export default function Page() {
  return new Response("<h1>Hello World from users/[id]</h1>", {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
