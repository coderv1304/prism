const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

/**
 * BFF proxy. The browser only ever talks to the Next.js origin; the API
 * hostname stays private to the container network. It also means the public
 * API URL can change without rebuilding the frontend.
 */
async function handler(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const incoming = new URL(request.url);
  const target = new URL(`/api/v1/${path.join("/")}${incoming.search}`, API_INTERNAL_URL);

  const headers = new Headers({ accept: "application/json" });
  const contentType = request.headers.get("content-type");
  const requestId = request.headers.get("x-request-id");
  if (contentType) headers.set("content-type", contentType);
  if (requestId) headers.set("x-request-id", requestId);

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);
    const upstreamRequestId = upstream.headers.get("x-request-id");
    if (upstreamRequestId) responseHeaders.set("x-request-id", upstreamRequestId);
    responseHeaders.set("cache-control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        statusCode: 502,
        message: "The Prism API is unreachable. Check that the api container is running.",
        path: incoming.pathname,
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}

export { handler as GET, handler as POST, handler as DELETE, handler as PATCH, handler as PUT };
