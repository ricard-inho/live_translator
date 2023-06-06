from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from typing import List
from datetime import datetime
import json

import asyncio
import logging
from datetime import datetime

import numpy as np

from starlette.websockets import WebSocket, WebSocketState
import asyncio

from model.whisper.model import WhisperModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FastAPI app")

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if len(self.active_connections) > 0:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        print("COnnections : ",len(self.active_connections))
        for connection in self.active_connections:
            print(connection.application_state == WebSocketState.CONNECTED)
            print(connection.client_state == WebSocketState.CONNECTED)
            await connection.send_text(message)
                
manager = ConnectionManager()

w_model = WhisperModel()

@app.get("/")
async def root():
    return {"message": "Hello World. Server live."}

@app.get("/setSettings")
async def set_settings(language: str, task: str):
    message = await w_model.set_model_settings(language=language, task=task)
    print(message)
    return json.dumps(message)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    try:
        while True:
            # Receive the JSON data sent by a client.
            #data = await websocket.receive_json()
            #essage_processed = await websocket.receive_text()
            #data = await websocket.receive_bytes()
            # Some (fake) heavey data processing logic.

            data = await websocket.receive()
            #print("Data: ", data.keys())
            await manager.send_personal_message(json.dumps({"data":"Got it"}), websocket=websocket)

            try: 
                message_processed = await w_model.process_audio(data)
                message = {"time":current_time,"clientId":client_id,"message":message_processed}
                await manager.send_personal_message(json.dumps(message), websocket=websocket)
            except KeyError:
                print("Key error bytes ", data.keys())
                continue

            #message_processed = await heavy_data_processing(audio)
            # Send JSON data to the client.
            # await websocket.send_json(
            #     {
            #         "message": message_processed,
            #         "time": datetime.now().strftime("%H:%M:%S"),
            #     }
            # )
            # message = {"time":current_time,"clientId":client_id,"len audio": "message_processed"}
            # await manager.broadcast(json.dumps(message))
        

    except Exception as e:
        print("Hey some problem: ", e)
        manager.disconnect(websocket)
