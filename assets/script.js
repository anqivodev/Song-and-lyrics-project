const BACKEND_URL = "http://127.0.0.1:4100";
const AUDIO_URL = `${BACKEND_URL}/media/heeriye.mp3`;
const LYRICS_URL = `${BACKEND_URL}/media/heeriye.lrc`;

const audio = document.getElementById("audio");
const startBtn = document.getElementById("startBtn");
const cover = document.getElementById("cover");
const lyricsBox = document.getElementById("lyrics");

let lines = [];
let currentIndex = -1;
let isLoaded = false;

function parseLyrics(text) {
  const parsed = [];
  const regex = /^\[(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/;

  for (const rawLine of text.split(/\r?\n/)) {
    const match = rawLine.trim().match(regex);
    if (!match) continue;

    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const fraction = Number((match[3] || "0").padEnd(3, "0").slice(0, 3));

    parsed.push({
      time: minutes * 60 + seconds + fraction / 1000,
      text: match[4].trim()
    });
  }

  lines = parsed.sort((a, b) => a.time - b.time);
  lyricsBox.replaceChildren();

  lines.forEach((line, index) => {
    const item = document.createElement("div");
    item.className = "lyric";
    item.dataset.index = String(index);
    item.textContent = line.text || "♪";
    lyricsBox.appendChild(item);
  });
}

async function loadSong() {
  startBtn.disabled = true;
  startBtn.textContent = "Loading... ❤️";

  try {
    const lyricsResponse = await fetch(LYRICS_URL);
    if (!lyricsResponse.ok) {
      throw new Error(`Lyrics request failed: HTTP ${lyricsResponse.status}`);
    }

    const lyricsText = await lyricsResponse.text();
    parseLyrics(lyricsText);

    if (!lines.length) {
      throw new Error("LRC has no valid timestamped lines.");
    }

    audio.src = AUDIO_URL;
    audio.load();

    await new Promise((resolve, reject) => {
      if (audio.readyState >= 3) return resolve();

      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Audio could not load. Check the MP3 path and file."));
      };
      const cleanup = () => {
        audio.removeEventListener("canplay", onReady);
        audio.removeEventListener("error", onError);
      };

      audio.addEventListener("canplay", onReady, { once: true });
      audio.addEventListener("error", onError, { once: true });
    });

    isLoaded = true;
    startBtn.disabled = false;
    startBtn.textContent = "For Preeti ❤️";
  } catch (error) {
    console.error("Song loading error:", error);
    startBtn.disabled = true;
    startBtn.textContent = "Song unavailable 💔";
    lyricsBox.innerHTML = '<div class="lyric">Unable to load song. Check backend files and try again.</div>';
  }
}

audio.addEventListener("timeupdate", () => {
  if (!lines.length) return;

  let index = -1;
  for (let i = 0; i < lines.length; i++) {
    if (audio.currentTime >= lines[i].time) index = i;
    else break;
  }

  if (index === currentIndex) return;
  currentIndex = index;

  lyricsBox.querySelectorAll(".lyric").forEach(el => el.classList.remove("active"));

  const active = lyricsBox.querySelector(`[data-index="${index}"]`);
  if (active) {
    active.classList.add("active");
    active.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

startBtn.addEventListener("click", async () => {
  if (!isLoaded) return;

  try {
    if (audio.ended) {
      audio.currentTime = 0;
      currentIndex = -1;
    }
    await audio.play();
  } catch (error) {
    console.error("Playback error:", error);
    startBtn.textContent = "Tap to Play Again ❤️";
  }
});

audio.addEventListener("play", () => {
  cover.classList.add("playing");
  startBtn.textContent = "Playing for Preeti ❤️";
});

audio.addEventListener("pause", () => {
  cover.classList.remove("playing");
  if (!audio.ended && isLoaded) startBtn.textContent = "Resume for Preeti ❤️";
});

audio.addEventListener("ended", () => {
  cover.classList.remove("playing");
  startBtn.textContent = "Play Again ❤️";
  currentIndex = -1;
});

for (let i = 0; i < 18; i++) {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "♥";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDelay = `${Math.random() * 9}s`;
  heart.style.fontSize = `${12 + Math.random() * 20}px`;
  document.getElementById("hearts").appendChild(heart);
}

loadSong();
