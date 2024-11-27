const WebSocket = require('ws');
const ytdl = require('ytdl-core');

const wss = new WebSocket.Server({ port: 5500 });
let lastMusic = null;

wss.on('connection', (ws) => {
  console.log('Un cliente se ha conectado.');

  ws.send(JSON.stringify(lastMusic));

  ws.on('message', (message) => {
    const decodedMessage = message.toString('utf-8');
    console.log('Mensaje recibido del cliente: ', decodedMessage);
    ytdl
      .getInfo(getVideoId(decodedMessage))
      .then((info) => {
        let artist = null;
        let title = info.videoDetails.title;
        if (title.includes(' - ')) {
          artist = title.split(' - ')[0];
          title = title.split(' - ').slice(1).join(' - ');
        }
        lastMusic = {
          title: title,
          thumbnail: info.videoDetails.thumbnails.at(-1).url,
          artist: artist,
        };
        if (ws.readyState === WebSocket.OPEN) {
          console.log('Enviando mensaje al cliente:', lastMusic);
          wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(lastMusic));
          });
        } else {
          console.log('La conexión WebSocket no está abierta.');
        }
      })
      .catch((err) => {
        console.log('Error al obtener la información del video:', err);
      });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

console.log('Servidor WebSocket escuchando en ws://localhost:5500');

const getVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|(?:v|e(?:mbed)?)\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
