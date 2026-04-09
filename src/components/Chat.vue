<template>
  <main class="container">
    <article>
      <header>
        <h2>Chat Room</h2>
      </header>
      <div class="chat-window" ref="chatWindow">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender === myId ? 'user' : 'bot']">
          <div class="message-content">
            <span class="sender-id" v-if="msg.sender !== myId">{{ msg.sender.substring(0, 4) }}: </span>
            {{ msg.text }}
          </div>
        </div>
      </div>
      <footer class="input-area">
        <form @submit.prevent="sendMessage" style="display: flex; gap: 0.5rem; width: 100%; margin-bottom: 0;">
            <input
            v-model="userInput"
            type="text"
            name="chat-input"
            placeholder="Type a message..."
            style="margin-bottom: 0;"
            />
            <button type="submit" :disabled="!userInput.trim()" style="width: auto; margin-bottom: 0;">Send</button>
        </form>
      </footer>
    </article>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import mqtt from "mqtt";

const userInput = ref('');
const messages = ref<{text: string, sender: string}[]>([]);
const chatWindow = ref<HTMLElement | null>(null);

const myId = ref(Math.random().toString(36).substring(2, 10));
const topic = "toille-vue/cyberpunk/chat";
let client: mqtt.MqttClient | null = null;

onMounted(() => {
    client = mqtt.connect("wss://broker.emqx.io:8084/mqtt");

    client.on("connect", () => {
      client?.subscribe(topic);
    });

    client.on("message", (t, message) => {
      if (t === topic) {
        try {
          const data = JSON.parse(message.toString());
          if (data.id && typeof data.id === "string" && data.text && typeof data.text === "string") {
              messages.value.push({ text: data.text, sender: data.id });
              scrollToBottom();
          }
        } catch {
          // ignore parsing errors
        }
      }
    });
});

onUnmounted(() => {
    if (client) {
        client.end();
    }
});

async function sendMessage() {
    if (!userInput.value.trim() || !client || !client.connected) return;

    const text = userInput.value;

    const payload = {
        id: myId.value,
        text: text,
        timestamp: Date.now(),
    };
    client.publish(topic, JSON.stringify(payload), { qos: 0 });

    userInput.value = '';
    // Let it be added from MQTT so we only show what was successfully published?
    // Or add immediately. Let's add immediately to feel faster, but actually it will come from MQTT.
    // So let's just let the MQTT message event handle adding it to the list.
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

.sender-id {
    font-size: 0.8em;
    opacity: 0.7;
    margin-right: 0.5rem;
}
</style>
