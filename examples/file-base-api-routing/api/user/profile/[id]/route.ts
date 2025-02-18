export async function GET(request: Request, params: { id: string }) {
  const query = new URL(request.url).searchParams;

  return new Response(
    JSON.stringify({
      id: params.id,
      query: query,
      name: "John Doe",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
