import { zodToJsonSchema } from "zod-to-json-schema";

// Import types
import type { Router } from "./router";
import type { ServerOptions } from "../types/index.d.ts";

/**
 * Helper function to build parameters from a Zod schema.
 * This simplified version assumes each parameter is a string.
 */
function buildParameters(zodSchema: any, location: "path" | "query"): any[] {
  const parameters: any[] = [];
  if (
    zodSchema &&
    zodSchema._def &&
    typeof zodSchema._def.shape === "function"
  ) {
    const shape = zodSchema._def.shape();
    for (const key in shape) {
      parameters.push({
        name: key,
        in: location,
        required: true,
        schema: { type: "string" },
      });
    }
  }
  return parameters;
}

/**
 * Helper function to build a requestBody definition from a Zod schema.
 * This function converts the Zod schema into a JSON Schema inline.
 */
function buildRequestBody(zodSchema: any): any {
  if (!zodSchema) return undefined;
  // Convert the Zod schema to JSON schema without a $ref by omitting a custom title.
  const jsonSchema = zodToJsonSchema(zodSchema);
  return {
    content: {
      "application/json": {
        schema: jsonSchema,
      },
    },
  };
}

/**
 * Generates an OpenAPI 3.0 document from the router's routes and global options.
 * @param router The router instance with loaded routes.
 * @param options Global options, including OpenAPI metadata.
 * @returns The OpenAPI document as a JavaScript object.
 */
export function generateOpenAPIDocument(
  router: Router,
  options: ServerOptions
) {
  const openapiDoc = {
    openapi: "3.0.0",
    info: {
      title: options.title || "Burger API",
      description: options.description || "Auto-generated API documentation",
      version: options.version || "1.0.0",
    },
    paths: {} as Record<string, any>,
  };

  // Iterate over each route in the router
  for (const route of router.routes) {
    openapiDoc.paths[route.path] = openapiDoc.paths[route.path] || {};

    for (const method in route.handlers) {
      const lowerMethod = method.toLowerCase();
      // Use provided openapi metadata if available, else default values.
      const methodMeta = route.openapi?.[lowerMethod] || {};
      // Build parameters from the schema (for path and query).
      let parameters: any[] = [];
      if (route.schema && route.schema[lowerMethod]) {
        const schemaDef = route.schema[lowerMethod];
        parameters = [
          ...buildParameters(schemaDef.params, "path"),
          ...buildParameters(schemaDef.query, "query"),
        ];
      }
      // Build requestBody if schema.body exists.
      let requestBody = undefined;
      if (route.schema && route.schema[lowerMethod]?.body) {
        requestBody = buildRequestBody(route.schema[lowerMethod].body);
      }

      openapiDoc.paths[route.path][lowerMethod] = {
        summary:
          methodMeta.summary ||
          `Auto-generated summary for ${method} ${route.path}`,
        description: methodMeta.description || "",
        parameters: parameters,
        requestBody: requestBody,
        responses: {
          "200": {
            description: "Successful response",
          },
        },
      };
    }
  }

  return openapiDoc;
}
