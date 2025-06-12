package in.thanadon.foodiesapi.controller;

import com.paypal.api.payments.Payment;
import in.thanadon.foodiesapi.entity.OrderEntity;
import in.thanadon.foodiesapi.io.OrderRequest;
import in.thanadon.foodiesapi.io.OrderResponse;
import in.thanadon.foodiesapi.repository.OrderRepository;
import in.thanadon.foodiesapi.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository; // Inject for final status update

    /**
     * Endpoint to create an order and initiate the PayPal payment process.
     * This is the endpoint you will test with Postman.
     */
    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest orderRequest, HttpServletRequest request) {
        // Dynamically create the base URL for the callback URLs
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String cancelUrl = baseUrl + "/api/payment/cancel";
        String successUrl = baseUrl + "/api/payment/success";

        OrderResponse response = orderService.createOrderWithPayment(orderRequest, cancelUrl, successUrl);

        return ResponseEntity.ok(response);
    }

    /**
     * PayPal redirects here after a user cancels the payment.
     * It updates the order status to CANCELLED.
     */
    @GetMapping("/payment/cancel")
    public ResponseEntity<String> paymentCancel(@RequestParam("orderId") String orderId, @RequestParam("token") String token) {
        orderService.cancelOrderPayment(orderId);
        // You can return a simple message or redirect to a frontend page
        return ResponseEntity.ok("Payment was cancelled for order " + orderId + ". Token: " + token);
    }

    /**
     * PayPal redirects here after a user successfully approves the payment.
     * It executes the payment and updates the order status.
     */
    @GetMapping("/payment/success")
    public ResponseEntity<String> paymentSuccess(
            @RequestParam("orderId") String orderId,
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId) {

        try {
            // CHANGE THIS LINE to call the new method name.
            orderService.executeAndFinalizeOrder(orderId, paymentId, payerId);

            return ResponseEntity.ok("Payment successful! Your order " + orderId + " has been updated.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing payment: " + e.getMessage());
        }
    }
}