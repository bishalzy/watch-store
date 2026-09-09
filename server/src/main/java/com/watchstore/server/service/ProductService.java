package com.watchstore.server.service;

import java.util.List;
import java.util.Optional;
import java.io.IOException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.watchstore.server.dto.product.ProductDTO;
import com.watchstore.server.dto.product.ProductRequest;
import com.watchstore.server.exceptions.BadRequestException;
import com.watchstore.server.exceptions.ResourceNotFoundException;
import com.watchstore.server.model.Inventory;
import com.watchstore.server.model.Product;
import com.watchstore.server.model.Category;
import com.watchstore.server.repository.InventoryRepository;
import com.watchstore.server.repository.OrderItemRepository;
import com.watchstore.server.repository.CategoryRepository;
import com.watchstore.server.repository.ProductRepository;
import com.watchstore.server.util.FileStorageUtil;

@Service
public class ProductService {
  private final ProductRepository productRepository;
  private final InventoryRepository inventoryRepository;
  private final CategoryRepository categoryRepository;
  private final OrderItemRepository orderItemRepository;

  public ProductService(ProductRepository productRepository, InventoryRepository inventoryRepository,
      CategoryRepository categoryRepository, OrderItemRepository orderItemRepository) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.inventoryRepository = inventoryRepository;
    this.orderItemRepository = orderItemRepository;
  }

  private final String uploadDirectory = "/home/bishal/Downloads";

  public void createProductWithInventory(ProductRequest productRequest) {
    MultipartFile file = productRequest.getProductImage();
    String randomFileName;

    try {
      randomFileName = FileStorageUtil.saveFile(file, uploadDirectory);
    } catch (IllegalStateException | IOException e) {
      throw new RuntimeException(e.getMessage());
    }

    Category category = categoryRepository
        .findByCategoryName(productRequest.getProductCategory().toLowerCase())
        .orElseThrow(() -> new BadRequestException("Category not found."));

    if (productRepository.findByName(productRequest.getProductName().toLowerCase()).isPresent()) {
      throw new BadRequestException(productRequest.getProductName() + " already exists!");
    }

    Product product = new Product(
        productRequest.getProductName(),
        productRequest.getProductPrice(),
        category,
        productRequest.getProductDescription(),
        randomFileName);

    Inventory inventory = new Inventory();
    inventory.setQuantity(productRequest.getProductQuantity());
    inventory.setProduct(product);

    productRepository.save(product);
    inventoryRepository.save(inventory);
  }

  public void updateProduct(Long id, ProductRequest productRequest) {
    Product existingProduct = productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found!"));

    MultipartFile file = productRequest.getProductImage();
    String randomFileName;

    try {
      if (file != null && !file.isEmpty()) {
        FileStorageUtil.deleteFile(existingProduct.getImage(), uploadDirectory);
        randomFileName = FileStorageUtil.saveFile(file, uploadDirectory);
        existingProduct.setImage(randomFileName);
      }
    } catch (IllegalStateException | IOException e) {
      e.printStackTrace();
      throw new RuntimeException(e.getMessage());
    }

    Category category = categoryRepository.findByCategoryName(productRequest.getProductCategory().toLowerCase())
        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

    existingProduct.setCategory(category);
    existingProduct.setName(productRequest.getProductName());
    existingProduct.setCategory(category);
    existingProduct.setDescription(productRequest.getProductDescription());
    existingProduct.setPrice(productRequest.getProductPrice());

    Inventory inventory = inventoryRepository.findByProduct(existingProduct)
        .orElseThrow(() -> new ResourceNotFoundException("Inventory not found!"));

    inventory.setQuantity(productRequest.getProductQuantity());

    productRepository.save(existingProduct);
    inventoryRepository.save(inventory);
  }

  public void deleteProduct(Long id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found! How did you try to delete it?"));

    boolean isReferencedInOrders = orderItemRepository.existsByProductId(id);

    if (isReferencedInOrders) {
      product.setIsActive(false);
      productRepository.save(product);
    } else {
      String imagePath = product.getImage();

      try {
        FileStorageUtil.deleteFile(imagePath, uploadDirectory);
      } catch (Exception e) {
        System.err.println("Failed to delete image file: " + imagePath);
      }

      productRepository.deleteById(id);
    }
  }

  public List<ProductDTO> getAllProducts() {
    List<Product> products = productRepository.findAll();

    return products.stream().map(product -> {
      Optional<Inventory> inventoryOpt = inventoryRepository.findByProduct(product);
      Inventory inventory = inventoryOpt.orElse(null);
      return new ProductDTO(product, inventory);
    }).collect(Collectors.toList());
  }

  public ProductDTO getProductById(Long id) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found!"));

    Optional<Inventory> inventoryOpt = inventoryRepository.findByProduct(product);
    Inventory inventory = inventoryOpt.orElse(null);

    return new ProductDTO(product, inventory);
  }

  public List<ProductDTO> getAllActiveProducts() {
    List<Product> products = productRepository.findByIsActiveTrue();

    return products.stream().map(product -> {
      Optional<Inventory> inventoryOpt = inventoryRepository.findByProduct(product);
      Inventory inventory = inventoryOpt.orElse(null);
      return new ProductDTO(product, inventory);
    }).collect(Collectors.toList());
  }
}
