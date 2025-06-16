package in.thanadon.foodiesapi.service;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import in.thanadon.foodiesapi.entity.OrderEntity;
import in.thanadon.foodiesapi.io.OrderPaymentStatusResponse;
import in.thanadon.foodiesapi.io.OrderRequest;
import in.thanadon.foodiesapi.io.OrderResponse;
import in.thanadon.foodiesapi.io.RetryPaymentResponse;
import in.thanadon.foodiesapi.repository.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for handling all order and payment logic.
 */
@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final APIContext apiContext;
    private final UserService userService;

    // PayPal payment constants
    private static final String PAYMENT_CURRENCY = "THB";
    private static final String PAYMENT_METHOD = "paypal";
    private static final String PAYMENT_INTENT = "sale"; // "sale" means the payment is captured immediately.

    /**
     * Creates a new order in the database and initiates a corresponding payment with PayPal.
     * The process involves saving the order locally first to generate an ID, then creating
     * a payment on PayPal's side.
     *
     * @param request    The order details from the client.
     * @param cancelUrl  The URL to redirect to if the user cancels the payment on PayPal's site.
     * @param successUrl The URL to redirect to if the user successfully approves the payment.
     * @return An OrderResponse containing the created order's details and the PayPal approval URL.
     */
    @Override
    public OrderResponse createOrderWithPayment(OrderRequest request, String cancelUrl, String successUrl) {
        // Step 1: Create the entity and set initial details.
        OrderEntity newOrder = convertToEntity(request);
        newOrder.setUserId(userService.findByUserId());
        newOrder.setPaymentStatus("PENDING");

        // Step 2: Save the order to the DB *before* contacting PayPal to get a unique order ID for tracking.
        newOrder = orderRepository.save(newOrder);
        Payment createdPayment;
        try {
            // Step 3: Call the shared helper method to create the payment object and call PayPal's API.
            String description = "FoodiesAPI Order: " + newOrder.getId();
            createdPayment = this.createPayPalPayment(newOrder, description, cancelUrl, successUrl);

        } catch (PayPalRESTException e) {
            // If the PayPal API call fails, we mark our internal order as FAILED.
            newOrder.setPaymentStatus("FAILED");
            orderRepository.save(newOrder);
            throw new RuntimeException("Failed to create PayPal payment: " + e.getMessage(), e);
        }
        // Step 4: Link our local order with the PayPal-generated transaction ID.
        newOrder.setPaypalOrderId(createdPayment.getId());
        orderRepository.save(newOrder);
        // Step 5: Prepare the final response for the client, including the crucial approval URL.
        OrderResponse response = convertToResponse(newOrder);
        response.setApprovalUrl(extractApprovalUrl(createdPayment));
        return response;
    }

    /**
     * Initiates a new PayPal payment for an existing order that was previously not completed.
     *
     * @param orderId    The ID of the existing order to retry.
     * @param cancelUrl  The URL for payment cancellation.
     * @param successUrl The URL for payment success.
     * @return A response containing a fresh PayPal approval URL.
     */
    @Override
    public RetryPaymentResponse retryOrderPayment(String orderId, String cancelUrl, String successUrl) {
        // Step 1: Find the existing order.
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order with ID " + orderId + " not found."));

        // CRITICAL: Prevent re-payment of an already completed order.
        if ("COMPLETED".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("This order has already been paid for.");
        }

        Payment createdPayment;
        try {
            // Step 2: Call the same shared helper method to create a new payment session.
            String description = "Retry for FoodiesAPI Order: " + order.getId();
            createdPayment = this.createPayPalPayment(order, description, cancelUrl, successUrl);

        } catch (PayPalRESTException e) {
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            throw new RuntimeException("Failed to create new PayPal payment for retry: " + e.getMessage(), e);
        }
        // Step 3: Update the order with the *new* PayPal ID and reset its status to PENDING.
        order.setPaypalOrderId(createdPayment.getId());
        order.setPaymentStatus("PENDING");
        orderRepository.save(order);
        // Step 4: Return the response containing the new URL.
        return new RetryPaymentResponse(extractApprovalUrl(createdPayment));
    }

    /**
     * Retrieves all orders for a specific user.
     * @return A list of orders as OrderResponse DTOs.
     */
    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUserId = userService.findByUserId();
        List<OrderEntity> list = orderRepository.findByUserId(loggedInUserId);
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public void removeOrder(String orderId) {
        // Step 1: Get the ID of the currently authenticated user.
        String currentUserId = userService.findByUserId();
        // Step 2: Find the order by its ID AND verify that it belongs to the current user.
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Order not found or you do not have permission to delete it."));
        // Step 3: If the check passes, it is now safe to delete the order.
        orderRepository.delete(order);
    }

    @Override
    public List<OrderResponse> getOrdersOfAllUser() {
        List<OrderEntity> list = orderRepository.findAll();
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public void updateOrderStatus(String orderId, String status) {
        OrderEntity entity = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order with ID " + orderId + " not found."));
        entity.setOrderStatus(status); // Corrected to update orderStatus
        orderRepository.save(entity);
    }

    /**
     * Retrieves the status of a specific order, but only if it belongs to the
     * currently authenticated user. This prevents users from snooping on others' orders.
     *
     * @param orderId The ID of the order to check.
     * @return An OrderStatusResponse DTO with the current statuses.
     */
    @Override
    public OrderPaymentStatusResponse getOrderPaymentStatusForCurrentUser(String orderId){
        // 1. Get the ID of the currently logged-in user.
        String loggedInUserId = userService.findByUserId();

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order with ID " + orderId + " not found."));

        if (!order.getUserId().equals(loggedInUserId)) {
            try {
                throw new AccessDeniedException("You do not have permission to view the status of this order.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        return new OrderPaymentStatusResponse(order.getId(), order.getPaymentStatus());
    }


    /**
     * Executes a PayPal payment after the user has approved it on the PayPal website.
     * This method is called by the success redirect endpoint.
     *
     * @param orderId   Our internal order ID.
     * @param paymentId The PayPal payment ID received as a query parameter.
     * @param payerId   The PayPal payer ID received as a query parameter.
     * @return The updated OrderEntity with its payment status set to "COMPLETED".
     */
    @Override
    public OrderEntity executeAndFinalizeOrder(String orderId, String paymentId, String payerId) {
        // Step 1: Find the order FIRST.
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("CRITICAL ERROR: Order " + orderId + " not found in database."));

        // Step 2: CRITICAL IDEMPOTENCY CHECK.
        // If the order is already completed, do not re-process. Just return the existing state.
        if ("COMPLETED".equalsIgnoreCase(order.getPaymentStatus())) {
            System.out.println("Idempotency check: Order " + orderId + " is already completed. Skipping execution.");
            return order;
        }

        try {
            Payment payment = new Payment();
            payment.setId(paymentId);
            PaymentExecution paymentExecute = new PaymentExecution();
            paymentExecute.setPayerId(payerId);
            Payment executedPayment = payment.execute(apiContext, paymentExecute);

            if (!"approved".equalsIgnoreCase(executedPayment.getState())) {
                throw new RuntimeException("PayPal payment was not approved. Status: " + executedPayment.getState());
            }

            // Step 3: Now that PayPal confirmed, update our database.
            order.setPaymentStatus("COMPLETED");
            return orderRepository.save(order);

        } catch (PayPalRESTException e) {
            // If execution fails, you might want to mark the order as FAILED.
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            throw new RuntimeException("Failed to execute PayPal payment: " + e.getMessage(), e);
        }
    }


    /**
     * Updates an order's payment status to "CANCELLED".
     * This is called by the cancel redirect endpoint.
     *
     * @param orderId The internal ID of the order to cancel.
     */
    @Override
    public void cancelOrderPayment(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found for ID: " + orderId));

        // To prevent errors, only update the status if it's currently PENDING.
        if ("PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setPaymentStatus("CANCELLED");
            orderRepository.save(order);
        }
    }

    //region Private Helper Methods

    /**
     * PRIVATE HELPER: Centralized logic to build a PayPal Payment object and create it via the API.
     *
     * @param order       The local order entity containing amount and ID.
     * @param description The description for the PayPal transaction.
     * @param cancelUrl   The URL for payment cancellation.
     * @param successUrl  The URL for payment success.
     * @return The created PayPal Payment object.
     * @throws PayPalRESTException if the API call fails.
     */
    private Payment createPayPalPayment(OrderEntity order, String description, String cancelUrl, String successUrl) throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setCurrency(PAYMENT_CURRENCY);
        // Format the total to two decimal places as required by PayPal.
        amount.setTotal(String.format("%.2f", order.getAmount()));

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod(PAYMENT_METHOD);

        Payment payment = new Payment();
        payment.setIntent(PAYMENT_INTENT);
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        // Append our internal orderId to the callback URLs for tracking on return.
        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl + "?orderId=" + order.getId());
        redirectUrls.setReturnUrl(successUrl + "?orderId=" + order.getId());
        payment.setRedirectUrls(redirectUrls);

        // This is the actual API call to PayPal.
        return payment.create(apiContext);
    }

    /**
     * PRIVATE HELPER: Extracts the mandatory `approval_url` from a PayPal Payment response.
     *
     * @param payment The PayPal Payment object returned from the API.
     * @return The approval URL string.
     */
    private String extractApprovalUrl(Payment payment) {
        return payment.getLinks().stream()
                .filter(link -> "approval_url".equalsIgnoreCase(link.getRel()))
                .map(Links::getHref)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("CRITICAL: PayPal approval URL not found in the response."));
    }

    /**
     * PRIVATE HELPER: Maps an OrderEntity to an OrderResponse DTO.
     */
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
                .orderedItems(order.getOrderItems())
                .build();
    }

    /**
     * PRIVATE HELPER: Maps an OrderRequest DTO to an OrderEntity.
     */
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
    //endregion
}