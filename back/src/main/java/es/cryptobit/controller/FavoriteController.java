package es.cryptobit.controller;

import es.cryptobit.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FavoriteController {

    @Autowired
    FavoriteRepository favoriteRepository;
}
