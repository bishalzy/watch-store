package com.watchstore.server.controller.product;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.watchstore.server.service.ProductService;
import com.watchstore.server.service.RecommendationService;
import com.watchstore.server.dto.product.ProductDTO;
import com.watchstore.server.dto.product.RecommendedProductDTO;

@RestController
@RequestMapping("/api/products")
public class ProductController {
  private final ProductService productService;
  private final RecommendationService recommendationService;

  public ProductController(ProductService productService, RecommendationService recommendationService) {
    this.productService = productService;
    this.recommendationService = recommendationService;
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<ProductDTO> getAllProducts() {
    return productService.getAllActiveProducts();
  }

  @GetMapping("/recommendations")
  @ResponseStatus(HttpStatus.OK)
  public List<RecommendedProductDTO> getRecommendations(
      @RequestParam(name = "viewedIds", required = false) List<Long> viewedIds,
      @RequestParam(name = "limit", defaultValue = "3") int limit) {
    return recommendationService.getPersonalizedRecommendations(viewedIds, limit);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public ProductDTO getProductById(@PathVariable Long id) {
    return productService.getProductById(id);
  }

  @GetMapping("/{id}/similar")
  @ResponseStatus(HttpStatus.OK)
  public List<RecommendedProductDTO> getSimilarProducts(
      @PathVariable Long id,
      @RequestParam(name = "limit", defaultValue = "3") int limit) {
    return recommendationService.getSimilarProducts(id, limit);
  }
}

