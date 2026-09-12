package com.watchstore.server.dto.product;

import com.watchstore.server.model.Inventory;
import com.watchstore.server.model.Product;

public class RecommendedProductDTO extends ProductDTO {
  private double matchScore;
  private String matchPercentage;

  public RecommendedProductDTO(Product product, Inventory inventory, double matchScore) {
    super(product, inventory);
    this.matchScore = Math.round(matchScore * 100.0) / 100.0;
    this.matchPercentage = (int) Math.round(Math.min(1.0, Math.max(0.0, matchScore)) * 100) + "%";
  }

  public double getMatchScore() {
    return matchScore;
  }

  public String getMatchPercentage() {
    return matchPercentage;
  }
}
