console.log("Lets write Javascript");

let currentSong = new Audio();

let songs;

let currFolder;

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const roundedSeconds = Math.floor(seconds); // Round down the seconds to the nearest integer
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;

    const minutesStr = String(minutes).padStart(2, "0");
    const secondsStr = String(remainingSeconds).padStart(2, "0");

    return `${minutesStr}:${secondsStr}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        let a = await fetch(`/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        let songUL = document
            .querySelector(".songList")
            .getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
        
        <li>
                <img class="invert" src="image/music.svg" alt="music">
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")}</div>
                  <div>Kruti</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="image/play.svg" alt="play">
                  </div>
              </li>`;
        }

        Array.from(
            document.querySelector(".songList").getElementsByTagName("li")
        ).forEach((e) => {
            e.addEventListener("click", (e) => {
                let songName = e
                    .querySelector(".info")
                    .firstElementChild.innerHTML.trim();
                console.log(songName);
                playMusic(songName);
            });
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "image/pause.svg";
        console.log("Playing music, setting play button to pause.svg");
    } else {
        play.src = "image/play.svg";
        console.log("Paused music, setting play button to play.svg");
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(
                `/songs/${folder}/info.json`
            );
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML =
                cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
              <div class="play-button">
                <a href="your-link-here">
                  <svg height="100" width="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#00C853" />
                    <polygon points="40,30 70,50 40,70" fill="black" />
                  </svg>
                </a>
              </div>
              <img src="../assets/songs/${folder}/img1.jpeg" alt="image" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        console.log(e);
        e.addEventListener("click", async (item) => {
            console.log("Fetching Songs");
            songs = await getSongs(
                `songs/${item.currentTarget.dataset.folder}`
                );
            playMusic(songs[0])
        });
    });
}

async function main() {
    await getSongs("songs/ANIMAL");
    playMusic(songs[0], true);

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "image/pause.svg";
        } else {
            currentSong.pause();
            play.src = "image/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(
            currentSong.currentTime
        )} / ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document
        .querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {
            console.log("Setting volume to: ", e.target.value);
            currentSong.volume = e.target.value / 100;
            if (currentSong.volume >0){
                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
            }
        });

        document.querySelector(".volume>img").addEventListener("click", e=>{ 
            if(e.target.src.includes("volume.svg")){
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else{
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentSong.volume = .10;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }
    
        })
}

main();
