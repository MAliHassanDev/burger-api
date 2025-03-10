# 🍔 burger-api [![Under Development](https://img.shields.io/badge/under%20development-red.svg)](https://github.com/isfhan/burger-api) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Bun](https://img.shields.io/badge/Bun-1.2.4-black?logo=bun)](https://bun.sh)

**burger-api** is a modern, open source API framework built on [Bun.js](https://bun.sh). It combines the simplicity of file-based routing with powerful features like built-in middleware, Zod-based schema validation, and automatic OpenAPI generation. Designed for high performance and ease-of-use, burger-api leverages Bun's native modules to deliver blazing-fast API responses while keeping your codebase clean and maintainable.

**This project is under active development and should not be used in production yet.**

## 🚀 Overview

burger-api is built to offer a robust developer experience through:

- ⚡ **Bun-Native Performance:**  
  Leverages Bun's high-performance HTTP server.

- 📁 **File-Based Routing:**  
  Automatically registers API routes from your file structure using a clear naming convention.

- 🔄 **Middleware Architecture:**  
  Supports both global and route-specific middleware with a familiar `req, res, next` pattern.

- ✅ **Type-Safe Validation:**  
  Utilizes Zod for request validation, ensuring full type safety and automatic error reporting.

- 📚 **Automatic OpenAPI Generation:**  
  Generates a complete OpenAPI 3.0 specification (with support for tags, summaries, descriptions, operationId, deprecated status, externalDocs, and more) directly from your routes and Zod schemas.

- 🔍 **Swagger UI Integration:**  
  Provides an out-of-the-box Swagger UI endpoint for interactive API documentation.

## ✨ Features

### Core Features

- ⚡ **Bun-Native HTTP Server:**  
  Built on Bun's native APIs for exceptional performance.

- 📁 **File-Based Routing Engine:**  
  Automatically scans directories to register routes.

  - Supports dynamic routes via folder names like `[id]` for `/api/product/:id`.

- 🛠️ **Request & Response Enhancements:**

  - `BurgerRequest` extends the native Request to include query, params, and validated data.
  - `BurgerResponse` provides methods to set headers, status, and build responses (JSON, text, HTML, redirects, files).

- 🔄 **Middleware System:**

  - **Global Middleware:** Runs on every request.
  - **Route-Specific Middleware:** Defined in individual route files.
  - **Validation Middleware:** Automatically validates request data using Zod schemas exported from routes.

- ✅ **Zod-Based Schema Validation:**  
  Automatically validates request params, query, and body using Zod.

  - Supports preprocessing (e.g., converting URL parameters from string to number).

- 📚 **Automatic OpenAPI Specification Generation:**  
  Generates an OpenAPI 3.0 document using route metadata and Zod schemas.

  - **OpenAPI Options:**
    - Global metadata (title, description, version)
    - Per-route metadata (summary, description, tags, operationId, deprecated, externalDocs)
    - Auto-generated parameters and requestBody schemas (using `zod-to-json-schema` for detailed inline JSON schema definitions)

- 🔍 **Swagger UI Integration:**  
  Provides a `/docs` endpoint serving an interactive Swagger UI that reads from `/openapi.json`.

## 📣 Release Notes

### Version 0.1.0

- 🎨 **Static Page Serving:**
  - Basic support for serving static `.html` files
  - File-based routing for pages
  - Support for route grouping with `(group)` syntax
  - Support for dynamic route with `[slug]` syntax

### Version 0.0.39

- 🚀 Initial release with core API features
- ⚡ Bun-native HTTP server implementation
- 📁 File-based API routing
- ✅ Zod schema validation
- 📚 OpenAPI/Swagger integration
- 🔄 Middleware system

## 🎯 What's Coming Next?

We're actively enhancing burger-api with powerful new features:

### 🎨 Page Serving Enhancements (In Development)

- 🔥 **TSX Support:** Adding React/TSX rendering capabilities
- 🔐 **Global Middleware:** Applies to all routes for tasks like logging and authentication.
- 🔐 **Page-Specific Middleware:** Defined in individual route files for tailored processing.
- 🛠️ **Advanced Middleware:** More built-in middleware for common use cases:
  - CORS handling
  - Rate limiting
  - Request logging
  - Security headers
- 🎯 **Performance Optimizations:** Further leveraging Bun's capabilities for faster page serving

Stay tuned for updates as we continue to build and improve burger-api! We're committed to making it the best API framework for Bun.js.

## 📦 Installation

Install burger-api via bun:

```bash
bun add burger-api
```

## 🚀 How to Use burger-api

### **Basic Usage Example**

```ts
import { Burger } from "burger-api";

// Global middleware example: a simple logger.
const globalLogger = async (req, res, next) => {
  console.log(`[Global Logger] ${req.method} ${req.url}`);
  return next();
};

const burger = new Burger({
  title: "My Custom API",
  description: "Custom API with auto-generated docs and validation",
  apiDir: "api",
  globalMiddleware: [globalLogger],
  version: "1.0.0",
  debug: true, // Enable debug mode for detailed logging and stack trace page
});

// Start the server on port 4000 with a callback
burger.serve(4000, (port) => {
  console.log(`Server is running on port ${port}`);
});
```

The `debug` option enables:

- 🔍 Interactive stack trace page at when errors occur
  - Shows detailed error information
  - Displays the full stack trace
  - Highlights the exact line where the error occurred
  - Provides request context and environment details

This is particularly useful during development to understand how your API is working and troubleshoot issues.

### **Recommended Project Structure**

Here's a recommended project structure that helps keep your code organized and maintainable:

```
my-api/
├── src/
│   ├── api/                    # API routes
│   │   ├── products/
│   │   │   ├── route.ts       # Product routes
│   │   │   └── [id]/
│   │   │       └── route.ts   # Product detail routes
│   │   └── users/
│   │       └── route.ts       # User routes
│   ├── middleware/            # Middleware
│   │   ├── global/           # Global middleware
│   │   │   ├── logger.ts
│   │   │   └── auth.ts
│   │   └── routes/           # Route-specific middleware
│   │       ├── products.ts
│   │       └── users.ts
│   ├── schemas/              # Zod schemas
│   │   ├── product.ts
│   │   └── user.ts
│   ├── utils/               # Utility functions
│   │   ├── errors.ts
│   │   └── helpers.ts
│   └── index.ts             # Main application file
├── package.json
└── tsconfig.json
```

### **Example Implementation**

Here's how to implement this structure:

1. **Global Middleware** (`src/middleware/global/logger.ts`):

```ts
import type { BurgerRequest, BurgerResponse } from "burger-api";

export const logger = async (
  req: BurgerRequest,
  res: BurgerResponse,
  next: () => Promise<Response>
) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  return next();
};
```

2. **Route-Specific Middleware** (`src/middleware/routes/products.ts`):

```ts
import type { BurgerRequest, BurgerResponse } from "burger-api";

export const validateProductAccess = async (
  req: BurgerRequest,
  res: BurgerResponse,
  next: () => Promise<Response>
) => {
  // Your middleware logic here
  return next();
};
```

3. **Schemas** (`src/schemas/product.ts`):

```ts
import { z } from "zod";

export const productSchema = {
  create: z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    description: z.string().optional(),
  }),
  update: z.object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
  }),
};
```

4. **Route File** (`src/api/products/route.ts`):

```ts
import type { BurgerRequest, BurgerResponse } from "burger-api";
import { validateProductAccess } from "../../middleware/routes/products";
import { productSchema } from "../../schemas/product";

export const middleware = [validateProductAccess];
export const schema = {
  post: {
    body: productSchema.create,
  },
  put: {
    body: productSchema.update,
  },
};

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  return res.json({ message: "List of products" });
}

export async function POST(req: BurgerRequest, res: BurgerResponse) {
  const body = req.validated?.body;
  return res.json({ message: "Product created", data: body });
}
```

5. **Main Application** (`src/index.ts`):

```ts
import { Burger } from "burger-api";
import { logger } from "./middleware/global/logger";

const burger = new Burger({
  title: "Product API",
  description: "API for managing products",
  apiDir: "api",
  globalMiddleware: [logger],
  version: "1.0.0",
});

burger.serve(4000, (port) => {
  console.log(`Server is running on port ${port}`);
});
```

This structure provides several benefits:

- 🎯 Clear separation of concerns
- 📁 Easy to find and maintain code
- 🔄 Reusable components
- 🧹 Clean and organized codebase
- 📚 Better scalability

### **File-Based Routing Examples**

- 📄 **Static API Route:**  
  Place a file at `src/api/route.ts` to handle the root API endpoint (e.g., `/api`).

- 🔄 **Dynamic API Route:**  
  For routes with dynamic segments, create folders with square brackets. For example:
  ```
  src/api/product/
  ├── route.ts         // Handles /api/product
  └── [id]/
      └── route.ts     // Handles /api/product/:id
  ```

### **Route File Example**

Below is an example route file demonstrating schema validation, route-specific middleware, and OpenAPI metadata.

```ts
// examples/demo/api/product/[id]/route.ts

import { z } from "zod";
import type { BurgerRequest, BurgerResponse } from "burger-api";

// OpenAPI metadata for this route
export const openapi = {
  get: {
    summary: "Get Product Details",
    description: "Retrieves product details by product ID.",
    tags: ["Product"],
    operationId: "getProductDetails",
  },
};

// Validation Schemas for GET and POST requests
export const schema = {
  get: {
    params: z.object({
      id: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z.number().min(1, "ID is required")
      ),
    }),
    query: z.object({
      search: z.string().optional(),
    }),
  },
  post: {
    body: z.object({
      name: z.string().min(1, "Name is required"),
      price: z.number().positive("Price must be positive"),
    }),
  },
};

// Route-specific middleware
export const middleware = [
  async (
    req: BurgerRequest,
    res: BurgerResponse,
    next: () => Promise<Response>
  ) => {
    console.log("[Product Middleware] Executing product route middleware");
    return next();
  },
];

// GET handler: returns product details
export async function GET(
  req: BurgerRequest,
  res: BurgerResponse,
  params: { id: number }
) {
  console.log("[GET] Product route invoked");
  const validatedParams = (req.validated?.params as { id: number }) || params;
  const query = req.validated?.query || Object.fromEntries(req.query.entries());
  return res.json({
    id: validatedParams.id,
    query,
    name: "Sample Product",
  });
}

// POST handler: creates a new product
export async function POST(req: BurgerRequest, res: BurgerResponse) {
  console.log("[POST] Product route invoked");
  const body = req.validated?.body || (await req.json());
  return res.json(body);
}
```

### **API Documentation Endpoints**

- 📚 **OpenAPI JSON:**  
  Access `http://localhost:4000/openapi.json` to view the auto-generated OpenAPI specification.

- 🔍 **Swagger UI:**  
  Access `http://localhost:4000/docs` to view interactive API documentation via Swagger UI.

## 🤝 Contributing

We welcome contributions from the community! If you have suggestions or improvements, please open an issue or submit a pull request. Let's build something amazing together.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don't hold you liable.

## ❓ FAQs & Additional Resources

- 🔄 **How do I add custom middleware?**  
  You can pass an array of global middleware in the Burger options or export route-specific middleware in your route files.

- 📁 **How does file-based routing work?**  
  Place your route files under `src/api/` or just `/api` using folder and file naming conventions (e.g., `[id]` for dynamic routes).

- ✅ **How is validation handled?**  
  burger-api uses Zod for schema validation. Define your schemas in your route files and they are automatically used to validate incoming requests.

- 📚 **How can I customize the OpenAPI documentation?**  
  Override the default auto-generated summaries, descriptions, tags, and operationIds by exporting an `openapi` object in your route files.

_burger-api_ aims to revolutionize your API development experience with simplicity, speed, and cutting-edge features. Happy coding! 🚀
