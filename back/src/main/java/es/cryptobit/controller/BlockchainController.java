package es.cryptobit.controller;

import es.cryptobit.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/blockchain")
@CrossOrigin(origins = "*")// Permite que React Native se conecte sin errores
public class BlockchainController {
    @Autowired
    private BlockchainService blockchainService;

    //Obtener el número de bloque
    @GetMapping("/block-number")
    public String getBlockNumber() {
        try {
            return "El último bloque de Ethereum es: " + blockchainService.getLatestBlockNumber();
        } catch (Exception e) {
            return "Error al conectar con la Blockchain: " + e.getMessage();
        }
    }

    //Obtener saldo de ETH de una dirección
    @GetMapping("/balance/{address}")
    public ResponseEntity<?> getEthBalance(@PathVariable String address) {
        try {
            BigDecimal balance = blockchainService.getEthBalance(address);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    //Obtener saldo de CUALQUIER TOKEN (USDT, LINK, etc.)
    @GetMapping("/token-balance/{userAddress}/{tokenAddress}")
    public ResponseEntity<?> getTokenBalance(@PathVariable String userAddress, @PathVariable String tokenAddress) {
        try {
            BigDecimal tokenBalance = blockchainService.getTokenBalance(userAddress, tokenAddress);
            return ResponseEntity.ok(tokenBalance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al consultar token: " + e.getMessage());
        }
    }
}