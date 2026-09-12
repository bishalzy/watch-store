package com.watchstore.server.service;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {

  private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

  private final Cloudinary cloudinary;

  public CloudinaryService(Cloudinary cloudinary) {
    this.cloudinary = cloudinary;
  }

  public String uploadImage(MultipartFile file, String folder) throws IOException {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File must not be empty");
    }

    Map<?, ?> uploadResult = cloudinary.uploader().upload(
        file.getBytes(),
        ObjectUtils.asMap(
            "folder", folder,
            "resource_type", "image"
        )
    );

    return (String) uploadResult.get("secure_url");
  }

  public boolean deleteImage(String imageUrlOrPublicId) {
    if (imageUrlOrPublicId == null || imageUrlOrPublicId.trim().isEmpty()) {
      return false;
    }

    String publicId = extractPublicId(imageUrlOrPublicId);
    if (publicId == null || publicId.isEmpty()) {
      return false;
    }

    try {
      Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
      String resultStatus = (String) result.get("result");
      return "ok".equalsIgnoreCase(resultStatus);
    } catch (Exception e) {
      logger.error("Failed to delete image from Cloudinary with publicId: {}", publicId, e);
      return false;
    }
  }

  public String extractPublicId(String imageUrlOrPublicId) {
    if (imageUrlOrPublicId == null || imageUrlOrPublicId.trim().isEmpty()) {
      return null;
    }

    String trimmed = imageUrlOrPublicId.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return trimmed;
    }

    int uploadIndex = trimmed.indexOf("/upload/");
    if (uploadIndex == -1) {
      return null;
    }

    String pathAfterUpload = trimmed.substring(uploadIndex + "/upload/".length());

    // Strip version prefix if present, e.g. v1726135000/
    pathAfterUpload = pathAfterUpload.replaceFirst("^v\\d+/", "");

    // Strip query parameters
    int queryIndex = pathAfterUpload.indexOf('?');
    if (queryIndex != -1) {
      pathAfterUpload = pathAfterUpload.substring(0, queryIndex);
    }

    // Strip file extension
    int lastDot = pathAfterUpload.lastIndexOf('.');
    if (lastDot != -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDot);
    }

    return pathAfterUpload;
  }
}
