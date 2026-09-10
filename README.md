# Online Watch Store

A full-stack e-commerce watch store built with **Spring Boot 21**, **React 18**, **Tailwind CSS**, and **TypeScript**, featuring an **AI Watch Assistance** powered by **Google Gemini**.

---

## Features

- **Watch Catalog & Collections**: Browse watches grouped by categories (Analog, Digital, Smartwatches).
- **Fuzzy Search Algorithm**: Instant search powered by an in-house **Levenshtein Distance** algorithm to find products even with typos or partial names.
- **AI Watch Assistance**: Conversational shopping assistant powered by Google Gemini (`gemini-3.6-flash`). Shoppers can describe their preferred style, occasion, budget, or specifications in plain English, and receive conversational guidance with interactive product recommendation cards grounded in the live MariaDB database.
- **Interactive Shopping Cart & Drawer**: Persistent cart drawer using Zustand, with real-time stock limits, quantity adjustments, and checkout flow.
- **Role-Based Authentication**: Secure JWT-based authentication using HTTP-only cookies, with distinct roles for Customers (`USER`) and Store Managers (`ADMIN`).
- **Admin Management Portal**: Administrative tools for creating new products, updating pricing/stock, uploading high-resolution imagery, and managing watch categories.
- **Responsive Dark Luxury Aesthetic**: Consistent dark luxury styling (`#1a1a1a`, `#1bddf3` accents, and high-contrast borders) across desktop and mobile viewports.

---

## Tech Stack

### Frontend (`/client`)
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS
- **State Management**: Zustand
- **Networking**: Axios
- **Icons**: React Icons (Ionicons 5, Remix Icons, FontAwesome)
- **Testing**: Vitest, React Testing Library

### Backend (`/server`)
- **Core**: Java 21, Spring Boot 21
- **Security**: Spring Security, JJWT (Java JWT)
- **Data Persistence**: Spring Data JPA, Hibernate, MariaDB / MySQL
- **JSON Processing**: Jackson (`jackson-databind`)
- **AI Integration**: Google Generative Language REST API (`gemini-3.6-flash`) with structured JSON schema outputs
- **Testing**: JUnit 5, Mockito

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher) and **npm**
- **Java Development Kit (JDK 21)**
- **Maven 3.8+**
- **MariaDB** or **MySQL** server
- **Google Gemini API Key** (optional, required for the AI Watch Assistance)

---

### 1. Database Setup

Create a database named `watchstore` in your SQL server:
```sql
CREATE DATABASE watchstore;
```
The database schema and tables will be automatically initialized by Spring Boot on startup via [`schema.sql`](server/src/main/resources/schema.sql).

---

### 2. Backend Setup (`/server`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create your `.env` configuration file (see [`server/.env.example`](server/.env.example)):
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your database credentials and Gemini API key:
   ```env
   DB_URL=jdbc:mariadb://localhost:3306/watchstore
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password

   JWT_SECRET_KEY=your_256_bit_secret_key
   SECURE_COOKIE=false

   ADMIN_EMAIL=admin@example.com
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password

   GEMINI_KEY=your_gemini_api_key

   KHALTI_SECRET_KEY=your_khalti_secret_private_key
   KHALTI_BASE_URL=https://dev.khalti.com/api/v2
   KHALTI_RETURN_URL=http://localhost:5173/checkout/verify # Should match frontend's URL and route
   KHALTI_WEBSITE_URL=http://localhost:5173
   ```
4. Build and start the backend service:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The server will start on port `5000` (e.g. `http://localhost:5000`).

For more details on backend structure and testing, check the [Server README](server/README.md).

---

### 3. Frontend Setup (`/client`)

1. In a new terminal, navigate to the client folder:
   ```bash
   cd client
   ```
2. Create your `.env` file (see [`client/.env.example`](client/.env.example)):
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

For detailed information on components, state stores, and hooks, see the [Client README](client/README.md).

---

## Running Tests

- **Backend Unit & Integration Tests**:
  ```bash
  cd server
  mvn test
  ```
  To run specific tests (e.g., AI Chat Service):
  ```bash
  mvn test -Dtest=ChatServiceTest
  ```

- **Frontend Unit Tests**:
  ```bash
  cd client
  npm run test
  ```

---

## Contributing

Contributions are welcome! If you'd like to improve features, add new tests, or refactor components:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
