const ws = new WebSocket('ws://localhost:5500');

ws.onmessage = (event) => {
  console.log('Mensaje recibido del servidor:', event.data);
  try {
    const message = JSON.parse(event.data);
    if (message.title && message.thumbnail) {
      document.getElementById('title').textContent = message.title;
      document.getElementById('artist').textContent = message.artist;
      document.getElementById('thumbnail').src = message.thumbnail;
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
