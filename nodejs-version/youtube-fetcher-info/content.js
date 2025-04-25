let lastUrl = window.location.href;

const sendInfoMusic = () => {
  let url = window.location.href;
  console.log('Solicitando envío de URL al servidor:', url);
  chrome.runtime.sendMessage({ type: 'SEND_URL', url }, (response) => {
    console.log(response.status);
  });
};

setInterval(() => {
  if (window.location.href !== lastUrl) {
    console.log('La URL ha cambiado:', window.location.href);
    lastUrl = window.location.href;
    sendInfoMusic();
  }
}, 100);
