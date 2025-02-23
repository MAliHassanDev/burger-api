# burger-api [![Under Development](https://img.shields.io/badge/under%20development-red.svg)](https://github.com/isfhan/burger-api)

**burger-api** is a modern, open source API framework built on [Bun.js](https://bun.sh). It combines the simplicity of file-based routing (inspired by Next.js) with powerful features like built-in middleware, Zod-based schema validation, and automatic OpenAPI generation. Designed with performance in mind, burger-api leverages Bun's native modules to deliver blazing-fast API responses while keeping your codebase clean and maintainable.

**This project is under active development and should not be used in production yet.**

## 🚀 What Makes burger-api Awesome?

- **Bun-Native Performance:** Built directly on Bun’s high-performance HTTP server.
- **File-Based Routing:** Automatically register API and page routes from your file structure.
- **Middleware Magic:** Support for global and route-specific middleware with a familiar composition model.
- **Type-Safe Validation:** Use Zod to define request schemas for full type safety and automatic request validation.
- **Auto OpenAPI Generation:** Keep your API documentation in sync automatically without extra effort.
- **Zero-Config Setup:** Get started quickly with minimal configuration, supported by a powerful CLI.

## 📂 Project Structure

```
burger-api/
├── src/               # Framework core code
│   ├── core/          # Core utilities (server, router, middleware)
│   ├── handlers/      # Built-in handlers (errors, file uploads, etc.)
│   ├── middleware/    # Default middleware provided by the framework (CORS, logging, etc.)
│   ├── utils/         # Helper utilities
│   └── index.ts       # Main entry point (exports Burger)
├── examples/          # Usage examples (demonstrating how to build APIs & pages)
├── package.json       # npm package metadata
├── bun.lockb          # Bun lockfile
└── README.md          # Project documentation
```

## 🗺️ Roadmap

### **Phase 1: Core Essentials**

- [✔] **Bun-Native HTTP Server**  
   Use Bun’s native APIs for a high-performance HTTP server.
- [✔] **File-Based Routing Engine**
  - [✔] Directory Scanning
  - [✔] Route Mapping (API Routes)
  - [ ] Route Mapping (Page Routes)
  - [ ] Differentiation between `route.ts` and `page.ts`
- [✔] **Request & Response Enhancements**  
   Extend Bun's native Request/Response with additional helper methods.
- [✔] **Middleware System**
  - [✔] Global Middleware Support
  - [✔] Route-Specific Middleware Support
  - [✔] Middleware Composition
- [✔] **Zod-Based Schema Validation**  
   Validate incoming requests using Zod schemas exported from route files.
- [✔] **Route Handler API**  
   Support standard HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD).
- [✔] **Automatic OpenAPI Specification Generation**  
   Generate up-to-date API documentation from your routes and schemas.
- [✔] **Swagger UI**
  Automatically generate a Swagger UI for your API.

### **Phase 2: Developer Experience & Automation**

- [ ] **CLI Tooling**  
       Develop a CLI (`burger-api-cli`) for scaffolding projects and managing configurations.
- [ ] **Hot Reloading/Watch Mode**  
       Implement file watching for a seamless development experience.
- [ ] **Enhanced Error Handling**  
       Build a robust, centralized error-handling mechanism.

### **Phase 3: Advanced Features & Optimizations**

- [ ] **File Upload Handling**  
       Leverage Bun's native file handling for efficient file uploads.
- [ ] **Performance Optimizations**  
       Further optimize routing, middleware, and processing overhead.
- [ ] **Dynamic Route Grouping for Pages**  
       Support route grouping (e.g., groupName) for better organization.
- [ ] **Extensible Plugin System (Future)**  
       Architect a plugin system for additional features like logging, caching, and analytics.

### **Phase 4: Ecosystem & Extensibility**

- [ ] **Prebuilt Authentication Middleware**  
       Offer built-in strategies (JWT, OAuth, API keys) out-of-the-box.
- [ ] **Testing Utilities & Documentation Examples**  
       Provide comprehensive tools and examples for testing and learning.
- [ ] **Optional ORM/Database Integration**  
       Explore integrations with lightweight ORMs for data persistence.
- [ ] **Customizable Logging & Monitoring**  
       Build configurable options for logging and production monitoring.

## 🛠️ How Developers Will Use It

In your project, you can set up burger-api with a few simple lines:

```ts
import { Burger } from "burger-api";

// Initialize burger-api with configuration options
const burger = new Burger({
  port: 3000,
  apiDir: "src/api", // Automatically loads API routes
  pageDir: "src/pages", // Automatically loads page routes
  middleware: [globalMiddleware1, globalMiddleware2 /*, ... */],
});

// Start serving requests
burger.serve();
```

**File-based routing examples:**

- **API Routes:**  
  Place your route files under `src/api/`
  ```
  src/api/
  ├── route.ts         // Handles `/`
  ├── users/
  │   ├── route.ts     // Handles `/users`
  │   └── [id]/
  │         └── route.ts   // Handles `/users/:id`
  ```
- **Page Routes:**  
  Use `page.ts` instead of `route.ts` under `src/pages/` for serving pages, with support for route groups.

Each `route.ts` file should export:

- **HTTP Methods:**
  ```ts
  export async function GET(request: Request) {
    /* ... */
  }
  export async function POST(request: Request) {
    /* ... */
  }
  // etc.
  ```
- **Zod Schema (Optional):**
  ```ts
  export const schema = {
    post: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
    }),
    put: z.object({
      /* ... */
    }),
  };
  ```
- **Route-Specific Middleware (Optional):**
  ```ts
  export const middleware = [middleware1, middleware2];
  ```

The exported Zod schemas are used to automatically generate OpenAPI specifications, ensuring your API documentation is always up-to-date.

## 🤝 Contributing

We welcome contributions from the community! If you have any questions or suggestions, please open an issue or submit a pull request. Let’s build something amazing together.

## 📄 License

This project is licensed under the MIT License.

## 💬 Questions?

If you have any questions or need further clarifications, feel free to reach out by opening an issue or contacting the maintainers directly.

_burger-api_ is here to revolutionize your API development experience with simplicity, speed, and cutting-edge features. Happy coding!
