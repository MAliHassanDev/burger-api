<p align="center">
  <img src="https://github.com/user-attachments/assets/0d9b376e-1d89-479a-aa7f-e7ee3c6b2342" alt="BurgerAPI logo"/>
</p>

[![Under Development](https://img.shields.io/badge/under%20development-red.svg)](https://github.com/isfhan/burger-api)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.2.4-black?logo=bun)](https://bun.sh)
[![Version](https://img.shields.io/badge/version-0.2.0-green.svg)](https://github.com/isfhan/burger-api/releases)

**burger-api** is a modern, open source API framework built on
[Bun.js](https://bun.sh). It combines the simplicity of file-based routing with
powerful features like built-in middleware, Zod-based schema validation, and
automatic OpenAPI generation. Designed for high performance and ease-of-use,
burger-api leverages Bun's native modules to deliver blazing-fast API responses
while keeping your codebase clean and maintainable.

**This project is under active development and should not be used in production
yet.**

## 📚 Table of Contents

-   [Overview](#-overview)
-   [Changelog](#-changelog)
-   [What's Coming Next](#-whats-coming-next)
-   [Contributing](#-contributing)
-   [License](#-license)

## 📖 Documentation

For detailed documentation and examples, visit the
[BurgerAPI official docs](https://burger-api.com/).

## 🚀 Overview

burger-api is built to offer a robust developer experience through:

-   ⚡ **Bun-Native Performance:**  
    Leverages Bun's high-performance HTTP server.

-   📁 **File-Based Routing:**  
    Automatically registers API routes from your file structure using a clear
    naming convention.

-   🔄 **Middleware Architecture:**  
    Supports both global and route-specific middleware.

-   ✅ **Type-Safe Validation:**  
    Utilizes Zod for request validation, ensuring full type safety and automatic
    error reporting.

-   📚 **Automatic OpenAPI Generation:**  
    Generates a complete OpenAPI 3.0 specification (with support for tags,
    summaries, descriptions, operationId, deprecated status, externalDocs, and
    more) directly from your routes and Zod schemas.

-   🔍 **Swagger UI Integration:**  
    Provides an out-of-the-box Swagger UI endpoint for interactive API
    documentation.

## 📣 Changelog

### Latest Version: 0.2.3 (May 2, 2025)

-   ⚡ **Core Improvements:**
    -   Removed custom request/response classes for simpler API
    -   Enhanced type safety and error handling

### Latest Version: 0.2.0 (April 26, 2025)

-   ⚡ **Performance & Core Improvements:**
    -   Optimized framework core and improved middleware handling
    -   Enhanced OpenAPI documentation and route tracking
    -   Updated ID preprocessing logic in schema validation
    -   Improved type definitions across the framework

For a complete list of changes, please check the [Changelog](CHANGELOG.md) file.

## 🎯 What's Coming Next?

We're actively enhancing burger-api with powerful new features Stay tuned for
updates as we continue to build and improve burger-api! We're committed to
making it the best API framework for Bun.js.

## 🤝 Contributing

We welcome contributions from the community! If you have suggestions or
improvements, please open an issue or submit a pull request. Let's build
something amazing together.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

The MIT License is a permissive license that is short and to the point. It lets
people do anything they want with your code as long as they provide attribution
back to you and don't hold you liable.
