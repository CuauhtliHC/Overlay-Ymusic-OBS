const WebSocket = require('ws');
const youtube = require('youtube-sr').default;

const wss = new WebSocket.Server({ port: 5500 });
let lastMusic = null;

wss.on('connection', (ws) => {
  console.log('Un cliente se ha conectado.');
  ws.send(JSON.stringify(lastMusic));

  ws.on('message', async (message) => {
    const decodedMessage = message.toString('utf-8');
    const videoId = getVideoId(decodedMessage);

    if (videoId) {
      try {
        const videoInfo = await youtube.getVideo(decodedMessage);
        const title = videoInfo.title;
        const thumbnail = videoInfo.thumbnail.url;

        let artist = null;
        let trackTitle = title;
        if (title.includes(' - ')) {
          artist = title.split(' - ')[0];
          trackTitle = title.split(' - ')[1];
        }

        lastMusic = { title: trackTitle, artist, thumbnail };

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(lastMusic));
          }
        });
      } catch (error) {
        console.error('Error al obtener la información del video:', error);
      }
    }
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
