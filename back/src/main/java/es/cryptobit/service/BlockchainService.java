package es.cryptobit.service;

import es.cryptobit.model.TransactionRecord;
import es.cryptobit.repository.BlockchainRecordRepository;
import es.cryptobit.repository.BlockchainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthBlockNumber;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class BlockchainService {

    @Autowired
    private Web3j web3j;

    @Autowired
    private BlockchainRepository repository;
    @Autowired
    private BlockchainRecordRepository blockchainRecordRepository;

    // Obtiene el número del último bloque (Util para verificar conexión)
    public String getLatestBlockNumber() throws Exception {
        EthBlockNumber blockNumber = web3j.ethBlockNumber().send();
        return blockNumber.getBlockNumber().toString();
    }


    public BigDecimal getEthBalance(String walletAddress, String userEmail) throws Exception {
        System.out.println("--- NUEVA CONSULTA DE SALDO ---");
        System.out.println("Usuario: " + userEmail);
        System.out.println("Dirección: " + walletAddress);

        var ethGetBalance = web3j.ethGetBalance(walletAddress, DefaultBlockParameterName.LATEST).send();

        // Aquí obtenemos el valor bruto (en Wei)
        BigInteger balanceInWei = ethGetBalance.getBalance();
        System.out.println("Saldo bruto en Wei: " + balanceInWei);

        // Convertimos a Ether
        BigDecimal balance = Convert.fromWei(balanceInWei.toString(), Convert.Unit.ETHER);
        System.out.println("Saldo convertido a ETH: " + balance);

        // GUARDAR REGISTRO EN MONGO
        TransactionRecord record = new TransactionRecord(
                userEmail,
                "ETH_BALANCE_CHECK",
                walletAddress,
                balance.toString()
        );
        blockchainRecordRepository.save(record);
        System.out.println("Registro guardado en MongoDB con éxito.");
        System.out.println("-------------------------------");

        return balance;
    }

    /**
     * Obtiene el saldo de CUALQUIER Token ERC-20 (USDT, LINK, etc.)
     * @param userAddress La dirección 0x del usuario
     * @param tokenContractAddress La dirección 0x del contrato de la cripto
     */
    public BigDecimal getTokenBalance(String userAddress, String tokenContractAddress) throws Exception {
        // 1. Definimos la función "balanceOf(address)" estándar de los tokens ERC-20
        Function function = new Function(
                "balanceOf",
                Arrays.asList(new Address(userAddress)),
                Collections.singletonList(new TypeReference<Uint256>() {})
        );

        // 2. Codificamos la función para enviarla a la blockchain
        String encodedFunction = FunctionEncoder.encode(function);

        // 3. Hacemos la llamada (Call) al contrato inteligente
        var response = web3j.ethCall(
                Transaction.createEthCallTransaction(userAddress, tokenContractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST).send();

        // 4. Decodificamos la respuesta
        List<Type> results = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());

        if (results.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigInteger balance = (BigInteger) results.get(0).getValue();

        // 5. Convertimos considerando 18 decimales (estándar de la mayoría de tokens)
        return new BigDecimal(balance).movePointLeft(18);
    }
}