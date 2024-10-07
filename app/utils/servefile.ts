export default async function ServeFile(
  filepath: string,
  contentType: string
): Promise<Response> {
  const bytes = await Bun.file(filepath).bytes();
  return new Response(bytes, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
