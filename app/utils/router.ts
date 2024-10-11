import * as fs from "node:fs/promises";
import * as path from "node:path";

interface MIMETYPES {
  [key: string]: string;
}

interface PathMap {
  [key: string]: {
    fullPath: string;
    contentType: string;
  };
}

const MIMETYPES: MIMETYPES = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  webp: "image/webp",
};

export default async function CreateRouter() {
  const files = await fs.readdir("app/examples", { withFileTypes: true });
  const pathMap: PathMap = {};

  files.forEach((file) => {
    const fullPath = path.join("app/examples", file.name);
    const relativePath = path.join("/", file.name);
    if (file.isDirectory()) {
      Object.assign(pathMap, CreateRouter());
    } else {
      const ext = path.extname(file.name).slice(1);
      let contentType = "application/octet-stream";

      if (ext) {
        contentType = MIMETYPES[ext] || contentType;
      }
      pathMap[relativePath] = {
        fullPath,
        contentType,
      };
    }
  });
  return pathMap;
}
