// Import stuff from zod
import { z } from "zod";

// Import types
import type { BurgerRequest, BurgerResponse, BurgerNext } from "@burgerTypes";

// OpenAPI Metadata
// Developers can provide custom metadata to enrich the docs.
export const openapi = {
  post: {
    summary: "Create a Product",
    description:
      "Creates a new product. Requires name and price in the request body.",
    tags: ["Product"],
    operationId: "createProduct",
  },
};

// Validation Schemas
export const schema = {
  post: {
    // Validate the JSON body.
    body: z.object({
      name: z.string().min(1, "Name is required"),
      price: z.number().positive("Price must be positive"),
    }),
  },
};

type ReqBody = z.infer<typeof schema.post.body>;

// Route-Specific Middleware
export const middleware = [
  async (req: BurgerRequest, res: BurgerResponse, next: BurgerNext) => {
    console.log("Products Middleware");
    return next();
  },
];

// POST handler: creates a new product.
export async function POST(req: BurgerRequest<{ body: ReqBody }>, res: BurgerResponse) {
  console.log("[POST] Products route invoked");
  // Use validated body 
  const body = req.validated.body;
  return res.json(body);
}
