package es.cryptobit.controller;

import es.cryptobit.model.Settings;
import es.cryptobit.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/API")
public class SettingsController {

    @Autowired
    private SettingsRepository settingsRepository;

    // http://localhost:8080/API/NewSettings
    @PostMapping("/NewSettings")
    public ResponseEntity<Object> newSettings(@RequestBody Settings newSettings) {
        try {
            settingsRepository.save(newSettings);
            return ResponseEntity.status(HttpStatus.CREATED).body(newSettings);
        } catch (Exception e) {
            System.out.println("ERROR AL GUARDAR SETTINGS: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar settings");
        }
    }

    // http://localhost:8080/API/SeeSettings
    @GetMapping("/SeeSettings")
    public ResponseEntity<List<Settings>> seeSettings() {
        try {
            return ResponseEntity.ok(settingsRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // http://localhost:8080/API/Settings/{userId}
    @GetMapping("/Settings/{userId}")
    public ResponseEntity<Object> getSettings(@PathVariable String userId) {
        try {
            Optional<Settings> settingsOpt = settingsRepository.findById(userId);
            if (settingsOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Settings no encontrados");
            }
            return ResponseEntity.ok(settingsOpt.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener settings");
        }
    }

    @PutMapping("/EditSettings/{userId}")
    public ResponseEntity<Object> editSettings(@PathVariable String userId, @RequestBody Settings updated) {
        try {
            Settings existing = settingsRepository.findById(userId)
                    .orElse(new Settings(userId, "EN", true, "USD", false));

            existing.setLanguage(updated.getLanguage());
            existing.setTheme(updated.getTheme());
            existing.setCurrency(updated.getCurrency());
            existing.setFaceId(updated.getFaceId());

            settingsRepository.save(existing);
            return ResponseEntity.ok(existing);

        } catch (Exception e) {
            System.out.println("ERROR AL ACTUALIZAR SETTINGS: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar settings");
        }
    }
}
