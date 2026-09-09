package com.watchstore.server.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.server.dto.chat.ChatRequestDTO;
import com.watchstore.server.dto.chat.ChatResponseDTO;
import com.watchstore.server.dto.chat.GeminiStructuredResponse;
import com.watchstore.server.dto.product.ProductDTO;

@Service
public class ChatService {

  private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

  private final GeminiService geminiService;
  private final ProductService productService;
  private final ObjectMapper objectMapper;

  public ChatService(GeminiService geminiService, ProductService productService, ObjectMapper objectMapper) {
    this.geminiService = geminiService;
    this.productService = productService;
    this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
  }

  public ChatResponseDTO processChat(ChatRequestDTO request) {
    String userMessage = request.getMessage();
    if (userMessage == null || userMessage.trim().isEmpty()) {
      return new ChatResponseDTO("Please provide a question or describe what kind of watch you are looking for.",
          new ArrayList<>());
    }

    // 1. Fetch all active products from the store
    List<ProductDTO> activeProducts = productService.getAllActiveProducts();

    if (activeProducts == null || activeProducts.isEmpty()) {
      return new ChatResponseDTO("Our catalog currently has no products in stock. Please check back soon!",
          new ArrayList<>());
    }

    // 2. Map active products by ID for fast hydration
    Map<Long, ProductDTO> productMap = activeProducts.stream()
        .collect(Collectors.toMap(ProductDTO::getId, p -> p, (a, b) -> a));

    // 3. Create a compact catalog representation for Gemini
    String catalogJson = buildCompactCatalog(activeProducts);

    // 4. Call Gemini to get recommendations
    GeminiStructuredResponse geminiResponse = geminiService.generateRecommendation(
        catalogJson,
        userMessage,
        request.getHistory());

    // 5. Hydrate recommended product IDs in the order Gemini prioritized them
    List<ProductDTO> recommendedProducts = new ArrayList<>();
    if (geminiResponse.getRecommendedProductIds() != null) {
      for (Long id : geminiResponse.getRecommendedProductIds()) {
        ProductDTO matched = productMap.get(id);
        if (matched != null) {
          recommendedProducts.add(matched);
        }
      }
    }

    return new ChatResponseDTO(geminiResponse.getReply(), recommendedProducts);
  }

  private String buildCompactCatalog(List<ProductDTO> products) {
    try {
      List<Map<String, Object>> compactList = new ArrayList<>();
      for (ProductDTO p : products) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", p.getId());
        item.put("name", p.getName());
        item.put("category", p.getCategory());
        item.put("price", p.getPrice());
        item.put("description", p.getDescription());
        item.put("inStock", p.getQuantity() > 0);
        compactList.add(item);
      }
      return objectMapper.writeValueAsString(compactList);
    } catch (Exception e) {
      logger.error("Failed to serialize catalog for Gemini", e);
      return "[]";
    }
  }
}
