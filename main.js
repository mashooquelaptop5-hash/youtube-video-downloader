Deno.serve(async (request) => {
  // CORS Headers
  const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*", // Allows any website to call this API
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle Preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  const url = new URL(request.url);
  const inputUrl = url.searchParams.get('url');

  if (!inputUrl) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Please provide a ?url= parameter' }),
      { status: 400, headers }
    );
  }

  const isYouTube = inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be');
  if (!isYouTube) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid YouTube URL' }),
      { status: 400, headers }
    );
  }

  try {
    const videoId = extractVideoId(inputUrl);
    
    // Using an alternative stable endpoint for Cobalt
    const apiUrl = `https://api.cobalt.tools/api/json`; 
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: inputUrl,
        videoQuality: '720',
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
          channel: '@SaNaUsman',
        }),
        { headers }
      );
    } else {
      throw new Error(data.text || "Could not fetch download link");
    }

  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', message: err.message }),
      { status: 500, headers }
    );
  }
});

function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : "default";
}
