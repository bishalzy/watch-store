package com.watchstore.server.algorithm;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Custom TF-IDF (Term Frequency - Inverse Document Frequency) Vectorizer
 * for Content-Based Product Recommendation.
 *
 * Implements:
 * 1. Tokenization and stop-word filtering
 * 2. Vocabulary extraction across the catalog corpus
 * 3. Term Frequency (TF) computation per product document
 * 4. Inverse Document Frequency (IDF) computation across the catalog
 * 5. L2 Euclidean normalization for efficient cosine similarity via dot product
 */
public class TfidfVectorizer {

  private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9\\s]");
  private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s+");

  private static final Set<String> STOP_WORDS = Set.of(
      "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
      "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
      "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
      "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
      "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
      "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
      "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
      "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
      "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
      "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
      "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
      "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
      "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
      "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
      "they're", "they've", "this", "those", "through", "to", "too", "under",
      "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
      "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
      "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
      "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
      "your", "yours", "yourself", "yourselves"
  );

  private final Map<String, Integer> vocabulary = new HashMap<>();
  private final Map<String, Double> idfMap = new HashMap<>();
  private int totalDocuments = 0;

  /**
   * Preprocess a raw text string: converts to lowercase, removes punctuation,
   * splits by whitespace, and filters out stop words and short tokens.
   *
   * @param rawText the input text
   * @return list of normalized tokens
   */
  public List<String> tokenize(String rawText) {
    if (rawText == null || rawText.isBlank()) {
      return Collections.emptyList();
    }

    String cleaned = NON_ALPHANUMERIC.matcher(rawText.toLowerCase()).replaceAll(" ");
    String[] parts = MULTIPLE_SPACES.matcher(cleaned.trim()).replaceAll(" ").split(" ");

    List<String> tokens = new ArrayList<>();
    for (String part : parts) {
      if (part.length() > 1 && !STOP_WORDS.contains(part)) {
        tokens.add(part);
      }
    }
    return tokens;
  }

  /**
   * Fits the vectorizer on a collection of document texts (name + category + description).
   * Populates the vocabulary and computes the IDF for each token.
   *
   * @param documents map of document ID to full text
   */
  public void fit(Map<Long, String> documents) {
    vocabulary.clear();
    idfMap.clear();
    totalDocuments = documents.size();

    if (totalDocuments == 0) {
      return;
    }

    // Track document frequency: how many documents contain each term
    Map<String, Integer> documentFrequency = new HashMap<>();

    for (String text : documents.values()) {
      List<String> tokens = tokenize(text);
      Set<String> uniqueTokens = new HashSet<>(tokens);
      for (String token : uniqueTokens) {
        documentFrequency.merge(token, 1, Integer::sum);
      }
    }

    // Build vocabulary index and calculate smoothed IDF: ln(1 + totalDocs / df)
    int index = 0;
    for (Map.Entry<String, Integer> entry : documentFrequency.entrySet()) {
      String term = entry.getKey();
      int df = entry.getValue();
      vocabulary.put(term, index++);

      double idf = Math.log(1.0 + ((double) totalDocuments / (double) df));
      idfMap.put(term, idf);
    }
  }

  /**
   * Transforms a document text into an L2-normalized TF-IDF vector.
   *
   * @param text document text
   * @return normalized double array of size vocabulary.size()
   */
  public double[] transform(String text) {
    int vocabSize = vocabulary.size();
    if (vocabSize == 0) {
      return new double[0];
    }

    double[] vector = new double[vocabSize];
    List<String> tokens = tokenize(text);
    if (tokens.isEmpty()) {
      return vector;
    }

    // Calculate raw Term Frequencies
    Map<String, Integer> tfCount = new HashMap<>();
    for (String token : tokens) {
      if (vocabulary.containsKey(token)) {
        tfCount.merge(token, 1, Integer::sum);
      }
    }

    // Apply TF * IDF formula
    int totalTokens = tokens.size();
    double sumOfSquares = 0.0;

    for (Map.Entry<String, Integer> entry : tfCount.entrySet()) {
      String term = entry.getKey();
      int count = entry.getValue();
      int termIndex = vocabulary.get(term);

      double tf = (double) count / totalTokens;
      double idf = idfMap.getOrDefault(term, 0.0);
      double tfidf = tf * idf;

      vector[termIndex] = tfidf;
      sumOfSquares += tfidf * tfidf;
    }

    // L2 Normalization: v_norm = v / ||v||_2
    double magnitude = Math.sqrt(sumOfSquares);
    if (magnitude > 0.0) {
      for (int i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }

    return vector;
  }

  public int getVocabSize() {
    return vocabulary.size();
  }

  public Map<String, Integer> getVocabulary() {
    return Collections.unmodifiableMap(vocabulary);
  }
}
