package com.watchstore.server.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class StorageProperties {

  private String dir;

  public String getDir() {
    return dir;
  }

  public void setDir(String dir) {
    this.dir = dir;
  }

  public Path getUploadPath() {
    return Paths.get(dir);
  }

  @PostConstruct
  public void ensureDirectoryExists() throws IOException {
    Files.createDirectories(getUploadPath());
  }
}
