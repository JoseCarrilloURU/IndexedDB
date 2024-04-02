import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import process from 'process';
window.Buffer = Buffer;
window.process = process;


export class SongManager {
    constructor(db, storeName) {
        this.db = db;
        this.storeName = storeName;

        this.audioChange = false;

        this.idforNewSong = null;
        this.setNewLastSongID();
        this.fillSongsWithIds();
    
        this.img = null;
        this.audioId = null;
        this.audio=null;

        console.log("SongManager creado");
    }

    //añade cancion id 0
    addSong(file,name,author,album,img) {
        console.log("añadiendo cancion",this.idforNewSong,'nombre', name,'autor', author,'album', album,'file', file,'img', img);
        let transaction = this.db.transaction([this.storeName], "readwrite");
        let store = transaction.objectStore(this.storeName);
        console.log("nombre de cancion", name);
        if(!name || name==""){
            let fileName = file.name.split(".")[0];
            name = fileName;
            console.log("nombre de cancion vacio, se ha cambiado a", name);
        }
        let request = store.add({id: this.idforNewSong, name: name, author: author, album: album, file: file,img: img});
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
                let imagen = getRequest.result.img;
                this.img = URL.createObjectURL(new Blob([imagen.data], { type: imagen.format }));
                console.log("cambiando ", this.img);

                let musicImg = document.querySelector(".wrapper").querySelector(".img-area img");//!acople???????????
                let musicName = document.querySelector(".wrapper").querySelector(".song-details .name");
                let musicArtist = document.querySelector(".wrapper").querySelector(".song-details .artist");
                musicName.innerHTML = getRequest.result.name;
                musicArtist.innerHTML = getRequest.result.author;
                
                console.log("cambiando ", musicImg);
                if (musicImg) {
                    musicImg.src = this.img
                }
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

        let playPause = document.querySelector(".wrapper").querySelector(".play-pause");

        if(this.audio==null){
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
                playPause.querySelector("i").innerText = "play_arrow";
            } else {
                console.log("play", this.audioId);
                this.audio.play();
                playPause.querySelector("i").innerText = "pause";
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
            this.nextSong();
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
                    album: song.album,
                    img: URL.createObjectURL(new Blob([song.img.data], { type: song.img.format })),
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
        }else{
            this.audioId = Math.min.apply(null, this.songs);
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
        }else{
            this.audioId = Math.max.apply(null, this.songs);
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

    uploadSong() {
        return new Promise((resolve, reject) => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'audio/*';
            const self = this; // Define 'self' to refer to the SongManager instance
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
                    await self.addSong(file,nombre,artista,album, img); // Use 'self' instead of 'this'
                    if(self.audioId==null){
                        self.nextSong();
                    }
                    resolve(); // Resolve the promise when addSong has finished
                } catch (error) {
                    console.error(error);
                    reject(error); // Reject the promise if there's an error
                }

            };
            fileInput.click();
        });
    }
    
    


}

