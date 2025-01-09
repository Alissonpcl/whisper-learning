// src/VoiceInput.js
import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from 'axios';

const VoiceInput = () => {
  const [texto, setTexto] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textareaRef = useRef(null); // Referência para o textarea

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'pt-BR';

      recog.onstart = () => {
        console.log('Reconhecimento de voz iniciado');
        setIsListening(true);
      };

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Texto transcrito:', transcript);
        setTexto(transcript);
      };

      recog.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
      };

      recog.onend = () => {
        console.log('Reconhecimento de voz finalizado');
        setIsListening(false);
        // Removido o envio aqui

        // Testando adicionar o trigger do envio aqui
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      };

      setRecognition(recog);
    } else {
      alert('Seu navegador não suporta a API de Reconhecimento de Voz.');
    }
  }, []);

  useEffect(() => {
    // Auto-resize do textarea sempre que o texto muda
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Resetar a altura
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Ajustar para o scrollHeight
    }
  }, [texto]);

  const handleMicClick = async () => {
    if (recognition) {
      if (isListening) {
        console.log('Parando o reconhecimento de voz e a gravação');
        recognition.stop();
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      } else {
        try {
          console.log('Solicitando acesso ao microfone');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Acesso ao microfone concedido');

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = []; // Garantir que está vazio antes de iniciar

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              console.log('Dados de áudio disponíveis');
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            console.log('Gravação de áudio finalizada');
            stream.getTracks().forEach((track) => track.stop());
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              enviarAudio(audioBlob);
            } else {
              console.warn('Nenhum dado de áudio capturado');
            }
          };

          mediaRecorder.start();
          console.log('Iniciando o MediaRecorder');
          recognition.start();
        } catch (err) {
          console.error('Erro ao acessar o microfone:', err);
          alert('Não foi possível acessar o microfone.');
        }
      }
    }
  };

  const enviarAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'gravacao.webm');

      console.log('Enviando áudio para o backend');

      const response = await axios.post('http://localhost:9090/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('Áudio enviado com sucesso:', response.data);
      } else {
        console.error('Falha ao enviar o áudio:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao enviar o áudio:', error);
    }
  };

  return (
    <div style={styles.container}>
      <textarea
        ref={textareaRef} // Vincular a referência
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Fale algo..."
        style={styles.textarea}
        rows={1} // Começa com uma única linha
      />
      <button onClick={handleMicClick} style={styles.button}>
        {isListening ? <FaMicrophoneSlash size={24} color="#ff0000" /> : <FaMicrophone size={24} color="#0000ff" />}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-end', // Alinhar botões e textarea na base
    width: '100%', // Ajustar para 100% do contêiner pai
    maxWidth: '600px', // Limitar a largura máxima
    margin: '50px auto',
    padding: '0 10px', // Adicionar padding lateral
  },
  textarea: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    resize: 'none', // Desativar a possibilidade de redimensionamento manual
    overflow: 'hidden', // Esconder barras de rolagem
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.5',
  },
  button: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '10px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default VoiceInput;


/*
Explicação do Código
Importações:
useState e useEffect do React para gerenciar estados e efeitos colaterais.
Ícones de microfone da biblioteca react-icons.
Estados:
texto: Armazena o texto transcrito.
isListening: Indica se o reconhecimento de voz está ativo.
recognition: Instância do reconhecimento de voz.
useEffect:
Verifica se a API de Reconhecimento de Voz é suportada pelo navegador.
Configura as propriedades e os eventos do reconhecimento de voz.
Atualiza os estados com base nos eventos (início, resultado, erro, fim).
handleMicClick:
Inicia ou para o reconhecimento de voz com base no estado atual (isListening).
Renderização:
Campo de texto para exibir o texto transcrito.
Botão com ícone que alterna entre os estados de "ouvindo" e "parado".
*/

/*
Importações Adicionais:
useRef do React para manter referências persistentes entre renderizações.
axios para realizar requisições HTTP.
ARMAZENAR ÁUDIO:
mediaRecorderRef e audioChunksRef: Utilizados para armazenar a instância do MediaRecorder e os pedaços de áudio gravados, respectivamente.
FUNCIONAMENTO:
Quando o usuário clica no ícone do microfone, o aplicativo:
Solicita permissão para acessar o microfone.
Inicia a gravação de áudio usando MediaRecorder.
Inicia o reconhecimento de voz usando a Web Speech API.
Quando a gravação ou o reconhecimento de voz são interrompidos:
Para a gravação.
Envia o áudio gravado para o backend.
FUNÇÃO enviarAudio:
Cria um objeto FormData contendo o blob de áudio.
Envia o áudio para o endpoint /upload do backend usando axios.
*/