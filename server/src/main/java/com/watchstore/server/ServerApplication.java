package com.watchstore.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.watchstore.server.config.EnvConfig;

@SpringBootApplication
public class ServerApplication {

  public static void main(String[] args) {
    EnvConfig.loadEnv();
    SpringApplication.run(ServerApplication.class, args);
  }
}
