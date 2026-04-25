// js/app.js

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const mainAudio = document.getElementById("main-audio");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const playIcon = document.getElementById("play-icon");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    
    const albumArt = document.getElementById("album-art");
    const artShadow = document.getElementById("art-shadow");
    const songTitle = document.getElementById("song-title");
    const songArtist = document.getElementById("song-artist");
    
    const progressWrapper = document.getElementById("progress-wrapper");
    const progressBar = document.getElementById("progress-bar");
    const currentTimeEl = document.getElementById("current-time");
    const totalDurationEl = document.getElementById("total-duration");
    
    const volumeSlider = document.getElementById("volume-slider");
    const volumeIcon = document.getElementById("volume-icon");
    
    const shuffleBtn = document.getElementById("shuffle-btn");
    const repeatBtn = document.getElementById("repeat-btn");
    
    const playlistContainer = document.getElementById("playlist");
    const showPlaylistBtn = document.getElementById("show-playlist-btn");
    const closePlaylistBtn = document.getElementById("close-playlist-btn");
    const playlistDrawer = document.getElementById("playlist-drawer");

    // State
    let musicIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = "none"; // none, one, all

    // Initialize Player
    function loadMusic(index) {
        const music = allMusic[index];
        songTitle.innerText = music.name;
        songArtist.innerText = music.artist;
        albumArt.src = music.img;
        artShadow.style.backgroundImage = `url(${music.img})`;
        mainAudio.src = music.src;
        
        // Update playlist UI
        updatePlaylistUI();
    }

    // Play/Pause logic
    function togglePlay() {
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    function playMusic() {
        isPlaying = true;
        playIcon.classList.replace("fa-play", "fa-pause");
        albumArt.classList.add("playing");
        artShadow.classList.add("playing");
        mainAudio.play().catch(e => console.log("Autoplay prevented or audio loading: ", e));
    }

    function pauseMusic() {
        isPlaying = false;
        playIcon.classList.replace("fa-pause", "fa-play");
        albumArt.classList.remove("playing");
        artShadow.classList.remove("playing");
        mainAudio.pause();
    }

    // Next/Prev Track
    function nextMusic() {
        if (isShuffle) {
            let randIndex = Math.floor(Math.random() * allMusic.length);
            // Ensure it doesn't play the same song in shuffle
            while(randIndex === musicIndex && allMusic.length > 1) {
                randIndex = Math.floor(Math.random() * allMusic.length);
            }
            musicIndex = randIndex;
        } else {
            musicIndex = (musicIndex + 1) % allMusic.length;
        }
        loadMusic(musicIndex);
        if (isPlaying) playMusic();
    }

    function prevMusic() {
        musicIndex = (musicIndex - 1 + allMusic.length) % allMusic.length;
        loadMusic(musicIndex);
        if (isPlaying) playMusic();
    }

    // Time formatting
    function formatTime(time) {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        let secs = Math.floor(time % 60);
        if (secs < 10) secs = `0${secs}`;
        return `${mins}:${secs}`;
    }

    // Event Listeners
    window.addEventListener("load", () => {
        loadMusic(musicIndex);
        renderPlaylist();
    });

    playPauseBtn.addEventListener("click", togglePlay);
    nextBtn.addEventListener("click", nextMusic);
    prevBtn.addEventListener("click", prevMusic);

    // Update Progress
    mainAudio.addEventListener("timeupdate", (e) => {
        const currentTime = e.target.currentTime;
        const duration = e.target.duration;
        
        // Update current time display
        currentTimeEl.innerText = formatTime(currentTime);
        
        // Update duration (only when metadata is loaded and valid)
        if (duration) {
            totalDurationEl.innerText = formatTime(duration);
            // Update progress bar width
            let progressWidth = (currentTime / duration) * 100;
            progressBar.style.width = `${progressWidth}%`;
        }
    });

    mainAudio.addEventListener("loadeddata", () => {
        totalDurationEl.innerText = formatTime(mainAudio.duration);
    });

    // Seek logic
    progressWrapper.addEventListener("click", (e) => {
        let progressWidthVal = progressWrapper.clientWidth;
        let clickOffsetX = e.offsetX;
        let songDuration = mainAudio.duration;
        
        mainAudio.currentTime = (clickOffsetX / progressWidthVal) * songDuration;
        if (!isPlaying) playMusic();
    });

    // Volume logic
    volumeSlider.addEventListener("input", (e) => {
        let vol = e.target.value / 100;
        mainAudio.volume = vol;
        
        if (vol === 0) {
            volumeIcon.className = "fa-solid fa-volume-xmark";
        } else if (vol < 0.5) {
            volumeIcon.className = "fa-solid fa-volume-low";
        } else {
            volumeIcon.className = "fa-solid fa-volume-high";
        }
    });

    volumeIcon.addEventListener("click", () => {
        if (mainAudio.volume > 0) {
            mainAudio.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.className = "fa-solid fa-volume-xmark";
        } else {
            mainAudio.volume = 1;
            volumeSlider.value = 100;
            volumeIcon.className = "fa-solid fa-volume-high";
        }
    });

    // End of track logic
    mainAudio.addEventListener("ended", () => {
        if (repeatMode === "one") {
            mainAudio.currentTime = 0;
            playMusic();
        } else {
            nextMusic();
        }
    });

    // Shuffle & Repeat toggles
    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle("active", isShuffle);
    });

    repeatBtn.addEventListener("click", () => {
        if (repeatMode === "none") {
            repeatMode = "one";
            repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i><span style="font-size:0.5rem;position:absolute;">1</span>';
            repeatBtn.classList.add("active");
        } else if (repeatMode === "one") {
            repeatMode = "all";
            repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
            repeatBtn.classList.add("active");
        } else {
            repeatMode = "none";
            repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
            repeatBtn.classList.remove("active");
        }
    });

    // Playlist logic
    function renderPlaylist() {
        playlistContainer.innerHTML = "";
        allMusic.forEach((music, index) => {
            let li = document.createElement("div");
            li.classList.add("playlist-item");
            li.setAttribute("data-index", index);
            
            li.innerHTML = `
                <img src="${music.img}" alt="${music.name}" class="item-art">
                <div class="item-info">
                    <div class="item-title">${music.name}</div>
                    <div class="item-artist">${music.artist}</div>
                </div>
                <div class="playing-indicator">
                    <i class="fa-solid fa-chart-simple"></i>
                </div>
            `;
            
            li.addEventListener("click", () => {
                musicIndex = index;
                loadMusic(musicIndex);
                playMusic();
                if(window.innerWidth <= 768) {
                    playlistDrawer.classList.remove("active");
                }
            });
            
            playlistContainer.appendChild(li);
        });
        updatePlaylistUI();
    }

    function updatePlaylistUI() {
        const items = playlistContainer.querySelectorAll(".playlist-item");
        items.forEach(item => item.classList.remove("playing"));
        if(items[musicIndex]) {
            items[musicIndex].classList.add("playing");
            // Scroll to active item
            items[musicIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Mobile Playlist Drawer toggles
    showPlaylistBtn.addEventListener("click", () => {
        playlistDrawer.classList.add("active");
    });
    
    closePlaylistBtn.addEventListener("click", () => {
        playlistDrawer.classList.remove("active");
    });
});
