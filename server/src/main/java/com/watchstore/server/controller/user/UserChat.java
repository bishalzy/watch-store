package com.watchstore.server.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.watchstore.server.dto.chat.ChatRequestDTO;
import com.watchstore.server.dto.chat.ChatResponseDTO;
import com.watchstore.server.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class UserChat {

  private final ChatService chatService;

  public UserChat(ChatService chatService) {
    this.chatService = chatService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.OK)
  public ChatResponseDTO chatWithAI(@RequestBody ChatRequestDTO request) {
    return chatService.processChat(request);
  }
}
