package com.watchstore.server.util;

import java.util.Arrays;
import java.util.Optional;

import com.watchstore.server.dto.auth.UserDTO;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

public class CookieUtil {
  private static String jwtToken;

  private static boolean isSecure() {
    String secure = System.getProperty("SECURE_COOKIE");
    if (secure == null) {
      secure = System.getenv("SECURE_COOKIE");
    }
    return "true".equalsIgnoreCase(secure);
  }

  public static Cookie createCookie(UserDTO userDTO) {
    jwtToken = JWTUtil.generateTokenString(userDTO);
    Cookie cookie = new Cookie("jwt", jwtToken);
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    boolean secure = isSecure();
    cookie.setSecure(secure);
    if (secure) {
      cookie.setAttribute("SameSite", "None");
    } else {
      cookie.setAttribute("SameSite", "Lax");
    }
    cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days in seconds
    return cookie;
  }

  public static Cookie deleteCookie() {
    Cookie cookie = new Cookie("jwt", null);
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    boolean secure = isSecure();
    cookie.setSecure(secure);
    if (secure) {
      cookie.setAttribute("SameSite", "None");
    } else {
      cookie.setAttribute("SameSite", "Lax");
    }
    cookie.setMaxAge(0);
    return cookie;
  }

  public static Optional<UserDTO> getUserFromRequest(HttpServletRequest request) {
    if (request.getCookies() == null)
      return Optional.empty();

    return Arrays.stream(request.getCookies())
        .filter(c -> "jwt".equals(c.getName()))
        .findFirst()
        .map(Cookie::getValue)
        .filter(JWTUtil::isTokenValid)
        .map(JWTUtil::getUserFromToken);
  }
}
