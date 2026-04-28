<template>
  <main class="container" role="main" aria-label="Ask Me Chat" id="main-content">
    <article>
      <header>
        <h2>Ask Me</h2>
        <button @click="clearChat" class="outline" style="float: right; margin-top: -2.5rem;">Clear Chat</button>
      </header>
      <div class="chat-window" ref="chatWindow" role="log" aria-live="polite" aria-label="Chat conversation">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender]">
          <div class="message-content">
            {{ msg.text }}
          </div>
        </div>
        <div v-if="isTyping" class="message bot" aria-label="Bot is typing">
           <div class="message-content">
             Typing<span class="typing-dots">...</span>
           </div>
        </div>
      </div>
      <div class="suggestions" v-if="messages.length <= 1">
        <p>Quick questions:</p>
        <button v-for="q in suggestedQuestions" @click="askQuestion(q)" class="outline suggestion-btn">
          {{ q }}
        </button>
      </div>
      <footer class="input-area">
        <form @submit.prevent="sendMessage" style="display: flex; gap: 0.5rem; width: 100%; margin-bottom: 0;">
            <input
            v-model="userInput"
            type="text"
            id="chat-input"
            name="chat-input"
            placeholder="Ask a question..."
            :disabled="isTyping"
            style="margin-bottom: 0;"
            aria-label="Type your question here"
            />
            <button type="submit" :disabled="!userInput.trim() || isTyping" style="width: auto; margin-bottom: 0;">Send</button>
        </form>
      </footer>
    </article>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { useHead } from "@vueuse/head";

useHead({
  title: "Elliot > Ask Me",
  meta: [
    {
      name: "description",
      content: "Ask me anything about my skills, experience, and interests",
    },
  ],
});

useHead({
  title: "Elliot > Ask Me",
  meta: [
    {
      name: "description",
      content: "Ask me anything about my skills, experience, and interests",
    },
  ],
});

const RESPONSE_DELAY_MS = 1000;
const STORAGE_KEY = 'ask-me-chat';

const userInput = ref('');
const messages = ref<{text: string, sender: 'user' | 'bot'}[]>([]);
const isTyping = ref(false);
const chatWindow = ref<HTMLElement | null>(null);

const suggestedQuestions = [
  'What are your skills?',
  'Tell me about your experience',
  'What are your interests?',
  'How can I contact you?'
];

const knowledgeBase = [
  { keywords: ['skill', 'tech', 'stack', 'language', 'framework', 'php', 'javascript', 'vue', 'react', 'laravel', 'symfony'], answer: "I work primarily with PHP (Laravel, Symfony) and JavaScript (VueJS, React, SolidJS). I also have strong experience with Git and MySQL databases." },
  { keywords: ['experience', 'work', 'job', 'history', 'years', 'background', 'career'], answer: "I have 14 years of experience in software and web development. I recently joined RM as a Software Engineer and am excited about this new chapter." },
  { keywords: ['music', 'hobby', 'interest', 'guitar', 'piano', 'youtube'], answer: "I play guitar and enjoy composing music. You can check out my original compositions on my YouTube channel!" },
  { keywords: ['education', 'degree', 'study', 'university', 'qualification'], answer: "I am a BSc (Hons) graduate with a strong foundation in computer science and software development." },
  { keywords: ['name', 'who', 'about'], answer: "My name is Elliot Dickerson. I'm a Software Engineer passionate about building great web experiences." },
  { keywords: ['contact', 'email', 'reach', 'hire', 'github', 'linkedin'], answer: "You can find me on GitHub and LinkedIn, or reach out through the contact channels on this site." },
  { keywords: ['location', 'where', 'live', 'based'], answer: "I'm based in the UK and work remotely as a Software Engineer." },
  { keywords: ['project', 'portfolio', 'work', 'built', 'made'], answer: "This website itself is one of my projects! I also work on various coding experiments and Three.js visualizations like the cyberpunk city above." },
  { keywords: ['hello', 'hi', 'hey', 'greetings'], answer: "Hello! Great to meet you. Feel free to ask me anything about my background or experience!" }
];

const defaultAnswer = "That's an interesting question! I'd be happy to discuss more about my background. You can also check out my About page for more details.";

onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        messages.value = JSON.parse(saved);
      } catch (e) {
        initializeChat();
      }
    } else {
      initializeChat();
    }
});

watch(messages, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

function initializeChat() {
  messages.value = [{
    text: "Hello! I'm an automated assistant. Ask me anything about my skills, experience, or interests!",
    sender: 'bot'
  }];
}

function askQuestion(question: string) {
  userInput.value = question;
  sendMessage();
}

async function sendMessage() {
    if (!userInput.value.trim()) return;

    const text = userInput.value;
    messages.value.push({ text, sender: 'user' });
    userInput.value = '';
    isTyping.value = true;
    scrollToBottom();

    setTimeout(() => {
        const response = generateResponse(text);
        messages.value.push({ text: response, sender: 'bot' });
        isTyping.value = false;
        scrollToBottom();
    }, RESPONSE_DELAY_MS);
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

function clearChat() {
  messages.value = [];
  localStorage.removeItem(STORAGE_KEY);
  initializeChat();
}

function scrollToBottom() {
    nextTick(() => {
        if (chatWindow.value) {
            chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
        }
    });
}
</script>

<style scoped>
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

.suggestions {
  padding: 1rem;
  text-align: center;
}

.suggestions p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.suggestion-btn {
  margin: 0.25rem;
  font-size: 0.85rem;
  padding: 0.3rem 0.8rem;
}

.typing-dots {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
