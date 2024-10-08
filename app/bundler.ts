await Bun.build({
  entrypoints: ["./app/main.ts"],
  outdir: "./app/static",
  minify: true,
  target: "browser",
}).catch(console.error);
