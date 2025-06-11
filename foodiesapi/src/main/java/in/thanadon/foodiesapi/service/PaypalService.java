package in.thanadon.foodiesapi.service;

import com.paypal.api.payments.Payment;

public interface PaypalService {

    Payment createPayment(
            Double total,
            String currency,
            String method,
            String intent,
            String description,
            String cancelUrl,
            String successUrl
    );

    Payment execute(String paymentId, String payerId);
}