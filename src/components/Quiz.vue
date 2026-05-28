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
      <div v-else>
        <p>Loading questions...</p>
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

const questions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctIndex: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctIndex: 1
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctIndex: 3
  },
  {
    question: "In what year did the Titanic sink?",
    options: ["1912", "1905", "1920", "1898"],
    correctIndex: 0
  },
  {
    question: "What is the chemical symbol for Gold?",
    options: ["Ag", "Au", "Fe", "Cu"],
    correctIndex: 1
  },
  {
    question: "Which animal is the tallest in the world?",
    options: ["Elephant", "Giraffe", "Ostrich", "Kangaroo"],
    correctIndex: 1
  },
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Tomato", "Onion", "Avocado", "Pepper"],
    correctIndex: 2
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctIndex: 2
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctIndex: 2
  }
];

const currentQuestion = ref<Question | null>(null);
const selectedOptionIndex = ref<number | null>(null);
const hasAnswered = ref(false);
const isCorrect = ref(false);

const loadRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  // Avoid showing the same question twice in a row if possible
  if (currentQuestion.value && questions.length > 1) {
      let newIndex = randomIndex;
      while (questions[newIndex].question === currentQuestion.value.question) {
          newIndex = Math.floor(Math.random() * questions.length);
      }
      currentQuestion.value = questions[newIndex];
  } else {
      currentQuestion.value = questions[randomIndex];
  }

  selectedOptionIndex.value = null;
  hasAnswered.value = false;
  isCorrect.value = false;
};

onMounted(() => {
  loadRandomQuestion();
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
  loadRandomQuestion();
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
