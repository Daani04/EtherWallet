package es.cryptobit.controller;

import es.cryptobit.model.User;
import es.cryptobit.repository.UserRepository;
import org.bson.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/API/NewUser")
    public ResponseEntity<Object> addNewUser(@RequestBody User newUser) {

        userRepository.save(newUser);
        System.out.println("Usuario insertado: " + newUser.getFirstName());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
