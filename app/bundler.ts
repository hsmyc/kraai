await Bun.build({
  entrypoints: ["./app/main.ts"],
  outdir: "./app/examples",
  minify: true,
  target: "browser",
}).catch(console.error);
