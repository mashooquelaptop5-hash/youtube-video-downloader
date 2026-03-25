import { Hono } from "https://deno.land/x/hono@v4.0.0/mod.ts";

const app = new Hono();

// 🎥 VIDEO INFO API
app.get("/info", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "URL is required" }, 400);

  const command = new Deno.Command("yt-dlp", {
    args: ["-j", url],
  });

  try {
    const { stdout } = await command.output();
    const data = JSON.parse(new TextDecoder().decode(stdout));

    const result = {
      title: data.title,
      thumbnail: data.thumbnail,
      duration: data.duration,
      formats: data.formats
        .filter((f: any) => f.ext === "mp4")
        .map((f: any) => ({
          quality: f.format_note,
          url: f.url,
        })),
      audio: data.formats
        .filter((f: any) => f.ext === "m4a")
        .map((f: any) => ({
          quality: f.format_note,
          url: f.url,
        })),
    };

    return c.json(result);
  } catch (err) {
    return c.json({ error: "Failed to fetch info" }, 500);
  }
});

// 🎧 AUDIO DOWNLOAD (best)
app.get("/audio", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "URL is required" }, 400);

  const command = new Deno.Command("yt-dlp", {
    args: ["-f", "bestaudio", "-g", url],
  });

  try {
    const { stdout } = await command.output();
    return c.json({
      audio: new TextDecoder().decode(stdout).trim(),
    });
  } catch (err) {
    return c.json({ error: "Failed to get audio link" }, 500);
  }
});

Deno.serve({ port: 3000 }, app.fetch);
