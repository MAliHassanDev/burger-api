import type { BurgerRequest, BurgerResponse } from "@src/index";

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  const query = req.query;
  return res.json({
    query: query,
    name: "John Doe",
  });
}

export async function POST(req: BurgerRequest, res: BurgerResponse) {
  const body = await req.json();
  return res.json(body);
}
