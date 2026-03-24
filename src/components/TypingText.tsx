import { createSignal, onMount, onCleanup } from 'solid-js';

interface TypingTextProps {
  text: string;
}

export default function TypingText(props: TypingTextProps) {
  const [displayedText, setDisplayedText] = createSignal('');
  let index = 0;
  let typingInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    typingInterval = setInterval(() => {
      if (index < props.text.length) {
        setDisplayedText(prev => prev + props.text.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
  });

  onCleanup(() => {
    clearInterval(typingInterval);
  });

  return (
    <p class="typing-effect">
      {displayedText()}<span class="cursor"></span>
      <style>{`
        .typing-effect {
          color: #00ff00;
          font-family: 'Courier New', Courier, monospace;
        }

        .cursor {
          display: inline-block;
          width: 10px;
          height: 1.2em;
          background-color: #00ff00;
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </p>
  );
}
