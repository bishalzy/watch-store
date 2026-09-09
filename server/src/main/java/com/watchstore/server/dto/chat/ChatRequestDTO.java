package com.watchstore.server.dto.chat;

import java.util.ArrayList;
import java.util.List;

public class ChatRequestDTO {
  private String message;
  private List<ChatMessageDTO> history = new ArrayList<>();

  public ChatRequestDTO() {
  }

  public ChatRequestDTO(String message, List<ChatMessageDTO> history) {
    this.message = message;
    if (history != null) {
      this.history = history;
    }
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public List<ChatMessageDTO> getHistory() {
    return history;
  }

  public void setHistory(List<ChatMessageDTO> history) {
    this.history = history;
  }
}
