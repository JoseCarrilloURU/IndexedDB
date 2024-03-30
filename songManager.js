class SongManager {
    constructor(db, storeName) {
        this.db = db;
        this.storeName = storeName;
        this.idCounter = 0;
        this.audis = "der";
        this.audio=null;
        this.getSongCount();
        console.log("SongManager creado");
    }

    //añade cancion id 0
    addSong(file,name,author,album) {

        let transaction = this.db.transaction([this.storeName], "readwrite");
        let store = transaction.objectStore(this.storeName);
        let request = store.add({id: this.idCounter++, name: name, author: author, album: album, file: file});
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
        console.log("id",id);
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
            console.log("El objeto ha sido borrado con éxito");
        };
    
        request.onerror = function(e) {
            console.log("Error al borrar el objeto", e.target.error);
        };
    }

    getAllSongs() {
        let transaction = this.db.transaction([this.storeName], "readonly");
        let store = transaction.objectStore(this.storeName);
        let getAllRequest = store.getAll();
        getAllRequest.onsuccess = function() {
            let songs = getAllRequest.result;
            console.log(songs);
        };
        getAllRequest.onerror = function(e) {
            console.log('Error', e.target.error.name);
        };
    }

    getSongCount() {
        let transaction = this.db.transaction([this.storeName], "readonly");
      let store = transaction.objectStore(this.storeName);
      let request = store.count();
      request.onsuccess = ()=> {
          this.idCounter= request.result
      };
      request.onerror = function(e) {
          console.log("Error obteniendo el número de canciones: ", e);
      };
  }


    


}

