package com.watchstore.server.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.watchstore.server.algorithm.RecommendationEngine;
import com.watchstore.server.algorithm.TfidfVectorizer;
import com.watchstore.server.dto.product.RecommendedProductDTO;
import com.watchstore.server.model.Inventory;
import com.watchstore.server.model.Product;
import com.watchstore.server.repository.InventoryRepository;
import com.watchstore.server.repository.ProductRepository;

@Service
public class RecommendationService {

  private final ProductRepository productRepository;
  private final InventoryRepository inventoryRepository;
  private final RecommendationEngine recommendationEngine = new RecommendationEngine();

  public RecommendationService(ProductRepository productRepository, InventoryRepository inventoryRepository) {
    this.productRepository = productRepository;
    this.inventoryRepository = inventoryRepository;
  }

  /**
   * Builds feature representations for all active products in the database.
   */
  private List<RecommendationEngine.ProductFeature> buildCatalogFeatures(List<Product> products) {
    if (products.isEmpty()) {
      return Collections.emptyList();
    }

    // Build document text map for TF-IDF training
    Map<Long, String> documentTexts = new HashMap<>();
    for (Product p : products) {
      String categoryName = p.getCategory() != null ? p.getCategory().getCategoryName() : "";
      String combinedText = p.getName() + " " + categoryName + " " + (p.getDescription() != null ? p.getDescription() : "");
      documentTexts.put(p.getId(), combinedText);
    }

    TfidfVectorizer vectorizer = new TfidfVectorizer();
    vectorizer.fit(documentTexts);

    List<RecommendationEngine.ProductFeature> features = new ArrayList<>();
    for (Product p : products) {
      String categoryName = p.getCategory() != null ? p.getCategory().getCategoryName() : "";
      String text = documentTexts.get(p.getId());
      double[] vector = vectorizer.transform(text);

      features.add(new RecommendationEngine.ProductFeature(
          p.getId(),
          p.getName(),
          categoryName,
          p.getPrice(),
          vector
      ));
    }

    return features;
  }

  /**
   * Generates personalized recommendations based on a user's recent browsing history.
   * If viewedIds is empty or invalid, provides curated cold-start picks.
   */
  public List<RecommendedProductDTO> getPersonalizedRecommendations(List<Long> viewedIds, int limit) {
    List<Product> activeProducts = productRepository.findByIsActiveTrue();
    if (activeProducts.isEmpty()) {
      return Collections.emptyList();
    }

    List<RecommendationEngine.ProductFeature> features = buildCatalogFeatures(activeProducts);
    List<RecommendationEngine.ScoredProduct> scored = recommendationEngine.recommendPersonalized(viewedIds, features, limit);

    return mapToDTOs(scored, activeProducts);
  }

  /**
   * Generates similar product recommendations for a single target watch.
   */
  public List<RecommendedProductDTO> getSimilarProducts(Long productId, int limit) {
    List<Product> activeProducts = productRepository.findByIsActiveTrue();
    if (activeProducts.isEmpty()) {
      return Collections.emptyList();
    }

    List<RecommendationEngine.ProductFeature> features = buildCatalogFeatures(activeProducts);
    List<RecommendationEngine.ScoredProduct> scored = recommendationEngine.recommendSimilar(productId, features, limit);

    return mapToDTOs(scored, activeProducts);
  }

  private List<RecommendedProductDTO> mapToDTOs(
      List<RecommendationEngine.ScoredProduct> scoredList,
      List<Product> products) {

    Map<Long, Product> productMap = products.stream()
        .collect(Collectors.toMap(Product::getId, p -> p));

    List<RecommendedProductDTO> dtos = new ArrayList<>();

    for (RecommendationEngine.ScoredProduct sp : scoredList) {
      Product product = productMap.get(sp.productId());
      if (product != null) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findByProduct(product);
        Inventory inventory = inventoryOpt.orElse(null);
        if (inventory == null) {
          inventory = new Inventory();
          inventory.setProduct(product);
          inventory.setQuantity(0);
        }
        dtos.add(new RecommendedProductDTO(product, inventory, sp.score()));
      }
    }

    return dtos;
  }
}
