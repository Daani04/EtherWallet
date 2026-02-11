package es.cryptobit.controller;

import es.cryptobit.model.User;
import es.cryptobit.repository.UserRepository;
import org.bson.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // http://localhost:8080/API/NewUser
    @PostMapping("/API/NewUser")
    public ResponseEntity<Object> addNewUser(@RequestBody User newUser) {

        userRepository.save(newUser);
        System.out.println("Usuario insertado: " + newUser.getFirstName());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // http://localhost:8080/API/SeeUsers
    @GetMapping("/API/SeeUsers")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
}
