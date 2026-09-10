package com.watchstore.server.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
  private User user;

  @Column(name = "drop_location", nullable = false, columnDefinition = "TEXT")
  private String dropLocation;

  @Column(name = "phone_number", nullable = false, length = 20)
  private String phoneNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private OrderStatus status = OrderStatus.PENDING;

  @Column(name = "pidx", length = 50)
  private String pidx;

  @Column(name = "created_at", columnDefinition = "DATETIME", updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
  private List<OrderItem> items = new ArrayList<>();

  public Order() {
  }

  public Order(User user, String dropLocation, String phoneNumber) {
    this.user = user;
    this.dropLocation = dropLocation;
    this.phoneNumber = phoneNumber;
  }

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public String getDropLocation() {
    return dropLocation;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public void setStatus(OrderStatus status) {
    this.status = status;
  }

  public String getPidx() {
    return pidx;
  }

  public void setPidx(String pidx) {
    this.pidx = pidx;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public List<OrderItem> getItems() {
    return items;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public void setDropLocation(String dropLocation) {
    this.dropLocation = dropLocation;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public void setItems(List<OrderItem> items) {
    this.items = items;
  }

  public void addItem(OrderItem item) {
    items.add(item);
    item.setOrder(this);
  }

  public void removeItem(OrderItem item) {
    items.remove(item);
    item.setOrder(null);
  }
}
