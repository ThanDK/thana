package in.thanadon.foodiesapi.service;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import in.thanadon.foodiesapi.entity.OrderEntity;
import in.thanadon.foodiesapi.io.OrderRequest;
import in.thanadon.foodiesapi.io.OrderResponse;
import in.thanadon.foodiesapi.repository.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final APIContext apiContext;
    private final UserService userService;

    // These are no longer needed here, as they will be passed in from the Controller.
    // private static final String CANCEL_URL = "...";
    // private static final String SUCCESS_URL = "...";

    private static final String PAYMENT_CURRENCY = "THB";
    private static final String PAYMENT_METHOD = "paypal";
    private static final String PAYMENT_INTENT = "sale";

    @Override
    // The signature is now correct with the new parameters.
    public OrderResponse createOrderWithPayment(OrderRequest request, String cancelUrl, String successUrl) {
        // Step 1: Convert request to an entity and set the user ID.
        OrderEntity newOrder = convertToEntity(request);
        String loggedInUserId = userService.findByUserId();
        newOrder.setUserId(loggedInUserId);
        newOrder.setPaymentStatus("PENDING"); // Set initial payment status

        // Step 2: First save. This is identical to your Razorpay flow.
        newOrder = orderRepository.save(newOrder);

        Payment createdPayment;
        try {
            Amount amount = new Amount();
            amount.setCurrency(PAYMENT_CURRENCY);
            amount.setTotal(String.format("%.2f", newOrder.getAmount()));

            Transaction transaction = new Transaction();
            transaction.setDescription("FoodiesAPI Order: " + newOrder.getId());
            transaction.setAmount(amount);

            List<Transaction> transactions = new ArrayList<>();
            transactions.add(transaction);

            Payer payer = new Payer();
            payer.setPaymentMethod(PAYMENT_METHOD);

            Payment payment = new Payment();
            payment.setIntent(PAYMENT_INTENT);
            payment.setPayer(payer);
            payment.setTransactions(transactions);

            // Set the mandatory redirect URLs for PayPal's use.
            RedirectUrls redirectUrls = new RedirectUrls();

            // *** FIX: Use the method parameters 'cancelUrl' and 'successUrl' ***
            // We append the internal orderId so your success/cancel controller can find the order.
            redirectUrls.setCancelUrl(cancelUrl + "?orderId=" + newOrder.getId());
            redirectUrls.setReturnUrl(successUrl + "?orderId=" + newOrder.getId());
            payment.setRedirectUrls(redirectUrls);

            // Step 4: Make the API call to PayPal.
            createdPayment = payment.create(apiContext);

        } catch (PayPalRESTException e) {
            // If the API call fails, update the order status and notify the client.
            newOrder.setPaymentStatus("FAILED");
            orderRepository.save(newOrder);
            throw new RuntimeException("Failed to create PayPal payment: " + e.getMessage(), e);
        }

        // Step 5: Update your local order with the PayPal Payment ID.
        newOrder.setPaypalOrderId(createdPayment.getId());

        // Step 6: Second save. This is identical to your Razorpay flow.
        orderRepository.save(newOrder);

        // Step 7: Prepare the response for the client.
        OrderResponse response = convertToResponse(newOrder);

        // Extract the approval_url. This is the URL your frontend must redirect the user to.
        Optional<String> approvalUrl = createdPayment.getLinks().stream()
                .filter(link -> "approval_url".equalsIgnoreCase(link.getRel()))
                .map(Links::getHref)
                .findFirst();

        // This check is critical. Without an approval URL, the payment cannot proceed.
        if (approvalUrl.isPresent()) {
            response.setApprovalUrl(approvalUrl.get());
        } else {
            // This indicates a serious problem with the payment creation.
            throw new RuntimeException("CRITICAL: PayPal approval URL not found in the response.");
        }

        return response;
    }

    private OrderResponse convertToResponse(OrderEntity order) {
        return OrderResponse.builder()
                .id(order.getId())
                .amount(order.getAmount())
                .userAddress(order.getUserAddress())
                .userId(order.getUserId())
                .paypalOrderId(order.getPaypalOrderId())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .email(order.getEmail())
                .phoneNumber(order.getPhoneNumber())
                .build();
    }

    private OrderEntity convertToEntity(OrderRequest request) {
        return OrderEntity.builder()
                .userAddress(request.getUserAddress())
                .amount(request.getAmount())
                .orderItems(request.getOrderedItems())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .orderStatus(request.getOrderStatus())
                .build();
    }

    @Override
    public OrderEntity executeAndFinalizeOrder(String orderId, String paymentId, String payerId) {
        try {
            // Step 1: Create a PayPal Payment object to execute.
            Payment payment = new Payment();
            payment.setId(paymentId);

            PaymentExecution paymentExecute = new PaymentExecution();
            paymentExecute.setPayerId(payerId);

            // Step 2: Call the PayPal API to execute the payment.
            Payment executedPayment = payment.execute(apiContext, paymentExecute);

            // Step 3: Check if PayPal actually approved the payment.
            if (!"approved".equalsIgnoreCase(executedPayment.getState())) {
                throw new RuntimeException("PayPal payment was not approved. Status: " + executedPayment.getState());
            }

            // Step 4: If approved, find YOUR order in YOUR database.
            OrderEntity order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("CRITICAL ERROR: Order " + orderId + " not found in database."));

            // Step 5: THIS IS THE FIX. Update the status of your order.
            order.setPaymentStatus("COMPLETED");

            // Step 6: Save the updated order with the "COMPLETED" status back to your database.
            return orderRepository.save(order);

        } catch (PayPalRESTException e) {
            // This catches errors from the PayPal API call itself.
            throw new RuntimeException("Failed to execute PayPal payment: " + e.getMessage(), e);
        }
    }

    // This method is fine, but make sure it has the @Override annotation.
    @Override
    public void cancelOrderPayment(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found for ID: " + orderId));

        order.setPaymentStatus("CANCELLED");
        orderRepository.save(order);
    }
}