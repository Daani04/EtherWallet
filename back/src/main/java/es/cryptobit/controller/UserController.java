package es.cryptobit.controller;

import es.cryptobit.model.User;
import es.cryptobit.repository.UserRepository;
import org.bson.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.MessageDigest;
import java.security.MessageDigest;
import java.util.List;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // http://localhost:8080/API/NewUser
    @PostMapping("/API/NewUser")
    public ResponseEntity<Object> metodoEndpoint(@RequestBody User newUser) {
        try {
            System.out.println(newUser.toString());
            newUser.setPassword(sha256(newUser.getPassword()));
            userRepository.save(newUser);
            System.out.println("EXITO: Usuario guardado en Mongo");
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            System.out.println("ERROR AL GUARDAR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // http://localhost:8080/API/SeeUsers
    @GetMapping("/API/SeeUsers")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // http://localhost:8080/API/Login
    @PostMapping("/API/Login")
    public ResponseEntity<String> login(@RequestBody User loginUser) {
        try {
            if (loginUser.getEmail() == null || loginUser.getPassword() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Faltan campos (email/password)");
            }

            Optional<User> userOpt = userRepository.findByEmail(loginUser.getEmail());

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("usuario/contraseña no encontrados");
            }

            User userDB = userOpt.get();

            // OJO: aquí NO hasheamos, porque el front ya envía el hash
            String incomingHash = loginUser.getPassword().trim();
            String dbHash = userDB.getPassword().trim();

            if (!incomingHash.equalsIgnoreCase(dbHash)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("usuario/contraseña no encontrados");
            }

            System.out.println("Login correcto: " + loginUser.getEmail());
            return ResponseEntity.ok("Login correcto");

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error en login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error en login");
        }
    }


    public String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes("UTF-8"));

            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // http://localhost:8080/API/EditUser/{id}
    @PutMapping("/EditUser/{id}")
    public ResponseEntity<Object> updateUser(
            @PathVariable String id,
            @RequestBody User updatedUser) {

        try {
            Optional<User> optionalUser = userRepository.findById(id);

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado");
            }

            User existingUser = optionalUser.get();

            // Actualizar TODOS los campos
            existingUser.setFirstName(updatedUser.getFirstName());
            existingUser.setLastName(updatedUser.getLastName());
            existingUser.setDni(updatedUser.getDni());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setPassword(updatedUser.getPassword());
            existingUser.setBirthDate(updatedUser.getBirthDate());
            existingUser.setUserImage(updatedUser.getUserImage());
            existingUser.setFavoriteId(updatedUser.getFavoriteId());

            userRepository.save(existingUser);

            return ResponseEntity.ok(existingUser);

        } catch (Exception e) {
            System.out.println("ERROR AL ACTUALIZAR: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar usuario");
        }
    }

    // http://localhost:8080/API/DeleteUser/{id}
    @DeleteMapping("/DeleteUser/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable String id) {

        try {

            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado");
            }

            userRepository.deleteById(id);

            return ResponseEntity.ok("Usuario eliminado correctamente");

        } catch (Exception e) {
            System.out.println("ERROR AL BORRAR: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al borrar usuario");
        }
    }
}
