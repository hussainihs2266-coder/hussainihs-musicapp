// Load from phone (local storage) or default songs
let songs = JSON.parse(localStorage.getItem("playlist")) || [
  { name: "Song 1", file: "music/song1.mp3", cover: "images/cover1.jpg", fav: false },
  { name: "Song 2", file: "music/song2.mp3", cover: "images/cover2.jpg", fav: false },
  { name: "Song 3", file: "music/song3.mp3", cover: "images/cover3.jpg", fav: false }
];

const audio = document.getElementById("audio");
const songTitle = document.getElementById("song-title");
const playlist = document.getElementById("playlist");
const cover = document.getElementById("cover");

const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

const search = document.getElementById("search");
const upload = document.getElementById("upload");
const themeToggle = document.getElementById("theme-toggle");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");

let currentSong = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

/* SAVE PLAYLIST */
function savePlaylist() {
  localStorage.setItem("playlist", JSON.stringify(songs));
}

/* BUILD PLAYLIST UI */
function buildPlaylist() {
  playlist.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${song.name}</span>
      <span class="favorite ${song.fav ? "active" : ""}">❤️</span>
    `;

    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("favorite")) {
        song.fav = !song.fav;
        savePlaylist();
        buildPlaylist();
      } else {
        currentSong = index;
        loadSong();
        playSong();
      }
    });

    playlist.appendChild(li);
  });
}

function loadSong() {
  audio.src = songs[currentSong].file;
  songTitle.textContent = songs[currentSong].name;
  cover.src = songs[currentSong].cover;

  [...playlist.children].forEach((li, i) =>
    li.classList.toggle("active", i === currentSong)
  );
}

function playSong() {
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
  cover.classList.add("rotate");
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = "▶️";
  cover.classList.remove("rotate");
}

playBtn.addEventListener("click", () => {
  isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

function nextSong() {
  if (isShuffle) {
    currentSong = Math.floor(Math.random() * songs.length);
  } else {
    currentSong = (currentSong + 1) % songs.length;
  }
  loadSong();
  playSong();
}

function prevSong() {
  currentSong = (currentSong - 1 + songs.length) % songs.length;
  loadSong();
  playSong();
}

/* TIME + SEEK */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60) || 0;
  const s = Math.floor(seconds % 60) || 0;
  return `${m}:${s < 10 ? "0" + s : s}`;
}

audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

/* VOLUME */
volume.addEventListener("input", () => {
  audio.volume = volume.value;
});

/* SHUFFLE + REPEAT */
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.background = isShuffle ? "#4f46e5" : "";
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.style.background = isRepeat ? "#4f46e5" : "";
});

/* AUTO NEXT */
audio.addEventListener("ended", () => {
  if (isRepeat) playSong();
  else nextSong();
});

/* SEARCH */
search.addEventListener("input", () => {
  const text = search.value.toLowerCase();
  [...playlist.children].forEach((li) => {
    li.style.display = li.textContent.toLowerCase().includes(text)
      ? "flex"
      : "none";
  });
});

/* UPLOAD SONGS */
upload.addEventListener("change", (e) => {
  [...e.target.files].forEach((file) => {
    const url = URL.createObjectURL(file);
    songs.push({
      name: file.name,
      file: url,
      cover: "images/cover1.jpg",
      fav: false
    });
  });

  savePlaylist();
  buildPlaylist();
});

/* THEME */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") document.body.classList.add("light");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

/* INIT */
buildPlaylist();
loadSong();
