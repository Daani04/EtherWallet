package es.cryptobit.controller;

import es.cryptobit.model.User;
import es.cryptobit.model.Wallet;
import es.cryptobit.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @PostMapping("/API/AdDataWallet")
    public ResponseEntity<Object> AdDataWallet(@RequestBody Wallet newDataWallet) {

        walletRepository.save(newDataWallet);
        System.out.println("Datos: " +  newDataWallet.toString());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
