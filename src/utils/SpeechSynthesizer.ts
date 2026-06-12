const enabled = true;

export function speak(text: string) {
  if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.75;
  utterance.pitch = 0.4;
  utterance.volume = 0.7;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("google uk") ||
      v.name.toLowerCase().includes("samantha"),
  );
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
