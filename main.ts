import { Hono } from "https://deno.land/x/hono@v4.0.0/mod.ts";
// Using a more modern, Deno 2 compatible port
import ytdl from "https://deno.land/x/ytdl_core_deno@v0.0.3/mod.ts";

const app = new Hono();

app.get("/", (c) => c.text("YouTube API is Running! Use /info?url=URL"));

// 🎥 VIDEO INFO API
app.get("/info", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "Missing url parameter" }, 400);

  try {
    const info = await ytdl.getInfo(url);
    
    const result = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: info.videoDetails.lengthSeconds,
      formats: info.formats
        .filter((f) => f.container === "mp4" && f.hasVideo)
        .map((f) => ({
          quality: f.qualityLabel,
          url: f.url,
        })),
      audio: info.formats
        .filter((f) => !f.hasVideo && f.hasAudio)
        .map((f) => ({
          quality: f.audioBitrate + "kbps",
          url: f.url,
        })),
    };

    return c.json(result);
  } catch (err) {
    return c.json({ error: "Failed to fetch info", details: err.message }, 500);
  }
});

// 🎧 AUDIO REDIRECT
app.get("/audio", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "Missing url" }, 400);

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    
    return c.json({
      audioUrl: format.url
    });
  } catch (err) {
    return c.json({ error: "Failed to get audio", details: err.message }, 500);
  }
});

Deno.serve(app.fetch);
