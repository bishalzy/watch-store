package com.watchstore.server.config;

import io.github.cdimascio.dotenv.Dotenv;

public class EnvConfig {

  private static String getEnv(Dotenv dotenv, String key) {
    String val = null;
    if (dotenv != null) {
      try {
        val = dotenv.get(key);
      } catch (Exception ignored) {
      }
    }
    if (val == null || val.trim().isEmpty()) {
      val = System.getenv(key);
    }
    return (val != null && !val.trim().isEmpty()) ? val.trim() : null;
  }

  private static void setPropertyIfPresent(String propertyKey, String value) {
    if (value != null && !value.trim().isEmpty()) {
      System.setProperty(propertyKey, value.trim());
    }
  }

  public static void loadEnv() {
    Dotenv dotenv = null;
    try {
      dotenv = Dotenv.configure()
          .ignoreIfMalformed()
          .ignoreIfMissing()
          .load();
    } catch (Exception ignored) {
    }

    String dbUrl = getEnv(dotenv, "DB_URL");
    if (dbUrl != null) {
      if (dbUrl.startsWith("mysql://") || dbUrl.startsWith("mariadb://")) {
        dbUrl = "jdbc:" + dbUrl;
      }
      setPropertyIfPresent("spring.datasource.url", dbUrl);
    }
    setPropertyIfPresent("spring.datasource.username", getEnv(dotenv, "DB_USERNAME"));
    setPropertyIfPresent("spring.datasource.password", getEnv(dotenv, "DB_PASSWORD"));
    setPropertyIfPresent("app.admin.email", getEnv(dotenv, "ADMIN_EMAIL"));
    setPropertyIfPresent("app.admin.username", getEnv(dotenv, "ADMIN_USERNAME"));
    setPropertyIfPresent("app.admin.password", getEnv(dotenv, "ADMIN_PASSWORD"));
    setPropertyIfPresent("JWT_SECRET_KEY", getEnv(dotenv, "JWT_SECRET_KEY"));
    setPropertyIfPresent("SECURE_COOKIE", getEnv(dotenv, "SECURE_COOKIE"));
    setPropertyIfPresent("khalti.secret-key", getEnv(dotenv, "KHALTI_SECRET_KEY"));
    setPropertyIfPresent("khalti.base-url", getEnv(dotenv, "KHALTI_BASE_URL"));
    setPropertyIfPresent("khalti.return-url", getEnv(dotenv, "KHALTI_RETURN_URL"));
    setPropertyIfPresent("khalti.website-url", getEnv(dotenv, "KHALTI_WEBSITE_URL"));
    setPropertyIfPresent("client.url", getEnv(dotenv, "CLIENT_URL"));
    System.setProperty("spring.jpa.hibernate.ddl-auto", "update");

    setPropertyIfPresent("GEMINI_KEY", getEnv(dotenv, "GEMINI_KEY"));
    setPropertyIfPresent("GEMINI_MODELS", getEnv(dotenv, "GEMINI_MODELS"));
    setPropertyIfPresent("GEMINI_MODEL", getEnv(dotenv, "GEMINI_MODEL"));

    String cloudName = getEnv(dotenv, "CLOUDINARY_CLOUD_NAME") != null 
        ? getEnv(dotenv, "CLOUDINARY_CLOUD_NAME") 
        : getEnv(dotenv, "CLOUDNARY_CLOUD_NAME");
    setPropertyIfPresent("cloudinary.cloud-name", cloudName);

    String apiKey = getEnv(dotenv, "CLOUDINARY_API_KEY") != null 
        ? getEnv(dotenv, "CLOUDINARY_API_KEY") 
        : getEnv(dotenv, "CLOUDNARY_API_KEY");
    setPropertyIfPresent("cloudinary.api-key", apiKey);

    String apiSecret = getEnv(dotenv, "CLOUDINARY_API_SECRET") != null 
        ? getEnv(dotenv, "CLOUDINARY_API_SECRET") 
        : getEnv(dotenv, "CLOUDNARY_API_SECRET");
    setPropertyIfPresent("cloudinary.api-secret", apiSecret);
  }
}
