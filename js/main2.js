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

open.onsuccess = function() {
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
    fileInput.onchange = function() {
        const file = this.files[0];

        songManager.addSong(file,'naem','autor','album');
    };
    fileInput.click();
});

playPauseBtn.addEventListener('click', ()=> {
    console.log("playButton clicked");
    songManager.playSong();

});

moreMusicBtn.addEventListener('click', ()=> {
    songManager.getAllSongs();   

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


