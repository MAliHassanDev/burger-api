// Import stuff from zod
import { z } from "zod";

// Import types
import type { BurgerRequest, BurgerResponse, BurgerNext } from "@burgerTypes";

// OpenAPI Metadata
// Developers can provide custom metadata to enrich the docs.
export const openapi = {
  get: {
    summary: "Get Product Details",
    description:
      "Retrieves the details of a product by its ID. Optionally accepts a search parameter.",
    tags: ["Product"],
    operationId: "getProductDetails",
  },
};

// Validation Schemas
export const schema = {
  get: {
    // Validate URL parameters: convert "id" from string to number.
    params: z.object({
      id: z.preprocess((val) => {
        if (typeof val === "string") {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? undefined : parsed;
        }
        return val;
      }, z.number().min(1, "ID is required")),
    }),
    // Validate query parameters.
    query: z.object({
      search: z.string().optional(),
    }),
  },
};

type ReqParams = z.infer<typeof schema.get.params>;
type ReqQuery = z.infer<typeof schema.get.query>;

// Route-Specific Middleware
export const middleware = [
  async (
    req: BurgerRequest<{ params: ReqParams; query: ReqQuery }>,
    res: BurgerResponse,
    next: BurgerNext
  ) => {
    console.log("Product Detail Middleware");
    return next();
  },
];

export async function GET(req: BurgerRequest<{ params: ReqParams; query: ReqQuery }>, res: BurgerResponse) {
  console.log("[GET] Dynamic Product route invoked");

  // Use validated parameters 
  const validatedParams = req.validated.params;
  const query = req.validated.query;
  
  return res.json({
    id: validatedParams.id,
    query: query,
    name: "Sample Product",
  });
}
