# ----- STAGE 1: Build with JDK 21 -----
# Use image with Maven and JDK 21
FROM maven:3.9-eclipse-temurin-21 AS builder

# Tạo thư mục làm việc
WORKDIR /app

# Copy file pom.xml trước để tận dụng cache của Docker
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ source code còn lại
COPY src ./src

# Chạy lệnh build của Maven để tạo ra file .jar
RUN mvn clean package -DskipTests


# ----- STAGE 2: Run with JRE 21 -----
# Use openjdk:21-jdk-slim
FROM openjdk:21-jdk-slim

# Tạo thư mục làm việc
WORKDIR /app

# Chỉ copy file .jar đã được build từ STAGE 1 vào image cuối cùng
COPY --from=builder /app/target/*.jar app.jar

# Mở cổng 8080 (hoặc cổng ứng dụng của bạn)
EXPOSE 8080

# Lệnh để khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]