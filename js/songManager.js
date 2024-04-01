class SongManager {
    constructor(db, storeName) {
        this.db = db;
        this.storeName = storeName;
        this.id = 0;

        this.audio=null;
        this.getSongCount();
        console.log("SongManager creado");
    }

    //añade cancion id 0
    addSong(file,name,author,album) {
        console.log("añadiendo cancion",this.id);
        let transaction = this.db.transaction([this.storeName], "readwrite");
        let store = transaction.objectStore(this.storeName);
        if(name==''){
            let fileName = file.name.split('.')[0]; // get the file name without the extension
            name = fileName
            console.log("name durante",name);
        }

        let request = store.add({id: this.id++, name: name, author: author, album: album, file: file});
        request.onsuccess = function(e) {
            console.log("Canción añadida con éxito");
        };
        request.onerror = function(e) {
            console.log("Error al añadir la canción", e.target.error);
        };
    }

    /*
    let url = URL.createObjectURL(getRequest.result.file);
    // Crear un nuevo elemento de audio y reproducir el archivo
    let audio = new Audio(url);
    audio.play();
    */

    /*
        let getRequest = store.get(0);
        getRequest.onsuccess = function() {
            // Imprime el resultado de la solicitud get
            console.log(getRequest.result.file); // {id: 1, name: "John Doe"}
            let url = URL.createObjectURL(getRequest.result.file);
            // Crear un nuevo elemento de audio y reproducir el archivo
            let audio = new Audio(url);
            audio.play();

        };
    */

    playSong(id) {
        let transaction = this.db.transaction([this.storeName], "readonly");
        let store = transaction.objectStore(this.storeName);
        console.log("playing id",id);
        let getRequest = store.get(id);
        getRequest.onsuccess = ()=> {
            // Imprime el resultado de la solicitud get

            console.log(getRequest.result.file); // {id: 1, name: "John Doe"}
            let url = URL.createObjectURL(getRequest.result.file);
            // Crear un nuevo elemento de audio y reproducir el archivo
            this.audio = new Audio(url);
            this.audio.play();
            
        };
        getRequest.onerror = function(e) {
            console.log("Error al obtener la canción", e.target.error);
        };
    }

    stopSong() {
        this.audio.pause();
    }   

    deleteSong(id) {
        // Abre una transacción de lectura/escritura en la base de datos
        let transaction = this.db.transaction([this.storeName], "readwrite");
    
        // Abre el object store
        let store = transaction.objectStore(this.storeName);
    
        // Borra el objeto con el id proporcionado
        let request = store.delete(id);

    
        request.onsuccess = function(e) {
            console.log("El objeto ha sido borrado con éxito", id);
        };
    
        request.onerror = function(e) {
            console.log("Error al borrar el objeto", e.target.error);
        };
    }

    getAllSongs() {
        let transaction = this.db.transaction([this.storeName], "readonly");
        let store = transaction.objectStore(this.storeName);
        let getAllRequest = store.getAll();
        getAllRequest.onsuccess = ()=> {
            let songs = getAllRequest.result;
            let songList = document.getElementById('song-list');
            songList.innerHTML = ''; // clear the list
            songs.forEach(song => {
                let listItem = document.createElement('button');
                listItem.textContent = song.id + ': ' + song.name; // display the song id and name
                listItem.addEventListener('click', ()=> {
                    if (this.audio){
                        this.audio.pause();
                        this.audio.currentTime = 0;
                    }
                    console.log('Playing song', song.id);
                    this.playSong(song.id);
                });
                songList.appendChild(listItem);
            });
        };
        getAllRequest.onerror = function(e) {
            console.log('Error', e.target.error.name);
        };
    }

    getSongCount() {
        let transaction = this.db.transaction([this.storeName], 'readonly');
        let store = transaction.objectStore(this.storeName);
        let request = store.openCursor(null, 'prev');
        
        request.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                this.id = cursor.value.id + 1;
            }
        };
        request.onerror = (e) =>{
            console.log('Error', e.target.error.name);
        };
    }

    
    


}

