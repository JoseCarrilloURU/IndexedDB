import {SongManager} from './songManager.js';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import process from 'process';
window.Buffer = Buffer;
window.process = process;

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
uploadBtn = wrapper.querySelector("#upload");

let songManager;
let id = 1;

//indexedDB.deleteDatabase("MusicDatabase");
let audio = document.getElementById('audio');


// Open (or create) the database
let open = indexedDB.open("MusicDatabase", 1);

// Create the schema
open.onupgradeneeded = function() {
    let db = open.result;
    db.createObjectStore("SongStore", {keyPath: "id"});
};

//tomar valores del submit

open.onsuccess = ()=> {
    var db = open.result;
    songManager = new SongManager(db,"SongStore");
    console.log("La base de datos ha sido abierta con éxito y pasada a SongManager");
    
};
open.onerror = function(e) {
    console.log("Error al abrir la base de datos", e.target.error);
};


uploadBtn.addEventListener('click', ()=>{
    console.log("uploadButton clicked");
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.onchange = async function() {
        const file = this.files[0];

        try {
            const metadata = await mm.parseBlob(file);
            let nombre = metadata.common.title;
            let artista = metadata.common.artist;
            let album = metadata.common.album;
            let img= null;
            if (metadata.common.picture && metadata.common.picture[0]) {
                img = metadata.common.picture[0];
                
            }
            songManager.addSong(file,nombre,artista,album, img);
        } catch (error) {
            console.error(error);
        }

    };
    fileInput.click();
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

delBtn.addEventListener('click', ()=> {
    console.log("deleteButton clicked");
    songManager.deleteSong(songManager.audioId);
});

let allMusic=null;
const ulTag = wrapper.querySelector("ul");

moreMusicBtn.addEventListener("click", async ()=>{
    allMusic = await songManager.getAllSongs();
    console.log('dddddddd',allMusic);
    const ulTag = wrapper.querySelector("ul");
    ulTag.innerHTML = ''; // Vacía el contenido de ulTag
    // let create li tags according to array length for list
    for (let i = 0; i < allMusic.length; i++) {
      //let's pass the song name, artist from the array
      let img = allMusic[i].img;
      let liTag = `<li li-index="${i + 1}">
                        <div class="row" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span>${allMusic[i].name}</span>
                            <p>${allMusic[i].album}</p>
                        </div>
                        <img src="${img}" alt="Album Cover" style="width: 100px;">
                        </div>
                  </li>`;
      ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag    

    }

    musicList.classList.toggle("show");
});
closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});


