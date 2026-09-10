package com.watchstore.server.dto.khalti;

import com.fasterxml.jackson.annotation.JsonProperty;

public class KhaltiLookupResponseDTO {
  private String pidx;

  @JsonProperty("total_amount")
  private int totalAmount;

  private String status; // "Completed", "Pending", "Expired", "User canceled", etc.

  @JsonProperty("transaction_id")
  private String transactionId;

  private int fee;
  private boolean refunded;

  public String getPidx() {
      return pidx;
  }

  public void setPidx(String pidx) {
      this.pidx = pidx;
  }

  public int getTotalAmount() {
      return totalAmount;
  }

  public void setTotalAmount(int totalAmount) {
      this.totalAmount = totalAmount;
  }

  public String getStatus() {
      return status;
  }

  public void setStatus(String status) {
      this.status = status;
  }

  public String getTransactionId() {
      return transactionId;
  }

  public void setTransactionId(String transactionId) {
      this.transactionId = transactionId;
  }

  public int getFee() {
      return fee;
  }

  public void setFee(int fee) {
      this.fee = fee;
  }

  public boolean isRefunded() {
      return refunded;
  }

  public void setRefunded(boolean refunded) {
      this.refunded = refunded;
  }
}
