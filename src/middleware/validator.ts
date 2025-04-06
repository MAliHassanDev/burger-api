// Import types
import type {
    RouteSchema,
    Middleware,
    BurgerRequest,
    BurgerNext,
} from '@burgerTypes';

export function createValidationMiddleware(schema: RouteSchema): Middleware {
    return async (req: BurgerRequest, next: BurgerNext) => {
        // If the request has been validated, continue.
        if (req.validated) {
            return next();
        }

        // Determine the HTTP method (in lowercase) to match the schema.
        const method = req.method.toLowerCase();

        // Get the schema for the current method.
        const methodSchema = schema[method];

        // If there's no schema for this method, continue.
        if (!methodSchema) {
            return await next();
        }

        // Get the schemas for the current method.
        const paramsSchema = methodSchema.params;
        const querySchema = methodSchema.query;
        const bodySchema = methodSchema.body;

        /**
         * Array to collect validation errors.
         * Each error contains a `field` indicating the part of the request that failed validation,
         * and an `error` providing details about the validation failure.
         */
        const errors = new Array(3); // Pre-allocate for params, query, body
        let errorCount = 0;

        /**
         * Object to store validated request data. This will be attached to the
         * request object if validation is successful. The object will contain
         * validated data for the following fields:
         *
         * - `params`: Validated URL parameters.
         * - `query`: Validated query parameters.
         * - `body`: Validated request body (if JSON).
         */
        const validated: BurgerRequest['validated'] = {};

        // Validate URL parameters (if available and schema provided).
        if (paramsSchema && req.params) {
            try {
                const result = paramsSchema.safeParse(req.params);
                if (result.success) {
                    validated.params = result.data;
                } else {
                    errors[errorCount++] = {
                        field: 'params',
                        error: result.error,
                    };
                }
            } catch (e: any) {
                errors[errorCount++] = { field: 'params', error: e.errors };
            }
        }

        // Validate query parameters.
        const url = new URL(req.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());

        if (querySchema) {
            try {
                const result = querySchema.safeParse(queryParams);
                if (result.success) {
                    validated.query = result.data;
                } else {
                    errors[errorCount++] = {
                        field: 'query',
                        error: result.error,
                    };
                }
            } catch (e: any) {
                errors[errorCount++] = { field: 'query', error: e.errors };
            }
        }

        // Validate request body.
        if (
            bodySchema &&
            req.headers.get('Content-Type')?.includes('application/json')
        ) {
            try {
                // Attempt to parse the JSON body.
                const bodyData = await req.json();
                const result = bodySchema.safeParse(bodyData);
                if (result.success) {
                    // Set the validated body.
                    validated.body = result.data;

                    // Set the json method to return the validated body.
                    req.json = () => result.data;
                } else {
                    errors[errorCount++] = {
                        field: 'body',
                        error: result.error,
                    };
                }
            } catch (e: any) {
                errors[errorCount++] = {
                    field: 'body',
                    error: e.errors || e.message,
                };
            }
        }

        if (errorCount > 0) {
            // If validation fails, return a 400 response with error details.
            return Response.json({ errors }, { status: 400 });
        }

        // Attach validated data to the request.
        req.validated = validated;

        // Continue to the next middleware or handler.
        return next();
    };
}
