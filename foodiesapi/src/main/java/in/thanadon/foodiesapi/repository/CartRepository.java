package in.thanadon.foodiesapi.repository;

import in.thanadon.foodiesapi.entity.CartEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartRepository extends MongoRepository<CartEntity, String> {

}
