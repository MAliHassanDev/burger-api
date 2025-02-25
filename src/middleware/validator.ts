// Import types
import type {
  BurgerRequest,
  BurgerResponse,
  Middleware,
  RouteSchema,
} from "../types/index";

/**
 * Creates a middleware function that validates request data according to the
 * given schema for the current HTTP method.
 *
 * @param schema - The route schema to validate against.
 * @returns A middleware function that validates request data and attaches the
 * validated data to the request if successful, or returns a 400 response with
 * error details if validation fails.
 */
export function createValidationMiddleware(schema: RouteSchema): Middleware {
  return async (
    req: BurgerRequest,
    res: BurgerResponse,
    next: () => Promise<Response>
  ) => {
    // If the request has been validated, continue.
    if (req.validated) {
      return await next();
    }

    // Determine the HTTP method (in lowercase) to match the schema.
    const method = req.method.toLowerCase();

    // Get the schema for the current method.
    const methodSchema = schema[method];

    // If there's no schema for this method, continue.
    if (!methodSchema) {
      return await next();
    }

    /**
     * Array to collect validation errors.
     * Each error contains a `field` indicating the part of the request that failed validation,
     * and an `error` providing details about the validation failure.
     */
    const errors: {
      field: string;
      error: any;
    }[] = [];

    /**
     * Object to store validated request data. This will be attached to the
     * request object if validation is successful. The object will contain
     * validated data for the following fields:
     *
     * - `params`: Validated URL parameters.
     * - `query`: Validated query parameters.
     * - `body`: Validated request body (if JSON).
     */
    const validated: {
      params?: unknown;
      query?: unknown;
      body?: unknown;
    } = {};

    // Validate URL parameters (if available and schema provided).
    // (Assume that middleware upstream attaches route params to req.params.)
    if (methodSchema.params && req.params) {
      try {
        validated.params = methodSchema.params.parse(req.params);
      } catch (e: any) {
        errors.push({ field: "params", error: e.errors });
      }
    }

    // Validate query parameters.
    if (methodSchema.query) {
      try {
        validated.query = methodSchema.query.parse(
          Object.fromEntries(req.query.entries())
        );
      } catch (e: any) {
        errors.push({ field: "query", error: e.errors });
      }
    }

    // Validate request body.
    if (methodSchema.body) {
      // Check the Content-Type header.
      const contentType = req.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        // If not JSON, push an error indicating the expected content type.
        errors.push({
          field: "body",
          error: "Invalid Content-Type. Expected 'application/json'.",
        });
      } else {
        try {
          // Attempt to parse the JSON body.
          const bodyData = await req.json();
          validated.body = methodSchema.body.parse(bodyData);
        } catch (e: any) {
          errors.push({ field: "body", error: e.errors || e.message });
        }
      }
    }

    if (errors.length > 0) {
      // If validation fails, return a 400 response with error details.
      return res.status(400).json({ errors });
    }

    // Attach validated data to the request.
    req.validated = validated;

    // Continue to the next middleware or handler.
    return await next();
  };
}
