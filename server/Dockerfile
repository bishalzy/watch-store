# Build stage
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

# Copy Maven wrapper and POM
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# Copy source code and build production jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy packaged jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Configure default port
ENV PORT=5000
EXPOSE 5000

# Run Spring Boot app
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
