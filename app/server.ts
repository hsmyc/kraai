import CreateRouter from "./utils/router";
import ServeFile from "./utils/servefile";

Bun.serve({
  async fetch(req) {
    const routes = await CreateRouter();
    const url = new URL(req.url);
    const pathname = url.pathname;
    const route = routes[pathname];
    if (route) {
      return ServeFile(route.fullPath, route.contentType);
    } else if (pathname === "/") {
      return ServeFile("app/static/index.html", "text/html");
    }
    return new Response("Not Found", { status: 404 });
  },
});
