// src/App.js
import React from 'react';
import VoiceInput from './VoiceInput';

function App() {
  return (
    <div style={styles.app}>
      <h1>Reconhecimento de Voz com React</h1>
      <VoiceInput />
    </div>
  );
}

const styles = {
  app: {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
};

export default App;