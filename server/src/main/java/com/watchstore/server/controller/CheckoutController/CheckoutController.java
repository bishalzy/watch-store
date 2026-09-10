package com.watchstore.server.controller.CheckoutController;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.watchstore.server.dto.checkout.CheckoutInitiateResponseDTO;
import com.watchstore.server.dto.khalti.KhaltiInitiateRequestDTO;
import com.watchstore.server.dto.khalti.KhaltiInitiateResponseDTO;
import com.watchstore.server.dto.khalti.KhaltiLookupResponseDTO;
import com.watchstore.server.dto.order.OrderRequestDTO;
import com.watchstore.server.model.Order;
import com.watchstore.server.service.KhaltiService;
import com.watchstore.server.service.OrderService;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
  private final OrderService orderService;
  private final KhaltiService khaltiService;

  @Value("${khalti.return-url}")
  private String returnUrl;

  @Value("${khalti.website-url}")
  private String websiteUrl;

  public CheckoutController(OrderService orderService, KhaltiService khaltiService) {
      this.orderService = orderService;
      this.khaltiService = khaltiService;
  }

  @PostMapping("/initiate")
  public ResponseEntity<CheckoutInitiateResponseDTO> initiateCheckout(@RequestBody OrderRequestDTO orderRequest) {
    Order order = orderService.createPendingOrder(orderRequest);

    // computed server-side from stored order items — never trust a client-sent total
    int amountInPaisa = order.getItems().stream()
        .mapToInt(item -> item.getUnitPrice()
            .multiply(BigDecimal.valueOf(item.getQuantity()))
            .multiply(BigDecimal.valueOf(100))
            .intValue())
        .sum();

    KhaltiInitiateRequestDTO khaltiRequest = new KhaltiInitiateRequestDTO();
    khaltiRequest.setReturnUrl(returnUrl);
    khaltiRequest.setWebsiteUrl(websiteUrl);
    khaltiRequest.setAmount(amountInPaisa);
    khaltiRequest.setPurchaseOrderId(String.valueOf(order.getId()));
    khaltiRequest.setPurchaseOrderName("WatchStore Order #" + order.getId());

    KhaltiInitiateResponseDTO khaltiResponse = khaltiService.initiatePayment(khaltiRequest);

    order.setPidx(khaltiResponse.getPidx());
    orderService.saveOrder(order);

    return ResponseEntity.ok(new CheckoutInitiateResponseDTO(
        khaltiResponse.getPaymentUrl(), khaltiResponse.getPidx(), order.getId()));
  }

  @GetMapping("/verify")
  public ResponseEntity<?> verifyCheckout(@RequestParam String pidx) {
    KhaltiLookupResponseDTO lookup = khaltiService.verifyPayment(pidx);

    if ("Completed".equalsIgnoreCase(lookup.getStatus())) {
        Order order = orderService.completeOrder(pidx);
        return ResponseEntity.ok(Map.of("status", "success", "orderId", order.getId()));
    } else {
        orderService.markOrderFailed(pidx);
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
            .body(Map.of("status", lookup.getStatus()));
    }
  }
}
