// Deno Deploy ke liye standard server setup
Deno.serve(async (request) => {
  const url = new URL(request.url);
  const inputUrl = url.searchParams.get('url');

  // 1. Check if URL parameter exists
  if (!inputUrl) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Please provide a ?url= parameter' }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  // 2. Validate YouTube Link
  const isYouTube = inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be');
  if (!isYouTube) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid YouTube URL' }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  try {
    // Video ID extract karne ke liye logic
    const videoId = extractVideoId(inputUrl);

    // YouTube Metadata aur Download link ke liye API try karte hain
    // Hum ek reliable public API use kar rahe hain jo Deno par stable chalti hai
    const apiUrl = `https://api.cobalt.tools/api/json`; // Cobalt ek popular open-source engine hai
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: inputUrl,
        videoQuality: '720', // Default quality
      })
    });

    const data = await response.json();

    if (data.url || data.status === 'stream') {
      return new Response(
        JSON.stringify({
          status: 'success',
          video: data.url,
          title: data.filename || 'YouTube Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          channel: '@old_studio786',
          note: 'Powered by Deno Deploy'
        }, null, 2),
        { 
          headers: { 
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          } 
        }
      );
    } else {
      throw new Error("Could not fetch download link");
    }

  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', message: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
});

// Helper Function: Video ID nikalne ke liye
function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : "default";
}
