package com.watchstore.server;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.server.dto.chat.ChatRequestDTO;
import com.watchstore.server.dto.chat.ChatResponseDTO;
import com.watchstore.server.dto.chat.GeminiStructuredResponse;
import com.watchstore.server.dto.product.ProductDTO;
import com.watchstore.server.model.Category;
import com.watchstore.server.model.Inventory;
import com.watchstore.server.model.Product;
import com.watchstore.server.service.ChatService;
import com.watchstore.server.service.GeminiService;
import com.watchstore.server.service.ProductService;

public class ChatServiceTest {

  private GeminiService geminiService;
  private ProductService productService;
  private ChatService chatService;

  @BeforeEach
  void setUp() {
    geminiService = Mockito.mock(GeminiService.class);
    productService = Mockito.mock(ProductService.class);
    chatService = new ChatService(geminiService, productService, new ObjectMapper());
  }

  @Test
  void testProcessChatReturnsHydratedProducts() {
    // Mock active products
    Category cat = new Category("Sport");
    Product product1 = new Product("Aqua Diver", 250.0, cat, "Water resistant 200m diver watch", "diver.jpg");
    Inventory inv1 = new Inventory();
    inv1.setQuantity(5);
    inv1.setProduct(product1);
    ProductDTO dto1 = new ProductDTO(product1, inv1);

    when(productService.getAllActiveProducts()).thenReturn(List.of(dto1));

    // Mock Gemini response
    GeminiStructuredResponse geminiMock = new GeminiStructuredResponse(
        "I recommend the Aqua Diver for water activities.",
        List.of(dto1.getId())
    );
    when(geminiService.generateRecommendation(anyString(), anyString(), anyList()))
        .thenReturn(geminiMock);

    ChatRequestDTO request = new ChatRequestDTO("diver watch", Collections.emptyList());
    ChatResponseDTO response = chatService.processChat(request);

    assertNotNull(response);
    assertEquals("I recommend the Aqua Diver for water activities.", response.getReply());
    assertFalse(response.getRecommendedProducts().isEmpty());
    assertEquals("Aqua Diver", response.getRecommendedProducts().get(0).getName());
  }

  @Test
  void testProcessChatWithEmptyMessage() {
    ChatRequestDTO request = new ChatRequestDTO("", Collections.emptyList());
    ChatResponseDTO response = chatService.processChat(request);

    assertNotNull(response);
    assertFalse(response.getReply().isEmpty());
    assertEquals(0, response.getRecommendedProducts().size());
  }
}
