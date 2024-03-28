// Open (or create) the database
var open = indexedDB.open("MusicDatabase", 1);

// Create the schema
open.onupgradeneeded = function() {
    var db = open.result;
    var store = db.createObjectStore("SongStore", {keyPath: "id"});
};
//hola como estas
open.onsuccess = function() {
    var db = open.result;
    var tx = db.transaction("SongStore", "readonly");
    var store = tx.objectStore("SongStore");

    // Handle form submission
    document.getElementById('song-form').onsubmit = function(e) {
        e.preventDefault();
        var id = document.getElementById('song-id').value;
        var name = document.getElementById('song-name').value;
        var author = document.getElementById('song-author').value;
        var album = document.getElementById('song-album').value;
        var fileInput = document.getElementById('song-file');
        var file = fileInput.files[0];

        var tx = db.transaction("SongStore", "readwrite");
        var store = tx.objectStore("SongStore");

        // Add the song to the database
        store.put({id: id, name: name, author: author, album: album, file: file});
    };

    // Handle play button click
    document.getElementById('play-button').onclick = function() {
        var id = document.getElementById('song-id').value;
        var tx = db.transaction("SongStore", "readonly");
        var store = tx.objectStore("SongStore");
        var getSong = store.get(id);
    
        getSong.onsuccess = function() {
            var player = document.getElementById('player');
            var blob = getSong.result.file;
            var url = URL.createObjectURL(blob);
            player.src = url;
            player.play();
        };
    };

    // Handle pause button click
document.getElementById('pause-button').onclick = function() {
    var player = document.getElementById('player');
    player.pause();
};

// Handle delete button click
document.getElementById('delete-button').onclick = function() {
    var id = document.getElementById('song-id').value;
    var request = store.delete(id);

    request.onsuccess = function() {
        console.log('Song deleted.');
    };

    request.onerror = function(e) {
        console.log('Error', e.target.error.name);
    };
};

// Handle next button click
/*document.getElementById('next-button').onclick = function() {
    // Here you would need to implement logic to get the next song
    // This will depend on how you are storing and retrieving your songs
};

// Handle previous button click
document.getElementById('prev-button').onclick = function() {
    // Here you would need to implement logic to get the previous song
    // This will depend on how you are storing and retrieving your songs
};*/

var getAllRequest = store.getAll();

getAllRequest.onsuccess = function() {
    var songs = getAllRequest.result;
    console.log(songs);
};

getAllRequest.onerror = function(e) {
    console.log('Error', e.target.error.name);
};

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
};