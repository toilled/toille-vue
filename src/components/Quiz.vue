<template>
  <div class="container" role="main" aria-label="Pub Quiz">
    <article>
      <header>
        <h2>Pub Quiz</h2>
      </header>

      <div v-if="currentQuestion">
        <p class="question">{{ currentQuestion.question }}</p>

        <div class="options">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectAnswer(index)"
            :class="getOptionClass(index)"
            :disabled="hasAnswered"
            class="outline"
          >
            {{ option }}
          </button>
        </div>

        <div v-if="hasAnswered" class="result" :class="{ correct: isCorrect, wrong: !isCorrect }">
          <p v-if="isCorrect">Correct! 🎉</p>
          <p v-else>Wrong! The correct answer was: {{ currentQuestion.options[currentQuestion.correctIndex] }}</p>

          <button @click="nextQuestion">Next Question</button>
        </div>
      </div>
      <div v-else-if="isLoading">
        <p>Loading question...</p>
      </div>
      <div v-else-if="error">
        <p class="error">{{ error }}</p>
        <button @click="nextQuestion">Try Again</button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead } from "@vueuse/head";

useHead({
  title: "Pub Quiz",
  meta: [
    {
      name: "description",
      content: "Test your knowledge with a random pub quiz question.",
    },
  ],
});

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const currentQuestion = ref<Question | null>(null);
const selectedOptionIndex = ref<number | null>(null);
const hasAnswered = ref(false);
const isCorrect = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(true);

const decodeHTML = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const fetchQuestion = async () => {
  isLoading.value = true;
  error.value = null;
  currentQuestion.value = null;

  try {
    const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
    if (!response.ok) {
      throw new Error(`Failed to fetch question: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.response_code === 0 && data.results && data.results.length > 0) {
      const result = data.results[0];
      const decodedQuestion = decodeHTML(result.question);
      const correctAnswer = decodeHTML(result.correct_answer);
      const incorrectAnswers = result.incorrect_answers.map((ans: string) => decodeHTML(ans));

      const allOptions = [...incorrectAnswers, correctAnswer];
      // Simple shuffle
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }

      const correctIndex = allOptions.indexOf(correctAnswer);

      currentQuestion.value = {
        question: decodedQuestion,
        options: allOptions,
        correctIndex
      };
    } else if (data.response_code === 5) { // Rate limit usually
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (err: any) {
    error.value = err.message || "An error occurred while fetching the question.";
  } finally {
    isLoading.value = false;
    selectedOptionIndex.value = null;
    hasAnswered.value = false;
    isCorrect.value = false;
  }
};

onMounted(() => {
  fetchQuestion();
});

const selectAnswer = (index: number) => {
  if (hasAnswered.value || !currentQuestion.value) return;

  selectedOptionIndex.value = index;
  hasAnswered.value = true;
  isCorrect.value = index === currentQuestion.value.correctIndex;
};

const getOptionClass = (index: number) => {
  if (!hasAnswered.value || !currentQuestion.value) return '';

  if (index === currentQuestion.value.correctIndex) {
    return 'correct-option';
  }
  if (index === selectedOptionIndex.value && !isCorrect.value) {
    return 'wrong-option';
  }
  return '';
};

const nextQuestion = () => {
  fetchQuestion();
};
</script>

<style scoped>
.question {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.options button {
  text-align: left;
  margin-bottom: 0;
}

.correct-option {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
  color: white !important;
}

.wrong-option {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: white !important;
}

.result {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: var(--pico-border-radius);
  text-align: center;
}

.result.correct {
  background-color: rgba(40, 167, 69, 0.2);
  border: 1px solid #28a745;
}

.result.wrong {
  background-color: rgba(220, 53, 69, 0.2);
  border: 1px solid #dc3545;
}

.result p {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
</style>
