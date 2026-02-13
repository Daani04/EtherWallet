package es.cryptobit.repository;

import es.cryptobit.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockchainRepository extends MongoRepository<Transaction, String> {
}