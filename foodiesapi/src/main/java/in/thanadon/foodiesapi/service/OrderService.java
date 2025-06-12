package in.thanadon.foodiesapi.service;

import com.paypal.api.payments.Payment;
import in.thanadon.foodiesapi.entity.OrderEntity;
import in.thanadon.foodiesapi.io.OrderRequest;
import in.thanadon.foodiesapi.io.OrderResponse;

public interface OrderService {

    OrderResponse createOrderWithPayment(OrderRequest request, String cancelUrl, String successUrl);

    OrderEntity executeAndFinalizeOrder(String orderId, String paymentId, String payerId);

    void cancelOrderPayment(String orderId);
}
