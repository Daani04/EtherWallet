package es.cryptobit.controller;

import es.cryptobit.model.Settings;
import es.cryptobit.model.User;
import es.cryptobit.repository.SettingsRepository;
import es.cryptobit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@RestController
@RequestMapping("/API")
public class SettingsController {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

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
        return settingsRepository.findByUserId(userId)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Settings no encontrados"));
    }

    @PutMapping("/EditSettings/{userId}")
    public ResponseEntity<?> editSettings(@PathVariable String userId,
                                          @RequestBody Settings newSettings) {

        Optional<Settings> existing = settingsRepository.findByUserId(userId);

        Settings settings = existing.orElseGet(() -> {
            Settings s = new Settings();
            s.setUserId(userId); // como @Id
            return s;
        });

        settings.setTheme(newSettings.getTheme());
        settings.setLanguage(newSettings.getLanguage());
        settings.setCurrency(newSettings.getCurrency());
        settings.setFaceId(newSettings.getFaceId());

        settingsRepository.save(settings);
        return ResponseEntity.ok(settings);
    }

    // http://localhost:8080/API/User/{id}
    @GetMapping("/User/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado");
            }

            return ResponseEntity.ok(userOpt.get());

        } catch (Exception e) {
            System.out.println("ERROR GET USER: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error obteniendo usuario");
        }
    }

}
