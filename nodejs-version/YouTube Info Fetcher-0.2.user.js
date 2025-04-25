// ==UserScript==
// @name         YouTube Info Fetcher
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Obtén información de un video de YouTube abierto en una pestaña
// @author       Cuauhtli HC
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let lastUrl = window.location.href;

  const socket = new WebSocket('ws://localhost:5500');

  socket.onopen = function (event) {
    console.log('Conexión WebSocket establecida');
  };

  socket.onmessage = function (event) {
    console.log('Mensaje recibido del servidor:', event.data);
  };

  socket.onerror = function (error) {
    console.log('Error en WebSocket:', error);
  };

  socket.onclose = function (event) {
    console.log('Conexión WebSocket cerrada');
  };

  const sendInfoMusic = () => {
    let url = window.location.href;
    console.log('Enviando URL al servidor:', url);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(url);
    } else {
      console.log('WebSocket no está abierto. No se pudo enviar la URL.');
    }
  };
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      console.log('La URL ha cambiado:', window.location.href);
      lastUrl = window.location.href;
      sendInfoMusic();
    }
  }, 100);
})();
