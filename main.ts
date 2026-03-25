import { Hono } from "https://deno.land/x/hono@v4.0.0/mod.ts";
import { getFormats } from "https://deno.land/x/yt_download@1.5/mod.ts";

const app = new Hono();

// 🎥 VIDEO INFO API
app.get("/info", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "Missing url parameter" }, 400);

  try {
    // Extract ID from URL
    const videoId = new URL(url).searchParams.get("v") || url.split("/").pop();
    if (!videoId) throw new Error("Invalid URL");

    const formats = await getFormats(videoId);

    // Filter and format the data manually
    const result = {
      videoId: videoId,
      video_formats: formats
        .filter((f) => f.hasVideo && f.container === "mp4")
        .map((f) => ({
          quality: f.qualityLabel,
          url: f.url,
          extension: f.container
        })),
      audio_formats: formats
        .filter((f) => f.hasAudio && !f.hasVideo)
        .map((f) => ({
          bitrate: f.audioBitrate,
          url: f.url,
          extension: f.container
        }))
    };

    return c.json(result);
  } catch (err) {
    return c.json({ error: "Failed to fetch video data", details: err.message }, 500);
  }
});

// 🎧 SIMPLE REDIRECT TO AUDIO
app.get("/audio", async (c) => {
  const url = c.req.query("url");
  const videoId = new URL(url!).searchParams.get("v") || url!.split("/").pop();

  const formats = await getFormats(videoId!);
  const bestAudio = formats
    .filter((f) => f.hasAudio && !f.hasVideo)
    .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];

  return c.json({ audioUrl: bestAudio.url });
});

Deno.serve(app.fetch);
