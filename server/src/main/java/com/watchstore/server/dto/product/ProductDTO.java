package com.watchstore.server.dto.product;

import java.time.LocalDate;

import com.watchstore.server.model.Inventory;
import com.watchstore.server.model.Product;

public class ProductDTO {
  private long id;
  private String name;
  private double price;
  private String category;
  private String description;
  private String imagePath;
  private int quantity;
  private boolean isActive;
  private LocalDate dateAdded;

  public ProductDTO(Product product, Inventory inventory) {
    this.id = product.getId();
    this.name = product.getName();
    this.price = product.getPrice();
    this.category = product.getCategory().getCategoryName();
    this.description = product.getDescription();
    this.imagePath = product.getImage();
    this.isActive = product.isActive();
    this.quantity = inventory.getQuantity();
    this.dateAdded = inventory.getDateAdded();
  }

  public Long getId() {
    return this.id;
  }

  public String getName() {
    return this.name;
  }

  public double getPrice() {
    return this.price;
  }

  public String getCategory() {
    return this.category;
  }

  public String getDescription() {
    return this.description;
  }

  public String getImagePath() {
    return this.imagePath;
  }

  public int getQuantity() {
    return this.quantity;
  }

  public boolean getIsActive() {
    return this.isActive;
  }

  public LocalDate getDateAdded() {
    return this.dateAdded;
  }

}
