package com.watchstore.server.dto.khalti;

import com.fasterxml.jackson.annotation.JsonProperty;

public class KhaltiInitiateResponseDTO {
  private String pidx;

  @JsonProperty("payment_url")
  private String paymentUrl;

  @JsonProperty("expires_at")
  private String expiresAt;

  @JsonProperty("expires_in")
  private int expiresIn;

  public String getPidx() {
      return pidx;
  }

  public void setPidx(String pidx) {
      this.pidx = pidx;
  }

  public String getPaymentUrl() {
      return paymentUrl;
  }

  public void setPaymentUrl(String paymentUrl) {
      this.paymentUrl = paymentUrl;
  }

  public String getExpiresAt() {
      return expiresAt;
  }

  public void setExpiresAt(String expiresAt) {
      this.expiresAt = expiresAt;
  }

  public int getExpiresIn() {
      return expiresIn;
  }

  public void setExpiresIn(int expiresIn) {
      this.expiresIn = expiresIn;
  }
}
