// Import stuff from zod
import { z } from "zod";

// Import types
import type { BurgerRequest, BurgerResponse, BurgerNext } from "@src/index";

// Export a schema for both GET and POST requests.
// For GET, we validate the query parameters.
// For POST, we validate the body.
export const schema = {
  get: {
    query: z.object({
      search: z.string(),
    }),
  },
  post: {
    body: z.object({
      // "name" is required and must be at least 1 character.
      name: z.string().min(1, "Name is required"),
      // "price" must be a positive number.
      price: z.number().positive("Price must be positive"),
    }),
  },
};

// Route-specific middleware
export const middleware = [
  async (req: BurgerRequest, res: BurgerResponse, next: BurgerNext) => {
    console.log("Product Route-specific middleware executed");
    return await next();
  },
];

// GET handler: uses validated query if available.
export async function GET(req: BurgerRequest, res: BurgerResponse) {
  console.log("Product GET request");
  // Use validated query if available, otherwise fallback to original query.
  const query = req.validated?.query ?? req.query;
  return res.json({
    query: query,
    name: "John Doe",
  });
}

// POST handler: uses validated body if available.
export async function POST(req: BurgerRequest, res: BurgerResponse) {
  console.log("Product POST request");
  // Use validated body if available; otherwise, parse the body from the request.
  const body = req.validated?.body;
  return res.json(body);
}
