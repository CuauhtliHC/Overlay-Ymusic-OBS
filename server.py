import asyncio
import json
from winrt.windows.media.control import \
    GlobalSystemMediaTransportControlsSessionManager as MediaManager
from winrt.windows.storage.streams import \
    DataReader, Buffer, InputStreamOptions
import websockets

TARGET_ID = None
clients = set()
last_media_info = None

async def save_thumbnail_to_file(stream_ref, filename="media_thumb.jpg"):
    try:
        readable_stream = await stream_ref.open_read_async()
        buffer = Buffer(5000000)  # 5MB buffer
        await readable_stream.read_async(buffer, buffer.capacity, InputStreamOptions.READ_AHEAD)
        if buffer.length > 0:
            reader = DataReader.from_buffer(buffer)
            byte_buffer = bytearray(buffer.length)
            reader.read_bytes(byte_buffer)
            with open(filename, 'wb') as f:
                f.write(byte_buffer)
        else:
            print("No se encontraron datos en la miniatura")
    except Exception as e:
        print(f"Error al guardar la miniatura: {e}")

async def print_media_info(session):
    global last_media_info
    info = await session.try_get_media_properties_async()
    title = info.title
    artist = None
    if ' - ' in title:
        artist, title = title.split(' - ', 1)
    last_media_info = {"title": title, "artist": artist}
    print(title)

    if clients:
        message = json.dumps(last_media_info)
        await asyncio.gather(*(client.send(message) for client in clients))

    thumb_stream_ref = info.thumbnail
    await save_thumbnail_to_file(thumb_stream_ref)

async def media_watcher(loop):
    sessions = await MediaManager.request_async()
    current_session = sessions.get_current_session()

    if not current_session:
        print("No hay medios en reproducción")
        return

    if TARGET_ID and current_session.source_app_user_model_id != TARGET_ID:
        print(f"{TARGET_ID} no es la sesión actual.")
        return

    def on_media_changed(sender, _):
        asyncio.run_coroutine_threadsafe(print_media_info(sender), loop)

    current_session.add_media_properties_changed(on_media_changed)
    await print_media_info(current_session)

    print("Esperando cambios...")
    while True:
        await asyncio.sleep(1)

async def websocket_handler(websocket):
    print("Cliente conectado")
    clients.add(websocket)
    if last_media_info:
        await websocket.send(json.dumps(last_media_info))

    try:
        async for _ in websocket:
            pass
    finally:
        clients.remove(websocket)
        print("Cliente desconectado")

async def main():
    loop = asyncio.get_running_loop()

    websocket_server = websockets.serve(websocket_handler, "localhost", 5500)

    await asyncio.gather(
        websocket_server,
        media_watcher(loop)
    )

if __name__ == "__main__":
    asyncio.run(main())
