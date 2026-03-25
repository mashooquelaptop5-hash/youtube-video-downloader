<header class="w-full max-w-4xl flex justify-between items-center mb-12">
    <h1 class="text-2xl font-bold gradient-text">Sana Usman</h1>
    <span class="bg-sky-500/10 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/20">V2.0 LIVE</span>
</header>

<main class="w-full max-w-2xl">
    <div class="text-center mb-10">
        <h2 class="text-4xl font-bold mb-4 tracking-tight">Download <span class="text-sky-400">Anywhere.</span></h2>
        <p class="text-slate-400">High-speed YouTube extraction by Sana Usman.</p>
    </div>

    <div class="glass p-2 rounded-2xl flex flex-col md:flex-row gap-2 mb-8 shadow-2xl">
        <input type="text" id="videoUrl" placeholder="Paste YouTube link here..." 
            class="bg-transparent flex-1 p-4 outline-none text-white placeholder-slate-500">
        <button onclick="fetchInfo()" id="btnFetch" class="btn-grad px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <span>Start</span>
            <i class="fa-solid fa-bolt"></i>
        </button>
    </div>

    <div id="loading" class="hidden flex flex-col items-center py-10">
        <div class="loader mb-4"></div>
        <p class="text-slate-400 animate-pulse">Connecting to Deno Edge Server...</p>
    </div>

    <div id="errorBox" class="hidden bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8 text-sm text-center"></div>

    <div id="results" class="hidden space-y-6">
        <div class="glass p-4 rounded-3xl flex flex-col sm:flex-row gap-4">
            <img id="thumb" src="" class="w-full sm:w-40 rounded-2xl aspect-video object-cover">
            <div class="flex flex-col justify-center">
                <h3 id="title" class="font-bold text-lg leading-tight mb-1"></h3>
                <p id="duration" class="text-slate-500 text-sm"></p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
                <h4 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-video text-sky-400"></i> Video Formats
                </h4>
                <div id="videoLinks" class="space-y-2"></div>
            </section>
            <section>
                <h4 class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-music text-indigo-400"></i> Audio Only
                </h4>
                <div id="audioLinks" class="space-y-2"></div>
            </section>
        </div>
    </div>
</main>

<footer class="mt-auto py-10 text-slate-600 text-xs text-center">
    <p>Built with ❤️ by <span class="text-slate-400">Sana Usman</span></p>
    <p class="mt-2 opacity-50">Note: If download fails, right-click and 'Save Link As'</p>
</footer>

<script>
    const API_BASE = "https://youtube-video-downloader-59-m80rznc9xy6d.mashooquelaptop5-hash.deno.net";

    async function fetchInfo() {
        const url = document.getElementById('videoUrl').value.trim();
        const results = document.getElementById('results');
        const loading = document.getElementById('loading');
        const errorBox = document.getElementById('errorBox');
        const btn = document.getElementById('btnFetch');

        if (!url) return;

        results.classList.add('hidden');
        errorBox.classList.add('hidden');
        loading.classList.remove('hidden');
        btn.disabled = true;

        try {
            // We use a timeout to catch network hangs
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${API_BASE}/info?url=${encodeURIComponent(url)}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.error) throw new Error(data.details || data.error);

            document.getElementById('thumb').src = data.thumbnail;
            document.getElementById('title').innerText = data.title;
            document.getElementById('duration').innerText = `${Math.floor(data.duration / 60)}m ${data.duration % 60}s`;

            const renderLinks = (containerId, items, icon) => {
                const container = document.getElementById(containerId);
                container.innerHTML = items.length ? '' : '<p class="text-xs text-slate-600 italic">No formats found</p>';
                items.forEach(item => {
                    const row = document.createElement('div');
                    row.className = "glass p-3 rounded-xl flex justify-between items-center text-sm";
                    row.innerHTML = `
                        <span class="font-medium">${item.quality}</span>
                        <div class="flex gap-2">
                            <button onclick="copyToClipboard('${item.url}')" class="p-2 hover:text-sky-400" title="Copy Link"><i class="fa-solid fa-link"></i></button>
                            <a href="${item.url}" target="_blank" rel="noreferrer" class="bg-white/5 hover:bg-white/10 p-2 px-3 rounded-lg flex items-center gap-2">
                                <i class="${icon}"></i>
                            </a>
                        </div>
                    `;
                    container.appendChild(row);
                });
            };

            renderLinks('videoLinks', data.formats, 'fa-solid fa-download');
            renderLinks('audioLinks', data.audio, 'fa-solid fa-play');

            results.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            errorBox.innerHTML = `<strong>Fetch Error:</strong> ${err.message === 'signal timed out' ? 'API took too long to respond.' : 'Could not connect to API. Ensure CORS is enabled on Deno.'}`;
            errorBox.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
            btn.disabled = false;
        }
    }

    function copyToClipboard(text) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Download link copied to clipboard!');
    }
</script>
