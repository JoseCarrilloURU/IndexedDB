

let songManager;
let id = 1;



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
};

let playButton= document.getElementById('play-button')
playButton.addEventListener('click', function() {
    console.log("playButton clicked");
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



document.getElementById('delete-button').addEventListener('click', function() {
    songManager.deleteSong(id);
});

document.getElementById('list').addEventListener('click', function() {
    songManager.getAllSongs();
});

document.getElementById('stop-button').addEventListener('click', function() {
    songManager.stopSong();
});



