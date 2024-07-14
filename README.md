# IAM (Identity and Access Management System)

IAM is a comprehensive Identity and Access Management system implemented in Rust using Rocket.rs, integrating MongoDB and PostgreSQL with the Diesel ORM.

## 🚀 Features

- **MongoDB Integration:** Establish MongoDB connection using Rocket Adhoc fairing.
- **PostgreSQL with Diesel ORM:** Utilize PostgreSQL with the Diesel ORM for robust data management.
- **Prometheus Integration:** Monitor and collect metrics using Prometheus.
- **Custom Error Handling:** Implement custom error handling with Rocket Responder and okapi OpenApiGenerator.
- **CORS Fairing and Counter Fairing:** Showcase fairing functionality for CORS and custom functionality.
- **Model Examples:** Define example models like Customer to illustrate Rust structs interacting with MongoDB.
- **Request Guard:** Implement APIKey as a request guard.
- **RESTful API Endpoints:** Develop CRUD operations using the Customer model.
- **OpenAPI Documentation:** Generate comprehensive API documentation using okapi.
- **Unit Testing:** Includes unit tests for API endpoints.

## 🔧 Building and Testing

### Debug Mode

```bash
cargo run
```

### Release Mode

```bash
cargo build --release && cargo run --release
```

### Unit Testing

```bash
cargo test
```

## 📋 Project Structure

### Functions and Tables

- **Endpoints:**
  - `POST /change-password`: Allows users to change their password securely.
  - `POST /register`: Registers new users securely storing hashed passwords.
  - `POST /login`: Handles user authentication and token generation.
  - `POST /refresh-token`: Refreshes access tokens using a valid refresh token.
  - `GET /validate`: Validates JWT tokens and returns user details.
  - `POST /update-profile`: Updates user profile information (first name, last name, middle name, mobile number).

- **Tables Used:**
  - `users`: Stores user information including hashed passwords.
  - `tokens`: Manages authentication tokens for session management.
  - Additional tables for group memberships and permissions (if applicable).
