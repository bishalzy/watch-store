package com.watchstore.server.algorithm;

import java.util.*;

/**
 * RecommendationEngine executes Multi-Attribute Content-Based Filtering:
 * 1. Computes Cosine Similarity between TF-IDF feature vectors
 * 2. Computes Price Proximity distance
 * 3. Incorporates Category Affinity
 * 4. Combines into a weighted composite score [0.0 - 1.0]
 * 5. Uses a Min-Heap (PriorityQueue) to retrieve the Top-K items in O(N log K) time
 */
public class RecommendationEngine {

  public record ProductFeature(
      Long id,
      String name,
      String category,
      double price,
      double[] vector
  ) {}

  public record ScoredProduct(
      Long productId,
      double score
  ) implements Comparable<ScoredProduct> {
    @Override
    public int compareTo(ScoredProduct other) {
      // Natural ordering by score ascending (for min-heap)
      return Double.compare(this.score, other.score);
    }
  }

  // Weight constants for multi-attribute composite scoring
  private static final double WEIGHT_TEXT = 0.55;
  private static final double WEIGHT_CATEGORY = 0.25;
  private static final double WEIGHT_PRICE = 0.20;

  /**
   * Computes the Cosine Similarity between two L2-normalized vectors.
   * Since ||v1|| = 1 and ||v2|| = 1, Cosine(v1, v2) = v1 . v2
   */
  public static double cosineSimilarity(double[] v1, double[] v2) {
    if (v1 == null || v2 == null || v1.length == 0 || v2.length == 0 || v1.length != v2.length) {
      return 0.0;
    }

    double dotProduct = 0.0;
    for (int i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
    }
    // Clamp to [0.0, 1.0] to account for any floating point precision errors
    return Math.max(0.0, Math.min(1.0, dotProduct));
  }

  /**
   * Calculates normalized price proximity between two prices.
   * Returns a value between 0.0 (very different) and 1.0 (identical prices).
   */
  public static double priceProximity(double p1, double p2) {
    double maxPrice = Math.max(Math.max(p1, p2), 1.0);
    double diff = Math.abs(p1 - p2);
    double score = 1.0 - (diff / maxPrice);
    return Math.max(0.0, Math.min(1.0, score));
  }

  /**
   * Calculates category match score (1.0 if identical category, else 0.0).
   */
  public static double categorySimilarity(String cat1, String cat2) {
    if (cat1 == null || cat2 == null) {
      return 0.0;
    }
    return cat1.trim().equalsIgnoreCase(cat2.trim()) ? 1.0 : 0.0;
  }

  /**
   * Calculates hybrid multi-attribute composite similarity score.
   */
  public static double calculateCompositeScore(ProductFeature p1, ProductFeature p2) {
    double textSim = cosineSimilarity(p1.vector(), p2.vector());
    double catSim = categorySimilarity(p1.category(), p2.category());
    double priceSim = priceProximity(p1.price(), p2.price());

    return (WEIGHT_TEXT * textSim) + (WEIGHT_CATEGORY * catSim) + (WEIGHT_PRICE * priceSim);
  }

  /**
   * Recommends Top-K similar products for a given target product.
   */
  public List<ScoredProduct> recommendSimilar(Long targetId, List<ProductFeature> catalog, int limit) {
    if (catalog == null || catalog.isEmpty() || limit <= 0) {
      return Collections.emptyList();
    }

    ProductFeature target = catalog.stream()
        .filter(p -> p.id().equals(targetId))
        .findFirst()
        .orElse(null);

    if (target == null) {
      return Collections.emptyList();
    }

    // Use a Min-Heap of size K for optimal O(N log K) ranking
    PriorityQueue<ScoredProduct> minHeap = new PriorityQueue<>(limit);

    for (ProductFeature item : catalog) {
      if (item.id().equals(targetId)) {
        continue; // Do not recommend the target product to itself
      }

      double score = calculateCompositeScore(target, item);
      ScoredProduct candidate = new ScoredProduct(item.id(), score);

      if (minHeap.size() < limit) {
        minHeap.offer(candidate);
      } else if (candidate.score() > minHeap.peek().score()) {
        minHeap.poll();
        minHeap.offer(candidate);
      }
    }

    List<ScoredProduct> result = new ArrayList<>(minHeap);
    // Sort descending by score for display
    result.sort((a, b) -> Double.compare(b.score(), a.score()));
    return result;
  }

  /**
   * Recommends Top-K products tailored to user's browsing history.
   * If viewedIds is empty, returns cold-start fallback picks.
   */
  public List<ScoredProduct> recommendPersonalized(List<Long> viewedIds, List<ProductFeature> catalog, int limit) {
    if (catalog == null || catalog.isEmpty() || limit <= 0) {
      return Collections.emptyList();
    }

    // Filter viewed products that exist in active catalog
    Set<Long> viewedSet = viewedIds != null ? new HashSet<>(viewedIds) : Collections.emptySet();
    List<ProductFeature> viewedProducts = catalog.stream()
        .filter(p -> viewedSet.contains(p.id()))
        .toList();

    // Cold-Start fallback: If user has no history, return top catalog picks
    if (viewedProducts.isEmpty()) {
      return getColdStartRecommendations(catalog, limit);
    }

    // Build user preference profile:
    // 1. Centroid TF-IDF vector of viewed items
    int vocabSize = viewedProducts.getFirst().vector().length;
    double[] userVector = new double[vocabSize];
    double avgPrice = 0.0;
    Map<String, Integer> categoryCount = new HashMap<>();

    for (ProductFeature vp : viewedProducts) {
      avgPrice += vp.price();
      categoryCount.merge(vp.category().toLowerCase(), 1, Integer::sum);
      for (int i = 0; i < vocabSize; i++) {
        userVector[i] += vp.vector()[i];
      }
    }

    avgPrice /= viewedProducts.size();

    // L2 Normalize user centroid vector
    double sumSquares = 0.0;
    for (double val : userVector) {
      sumSquares += val * val;
    }
    double magnitude = Math.sqrt(sumSquares);
    if (magnitude > 0.0) {
      for (int i = 0; i < vocabSize; i++) {
        userVector[i] /= magnitude;
      }
    }

    // Score all non-viewed products against the user profile
    PriorityQueue<ScoredProduct> minHeap = new PriorityQueue<>(limit);

    for (ProductFeature item : catalog) {
      if (viewedSet.contains(item.id())) {
        continue; // Exclude already viewed products to encourage new discovery
      }

      double textSim = cosineSimilarity(userVector, item.vector());
      double priceSim = priceProximity(avgPrice, item.price());
      double catSim = categoryCount.containsKey(item.category().toLowerCase()) ? 1.0 : 0.0;

      double compositeScore = (WEIGHT_TEXT * textSim) + (WEIGHT_CATEGORY * catSim) + (WEIGHT_PRICE * priceSim);
      ScoredProduct candidate = new ScoredProduct(item.id(), compositeScore);

      if (minHeap.size() < limit) {
        minHeap.offer(candidate);
      } else if (candidate.score() > minHeap.peek().score()) {
        minHeap.poll();
        minHeap.offer(candidate);
      }
    }

    // If catalog had fewer non-viewed items than limit, backfill with viewed items
    if (minHeap.size() < limit) {
      for (ProductFeature item : catalog) {
        if (minHeap.size() >= limit) break;
        boolean alreadyAdded = minHeap.stream().anyMatch(sp -> sp.productId().equals(item.id()));
        if (!alreadyAdded) {
          minHeap.offer(new ScoredProduct(item.id(), 0.70));
        }
      }
    }

    List<ScoredProduct> result = new ArrayList<>(minHeap);
    result.sort((a, b) -> Double.compare(b.score(), a.score()));
    return result;
  }

  /**
   * Cold-start fallback picks: provides a diverse selection across categories.
   */
  private List<ScoredProduct> getColdStartRecommendations(List<ProductFeature> catalog, int limit) {
    List<ScoredProduct> fallback = new ArrayList<>();
    Set<String> seenCategories = new HashSet<>();

    // First pass: Pick one watch per category for diversity
    for (ProductFeature p : catalog) {
      if (fallback.size() >= limit) break;
      if (!seenCategories.contains(p.category().toLowerCase())) {
        seenCategories.add(p.category().toLowerCase());
        fallback.add(new ScoredProduct(p.id(), 0.90));
      }
    }

    // Second pass: Fill remaining slots if any
    for (ProductFeature p : catalog) {
      if (fallback.size() >= limit) break;
      boolean alreadyAdded = fallback.stream().anyMatch(sp -> sp.productId().equals(p.id()));
      if (!alreadyAdded) {
        fallback.add(new ScoredProduct(p.id(), 0.85));
      }
    }

    return fallback;
  }
}
