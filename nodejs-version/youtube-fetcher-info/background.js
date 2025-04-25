let socket = null;

function connectWebSocket() {
  if (socket) {
    socket.close();
  }

  socket = new WebSocket('ws://localhost:5500');

  socket.onopen = function () {
    console.log('Conexión WebSocket establecida en background.js');
  };

  socket.onmessage = function (event) {
    console.log('Mensaje recibido del servidor:', event.data);
  };

  socket.onerror = function (error) {
    console.error('Error en WebSocket:', error);
  };

  socket.onclose = function () {
    console.log(
      'Conexión WebSocket cerrada. Intentando reconectar en 5 segundos...',
    );
    setTimeout(connectWebSocket, 5000);
  };
}

connectWebSocket();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.type === 'SEND_URL' &&
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    console.log('Enviando URL al servidor:', message.url);
    socket.send(message.url);
    sendResponse({ status: 'URL enviada correctamente' });
  } else {
    console.log('WebSocket no está abierto. No se pudo enviar la URL.');
    sendResponse({ status: 'Error: WebSocket no abierto' });
  }
});
