package es.cryptobit.repository;

import es.cryptobit.model.Favorite; // Importante añadir el import
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


public interface FavoriteRepository extends MongoRepository<Favorite, String> {

}