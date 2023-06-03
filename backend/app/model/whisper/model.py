import whisper
import numpy as np

class WhisperModel():
    def __init__(self, model_type="base"):
        print("loading whisper")
        self.model = whisper.load_model(model_type, download_root="/app/model/whisper/")
        self.language = 'en'
        self.task = 'transcribe'

    async def set_model_settings(self, language, task):
        self.language = language
        self.task = task
        message = {"message": "Settings set correctly"}
        return message

    async def process_audio(self, data):
        audio = np.array([], dtype=np.int16)
        buffer = np.frombuffer(data["bytes"], dtype=np.int16).astype(np.float32) / 32000
        audio = np.concatenate([audio, buffer])
        print("Got: at ", type(audio))
        result = self.model.transcribe(audio)
        print(result["text"])
        return result["text"]
