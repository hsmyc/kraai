await Bun.build({
  entrypoints: ["./app/main.ts"],
  outdir: "./app/static/dist",
  minify: true,
  target: "browser",
}).catch(console.error);
