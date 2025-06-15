package in.thanadon.foodiesapi.controller;

import in.thanadon.foodiesapi.io.OrderRequest;
import in.thanadon.foodiesapi.io.OrderResponse;
import in.thanadon.foodiesapi.io.RetryPaymentResponse;
import in.thanadon.foodiesapi.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest orderRequest, HttpServletRequest request) {
        RedirectUrls urls = buildRedirectUrls(request);

        OrderResponse response = orderService.createOrderWithPayment(orderRequest, urls.getCancelUrl(), urls.getSuccessUrl());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment/success")
    public ResponseEntity<Void> paymentSuccess( // FIX: Changed return type to ResponseEntity<Void>
                                                @RequestParam("orderId") String orderId,
                                                @RequestParam("paymentId") String paymentId,
                                                @RequestParam("PayerID") String payerId) {
        try {
            orderService.executeAndFinalizeOrder(orderId, paymentId, payerId);
            // FIX: Redirect the popup back to a success page on the frontend
            String redirectUrl = frontendUrl + "/verify-payment?success=true&orderId=" + orderId;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
        } catch (Exception e) {
            // FIX: Redirect the popup to a failure page on the frontend
            String redirectUrl = frontendUrl + "/verify-payment?success=false";
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
        }
    }

    @GetMapping("/payment/cancel")
    public ResponseEntity<Void> paymentCancel(@RequestParam("orderId") String orderId) { // FIX: Changed return type
        orderService.cancelOrderPayment(orderId);
        // FIX: Redirect the popup to a "cancelled" page on the frontend
        String redirectUrl = frontendUrl + "/verify-payment?success=false&cancelled=true";
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/retry-payment/{orderId}")
    public ResponseEntity<RetryPaymentResponse> retryPayment(@PathVariable String orderId, HttpServletRequest request) {
        RedirectUrls urls = buildRedirectUrls(request);

        RetryPaymentResponse response = orderService.retryOrderPayment(orderId, urls.getCancelUrl(), urls.getSuccessUrl());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public List<OrderResponse> getOrders() {
        return orderService.getUserOrders();
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable String orderId) {
        orderService.removeOrder(orderId);
    }

    //admin panel
    @GetMapping("/all")
    public List<OrderResponse> getAllOrdersOfAllUsers() {
        return orderService.getOrdersOfAllUser();

    }
    //admin panel
    @PatchMapping("/status/{orderId}")
    public void updateOrderStatus(@PathVariable String orderId, @RequestParam("status") String status) {
        orderService.updateOrderStatus(orderId, status);
    }
    /**
     * PRIVATE HELPER: Constructs the full success and cancel URLs for PayPal redirects.
     * This centralizes the logic to prevent duplication.
     * @param request The incoming HttpServletRequest to determine the server's base URL.
     * @return A RedirectUrls object containing the cancel and success URLs.
     */
    private RedirectUrls buildRedirectUrls(HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String cancelUrl = baseUrl + "/api/orders/payment/cancel";
        String successUrl = baseUrl + "/api/orders/payment/success";
        return new RedirectUrls(cancelUrl, successUrl);
    }

    /**
     * PRIVATE HELPER DTO: A small, private inner class to hold the generated URLs.
     */
    @Data
    @AllArgsConstructor
    private static class RedirectUrls {
        private String cancelUrl;
        private String successUrl;
    }

    //endregion
}