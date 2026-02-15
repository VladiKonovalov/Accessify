# Maven/Gradle Setup Guide for Accessify

This guide explains how to use Accessify as a dependency in Maven and Gradle projects.

## Prerequisites

Before packaging Accessify as a WebJar, ensure you have:
1. Built the JavaScript library: `npm run build`
2. Maven 3.6+ or Gradle 6.0+ installed

## Building the WebJar

### Using Maven

```bash
# Build the WebJar
mvn clean package

# Install to local Maven repository (~/.m2/repository)
mvn clean install

# Deploy to Maven Central (requires GPG signing and Sonatype credentials)
mvn clean deploy
```

### Using Gradle

```bash
# Build the WebJar
./gradlew clean build

# Install to local Maven repository (~/.m2/repository)
./gradlew clean publishToMavenLocal

# Publish to remote repository (configure in build.gradle)
./gradlew clean publish
```

## Using Accessify in Your Java Project

### Maven Dependency

Add the following to your `pom.xml`:

```xml
<dependencies>
    <dependency>
        <groupId>org.webjars</groupId>
        <artifactId>accessify</artifactId>
        <version>2.0.0</version>
    </dependency>
</dependencies>
```

### Gradle Dependency

Add the following to your `build.gradle`:

```groovy
dependencies {
    implementation 'org.webjars:accessify:2.0.0'
}
```

Or in Kotlin DSL (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("org.webjars:accessify:2.0.0")
}
```

## Including Accessify in Your Web Application

### Spring Boot Example

In Spring Boot, WebJars are automatically available. Include the script in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Application</title>
</head>
<body>
    <h1>Welcome</h1>
    
    <!-- Accessify will be available at /webjars/accessify/2.0.0/accessify.min.js -->
    <script src="/webjars/accessify/2.0.0/accessify.min.js"></script>
    <script>
        // Initialize Accessify Toolbar V2
        var toolbar = new Accessify.ToolbarV2();
        toolbar.init();
    </script>
</body>
</html>
```

### Standard Servlet/JSP Example

For standard Java web applications, you can use the WebJar servlet or manually extract files:

**Option 1: Using WebJar Servlet**

Add the WebJar servlet dependency:

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>webjars-servlet-2.x</artifactId>
    <version>1.6</version>
</dependency>
```

Configure in `web.xml`:

```xml
<servlet>
    <servlet-name>WebJarServlet</servlet-name>
    <servlet-class>org.webjars.servlet.WebjarsServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>WebJarServlet</servlet-name>
    <url-pattern>/webjars/*</url-pattern>
</servlet-mapping>
```

Then reference in your HTML:

```html
<script src="/webjars/accessify/2.0.0/accessify.min.js"></script>
```

**Option 2: Manual Extraction**

Extract files from the JAR and serve them statically:

```java
// Example: Extract and serve files
InputStream is = getClass().getResourceAsStream(
    "/META-INF/resources/webjars/accessify/2.0.0/accessify.min.js"
);
// Copy to your webapp directory or serve directly
```

### Thymeleaf Example

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>My Application</title>
</head>
<body>
    <h1>Welcome</h1>
    
    <script th:src="@{/webjars/accessify/2.0.0/accessify.min.js}"></script>
    <script>
        var toolbar = new Accessify.ToolbarV2();
        toolbar.init();
    </script>
</body>
</html>
```

## Publishing to Maven Central

To publish to Maven Central (Sonatype OSSRH):

### 1. Create a Sonatype Account

1. Create an account at https://issues.sonatype.org/
2. Create a ticket to request groupId ownership
3. Wait for approval

### 2. Configure GPG Signing

```bash
# Generate GPG key
gpg --gen-key

# List your keys
gpg --list-keys

# Export public key
gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
```

### 3. Configure Maven Settings

Add to `~/.m2/settings.xml`:

```xml
<settings>
    <servers>
        <server>
            <id>ossrh</id>
            <username>YOUR_SONATYPE_USERNAME</username>
            <password>YOUR_SONATYPE_PASSWORD</password>
        </server>
    </servers>
</settings>
```

### 4. Update pom.xml

Add distribution management:

```xml
<distributionManagement>
    <snapshotRepository>
        <id>ossrh</id>
        <url>https://oss.sonatype.org/content/repositories/snapshots</url>
    </snapshotRepository>
    <repository>
        <id>ossrh</id>
        <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
    </repository>
</distributionManagement>
```

### 5. Deploy

```bash
mvn clean deploy
```

## Publishing to Local Repository

For testing or internal use:

```bash
# Maven
mvn clean install

# Gradle
./gradlew clean publishToMavenLocal
```

Then add local repository to your project's `pom.xml` or `build.gradle` (usually not needed as Maven/Gradle check local repo automatically).

## Version Management

Update the version in:
- `pom.xml` - `<version>` tag
- `build.gradle` - `version` property
- `package.json` - `version` field

Keep all versions synchronized.

## Troubleshooting

### Files not found in WebJar

Ensure `npm run build` has been executed and `dist/` directory contains the built files before running Maven/Gradle build.

### WebJar not resolving

- Check that the dependency is correctly added
- Verify the version matches
- For local builds, ensure `mvn install` or `gradle publishToMavenLocal` was run

### Script not loading

- Verify the WebJar servlet is configured (for non-Spring Boot apps)
- Check the path: `/webjars/accessify/{version}/accessify.min.js`
- Ensure your web server is serving static resources correctly

## Available Files in WebJar

After packaging, the following files will be available:

- `/webjars/accessify/2.0.0/accessify.js` - UMD build (development)
- `/webjars/accessify/2.0.0/accessify.min.js` - UMD build (production)
- `/webjars/accessify/2.0.0/accessify.esm.js` - ES Module build
- `/webjars/accessify/2.0.0/accessify.cjs.js` - CommonJS build
- Source maps (`.js.map`) for debugging

## Additional Resources

- [WebJars Documentation](https://www.webjars.org/)
- [Maven Central Publishing Guide](https://central.sonatype.org/publish/publish-guide/)
- [Gradle Publishing Guide](https://docs.gradle.org/current/userguide/publishing_maven.html)
