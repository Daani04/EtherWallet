package es.cryptobit.controller;

import es.cryptobit.model.PortfolioResponse;
import es.cryptobit.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blockchain")
@CrossOrigin(origins = "*")
public class BlockchainController {

    @Autowired
    private BlockchainService blockchainService;

    @GetMapping("/portfolio/{address}")
    public ResponseEntity<PortfolioResponse> getPortfolio(@PathVariable String address) {
        try {
            PortfolioResponse response = blockchainService.getCompletePortfolio(address);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}