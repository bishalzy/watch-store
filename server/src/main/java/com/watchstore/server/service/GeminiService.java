package com.watchstore.server.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.server.dto.chat.ChatMessageDTO;
import com.watchstore.server.dto.chat.GeminiStructuredResponse;

@Service
public class GeminiService {

  private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

  @Value("${gemini.api.key}")
  private String apiKey;

  @Value("${gemini.model:gemini-3.6-flash}")
  private String modelName;

  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;

  public GeminiService(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();
  }

  public GeminiStructuredResponse generateRecommendation(String catalogJson, String userMessage,
      List<ChatMessageDTO> history) {
    if (apiKey == null || apiKey.trim().isEmpty()) {
      logger.warn("GEMINI_KEY is missing or empty. Returning fallback response.");
      return new GeminiStructuredResponse(
          "The AI Assistant is currently not configured with an API key. Please browse our collection on the Products page.",
          Collections.emptyList());
    }

    try {
      String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
          + modelName + ":generateContent?key=" + apiKey;

      Map<String, Object> requestPayload = buildRequestPayload(catalogJson, userMessage, history);
      String requestBodyJson = objectMapper.writeValueAsString(requestPayload);

      HttpRequest httpRequest = HttpRequest.newBuilder()
          .uri(URI.create(endpoint))
          .header("Content-Type", "application/json")
          .timeout(Duration.ofSeconds(20))
          .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
          .build();

      HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() >= 200 && response.statusCode() < 300) {
        return parseGeminiResponse(response.body());
      } else {
        logger.error("Gemini API error. Status: {}, Body: {}", response.statusCode(), response.body());
        return new GeminiStructuredResponse(
            "I'm temporarily having trouble consulting the catalog. Feel free to browse our Products page while I get back up!",
            Collections.emptyList());
      }

    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      logger.error("Gemini API call interrupted", e);
      return new GeminiStructuredResponse("Request timed out. Please try again.", Collections.emptyList());
    } catch (Exception e) {
      logger.error("Error communicating with Gemini API", e);
      return new GeminiStructuredResponse(
          "I encountered an unexpected issue. Please ask again or explore our Products collection.",
          Collections.emptyList());
    }
  }

  private Map<String, Object> buildRequestPayload(String catalogJson, String userMessage,
      List<ChatMessageDTO> history) {
    Map<String, Object> payload = new HashMap<>();

    // 1. System instruction
    String systemPrompt = "You are the expert Horologist & AI Personal Shopping Assistance for WS (Watch Store).\n"
        + "Your goal is to assist customers in finding their ideal watch based on style, budget, specifications, and occasion.\n\n"
        + "CATALOG RULES:\n"
        + "1. You must ONLY recommend watches from this live store catalog:\n"
        + catalogJson + "\n\n"
        + "2. Tone: Warm, knowledgeable, refined, and conversational.\n"
        + "3. The store currency is Rupees (Rs.). When discussing prices, budgets, or price comparisons, ALWAYS use 'Rs.' as the currency prefix (e.g., Rs. 5,000 or Rs. 15,000) and NEVER use '$'.\n"
        + "4. Explain concisely why the recommended watches suit the user's request (aesthetic, price, features).\n"
        + "5. If no watch in the catalog directly matches, politely explain and suggest the closest available watches.\n"
        + "6. Output MUST adhere strictly to the JSON schema: 'reply' (your markdown conversational text) and 'recommendedProductIds' (array of IDs of recommended watches, ordered by relevance).";

    Map<String, Object> systemInstruction = Map.of(
        "parts", List.of(Map.of("text", systemPrompt)));
    payload.put("system_instruction", systemInstruction);

    // 2. Chat contents (history + current message)
    List<Map<String, Object>> contents = new ArrayList<>();

    if (history != null) {
      for (ChatMessageDTO msg : history) {
        String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
        if (msg.getText() != null && !msg.getText().trim().isEmpty()) {
          contents.add(Map.of(
              "role", role,
              "parts", List.of(Map.of("text", msg.getText()))));
        }
      }
    }

    // Add current user message
    contents.add(Map.of(
        "role", "user",
        "parts", List.of(Map.of("text", userMessage))));

    payload.put("contents", contents);

    // 3. Generation config for structured JSON output
    Map<String, Object> replySchema = Map.of("type", "STRING");
    Map<String, Object> productIdsSchema = Map.of(
        "type", "ARRAY",
        "items", Map.of("type", "INTEGER"));

    Map<String, Object> responseSchema = Map.of(
        "type", "OBJECT",
        "properties", Map.of(
            "reply", replySchema,
            "recommendedProductIds", productIdsSchema),
        "required", List.of("reply", "recommendedProductIds"));

    Map<String, Object> generationConfig = Map.of(
        "responseMimeType", "application/json",
        "responseSchema", responseSchema,
        "temperature", 0.7);

    payload.put("generationConfig", generationConfig);

    return payload;
  }

  private GeminiStructuredResponse parseGeminiResponse(String responseBody) throws IOException {
    JsonNode root = objectMapper.readTree(responseBody);
    JsonNode candidates = root.path("candidates");

    if (candidates.isArray() && !candidates.isEmpty()) {
      JsonNode parts = candidates.get(0).path("content").path("parts");
      if (parts.isArray() && !parts.isEmpty()) {
        String structuredJsonText = parts.get(0).path("text").asText();
        if (structuredJsonText != null && !structuredJsonText.trim().isEmpty()) {
          return objectMapper.readValue(structuredJsonText, GeminiStructuredResponse.class);
        }
      }
    }

    return new GeminiStructuredResponse(
        "I'd love to help you find a watch. Could you tell me a bit more about your style or budget?",
        Collections.emptyList());
  }
}
