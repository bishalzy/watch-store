package com.watchstore.server.dto.chat;

import java.util.ArrayList;
import java.util.List;
import com.watchstore.server.dto.product.ProductDTO;

public class ChatResponseDTO {
  private String reply;
  private List<ProductDTO> recommendedProducts = new ArrayList<>();

  public ChatResponseDTO() {
  }

  public ChatResponseDTO(String reply, List<ProductDTO> recommendedProducts) {
    this.reply = reply;
    if (recommendedProducts != null) {
      this.recommendedProducts = recommendedProducts;
    }
  }

  public String getReply() {
    return reply;
  }

  public void setReply(String reply) {
    this.reply = reply;
  }

  public List<ProductDTO> getRecommendedProducts() {
    return recommendedProducts;
  }

  public void setRecommendedProducts(List<ProductDTO> recommendedProducts) {
    this.recommendedProducts = recommendedProducts;
  }
}
