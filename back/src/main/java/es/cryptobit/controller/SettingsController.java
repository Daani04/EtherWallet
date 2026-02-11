package es.cryptobit.controller;

import es.cryptobit.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SettingsController {

    @Autowired
    SettingsRepository settingsRepository;
}
