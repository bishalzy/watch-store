package com.watchstore.server.dto.chat;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiStructuredResponse {
  private String reply;
  private List<Long> recommendedProductIds = new ArrayList<>();

  public GeminiStructuredResponse() {
  }

  public GeminiStructuredResponse(String reply, List<Long> recommendedProductIds) {
    this.reply = reply;
    if (recommendedProductIds != null) {
      this.recommendedProductIds = recommendedProductIds;
    }
  }

  public String getReply() {
    return reply;
  }

  public void setReply(String reply) {
    this.reply = reply;
  }

  public List<Long> getRecommendedProductIds() {
    return recommendedProductIds;
  }

  public void setRecommendedProductIds(List<Long> recommendedProductIds) {
    this.recommendedProductIds = recommendedProductIds;
  }
}
