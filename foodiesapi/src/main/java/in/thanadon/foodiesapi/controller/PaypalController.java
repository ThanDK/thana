package in.thanadon.foodiesapi.controller;

import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import in.thanadon.foodiesapi.service.PaypalService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaypalController {

    private final PaypalService paypalService;
    private static final Logger logger = LoggerFactory.getLogger(PaypalController.class);

    // Using http for localhost. In production, these should come from a configuration file.
    private static final String SUCCESS_URL = "http://localhost:8080/api/payment/success";
    private static final String CANCEL_URL = "http://localhost:8080/api/payment/cancel";

    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestParam double amount) {
        try {
            Payment payment = paypalService.createPayment(
                    amount,
                    "THB",
                    "paypal",
                    "sale",
                    "Payment for food order",
                    CANCEL_URL,
                    SUCCESS_URL
            );

            for (Links link : payment.getLinks()) {
                if ("approval_url".equals(link.getRel())) {
                    return ResponseEntity.ok(link.getHref());
                }
            }
            return ResponseEntity.status(500).body("No approval URL found in PayPal response.");
        } catch (Exception e) {
            // CORRECTED: Catching general Exception to handle the RuntimeException from the service.
            logger.error("Error creating PayPal payment", e);
            return ResponseEntity.status(500).body("Error creating payment: " + e.getMessage());
        }
    }

    @GetMapping("/success")
    public ResponseEntity<String> paymentSuccess(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId) { // Note: PayPal uses "PayerID" (with capital ID)
        try {
            // CORRECTED: Calling the 'execute' method from your service.
            Payment payment = paypalService.execute(paymentId, payerId);

            if (payment != null && "approved".equalsIgnoreCase(payment.getState())) {
                return ResponseEntity.ok("Payment successful and approved!");
            }

            return ResponseEntity.status(400).body("Payment was not approved by PayPal.");
        } catch (Exception e) {
            // CORRECTED: Catching general Exception.
            logger.error("Error confirming PayPal payment", e);
            return ResponseEntity.status(500).body("Error confirming payment: " + e.getMessage());
        }
    }

    @GetMapping("/cancel")
    public ResponseEntity<String> paymentCancel() {
        return ResponseEntity.ok("Payment cancelled by user.");
    }

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("PayPal payment endpoint is active.");
    }
}