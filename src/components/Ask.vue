<template>
  <main class="container">
    <article>
      <header>
        <h2>Ask Me</h2>
      </header>
      <div class="chat-window" ref="chatWindow">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender]">
          <div class="message-content">
            {{ msg.text }}
          </div>
        </div>
        <div v-if="isTyping" class="message bot">
           <div class="message-content">Typing...</div>
        </div>
      </div>
      <footer class="input-area">
        <form @submit.prevent="sendMessage" style="display: flex; gap: 0.5rem; width: 100%; margin-bottom: 0;">
            <input
            v-model="userInput"
            type="text"
            name="chat-input"
            placeholder="Ask a question..."
            :disabled="isTyping"
            style="margin-bottom: 0;"
            />
            <button type="submit" :disabled="!userInput.trim() || isTyping" style="width: auto; margin-bottom: 0;">Send</button>
        </form>
      </footer>
    </article>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

const userInput = ref('');
const messages = ref<{text: string, sender: 'user' | 'bot'}[]>([]);
const isTyping = ref(false);
const chatWindow = ref<HTMLElement | null>(null);

const reasons = [
  "I have a strong attention to detail which ensures high-quality code.",
  "I am adaptable and quick to learn new technologies and frameworks.",
  "I have over 14 years of experience in software development.",
  "I am proficient in both backend (PHP) and frontend (JavaScript) development.",
  "I am passionate about continuous improvement and problem-solving.",
  "I have experience working with complex frameworks like Laravel and VueJS.",
  "I am a team player who enjoys collaborating to achieve shared goals."
];

const knowledgeBase = [
  { keywords: ['skill', 'tech', 'stack', 'language', 'framework', 'php', 'javascript', 'vue', 'react'], answer: "I work primarily with PHP (Laravel, Symfony) and JavaScript (VueJS, React, SolidJS). I also know Git and MySQL." },
  { keywords: ['experience', 'work', 'job', 'history', 'years', 'background'], answer: "I have 14 years of experience in software and web development. I recently joined RM as a Software Engineer." },
  { keywords: ['music', 'hobby', 'interest', 'guitar', 'piano'], answer: "I play the guitar and enjoy composing music. I even have a YouTube channel!" },
  { keywords: ['education', 'degree', 'study', 'university'], answer: "I am a BSc (Hons) graduate." },
  { keywords: ['name', 'who'], answer: "My name is Elliot." },
  { keywords: ['contact', 'email', 'reach', 'hire'], answer: "You can reach out to me through the contact channels on this site or find me on GitHub/LinkedIn." }
];

const defaultAnswer = "That's an interesting question. I'm always happy to discuss more about my background.";

onMounted(() => {
    messages.value.push({
        text: "Hello! I'm an automated assistant. Ask me anything about my skills or experience.",
        sender: 'bot'
    });
});

async function sendMessage() {
    if (!userInput.value.trim()) return;

    const text = userInput.value;
    messages.value.push({ text, sender: 'user' });
    userInput.value = '';
    isTyping.value = true;
    scrollToBottom();

    // Simulate delay
    setTimeout(() => {
        const response = generateResponse(text);
        messages.value.push({ text: response, sender: 'bot' });
        isTyping.value = false;
        scrollToBottom();
    }, 1000);
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

    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    return `${answer} Also, one reason I'd be good for you is that ${randomReason}`;
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
</style>
