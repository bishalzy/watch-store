package com.watchstore.server.startup;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.watchstore.server.model.User;
import com.watchstore.server.repository.UserRepository;

@Component
public class StartupService {
  private final UserRepository userRepository;

  private final String adminEmail;
  private final String adminUsername;
  private final String adminPassword;

  private final PasswordEncoder passwordEncoder;

  public StartupService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      @Value("${app.admin.email}") String adminEmail,
      @Value("${app.admin.username}") String adminUsername,
      @Value("${app.admin.password}") String adminPassword) {
    this.userRepository = userRepository;
    this.adminEmail = adminEmail;
    this.adminUsername = adminUsername;
    this.adminPassword = adminPassword;
    this.passwordEncoder = passwordEncoder;

  }

  @EventListener(ApplicationReadyEvent.class)
  public void promoteAdminUser() {
    if (adminEmail == null || adminEmail.isBlank()) {
      System.out.println("No admin email configured.");
      return;
    }

    userRepository.findByEmail(adminEmail).ifPresentOrElse(user -> {
      if (!user.getRole().equals("ADMIN")) {
        user.setRole("ADMIN");
        ;
        userRepository.save(user);
        System.out.println("Promoted user " + adminEmail + " to admin.");
      } else {
        System.out.println("User " + adminEmail + " is already an admin.");
      }
    }, () -> {

      User newAdmin = new User();
      newAdmin.setEmail(adminEmail);
      newAdmin.setUsername(adminUsername);
      newAdmin.setPassword(passwordEncoder.encode(adminPassword));
      newAdmin.setRole("ADMIN");
      newAdmin.setSecurityCode("good_code");
      userRepository.save(newAdmin);
      System.out.println("Created new admin " + adminEmail);
    });
  }
}
