import { createSignal, onMount, For, Show } from 'solid-js';

const knowledgeBase = [
  { keywords: ['skill', 'tech', 'stack', 'language', 'framework', 'php', 'javascript', 'vue', 'react'], answer: "I work primarily with PHP (Laravel, Symfony) and JavaScript (VueJS, React, SolidJS). I also know Git and MySQL." },
  { keywords: ['experience', 'work', 'job', 'history', 'years', 'background'], answer: "I have 14 years of experience in software and web development. I recently joined RM as a Software Engineer." },
  { keywords: ['music', 'hobby', 'interest', 'guitar', 'piano'], answer: "I play the guitar and enjoy composing music. I even have a YouTube channel!" },
  { keywords: ['education', 'degree', 'study', 'university'], answer: "I am a BSc (Hons) graduate." },
  { keywords: ['name', 'who'], answer: "My name is Elliot." },
  { keywords: ['contact', 'email', 'reach', 'hire'], answer: "You can reach out to me through the contact channels on this site or find me on GitHub/LinkedIn." }
];

const defaultAnswer = "That's an interesting question. I'm always happy to discuss more about my background.";

export default function Ask() {
  const [userInput, setUserInput] = createSignal('');
  const [messages, setMessages] = createSignal<{text: string, sender: 'user' | 'bot'}[]>([]);
  const [isTyping, setIsTyping] = createSignal(false);
  let chatWindowRef: HTMLDivElement | undefined;

  onMount(() => {
    setMessages([{
      text: "Hello! I'm an automated assistant. Ask me anything about my skills or experience.",
      sender: 'bot'
    }]);
  });

  function scrollToBottom() {
    setTimeout(() => {
      if (chatWindowRef) {
        chatWindowRef.scrollTop = chatWindowRef.scrollHeight;
      }
    }, 0);
  }

  function generateResponse(question: string): string {
    const lowerQ = question.toLowerCase();
    let answer = defaultAnswer;

    for (const entry of knowledgeBase) {
      if (entry.keywords.some(k => lowerQ.includes(k))) {
        answer = entry.answer;
        break;
      }
    }

    return answer;
  }

  function sendMessage(e: Event) {
    e.preventDefault();
    const text = userInput().trim();
    if (!text) return;

    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setUserInput('');
    setIsTyping(true);
    scrollToBottom();

    // Simulate delay
    setTimeout(() => {
      const response = generateResponse(text);
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
      setIsTyping(false);
      scrollToBottom();
    }, 1000);
  }

  return (
    <main class="container">
      <article>
        <header>
          <h2>Ask Me</h2>
        </header>
        <div class="chat-window" ref={chatWindowRef}>
          <For each={messages()}>
            {(msg) => (
              <div class={`message ${msg.sender}`}>
                <div class="message-content">
                  {msg.text}
                </div>
              </div>
            )}
          </For>
          <Show when={isTyping()}>
            <div class="message bot">
              <div class="message-content">Typing...</div>
            </div>
          </Show>
        </div>
        <footer class="input-area">
          <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.5rem", width: "100%", "margin-bottom": 0 }}>
            <input
              type="text"
              name="chat-input"
              placeholder="Ask a question..."
              disabled={isTyping()}
              style={{ "margin-bottom": 0 }}
              value={userInput()}
              onInput={(e) => setUserInput(e.currentTarget.value)}
            />
            <button type="submit" disabled={!userInput().trim() || isTyping()} style={{ width: "auto", "margin-bottom": 0 }}>
              Send
            </button>
          </form>
        </footer>
      </article>
      <style>{`
        .chat-window {
            height: 400px;
            overflow-y: auto;
            border: 1px solid var(--muted-border-color, #ccc);
            padding: 1rem;
            margin-bottom: 0;
            background-color: rgba(0, 0, 0, 0.2);
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        .message {
            margin-bottom: 1rem;
            display: flex;
        }

        .message.user {
            justify-content: flex-end;
        }

        .message.bot {
            justify-content: flex-start;
        }

        .message-content {
            max-width: 80%;
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            background-color: var(--primary, #1095c1);
            color: white;
        }

        .message.bot .message-content {
            background-color: var(--card-background-color, #2d3748);
            color: var(--color, #e2e8f0);
        }
      `}</style>
    </main>
  );
}
