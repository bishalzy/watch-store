# Backend - Online Watch Store

This is the Spring Boot backend for the Online Watch Store, providing RESTful endpoints, JWT security, MariaDB database persistence, and an integrated AI shopping assistant powered by Google Gemini.

---

## Prerequisites

- **Java Development Kit (JDK 21)** or higher installed
- **Maven** (v3.8+) installed
- **MariaDB** (or MySQL) running and configured
- **Google Gemini API Key** (for the AI Watch Assistance)

---

## Environment Variables Configuration

Create a `.env` file at the root of the `server/` directory (`server/.env`). You can use [`server/.env.example`](.env.example) as a reference template:

```bash
# Database connection
DB_URL=jdbc:mariadb://localhost:3306/watchstore
DB_USERNAME=root
DB_PASSWORD=your_database_password

# Authentication & Security
JWT_SECRET_KEY=your_256_bits_key_is_recommended
SECURE_COOKIE="false" # "true" for HTTPS, "false" for HTTP connection

# Initial Admin User Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

# Google Gemini API Key for AI Watch Assistance
GEMINI_KEY=your_gemini_api_key_here
```

> [!NOTE]
> Spring Boot reads these values at startup via [`EnvConfig.java`](./src/main/java/com/watchstore/server/config/EnvConfig.java), which loads the `.env` variables and sets them as system properties for [`application.properties`](./src/main/resources/application.properties).

---

## Setup & Running

1. **Install dependencies and build:**
   ```bash
   mvn clean install
   ```

   To skip tests during build if needed:
   ```bash
   mvn clean install -DskipTests
   ```

2. **Run the backend server:**
   ```bash
   mvn spring-boot:run
   ```
   The backend server runs on port `5000` by default. You can change the port in [`application.properties`](./src/main/resources/application.properties).

---

## Testing

Run the automated test suite using Maven:
```bash
mvn test
```

To run individual test classes:
```bash
# Test the AI Chat & Recommendation Service
mvn test -Dtest=ChatServiceTest
```

---

## Architecture & Code Structure

The backend follows a layered REST API architecture:

##### `config/`
- [`EnvConfig.java`](./src/main/java/com/watchstore/server/config/EnvConfig.java): Reads `.env` variables and populates system properties (including `GEMINI_KEY`).
- [`SecurityConfig.java`](./src/main/java/com/watchstore/server/config/SecurityConfig.java): Configures the Spring Security filter chain, JWT verification, and endpoint access permissions (e.g., permits public access to `/api/chat/**`, `/api/products/**`, `/api/checkout`).
- [`JacksonConfig.java`](./src/main/java/com/watchstore/server/config/JacksonConfig.java): Provides `ObjectMapper` bean for serializing and deserializing JSON payloads.

##### `controller/`
- `AuthController.java`: User registration, login, logout, and token validation.
- `ProductController.java`: Public catalog retrieval, categories, and single product views.
- `AdminProductController.java`: Admin-only product creation, modification, and deletion.
- [`UserChat.java`](./src/main/java/com/watchstore/server/controller/user/UserChat.java): Exposes `POST /api/chat` for conversational interactions with the AI Watch Assistance.
- `OrderController.java`: Order processing and history.

##### `dto/`
- Data Transfer Objects preventing direct exposure of JPA entities.
- **`dto/chat/`**:
  - `ChatMessageDTO.java`: Conversational turns (`role` and `text`).
  - `ChatRequestDTO.java`: Incoming message prompt and conversational history.
  - `ChatResponseDTO.java`: Assistant response text and hydrated `List<ProductDTO>` recommendations.
  - `GeminiStructuredResponse.java`: Structured mapping for model outputs (`reply` and `recommendedProductIds`).

##### `service/`
- [`GeminiService.java`](./src/main/java/com/watchstore/server/service/GeminiService.java): Interacts with Google's Generative Language REST API (`gemini-3.6-flash`), enforcing structured JSON schema outputs and grounding system instructions.
- [`ChatService.java`](./src/main/java/com/watchstore/server/service/ChatService.java): Assembles compact live catalog data, dispatches prompts to Gemini, and hydrates recommended IDs into full database entities with prices, images, and stock.
- `ProductService.java`: Product business logic and file image handling.
- `UserService.java`, `AuthService.java`, `OrderService.java`.

##### `repository/`
- Spring Data JPA repositories interfacing with MariaDB.

##### `exceptions/`
- Custom domain exceptions and global REST exception handler.

---

## Database Initialization

The database schema is automatically executed on startup from [`schema.sql`](./src/main/resources/schema.sql) through:
```properties
spring.sql.init.mode=always
spring.sql.init.schema.locations=classpath:schema.sql
```
Initial admin user creation runs automatically on startup via the `startup/` initialization runner if no admin exists.
