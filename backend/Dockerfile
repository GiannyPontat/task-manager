# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# On définit une limite de mémoire pour Maven (300Mo max)
ENV MAVEN_OPTS="-Xmx300m"

COPY pom.xml .
# On télécharge les dépendances (sans le -q pour voir la progression)
RUN mvn dependency:go-offline

COPY src ./src
# On compile (sans les tests et avec limite de RAM)
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# On récupère le JAR généré
COPY --from=build /app/target/*.jar app.jar

# Très important pour Render : utiliser la variable PORT
ENV PORT=8080
EXPOSE 8080

# On lance l'app en limitant aussi la RAM au runtime
ENTRYPOINT ["java", "-Xmx300m", "-jar", "app.jar"]