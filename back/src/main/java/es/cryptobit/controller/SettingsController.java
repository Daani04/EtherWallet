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

    // http://localhost:8080/API/EditSettings/{userId}
    @PutMapping("/EditSettings/{userId}")
    public ResponseEntity<Object> editSettings(@PathVariable String userId, @RequestBody Settings updatedSettings) {
        try {
            Optional<Settings> optionalSettings = settingsRepository.findById(userId);

            if (optionalSettings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Settings no encontrados");
            }

            Settings existingSettings = optionalSettings.get();

            existingSettings.setLanguage(updatedSettings.getLanguage());
            existingSettings.setTheme(updatedSettings.getTheme());
            existingSettings.setCurrency(updatedSettings.getCurrency());

            settingsRepository.save(existingSettings);
            return ResponseEntity.ok(existingSettings);

        } catch (Exception e) {
            System.out.println("ERROR AL ACTUALIZAR SETTINGS: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar settings");
        }
    }

    // http://localhost:8080/API/DeleteSettings/{userId}
    @DeleteMapping("/DeleteSettings/{userId}")
    public ResponseEntity<Object> deleteSettings(@PathVariable String userId) {
        try {
            if (!settingsRepository.existsById(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Settings no encontrados");
            }

            settingsRepository.deleteById(userId);
            return ResponseEntity.ok("Settings eliminados correctamente");

        } catch (Exception e) {
            System.out.println("ERROR AL BORRAR SETTINGS: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al borrar settings");
        }
    }
}
