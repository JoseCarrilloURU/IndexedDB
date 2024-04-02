import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import process from 'process';
window.Buffer = Buffer;
window.process = process;

// Rest of your code...

async function fetchAndPrintMetadata(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const metadata = await mm.parseBlob(blob);

  console.log(`Título: ${metadata.common.title}`);
  console.log(`Álbum: ${metadata.common.album}`);
  console.log(`Autor: ${metadata.common.artist}`);
  console.log(`Género: ${metadata.common.genre}`);


  // Imprimir la imagen de la portada del álbum
  if (metadata.common.picture && metadata.common.picture[0]) {
    const picture = metadata.common.picture[0];
    // Crear una URL de objeto de blob a partir de los datos de la imagen
    const imageUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
    console.log(`Imagen: ${imageUrl}`);

    // Crear un nuevo elemento img y establecer su src a la URL de la imagen
    const img = document.createElement('img');
    img.src = imageUrl;

    // Añadir el elemento img a la página
    document.body.appendChild(img);
  }
}
fetchAndPrintMetadata('/AJR.mp3');