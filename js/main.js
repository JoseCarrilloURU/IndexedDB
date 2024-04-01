let songManager;
let id = 0;

//indexedDB.deleteDatabase("MusicDatabase");
audio = document.getElementById('audio');
console.log(audio);

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

document.getElementById('song-form').onsubmit = function(e) {
    e.preventDefault();
    var name = document.getElementById('song-name').value;
    var author = document.getElementById('song-author').value;
    var album = document.getElementById('song-album').value;
    var fileInput = document.getElementById('song-file');
    var file = fileInput.files[0];

    songManager.addSong(file,name,author,album);

    document.getElementById('song-name').value = '';
    document.getElementById('song-author').value = '';
    document.getElementById('song-album').value = '';
    document.getElementById('song-file').value = '';
};

document.getElementById('volume-slider').addEventListener('input', function() {
    songManager.audio.volume = this.value;
});

let playButton = document.getElementById('play-button')
playButton.addEventListener('click', ()=> {
    console.log("playButton clicked");
    audio = songManager.audio;
    console.log("audio",audio);
    if (songManager.audio && songManager.audio.currentTime > 0 ) {
        console.log("playButton clicked and audio is playing");
        // El audio ha comenzado y no está en pausa ni ha terminado, por lo que está reproduciéndose
        console.log(songManager.audio.paused);
        if (!songManager.audio.paused) {
            //audio en reproduccion
            playButton.innerHTML = 'Play';
            songManager.audio.pause();
        } else {
            //audio en pausa
            songManager.audio.play();
            playButton.innerHTML = 'Pause';
        }
    } else {
        // El audio no se está reproduciendo
        songManager.playSong(id);
        playButton.innerHTML = 'Pause';

    }

});

window.onload = function() {
    songManager.getAllSongs();
}

// songManager.getAllSongs = function() {
//     let transaction = this.db.transaction([this.storeName], "readonly");
//     let store = transaction.objectStore(this.storeName);
//     let getAllRequest = store.getAll();
//     getAllRequest.onsuccess = function() {
//         let songs = getAllRequest.result;
//         let songList = document.getElementById('song-list');
//         songList.innerHTML = ''; // clear the list
//         songs.forEach(song => {
//             let listItem = document.createElement('li');
//             //listItem.textContent = song.name; // assuming 'title' is a property of song
//             songList.appendChild(listItem);
//         });
//     };
//     getAllRequest.onerror = function(e) {
//         console.log('Error', e.target.error.name);
//     };
// }

document.getElementById('delete-button').addEventListener('click', function() {
    songManager.deleteSong(id);
});

document.getElementById('list').addEventListener('click', function() {
    songManager.getAllSongs();
});

document.getElementById('next-button').addEventListener('click', () =>{
    console.log(id)
    id=id+1;
    
    songManager.audio.pause();
    songManager.audio.currentTime = 0;
    songManager.playSong(id);
} );


document.getElementById('prev-button').addEventListener('click', ()=> {
    console.log(id)
    id=id-1;
    
    songManager.audio.pause();
    songManager.audio.currentTime = 0;
    songManager.playSong(id);
} );




