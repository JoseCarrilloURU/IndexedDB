class SongManager {
    constructor(db, storeName) {
        this.db = db;
        this.storeName = storeName;

        this.audioChange = false;

        this.idforNewSong = null;
        this.setNewLastSongID();
        this.fillSongsWithIds();
    

        this.audioId = null;
        this.audio=null;

        console.log("SongManager creado");
    }

    //añade cancion id 0
    addSong(file,name,author,album) {
        console.log("añadiendo cancion",this.idforNewSong, name, author, album, file);
        let transaction = this.db.transaction([this.storeName], "readwrite");
        let store = transaction.objectStore(this.storeName);
        console.log("nombre de cancion", name);
        if(!name || name==""){
            let fileName = file.name.split(".")[0];
            name = fileName;
            console.log("nombre de cancion vacio, se ha cambiado a", name);
        }
        let request = store.add({id: this.idforNewSong, name: name, author: author, album: album, file: file});
        request.onsuccess = (e)=> {
            this.songs.push(this.idforNewSong++)
            console.log("Canción añadida con éxito");
        };
        request.onerror = function(e) {
            console.log("Error al añadir la canción", e.target.error);
        };
    }


    setSong(id) {
        return new Promise((resolve, reject) => {
            console.log("cambiando cancion", this.audio);
            if(this.audio!=null){
                console.log("parando cancion y cambiando a", id);
                this.audio.currentTime = 0;
                this.audio.pause();
            }

            let transaction = this.db.transaction([this.storeName], "readonly");
            let store = transaction.objectStore(this.storeName);
            let getRequest = store.get(id);
            getRequest.onsuccess = ()=> {
    
                let url = URL.createObjectURL(getRequest.result.file);
                this.audioId = id;
                this.audio = new Audio(url);
                console.log("Canción obtenida con éxito", getRequest.result.file);
                this.audioChange = false;

                resolve();
            };
            getRequest.onerror = function(e) {
                console.log("Error al obtener la canción", e.target.error);
                reject(e.target.error);
            };
        });
    }

    async playSong(){
        if(this.audio==null ){
            console.log("cambiando cancion ore", 1);
            this.audioId=1 //! mientras no haya cancion lista de cancioes
            await this.setSong(this.audioId);
        }

        if(this.audioChange){
        await this.setSong(this.audioId);
        }


        if (this.audio.currentTime > 0 ) {

            if (!this.audio.paused) {
                console.log("pause", this.audioId);
                this.audio.pause();
            } else {
                console.log("play", this.audioId);
                this.audio.play();
            }
        }else{
            console.log("playing", this.audioId);
            this.audio.play();
        }
        
    }

 

    deleteSong(id) {
        console.log("borrando cancion", id);
        // Abre una transacción de lectura/escritura en la base de datos
        let transaction = this.db.transaction([this.storeName], "readwrite");
    
        // Abre el object store
        let store = transaction.objectStore(this.storeName);
    
        // Borra el objeto con el id proporcionado
        let request = store.delete(id);

    
        request.onsuccess =(e) =>{
            
            let index = this.songs.indexOf(id);
            if (index !== -1) {
                this.songs.splice(index, 1);
            }
            
            console.log("El objeto ha sido borrado con éxito", id);
            console.log(this.songs); 
        };
    
        request.onerror = function(e) {
            console.log("Error al borrar el objeto", e.target.error);
        };
    }

    getAllSongs() {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.storeName], "readonly");
            let store = transaction.objectStore(this.storeName);
            let getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                let arrsongs = getAllRequest.result.map(song => ({
                    id: song.id,
                    name: song.name,
                    artist: song.author,
                    img: song.album,
                    file: song.file
                }));

                console.log(arrsongs);
                resolve(arrsongs); // Resuelve la promesa con arrsongs
            };

            getAllRequest.onerror = function(e) {
                console.log('Error', e.target.error.name);
                reject(e.target.error.name); // Rechaza la promesa con el error
            };
        });
    }

    setNewLastSongID() {
        let transaction = this.db.transaction([this.storeName], 'readonly');
        let store = transaction.objectStore(this.storeName);
        let request = store.openCursor(null, 'prev');
        
        request.onsuccess = (e) => {
             let cursor= e.target.result;
             let lastId= cursor? cursor.value.id: null;
            if(typeof lastId === 'number' && !isNaN(lastId)){
                this.idforNewSong = lastId + 1;
            }else{
                this.idforNewSong = 1;
            }
        };
        request.onerror = (e) =>{
            console.log('Error', e.target.error.name);
        };
    }

    nextSong() {

        if (!(this.audioId >= Math.max.apply(null, this.songs))){
            this.audioId++;
            while (!this.songs.includes(this.audioId)) {
                console.log("entra")
                this.audioId++;
            }

        }
        this.audioChange = true;
        this.playSong(this.audioId);
    }

    prevSong() {

        if (!(this.audioId <= Math.min.apply(null, this.songs))){
            this.audioId--;

            while (!this.songs.includes(this.audioId)) {
                console.log("entra")
                this.audioId--;
            }
        }
        this.audioChange = true;
        this.playSong(this.audioId);
    }

    fillSongsWithIds() {
        let transaction = this.db.transaction([this.storeName], 'readonly');
        let store = transaction.objectStore(this.storeName);
        let request = store.openCursor();

        this.songs = []; // Vacía la lista de canciones antes de llenarla

        request.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                this.songs.push(cursor.value.id); // Agrega el id al array de canciones
                cursor.continue(); // Continúa al siguiente registro
            } else {
                
                console.log("Canciones cargadas con éxito", this.songs);
            }
        };

        request.onerror = (e) => {
            console.log('Error', e.target.error.name);
        };
    }

    

    
    


}

