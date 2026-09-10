package com.watchstore.server.dto.khalti;

import com.fasterxml.jackson.annotation.JsonProperty;

public class KhaltiInitiateRequestDTO {

  @JsonProperty("return_url")
  private String returnUrl;

  @JsonProperty("website_url")
  private String websiteUrl;

  private int amount; // paisa (Rs * 100)

  @JsonProperty("purchase_order_id")
  private String purchaseOrderId;

  @JsonProperty("purchase_order_name")
  private String purchaseOrderName;

  public String getReturnUrl() {
    return returnUrl;
  }

  public void setReturnUrl(String returnUrl) {
    this.returnUrl = returnUrl;
  }

  public String getWebsiteurl() {
    return websiteUrl;
  }

  public void setWebsiteUrl(String websiteUrl) {
    this.websiteUrl = websiteUrl;
  }

  public int getAmount() {
    return amount;
  }

  public void setAmount(int amount) {
    this.amount = amount;
  }

  public String getPurchaseOrderId() {
    return purchaseOrderId;
  }

  public void setPurchaseOrderId(String purchaseOrderId) {
    this.purchaseOrderId = purchaseOrderId;
  }

  public String getPurchaseOrderName() {
    return purchaseOrderName;
  }

  public void setPurchaseOrderName(String purchaseOrderName) {
    this.purchaseOrderName = purchaseOrderName;
  }
}
