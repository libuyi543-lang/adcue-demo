import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4174);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
};

function getFilePath(requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  return join(root, normalized);
}

createServer((request, response) => {
  const filePath = getFilePath(request.url || "/");
  const type = mimeTypes[extname(filePath)] || "application/octet-stream";

  try {
    const stats = statSync(filePath);

    if (request.headers.range && type === "video/mp4") {
      const [startText, endText] = request.headers.range.replace("bytes=", "").split("-");
      const start = Number(startText);
      const end = endText ? Number(endText) : Math.min(start + 1024 * 1024 * 8, stats.size - 1);

      response.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Content-Type": type,
      });
      createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, {
      "Accept-Ranges": type === "video/mp4" ? "bytes" : "none",
      "Content-Length": stats.size,
      "Content-Type": type,
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, () => {
  console.log(`AI ad director demo: http://127.0.0.1:${port}/`);
});
