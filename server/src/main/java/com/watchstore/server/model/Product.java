package com.watchstore.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private double price;

  @ManyToOne
  @JoinColumn(name = "category_id", nullable = false, unique = true)
  private Category category;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false, length = 500)
  private String image;

  @Column(name = "is_active", nullable = false)
  private boolean isActive;

  public Product() {
  };

  public Product(String name, double price, Category category, String description, String image) {
    this.name = name;
    this.price = price;
    this.category = category;
    this.description = description;
    this.image = image;
    this.isActive = true;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public double getPrice() {
    return price;
  }

  public Category getCategory() {
    return category;
  }

  public String getDescription() {
    return description;
  }

  public String getImage() {
    return image;
  }

  public boolean isActive() {
    return isActive;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setPrice(double price) {
    this.price = price;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public void setImage(String image) {
    this.image = image;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }
}
