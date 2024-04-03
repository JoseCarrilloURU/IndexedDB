import {SongManager} from './songManager.js';

const wrapper = document.querySelector(".wrapper"),
editBtn = wrapper.querySelector("#edit"),
delBtn = wrapper.querySelector("#delete"),
favBtn = wrapper.querySelector("#favorite"),
musicImg = wrapper.querySelector(".img-area img"), // 
musicName = wrapper.querySelector(".song-details .name"), // 
musicArtist = wrapper.querySelector(".song-details .artist"), //
playPauseBtn = wrapper.querySelector(".play-pause"),
prevBtn = wrapper.querySelector("#prev"),
nextBtn = wrapper.querySelector("#next"),
mainAudio = wrapper.querySelector("#main-audio"),
progressArea = wrapper.querySelector(".progress-area"),
progressBar = progressArea.querySelector(".progress-bar"),
musicList = wrapper.querySelector(".music-list"),
moreMusicBtn = wrapper.querySelector("#more-music"),
togglefavBtn = musicList.querySelector("#toggle-fav"),
closemoreMusic = musicList.querySelector("#close"),
uploadBtn = wrapper.querySelector("#upload"),
changeImgBtn = wrapper.querySelector("#changePic");

let songManager;



//indexedDB.deleteDatabase("MusicDatabase");
// Open (or create) the database
let dbRequest = indexedDB.open("MusicDatabase", 1);

// Create the schema
dbRequest.onupgradeneeded = function() {
    let db = dbRequest.result;
    db.createObjectStore("SongStore", {keyPath: "id"});
};

let dbPromise = new Promise((resolve, reject) => {
    dbRequest.onsuccess = function(event) {
        let db = dbRequest.result;
        songManager = new SongManager(db,"SongStore");
        console.log("La base de datos ha sido abierta con éxito y pasada a SongManager");
      resolve(event.target.result);
    };

    dbRequest.onerror = function(event) {
        console.log("Error al abrir la base de datos", e.target.error);
      };
});




uploadBtn.addEventListener('click', ()=>{
    console.log("uploadButton clicked");
    songManager.uploadSong();

});

playPauseBtn.addEventListener('click', ()=> {
    console.log("playButton clicked");
    songManager.playSong();

});

prevBtn.addEventListener('click', ()=> {
    songManager.prevSong();
});

nextBtn.addEventListener('click', ()=> {
    songManager.nextSong();
});

/* changePic.addEventListener('click', ()=> {
    console.log("changePic clicked");
    songManager.changePic();
}); */

delBtn.addEventListener('click', ()=> {
    console.log("deleteButton clicked");
    songManager.deleteSong(songManager.audioId);
});

moreMusicBtn.addEventListener("click", async ()=>{
    let allMusic = await songManager.getAllSongs();
    const ulTag = wrapper.querySelector("ul");
    ulTag.innerHTML = ''; // Vacía el contenido de ulTag

    if(allMusic.length==0){
        closemoreMusic.style.visibility = 'hidden';
        closemoreMusic.style.pointerEvents = 'none';
        togglefavBtn.style.pointerEvents = 'none';
        console.log("No hay canciones");
        let liTag =  `<div id = "uploadnew"> 
            <i class="material-icons" title="Upload Song">audio_file</i>
        </div>
        <div id = "uploadnew-text">
        <p class = "title">ADD YOUR FIRST SONG!</p>
        <p class = "subtitle">No songs have been added. Click on the button to add the first one.</p>
        </div>
        `;
        ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag
        document.getElementById('uploadnew').addEventListener('click', ()=> {
            console.log("uploadButton clicked no songs");
            songManager.uploadSong().then(() => {
                console.log("Canción subida con éxito");
                moreMusicBtn.click();
            });
        });
    }else{
        closemoreMusic.style.visibility = 'visible';
        closemoreMusic.style.pointerEvents = 'auto';  
        togglefavBtn.style.pointerEvents = 'auto';
        // let create li tags according to array length for list
        for (let i = 0; i < allMusic.length; i++) {
            let liTag = document.createElement("li");
            liTag.setAttribute("li-index", allMusic[i].id);

            let divTagOuter = document.createElement("div");
            divTagOuter.style.display = "flex";
            divTagOuter.style.justifyContent = "space-between";
            divTagOuter.style.alignItems = "center";

            let divTagInner = document.createElement("div");

            let spanTag = document.createElement("span");
            spanTag.textContent = allMusic[i].name;

            let pTag = document.createElement("p");
            pTag.textContent = allMusic[i].album;

            divTagInner.appendChild(spanTag);
            divTagInner.appendChild(pTag);
            divTagOuter.appendChild(divTagInner);
            liTag.appendChild(divTagOuter);

            liTag.addEventListener('click', () => {
                songManager.setSong(allMusic[i].id);
            });

            ulTag.appendChild(liTag);
        }

    }
    
    musicList.classList.toggle("show");
    let liTags = ulTag.querySelectorAll('li');
    liTags.forEach((liTag) => {
        liTag.addEventListener('click', async () => {
            let id = liTag.getAttribute("li-index");
            songManager.changeSongById(id)
            moreMusicBtn.click();
        });
    });
});

closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});

editBtn.addEventListener('click', async () => {
    const modal = document.getElementById("editModal");
    modal.style.display = "block";

    const song = await songManager.getSong();

    document.getElementById("author").value = song.author;
    document.getElementById("name").value = song.name;
    document.getElementById("album").value = song.album;
});

const form = document.getElementById("editForm");
form.addEventListener('submit', (event) => {
    event.preventDefault();
    let author = document.getElementById("author").value;
    let name = document.getElementById("name").value;
    let album = document.getElementById("album").value;
    songManager.edit(name, author, album);

    const modal = document.getElementById("editModal");
    modal.style.display = "none";
});

const span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    const modal = document.getElementById("editModal");
    modal.style.display = "none";


}



/*
mainAudio.addEventListener("timeupdate", (e)=>{
    console.log("timeupdate");
    const currentTime = e.target.currentTime; //getting playing song currentTime
    const duration = e.target.duration; //getting playing song total duration
    let progressWidth = (currentTime / duration) * 100;
    progressBar.style.width = `${progressWidth}%`;
  
    let musicCurrentTime = wrapper.querySelector(".current-time"),
    musicDuartion = wrapper.querySelector(".max-duration");
    mainAudio.addEventListener("loadeddata", ()=>{
      // update song total duration
      let mainAdDuration = mainAudio.duration;
      let totalMin = Math.floor(mainAdDuration / 60);
      let totalSec = Math.floor(mainAdDuration % 60);
      if(totalSec < 10){ //if sec is less than 10 then add 0 before it
        totalSec = `0${totalSec}`;
      }
      musicDuartion.innerText = `${totalMin}:${totalSec}`;
    });
    // update playing song current time
    let currentMin = Math.floor(currentTime / 60);
    let currentSec = Math.floor(currentTime % 60);
    if(currentSec < 10){ //if sec is less than 10 then add 0 before it
      currentSec = `0${currentSec}`;
    }
    musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
  });

// update playing song currentTime on according to the progress bar width
progressArea.addEventListener("click", (e)=>{
    let progressWidth = progressArea.clientWidth; //getting width of progress bar
    let clickedOffsetX = e.offsetX; //getting offset x value
    let songDuration = mainAudio.duration; //getting song total duration
    
    mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
    playMusic(); //calling playMusic function
    playingSong();
  });

  // update playing song currentTime on according to the progress bar width
progressArea.addEventListener("click", (e)=>{
    let progressWidth = progressArea.clientWidth; //getting width of progress bar
    let clickedOffsetX = e.offsetX; //getting offset x value
    let songDuration = mainAudio.duration; //getting song total duration
    
    mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
    playMusic(); //calling playMusic function
    playingSong();
  });
  */
  
