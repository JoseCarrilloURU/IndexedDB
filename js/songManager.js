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

        this.loopcounter = 0;
    

        this.audioId = null;
        this.audio=new Audio();
        this.barra();

        this.defaultImgPath = 'images/default4.jpg';
        this.defaultImg = null;

        this.author = null;
        this.album = null;
        this.name = null;
        this.img = null;

        this.selector = false;

        
        
        this.imgDefault(this.defaultImgPath).then(imageObject => {
            this.defaultImg = imageObject;
            console.log("Imagen por defecto cargada", imageObject);
        }).catch(error => {
            console.error("Error al cargar la imagen por defecto", error);
        });
        
        
        
        
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
            console.log("Nombre de canción vacío, se ha cambiado a ", name);
        }
        if(!img || img==""){
            img = this.defaultImg;
            console.log("Imagen de canción vacía, se ha cambiado a ", this.defaultImg);
        }
        let request = store.add({id: this.idforNewSong, name: name, author: author, album: album, file: file,img: img, isFavorite: false});
        request.onsuccess = (e)=> {
            this.songs.push(this.idforNewSong++)
            console.log("Canción añadida con éxito");
            if (this.songs.length === 1) {
                this.setSong(this.songs[0]).then(()=> {
                    this.playSong();
                });
            }
        };
        request.onerror = function(e) {
            console.log("Error al añadir la canción", e.target.error);
        };
        
    }


    setSong(id) {
        return new Promise((resolve, reject) => {
            if(this.audio!=null){
                this.audio.currentTime = 0;
                this.audio.pause();
            }

            
            if (this.songs.length==0) {
                this.name = 'undefined';
                this.author = 'undefined';
                this.img = this.defaultImgPath;
                this.syncInfoSong();
            }



            if (this.shuffle && !this.selector) {
                console.log(!this.selector)
                let randomSong;
                do {
                    let randomIndex = Math.floor(Math.random() * this.songs.length);
                    randomSong= this.songs[randomIndex];    
                } while (randomSong == this.audioId);
                id =randomSong ;
            }

            let transaction = this.db.transaction([this.storeName], "readonly");
            let store = transaction.objectStore(this.storeName);
            console.log("buscando id", id);
            let getRequest = store.get(id);


            getRequest.onsuccess = ()=> {

                let url = URL.createObjectURL(getRequest.result.file);
                this.audioId = id;
                this.audio.src = url;
                console.log("cambio de cancion", this.audioId);
                this.selector = false;
                let imagen = getRequest.result.img;
                this.name = getRequest.result.name;
                this.author = getRequest.result.author;
                this.album = getRequest.result.album;
                this.img = URL.createObjectURL(new Blob([imagen.data], { type: imagen.format }));


                this.syncInfoSong();
            
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

        if(this.audio==null  || this.audioId==Infinity){
            this.songs.length!=0? 
            this.audioId=Math.min(...this.songs): 
            console.log("no hay canciones");
    
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
            playPause.querySelector("i").innerText = "pause";
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

            if (this.songs.length === 0) {
                document.querySelector('#more-music').click();
            }
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
            let img = null;

            getAllRequest.onsuccess = () => {
                let arrsongs = getAllRequest.result.map(song => ({
                    id: song.id,
                    name: song.name,
                    artist: song.author,
                    album: song.album,
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

    async nextSong() {
        let songNumber = this.audioId;

        if (!(songNumber >= Math.max.apply(null, this.songs))){
            songNumber++;
            while (!this.songs.includes(songNumber)) {
                console.log("entra")
                this.audioId++;
            }
        }else{
            songNumber = Math.min.apply(null, this.songs);
        }
        this.audioChange = true;
        await this.setSong(songNumber);
        this.playSong();
    }

    async prevSong() {
        let songNumber = this.audioId;

        if (!(songNumber <= Math.min.apply(null, this.songs))){
            songNumber--;

            while (!this.songs.includes(songNumber)) {
                console.log("entra")
                this.audioId--;
            }
        }else{
            songNumber = Math.max.apply(null, this.songs);
        }
        this.audioChange = true;
        await this.setSong(songNumber);
        this.playSong();
    }

 
    
    fillSongsWithIds() {
        let transaction = this.db.transaction([this.storeName], 'readonly');
        let store = transaction.objectStore(this.storeName);
        let request = store.openCursor();

        this.songs = []; // Vacía la lista de canciones antes de llenarla

        request.onsuccess = async (e) => {
            let cursor = e.target.result;
            if (cursor) {
                this.songs.push(cursor.value.id); // Agrega el id al array de canciones
                cursor.continue(); // Continúa al siguiente registro
            } else {
                console.log("Canciones cargadas con éxito", this.songs);
                if (this.songs.length == 0) {
                    // If there are no songs, click the music list button
                    document.querySelector('#more-music').click();
                }else{
                    this.setSong(this.songs[0]);
                    
                }
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


    changePic(){
        return new Promise((resolve, reject) => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/jpeg, image/png';
            const self = this; // Define 'self' to refer to the SongManager instance
            fileInput.onchange = async function() {
                const file = this.files[0];
                
                try {
                    let transaction = self.db.transaction([self.storeName], "readwrite");
                    let store = transaction.objectStore(self.storeName);
                    let getRequest = store.get(self.audioId);
                    getRequest.onsuccess = ()=> {
                        console.log("cambiando imagen", file);
                        getRequest.result.img = file;
                        let request = store.put(getRequest.result);
                        request.onsuccess = (e)=> {
                            console.log("Imagen cambiada con éxito");
                            resolve();
                        };
                        request.onerror = function(e) {
                            console.log("Error al cambiar la imagen", e.target.error);
                            reject(e.target.error);
                        };
                    };
                } catch (error) {
                    console.error(error);
                    reject(error); // Reject the promise if there's an error
                }

            };
            fileInput.click();
        });
    }


    imgDefault = function (path) {
        return new Promise((resolve, reject) => {
            fetch(path)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const arrayBuffer = event.target.result;
                        const data = new Uint8Array(arrayBuffer);
                        const imageObject = {
                            format: 'image/png',
                            type: 'Cover (front)',
                            description: 'attached picture',
                            data: data
                        };
                        resolve(imageObject);
                    };
                    reader.onerror = function(error) {
                        reject(error);
                    };
                    reader.readAsArrayBuffer(blob);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    edit(name,author, album) {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(this.audioId);

        getRequest.onsuccess = (event) =>{
            const song = event.target.result;
            song.author = author;
            song.album = album;
            song.name = name;
            const putRequest = store.put(song);

            putRequest.onsuccess = (event) =>{
                console.log("Canción editada con éxito");
                this.author = author;
                this.album = album;
                this.name = name;
                this.syncInfoSong();
            };

            putRequest.onerror = function(event) {
                console.log("Error al editar la canción", event.target.error);
            };
        };

        getRequest.onerror = function(event) {
            console.log("Error al obtener la canción", event.target.error);
        };
    }


    getSong() {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.storeName], "readonly");
            let store = transaction.objectStore(this.storeName);
            let getRequest = store.get(this.audioId);

            getRequest.onsuccess = () => {
                console.log("Canción obtenida con éxito", getRequest.result);
                resolve(getRequest.result);
            };
            getRequest.onerror = function(e) {
                console.log("Error al obtener la canción", e.target.error);
                reject(e.target.error);
            };
        });
    }

    syncInfoSong() {
        let musicImg = document.querySelector(".wrapper").querySelector(".img-area img");//
        let musicName = document.querySelector(".wrapper").querySelector(".song-details .name");
        let musicArtist = document.querySelector(".wrapper").querySelector(".song-details .artist");
        let musicAlbum = document.querySelector(".wrapper").querySelector(".song-details .album-name");
        musicName.innerHTML = this.name;
        musicArtist.innerHTML = "By: " + this.author;
        musicAlbum.innerHTML = "Album: " + this.album;

        musicImg.src = this.img;
    }

    playlistLoop(){
        this.loopcounter++;
        switch(this.loopcounter){
            case 1:
                this.loop = true;
                this.audio.loop = true;
                break;
            case 2:
                this.audio.loop = false;
                this.shuffle= true;
                break;
            case 3:
                this.shuffle= false;
                this.loopcounter = 0;
                break;
        }
        console.log("loop",this.loopcounter);
    }

    barra(){
        
        const wrapper = document.querySelector(".wrapper"),
        progressArea = wrapper.querySelector(".progress-area"),
        progressBar = progressArea.querySelector(".progress-bar");
        this.audio.addEventListener("timeupdate", (e)=>{
            const currentTime = e.target.currentTime; //getting playing song currentTime
            const duration = e.target.duration; //getting playing song total duration
            let progressWidth = (currentTime / duration) * 100;
            progressBar.style.width = `${progressWidth}%`;
          
            let musicCurrentTime = wrapper.querySelector(".current-time");


            // update playing song current time
            let currentMin = Math.floor(currentTime / 60);
            let currentSec = Math.floor(currentTime % 60);
            if(currentSec < 10){ //if sec is less than 10 then add 0 before it
              currentSec = `0${currentSec}`;
            }
            musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
        });

        this.audio.addEventListener("loadeddata", ()=>{
        const musicDuration = wrapper.querySelector(".max-duration");
        // update song total duration
        let mainAdDuration = this.audio.duration;
        let totalMin = Math.floor(mainAdDuration / 60);
        let totalSec = Math.floor(mainAdDuration % 60);
        if(totalSec < 10){ //if sec is less than 10 then add 0 before it
            totalSec = `0${totalSec}`;
        }
        musicDuration.innerText = `${totalMin}:${totalSec}`;
        });

        this.audio.addEventListener("ended", ()=>{
            this.nextSong();
        })
        
        // update playing song currentTime on according to the progress bar width
        progressArea.addEventListener("click", (e)=>{
            let progressWidth = progressArea.clientWidth; //getting width of progress bar
            let clickedOffsetX = e.offsetX; //getting offset x value
            let songDuration = this.audio.duration; //getting song total duration
            
            this.audio.currentTime = (clickedOffsetX / progressWidth) * songDuration;

          });
        
          // update playing song currentTime on according to the progress bar width
        progressArea.addEventListener("click", (e)=>{
            let progressWidth = progressArea.clientWidth; //getting width of progress bar
            let clickedOffsetX = e.offsetX; //getting offset x value
            let songDuration = this.audio.duration; //getting song total duration

            this.audio.currentTime = (clickedOffsetX / progressWidth) * songDuration;


          });

    }

    favoriteSong(){
        let favBtn = document.querySelector(".wrapper").querySelector("#favorite");
            const isFav = favBtn.innerText === "star";
            isFav ? favBtn.innerText = "star_border" : favBtn.innerText = "star";
    }

    async setSongSelector(id){
        this.audioId = id;
        this.audioChange = true;
        this.selector = true;
        await this.setSong(this.audioId);
        this.playSong();
    }
}

