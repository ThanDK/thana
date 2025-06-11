package in.thanadon.foodiesapi.service;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaypalServiceImpl implements PaypalService {

    @Autowired
    private APIContext apiContext;

    @Override
    public Payment createPayment(Double total, String currency,
                                 String method, String intent,
                                 String description, String cancelUrl, String successUrl) {
        Amount amount = new Amount();
        amount.setCurrency(currency);
        amount.setTotal(String.format("%.2f", total));

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod(method); // No need for toUpperCase(), the SDK handles it.

        Payment payment = new Payment();
        payment.setIntent(intent);
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        try {
            return payment.create(apiContext);
        } catch (PayPalRESTException e) {
            // Wrap the checked exception in an unchecked exception for the controller to handle.
            throw new RuntimeException("Failed to create PayPal payment", e);
        }
    }

    @Override
    public Payment execute(String paymentId, String payerId) {
        Payment payment = new Payment();
        payment.setId(paymentId);

        PaymentExecution execution = new PaymentExecution();
        execution.setPayerId(payerId);

        try {
            return payment.execute(apiContext, execution);
        } catch (PayPalRESTException e) {
            // Wrap the checked exception.
            throw new RuntimeException("Failed to execute PayPal payment", e);
        }
    }
}