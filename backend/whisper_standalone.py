from faster_whisper import WhisperModel

model_size = "large-v3"

# Run on GPU with FP16
# model = WhisperModel(model_size, device="cuda", compute_type="float16")

# or run on GPU with INT8
# model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
# or run on CPU with INT8
model = WhisperModel(model_size, device="cpu", compute_type="int8")

audio_file_path = r"C:\Users\ALISSON\IdeaProjects\whisper-learning\bomdia_como_vai_voce.m4a"

segments, info = model.transcribe(audio_file_path, beam_size=5)

print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))


# Explicação do Backend
# Importações:
# Flask para criar o servidor web.
# Flask-Cors para habilitar CORS (Cross-Origin Resource Sharing), permitindo que o frontend se comunique com o backend.
# os e datetime para manipulação de arquivos e geração de nomes únicos.
# Configurações:
# CORS: Habilitado para todas as rotas usando CORS(app).
# UPLOAD_FOLDER: Define a pasta onde os áudios serão armazenados. Se a pasta não existir, ela será criada.
# Rota /upload:
# Espera uma requisição POST com um arquivo chamado audio.
# Verifica se o arquivo está presente e possui um nome.
# Gera um nome único para o arquivo usando a data e hora atual.
# Salva o arquivo na pasta uploads.
# Retorna uma resposta JSON indicando sucesso ou erro.
