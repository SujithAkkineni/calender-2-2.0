# Use Maven image to build the application
FROM maven:3.9.11-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
# Added destination './' to COPY command and removed space
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# Use JDK image to run the application
FROM eclipse-temurin:21-jre

# Set working directory
WORKDIR /app

# Copy the jar file from build stage
# Removed spaces inside '*. jar' and 'app. jar'
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
# Removed spaces and formatted array properly
ENTRYPOINT ["java", "-jar", "app.jar"]
