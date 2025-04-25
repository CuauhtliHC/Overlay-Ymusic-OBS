const ws = new WebSocket('ws://localhost:5500');
let refreshTimeout = null;

ws.onmessage = (event) => {
  console.log('Mensaje recibido del servidor:', event.data);
  try {
    const message = JSON.parse(event.data);
    if (message.title) {
      document.getElementById('title').textContent = message.title;
      document.getElementById('artist').textContent = message.artist || '';

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      refreshTimeout = setTimeout(() => {
        const thumbnailImg = document.getElementById('thumbnail');
        const newSrc = `./media_thumb.jpg?t=${Date.now()}`;

        const newImg = new Image();
        newImg.onload = () => {
          thumbnailImg.src = newSrc;
          console.log('Miniatura actualizada después de retardo');
        };
        newImg.onerror = () => {
          console.warn('Error al cargar la miniatura');
        };
        newImg.src = newSrc;
      }, 1500);
    }
  } catch (error) {
    console.error('Error al parsear el mensaje:', error);
  }
};

ws.onopen = () => {
  console.log('Conexión establecida con el servidor WebSocket.');
};

ws.onerror = (error) => {
  console.error('Error en la conexión WebSocket:', error);
};

ws.onclose = () => {
  console.log('Conexión cerrada con el servidor WebSocket.');
};
