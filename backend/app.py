# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import ffmpeg

app = Flask(__name__)
CORS(app)

# Diretório onde os áudios convertidos para MP3 serão salvos
UPLOAD_FOLDER_MP3 = 'uploads_mp3'
if not os.path.exists(UPLOAD_FOLDER_MP3):
    os.makedirs(UPLOAD_FOLDER_MP3)

# Diretório temporário para armazenar o arquivo webm antes da conversão
TEMP_FOLDER = 'temp_uploads'
if not os.path.exists(TEMP_FOLDER):
    os.makedirs(TEMP_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'Nenhum arquivo de áudio enviado'}), 400

    audio = request.files['audio']

    if audio.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

    # Criar um nome único para o arquivo
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
    original_filename = f'gravacao_{timestamp}.webm'
    temp_path = os.path.join(TEMP_FOLDER, original_filename)
    
    # Salvar o arquivo webm temporariamente
    try:
        audio.save(temp_path)
        print(f'Arquivo webm salvo em: {temp_path}')
    except Exception as e:
        print(f'Erro ao salvar o arquivo webm: {e}')
        return jsonify({'error': 'Erro ao salvar o arquivo de áudio'}), 500

    # Definir o caminho do arquivo MP3 resultante
    mp3_filename = f'gravacao_{timestamp}.mp3'
    mp3_path = os.path.join(UPLOAD_FOLDER_MP3, mp3_filename)

    # Converter o arquivo webm para mp3 usando ffmpeg
    try:
        (
            ffmpeg
            .input(temp_path)
            .output(mp3_path, codec='libmp3lame', audio_bitrate='192k')
            .run(overwrite_output=True)
        )
        print(f'Arquivo MP3 salvo em: {mp3_path}')
    except ffmpeg.Error as e:
        print('Erro na conversão com FFmpeg:', e.stderr.decode())
        return jsonify({'error': 'Erro na conversão do arquivo de áudio'}), 500
    finally:
        # Remover o arquivo webm temporário
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f'Arquivo webm temporário removido: {temp_path}')

    return jsonify({'message': 'Arquivo de áudio recebido e convertido com sucesso', 'filename': mp3_filename}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9090)