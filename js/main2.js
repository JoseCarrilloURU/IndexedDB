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
favoriteList = wrapper.querySelector(".favorites-list"),
togglefavBtn = musicList.querySelector("#toggle-fav"),
toggleunfavBtn = favoriteList.querySelector("#toggle-unfav"),
closefav = favoriteList.querySelector("#close-fav"),
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
        moreMusicBtn.click();
      resolve(event.target.result);
    };

    dbRequest.onerror = function(event) {
        console.log("Error al abrir la base de datos", e.target.error);
      };
});

uploadBtn.addEventListener('click', ()=>{
    songManager.uploadSong();

});

playPauseBtn.addEventListener('click', ()=> {
    songManager.playSong();

});

prevBtn.addEventListener('click', ()=> {
    songManager.prevSong();
});

nextBtn.addEventListener('click', ()=> {
    songManager.nextSong();
});

/* changePic.addEventListener('click', ()=> {
    songManager.changePic();
}); */

delBtn.addEventListener('click', ()=> {
    songManager.deleteSong(songManager.audioId);
});

favBtn.addEventListener('click', ()=> {
    songManager.favoriteSong();
});

toggleunfavBtn.addEventListener('click', async ()=> {
    moreMusicBtn.click();
    favoriteList.classList.toggle("show"); // This line toggles the visibility of the favorites list
});

togglefavBtn.addEventListener('click', async ()=>{
    moreMusicBtn.click();
    //songManager.favoriteSong();
    console.log("togglefavBtn clicked");

    let allMusic = await songManager.getAllSongs();
    console.log("allMusic: ", allMusic);

    //let favoriteMusic = allMusic.filter(song => song.isFavorite);
    const ulTag = wrapper.querySelector("ul");
    ulTag.innerHTML = ''; // Vacía el contenido de ulTag
    
    // let create li tags according to array length for list
    for (let i = 0; i < allMusic.length; i++) {
        console.log("entro a for de togglefavBtn");

    //for (let i = 0; i < favoriteMusic.length; i++) {
        let liTag = document.createElement("li");
        liTag.setAttribute("li-index", allMusic[i].id);
        //liTag.setAttribute("li-index", favoriteMusic[i].id);

        let divTagOuter = document.createElement("div");
        divTagOuter.style.display = "flex";
        divTagOuter.style.justifyContent = "space-between";
        divTagOuter.style.alignItems = "center";
        divTagOuter.style.position = "relative";

        let divTagInner = document.createElement("div");

        let h4tag = document.createElement("h4");
        h4tag.textContent = allMusic[i].name;

        let spanTag = document.createElement("span");
        spanTag.textContent = allMusic[i].artist ? "By: " + allMusic[i].artist : "By: undefined";

        let pTag = document.createElement("p");
        pTag.textContent = allMusic[i].album ? "Album: " + allMusic[i].album : "Album: undefined";
        pTag.style.fontSize = "0.9em"; 

        let spanTime = document.createElement("h4");
         spanTime.style.position = "absolute";
         spanTime.style.justifyContent = "flex-end";
         spanTime.style.paddingLeft = "285px";
        
        spanTime.textContent = allMusic[i].duration;

        divTagInner.appendChild(h4tag);
        divTagInner.appendChild(spanTag);
        divTagInner.appendChild(pTag);
        divTagOuter.appendChild(divTagInner);

        liTag.appendChild(divTagOuter);
        divTagOuter.appendChild(spanTime);


        liTag.addEventListener('click', () => {

            songManager.setSongSelector(allMusic[i].id)
            console.log("Canción cambiada changesongbyid");
            //moreMusicBtn.click();
        });

        ulTag.appendChild(liTag);
    }

    favoriteList.classList.toggle("show");
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

            let divTagTime = document.createElement("div");
            divTagTime.setAttribute("class", "timeStamp");


            let divTagInner = document.createElement("div");
            divTagInner.setAttribute("class", "music-info");

            let h4tag = document.createElement("h4");
            h4tag.textContent = allMusic[i].name;

            let spanTag = document.createElement("span");
            spanTag.textContent = allMusic[i].artist ? "By: " + allMusic[i].artist : "By: undefined";
            spanTag.setAttribute("class", "listartist");

            let pTag = document.createElement("p");
            pTag.textContent = allMusic[i].album ? "Album: " + allMusic[i].album : "Album: undefined";
            pTag.style.fontSize = "0.9em"; 
            pTag.setAttribute("class", "listalbum");

            let spanTime = document.createElement("h4");

            
            spanTime.textContent = allMusic[i].duration;

            divTagInner.appendChild(h4tag);
            divTagInner.appendChild(spanTag);
            divTagInner.appendChild(pTag);
            divTagTime.appendChild(spanTime);

            liTag.appendChild(divTagInner);
            liTag.appendChild(divTagTime);


            liTag.addEventListener('click', () => {

                songManager.setSongSelector(allMusic[i].id)
                console.log("Canción cambiada changesongbyid");
                moreMusicBtn.click();
            });

            ulTag.appendChild(liTag);
        }
    }
    
    musicList.classList.toggle("show");

});

/*

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

            let divTagTime = document.createElement("div");
            divTagTime.setAttribute("class", "timeStamp");


            let divTagInner = document.createElement("div");
            divTagInner.setAttribute("class", "music-info");

            let h4tag = document.createElement("h4");
            h4tag.textContent = allMusic[i].name;

            let spanTag = document.createElement("span");
            spanTag.textContent = allMusic[i].artist ? "By: " + allMusic[i].artist : "By: undefined";
            spanTag.setAttribute("class", "listartist");

            let pTag = document.createElement("p");
            pTag.textContent = allMusic[i].album ? "Album: " + allMusic[i].album : "Album: undefined";
            pTag.style.fontSize = "0.9em"; 
            pTag.setAttribute("class", "listalbum");

            let spanTime = document.createElement("h4");

            
            spanTime.textContent = allMusic[i].duration;

            divTagInner.appendChild(h4tag);
            divTagInner.appendChild(spanTag);
            divTagInner.appendChild(pTag);
            divTagTime.appendChild(spanTime);

            liTag.appendChild(divTagInner);
            liTag.appendChild(divTagTime);


            liTag.addEventListener('click', () => {

                songManager.setSongSelector(allMusic[i].id)
                console.log("Canción cambiada changesongbyid");
                moreMusicBtn.click();
            });

            ulTag.appendChild(liTag);
        }
    }
    
    musicList.classList.toggle("show");

});

*/

closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});

closefav.addEventListener("click", ()=>{
    togglefavBtn.click();
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
  
