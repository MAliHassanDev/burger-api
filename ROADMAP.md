# Burger-API Roadmap

This document outlines the planned features and enhancements for burger-api. Our aim is to build a fast, developer-friendly, and modern API framework using Bun.js with file-based routing, type-safe validation, and automatic OpenAPI documentation.

---

## Project Structure / Framework Overview

The burger-api project is organized to separate core functionality from examples and documentation. Below is an overview of the project structure:

```
burger-api/
├── src/               # Framework core code
│   ├── core/          # Core utilities: server, router, OpenAPI generator, request/response wrappers
│   ├── middleware/    # Built-in middleware (validation, logging, CORS, etc.)
│   ├── utils/         # Helper utilities (e.g., setDir, cleanPrefix)
│   └── index.ts       # Main entry point that exports the Burger class
├── examples/          # Usage examples demonstrating how to build APIs & pages
│   └── demo/          # A demo project showcasing all features in action
├── package.json       # npm package metadata
├── bun.lockb          # Bun lockfile
├── README.md          # Developer documentation and usage guide
└── roadmap.md         # This roadmap outlining current progress and future enhancements
```

The framework is built on the following core principles:

- **Bun-Native Performance:** Leverages Bun's built-in HTTP server.
- **File-Based Routing:** Uses folder and file naming conventions (e.g., `[id]` for dynamic routes) to auto-register routes.
- **Middleware Architecture:** Supports both global and route-specific middleware with a consistent `req, res, next` pattern.
- **Zod-Based Validation:** Provides type-safe request validation, ensuring robust API behavior.
- **Automatic OpenAPI Generation & Swagger UI Integration:** Automatically generates API documentation and serves an interactive UI at `/docs`.

## Phase 1: Core Essentials (Completed)

- [✔] **Bun-Native HTTP Server**
  - Use Bun’s native APIs for high-performance HTTP handling.
- [✔] **File-Based Routing Engine**
  - Directory scanning and route mapping for API routes.
  - Dynamic routing via folder naming conventions (e.g., `[id]`).
- [✔] **Request & Response Enhancements**
  - `BurgerRequest` and `BurgerResponse` wrappers with helper methods.
- [✔] **Middleware System**
  - Global middleware support.
  - Route-specific middleware support.
  - Middleware composition (global → validation → route-specific → handler).
- [✔] **Zod-Based Schema Validation**
  - Validate incoming requests (params, query, body) using Zod schemas.
  - Preprocessing for dynamic parameters.
- [✔] **Automatic OpenAPI Specification Generation**
  - Generate an up-to-date OpenAPI 3.0 document from routes and schemas.
- [✔] **Swagger UI Integration**
  - Expose `/openapi.json` for raw API documentation.
  - Serve `/docs` endpoint with interactive Swagger UI.

## Phase 2: Developer Experience & Automation

- [ ] **CLI Tooling**
  - Develop a CLI (`burger-api-cli`) for scaffolding projects and managing configurations.
- [ ] **Hot Reloading/Watch Mode**
  - Implement file watching for automatic server reload on code changes.
- [ ] **Enhanced Error Handling**
  - Build a robust, centralized error-handling mechanism.
- [ ] **Improved Logging & Monitoring**
  - Provide built-in logging and request/response tracking for production debugging.

## Phase 3: Advanced Features & Optimizations

- [ ] **File Upload Handling**
  - Leverage Bun's native file handling for efficient file uploads.
- [ ] **Performance Optimizations**
  - Fine-tune routing, middleware, and validation for minimal overhead.
- [ ] **Dynamic Route Grouping for Pages**
  - Support route grouping for better organization of page routes.
- [ ] **Extensible Plugin System**
  - Architect a plugin system to allow third-party extensions (logging, caching, analytics).

## Phase 4: Ecosystem & Extensibility

- [ ] **Prebuilt Authentication Middleware**
  - Provide built-in authentication strategies (JWT, OAuth, API keys).
- [ ] **Testing Utilities & Documentation Examples**
  - Offer comprehensive tools and examples for testing and onboarding.
- [ ] **Optional ORM/Database Integration**
  - Explore integrations with lightweight ORMs for data persistence.
- [ ] **Customizable Logging & Monitoring**
  - Build configurable options for advanced logging and production monitoring.
- [ ] **API Versioning Support**
  - Implement strategies for managing and documenting API versioning.

## Additional Considerations

- **Auto-Generated Metadata Improvements:**  
  Enhance route-level OpenAPI metadata (summary, description, tags, operationId) to allow better documentation customization.
- **Schema Conversion Enhancements:**  
  Further improve the conversion of Zod schemas to JSON Schema for detailed API documentation.
- **Dynamic Documentation Updates:**  
  Provide mechanisms to re-generate the OpenAPI document when routes or schemas change.
- **Community Feedback:**  
  Encourage contributions to continuously improve burger-api based on real-world use cases.

This roadmap is a living document that will evolve as new ideas and requirements emerge. We welcome contributions and suggestions from the community to help shape the future of burger-api.

Happy coding!
