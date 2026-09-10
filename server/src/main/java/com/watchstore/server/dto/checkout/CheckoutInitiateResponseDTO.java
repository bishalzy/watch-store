package com.watchstore.server.dto.checkout;

public class CheckoutInitiateResponseDTO {
  private String paymentUrl;
  private String pidx;
  private Long orderId;

  public CheckoutInitiateResponseDTO(String paymentUrl, String pidx, Long orderId) {
      this.paymentUrl = paymentUrl;
      this.pidx = pidx;
      this.orderId = orderId;
  }

  public String getPaymentUrl() {
      return paymentUrl;
  }

  public String getPidx() {
      return pidx;
  }

  public Long getOrderId() {
      return orderId;
  }
}
