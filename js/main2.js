import {SongManager} from './songManager.js';

const wrapper = document.querySelector(".wrapper"),
editBtn = wrapper.querySelector("#edit"),
delBtn = wrapper.querySelector("#delete"),
favBtn = wrapper.querySelector("#favorite"),
playPauseBtn = wrapper.querySelector(".play-pause"),
prevBtn = wrapper.querySelector("#prev"),
nextBtn = wrapper.querySelector("#next"),
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

favBtn.addEventListener('click', ()=>{
    console.log("FavBtn clicked");
    songManager.favoriteSong();
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

            let h4tag = document.createElement("h4");
            h4tag.textContent = allMusic[i].name;

            let spanTag = document.createElement("span");
            spanTag.textContent = allMusic[i].artist ? "By: " + allMusic[i].artist : "By: undefined";

            let pTag = document.createElement("p");
            pTag.textContent = allMusic[i].album ? "Album: " + allMusic[i].album : "Album: undefined";
            pTag.style.fontSize = "0.9em"; 

            divTagInner.appendChild(h4tag);
            divTagInner.appendChild(spanTag);
            divTagInner.appendChild(pTag);
            divTagInner.appendChild(musicTag);
            divTagOuter.appendChild(divTagInner);
            liTag.appendChild(divTagOuter);

            liTag.addEventListener('click', () => {

                songManager.setSongSelector(allMusic[i].id)
                console.log("Canción cambiada changesongbyid");
            });

            ulTag.appendChild(liTag);
        }
    }
    
    musicList.classList.toggle("show");

});

closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});

editBtn.addEventListener('click', async () => {
    const modal = document.getElementById("editModal");
    modal.classList.add('show');

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
    modal.classList.remove('show');
});

const span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    const modal = document.getElementById("editModal");
    modal.classList.remove('show');
}


const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener("click", ()=>{
  let getText = repeatBtn.innerText; //getting this tag innerText
  songManager.playlistLoop();
  switch(getText){
    case "repeat":
      repeatBtn.innerText = "repeat_one";
      repeatBtn.setAttribute("title", "Song Looped");
      break;
    case "repeat_one":
      repeatBtn.innerText = "shuffle";
      repeatBtn.setAttribute("title", "Playlist Shuffled");
      break;
    case "shuffle":
      repeatBtn.innerText = "repeat";
      repeatBtn.setAttribute("title", "Playlist Looped");
      break;
  }
});
  
