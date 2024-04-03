import {SongManager} from './songManager.js';

const wrapper = document.querySelector(".wrapper"),
editBtn = wrapper.querySelector("#edit"),
delBtn = wrapper.querySelector("#delete"),
favBtn = wrapper.querySelector("#favorite"),
musicImg = wrapper.querySelector(".img-area img"),
musicName = wrapper.querySelector(".song-details .name"),
musicArtist = wrapper.querySelector(".song-details .artist"),
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
let id = 1;

//indexedDB.deleteDatabase("MusicDatabase");
let audio = document.getElementById('audio');


// Open (or create) the database
let dbRequest = indexedDB.open("MusicDatabase", 1);

// Create the schema
dbRequest.onupgradeneeded = function() {
    let db = dbRequest.result;
    db.createObjectStore("SongStore", {keyPath: "id"});
};

//tomar valores del submit

// open.onsuccess = ()=> {
//     let db = open.result;
//     songManager = new SongManager(db,"SongStore");
//     console.log("La base de datos ha sido abierta con éxito y pasada a SongManager");
// };

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

changePic.addEventListener('click', ()=> {
    console.log("changePic clicked");
    songManager.changePic();
});

delBtn.addEventListener('click', ()=> {
    console.log("deleteButton clicked");
    songManager.deleteSong(songManager.audioId);
});

let allMusic=null;
const ulTag = wrapper.querySelector("ul");

moreMusicBtn.addEventListener("click", async ()=>{
    allMusic = await songManager.getAllSongs();
    const ulTag = wrapper.querySelector("ul");
    ulTag.innerHTML = ''; // Vacía el contenido de ulTag

    if(allMusic.length==0){
        console.log("No hay canciones");
        let liTag =  `<div id = "uploadnew"> 
            <i class="material-icons" title="Upload Songs">audio_file</i>
        </div>
        <div id = "uploadnew-text">
        <p class = "title">ADD YOUR FIRST SONG!</p>
        <p class = "subtitle">No songs have been added. Click on the button to add the first one.</p>
        </div>
        `;
        ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag
        document.getElementById('uploadnew').addEventListener('click', function() {
            console.log("uploadButton clicked no songs");
            songManager.uploadSong().then(() => {
                console.log("Canción subida con éxito");
                moreMusicBtn.click();
            });
        });
    }else{  
        // let create li tags according to array length for list
        for (let i = 0; i < allMusic.length; i++) {
        //let's pass the song name, artist from the array
        //let img = allMusic[i].img;
        let liTag = `<li li-index="${i + 1}">
                            <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span>${allMusic[i].name}</span>
                                <p>${allMusic[i].album}</p>
                            </div>
                    </li>`;
        ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag    

        }

    }
    musicList.classList.toggle("show");
});

closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});

// window.onload = async function() {
//     await ();
//     console.log("onload")
//     moreMusicBtn.click();
//   };

window.onload = async function() {
    try {
      await dbPromise;
      console.log("Database opened successfully.");
      moreMusicBtn.click();
    } catch (error) {
      console.error("Error: ", error);
    }
};


editBtn.addEventListener('click', async () => {
    const modal = document.getElementById("editModal");
    modal.style.display = "block";

    const song = await songManager.getSong();
    console.log('dddd',song);

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