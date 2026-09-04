// Web Speech API Types helper
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createSpeechRecognizer(
  onTranscriptUpdate: (text: string, isFinal: boolean) => void,
  onError: (errorMsg: string) => void,
  onEnd: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let fullTranscript = '';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        fullTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    const currentText = (fullTranscript + interimTranscript).trim();
    onTranscriptUpdate(currentText, false);
  };

  recognition.onerror = (event: any) => {
    let message = 'We couldn\'t clearly recognize your speech. Please try again.';
    if (event.error === 'not-allowed') {
      message = 'Microphone permission denied. Please grant microphone access in browser settings.';
    } else if (event.error === 'no-speech') {
      message = 'No speech detected. Please check your microphone and speak clearly.';
    }
    onError(message);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
