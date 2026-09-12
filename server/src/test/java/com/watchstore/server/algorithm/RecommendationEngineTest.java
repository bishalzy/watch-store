package com.watchstore.server.algorithm;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class RecommendationEngineTest {

  @Test
  @DisplayName("TF-IDF vectorizer correctly tokenizes, removes stop words, and normalizes vectors")
  void testTfidfVectorizer() {
    TfidfVectorizer vectorizer = new TfidfVectorizer();

    Map<Long, String> documents = new HashMap<>();
    documents.put(1L, "Luxury chronograph analog watch with stainless steel strap");
    documents.put(2L, "Minimalist classic analog quartz watch with leather band");
    documents.put(3L, "Smart fitness digital watch with heart rate monitor");

    vectorizer.fit(documents);

    assertTrue(vectorizer.getVocabSize() > 0, "Vocabulary should be populated");
    assertFalse(vectorizer.getVocabulary().containsKey("with"), "Stop words like 'with' must be excluded");
    assertTrue(vectorizer.getVocabulary().containsKey("chronograph"), "Significant terms must be indexed");

    double[] v1 = vectorizer.transform("Luxury chronograph analog watch");
    assertEquals(vectorizer.getVocabSize(), v1.length);

    // Verify L2 normalization: sum of squares should be ~ 1.0
    double sumSquares = 0.0;
    for (double val : v1) {
      sumSquares += val * val;
    }
    assertEquals(1.0, sumSquares, 0.0001, "Vector should be L2 unit normalized");
  }

  @Test
  @DisplayName("Cosine similarity returns 1.0 for identical vectors and 0.0 for orthogonal vectors")
  void testCosineSimilarity() {
    double[] v1 = {0.6, 0.8};
    double[] v2 = {0.6, 0.8};
    double[] v3 = {0.8, -0.6}; // Orthogonal dot product = 0.48 - 0.48 = 0.0

    assertEquals(1.0, RecommendationEngine.cosineSimilarity(v1, v2), 0.0001);
    assertEquals(0.0, RecommendationEngine.cosineSimilarity(v1, v3), 0.0001);
  }

  @Test
  @DisplayName("Price proximity scales correctly between 0.0 and 1.0")
  void testPriceProximity() {
    assertEquals(1.0, RecommendationEngine.priceProximity(5000.0, 5000.0), 0.0001);
    assertEquals(0.5, RecommendationEngine.priceProximity(5000.0, 10000.0), 0.0001);
    assertTrue(RecommendationEngine.priceProximity(5000.0, 6000.0) > RecommendationEngine.priceProximity(5000.0, 20000.0));
  }

  @Test
  @DisplayName("Category similarity is case-insensitive and binary")
  void testCategorySimilarity() {
    assertEquals(1.0, RecommendationEngine.categorySimilarity("Analog", "analog"), 0.0001);
    assertEquals(1.0, RecommendationEngine.categorySimilarity("Smartwatch ", "smartwatch"), 0.0001);
    assertEquals(0.0, RecommendationEngine.categorySimilarity("Analog", "Digital"), 0.0001);
  }

  @Test
  @DisplayName("recommendSimilar ranks the most content-relevant watch highest and excludes target watch")
  void testRecommendSimilar() {
    TfidfVectorizer vectorizer = new TfidfVectorizer();
    Map<Long, String> documents = new HashMap<>();
    documents.put(1L, "Rolex Submariner luxury automatic dive watch waterproof");
    documents.put(2L, "Omega Seamaster luxury automatic dive watch waterproof");
    documents.put(3L, "Casio G-Shock rugged digital sports outdoor watch");

    vectorizer.fit(documents);

    List<RecommendationEngine.ProductFeature> catalog = List.of(
        new RecommendationEngine.ProductFeature(1L, "Rolex Submariner", "Analog", 12000.0, vectorizer.transform(documents.get(1L))),
        new RecommendationEngine.ProductFeature(2L, "Omega Seamaster", "Analog", 11000.0, vectorizer.transform(documents.get(2L))),
        new RecommendationEngine.ProductFeature(3L, "Casio G-Shock", "Digital", 200.0, vectorizer.transform(documents.get(3L)))
    );

    RecommendationEngine engine = new RecommendationEngine();
    List<RecommendationEngine.ScoredProduct> recommendations = engine.recommendSimilar(1L, catalog, 2);

    assertEquals(2, recommendations.size());
    // Should NOT contain the target product (ID 1)
    assertTrue(recommendations.stream().noneMatch(r -> r.productId().equals(1L)));

    // Omega Seamaster (ID 2) must rank higher than Casio G-Shock (ID 3)
    assertEquals(2L, recommendations.getFirst().productId(), "Similar luxury dive watch should be ranked 1st");
    assertTrue(recommendations.get(0).score() > recommendations.get(1).score());
  }

  @Test
  @DisplayName("recommendPersonalized handles cold-start and browsing personalization")
  void testRecommendPersonalized() {
    TfidfVectorizer vectorizer = new TfidfVectorizer();
    Map<Long, String> documents = new HashMap<>();
    documents.put(1L, "Titan Chronograph leather luxury watch");
    documents.put(2L, "Fossil Chronograph brown leather luxury watch");
    documents.put(3L, "Apple Watch smart digital fitness tracker");

    vectorizer.fit(documents);

    List<RecommendationEngine.ProductFeature> catalog = List.of(
        new RecommendationEngine.ProductFeature(1L, "Titan Chronograph", "Analog", 8000.0, vectorizer.transform(documents.get(1L))),
        new RecommendationEngine.ProductFeature(2L, "Fossil Chronograph", "Analog", 8500.0, vectorizer.transform(documents.get(2L))),
        new RecommendationEngine.ProductFeature(3L, "Apple Watch", "Smartwatch", 45000.0, vectorizer.transform(documents.get(3L)))
    );

    RecommendationEngine engine = new RecommendationEngine();

    // 1. Cold-start test (no history)
    List<RecommendationEngine.ScoredProduct> coldStart = engine.recommendPersonalized(Collections.emptyList(), catalog, 2);
    assertEquals(2, coldStart.size(), "Cold start should return fallback picks");

    // 2. Personalization test: user viewed Titan Chronograph (ID 1)
    List<RecommendationEngine.ScoredProduct> personalized = engine.recommendPersonalized(List.of(1L), catalog, 2);
    assertEquals(2, personalized.size());

    // Fossil Chronograph (ID 2) should be recommended #1 due to shared category, chronograph/leather features and similar price
    assertEquals(2L, personalized.getFirst().productId(), "Fossil should be top recommendation for Titan viewer");
    assertTrue(personalized.getFirst().score() > 0.70, "Match score should be high for similar watches (was: " + personalized.getFirst().score() + ")");
  }
}
