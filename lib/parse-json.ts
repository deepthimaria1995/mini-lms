export async function parseJson(request: Request) {
  try {
    return {
      data: await request.json(),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "Invalid JSON request body",
    };
  }
}