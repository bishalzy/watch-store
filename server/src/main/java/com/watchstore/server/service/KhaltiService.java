package com.watchstore.server.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.watchstore.server.dto.khalti.KhaltiInitiateRequestDTO;
import com.watchstore.server.dto.khalti.KhaltiInitiateResponseDTO;
import com.watchstore.server.dto.khalti.KhaltiLookupResponseDTO;

import com.watchstore.server.exceptions.BadRequestException;

@Service
public class KhaltiService {
  private final RestTemplate restTemplate;

  @Value("${khalti.secret-key}")
  private String secretKey;

  @Value("${khalti.base-url}")
  private String baseUrl;

  public KhaltiService(RestTemplate restTemplate) {
      this.restTemplate = restTemplate;
  }

  public KhaltiInitiateResponseDTO initiatePayment(KhaltiInitiateRequestDTO request) {
      HttpHeaders headers = new HttpHeaders();
      headers.set("Authorization", "Key " + secretKey);
      headers.setContentType(MediaType.APPLICATION_JSON);

      HttpEntity<KhaltiInitiateRequestDTO> entity = new HttpEntity<>(request, headers);

      try {
          ResponseEntity<KhaltiInitiateResponseDTO> response = restTemplate.postForEntity(
              baseUrl + "/epayment/initiate/", entity, KhaltiInitiateResponseDTO.class);
          return response.getBody();
      } catch (HttpClientErrorException e) {
          throw new BadRequestException("Khalti initiation failed: " + e.getResponseBodyAsString());
      }
  }

  public KhaltiLookupResponseDTO verifyPayment(String pidx) {
      HttpHeaders headers = new HttpHeaders();
      headers.set("Authorization", "Key " + secretKey);
      headers.setContentType(MediaType.APPLICATION_JSON);

      Map<String, String> body = Map.of("pidx", pidx);
      HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

      try {
          ResponseEntity<KhaltiLookupResponseDTO> response = restTemplate.postForEntity(
              baseUrl + "/epayment/lookup/", entity, KhaltiLookupResponseDTO.class);
          return response.getBody();
      } catch (HttpClientErrorException e) {
          throw new BadRequestException("Khalti verification failed: " + e.getResponseBodyAsString());
      }
  }
}
