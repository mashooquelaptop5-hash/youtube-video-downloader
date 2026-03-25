import { Hono } from "https://deno.land/x/hono@v4.0.0/mod.ts";
// Using the official npm package directly in Deno
import ytdl from "npm:ytdl-core";

const app = new Hono();

app.get("/", (c) => c.text("YouTube API is Live on Deno 2.0!"));

// 🎥 VIDEO INFO API
app.get("/info", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "Missing url parameter" }, 400);

  try {
    // Basic validation
    if (!ytdl.validateURL(url)) {
      return c.json({ error: "Invalid YouTube URL" }, 400);
    }

    const info = await ytdl.getInfo(url);
    
    const result = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: info.videoDetails.lengthSeconds,
      // Map formats to a clean structure
      formats: info.formats
        .filter((f) => f.container === "mp4" && f.hasVideo)
        .map((f) => ({
          quality: f.qualityLabel || f.quality,
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
    console.error(err);
    return c.json({ error: "Failed to fetch info", details: err.message }, 500);
  }
});

// 🎧 AUDIO ONLY URL
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
