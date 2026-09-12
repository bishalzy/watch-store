package com.watchstore.server.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;

public class CloudinaryServiceTest {

  private Cloudinary cloudinary;
  private Uploader uploader;
  private CloudinaryService cloudinaryService;

  @BeforeEach
  public void setUp() {
    cloudinary = mock(Cloudinary.class);
    uploader = mock(Uploader.class);
    when(cloudinary.uploader()).thenReturn(uploader);
    cloudinaryService = new CloudinaryService(cloudinary);
  }

  @Test
  public void testExtractPublicId_WithFullCloudinaryUrl() {
    String url = "https://res.cloudinary.com/demo/image/upload/v1726135000/watchstore/products/sample_watch.jpg";
    String publicId = cloudinaryService.extractPublicId(url);
    assertEquals("watchstore/products/sample_watch", publicId);
  }

  @Test
  public void testExtractPublicId_WithoutVersionPrefix() {
    String url = "https://res.cloudinary.com/demo/image/upload/watchstore/products/sample_watch.png";
    String publicId = cloudinaryService.extractPublicId(url);
    assertEquals("watchstore/products/sample_watch", publicId);
  }

  @Test
  public void testExtractPublicId_WithQueryParams() {
    String url = "https://res.cloudinary.com/demo/image/upload/v1234/watchstore/products/sample.webp?auto=format";
    String publicId = cloudinaryService.extractPublicId(url);
    assertEquals("watchstore/products/sample", publicId);
  }

  @Test
  public void testExtractPublicId_WithRawPublicId() {
    String raw = "watchstore/products/sample_watch";
    String publicId = cloudinaryService.extractPublicId(raw);
    assertEquals("watchstore/products/sample_watch", publicId);
  }

  @Test
  public void testExtractPublicId_NullOrEmpty() {
    assertNull(cloudinaryService.extractPublicId(null));
    assertNull(cloudinaryService.extractPublicId("   "));
  }

  @Test
  public void testDeleteImage_Success() throws IOException {
    when(uploader.destroy(org.mockito.ArgumentMatchers.eq("watchstore/products/sample"), anyMap()))
        .thenReturn(Map.of("result", "ok"));

    boolean deleted = cloudinaryService.deleteImage("https://res.cloudinary.com/demo/image/upload/v123/watchstore/products/sample.jpg");
    assertEquals(true, deleted);
  }
}
