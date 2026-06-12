<template>
  <article>
    <header>
      <h2>{{ t("quiz.title") }}</h2>
    </header>

    <div v-if="currentQuestion">
      <p class="question">{{ translatedQuestion }}</p>

      <div class="options">
        <button
          v-for="(_, index) in currentQuestion.options"
          :key="index"
          @click.stop="selectAnswer(index)"
          :class="getOptionClass(index)"
          :disabled="hasAnswered"
          class="outline answer-option"
        >
          {{ translatedOptions[index] }}
        </button>
      </div>

      <div v-if="hasAnswered" class="result" :class="{ correct: isCorrect, wrong: !isCorrect }">
        <p v-if="isCorrect">{{ t("quiz.correct") }}</p>
        <p v-else>{{ t("quiz.wrong", { answer: translatedOptions[currentQuestion.correctIndex] }) }}</p>

        <button @click.stop="nextQuestion">{{ t("quiz.nextQuestion") }}</button>
      </div>
    </div>
    <div v-else-if="isLoading">
      <p>{{ t("quiz.loading") }}</p>
    </div>
    <div v-else-if="error">
      <p class="error">{{ error }}</p>
      <button @click.stop="nextQuestion">{{ t("quiz.tryAgain") }}</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useHead } from "@vueuse/head";
import { useTranslate } from "../composables/useTranslate";

const { t } = useI18n();
const { translate, locale } = useTranslate();

useHead({
  title: t("quiz.title"),
  meta: [
    {
      name: "description",
      content: t("quiz.description"),
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
const translatedQuestion = ref("");
const translatedOptions = ref<string[]>([]);

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
      translatedQuestion.value = decodedQuestion;
      translatedOptions.value = [...allOptions];
      translate(decodedQuestion).then(t => translatedQuestion.value = t);
      allOptions.forEach((opt, i) => {
        translate(opt).then(t => { translatedOptions.value[i] = t; });
      });
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

watch(locale, () => {
  if (currentQuestion.value) {
    translatedQuestion.value = currentQuestion.value.question;
    translatedOptions.value = [...currentQuestion.value.options];
    translate(currentQuestion.value.question).then(t => translatedQuestion.value = t);
    currentQuestion.value.options.forEach((opt, i) => {
      translate(opt).then(t => { translatedOptions.value[i] = t; });
    });
  }
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
article {
  padding: 2.5rem 3rem;
}

@media (max-width: 600px) {
  article {
    padding: 1.25rem;
  }
}

.question {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 5px rgba(0, 255, 204, 0.3);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.answer-option {
  text-align: left;
  margin-bottom: 0;
  transition: all 0.3s ease;
}

button.outline.answer-option.correct-option {
  background: rgba(0, 255, 204, 0.15);
  border-color: #00ffcc;
  color: #00ffcc;
}

button.outline.answer-option.correct-option:disabled {
  opacity: 1;
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.3);
}

button.outline.answer-option.wrong-option {
  background: rgba(255, 0, 204, 0.15);
  border-color: #ff00cc;
  color: #ff00cc;
}

button.outline.answer-option.wrong-option:disabled {
  opacity: 1;
  box-shadow: 0 0 12px rgba(255, 0, 204, 0.3);
}

.result {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(0, 255, 204, 0.2);
  background: rgba(5, 5, 16, 0.85);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.result.correct {
  border-color: rgba(0, 255, 204, 0.4);
  background: rgba(0, 255, 204, 0.08);
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.15);
}

.result.wrong {
  border-color: rgba(255, 0, 204, 0.4);
  background: rgba(255, 0, 204, 0.08);
  box-shadow: 0 0 15px rgba(255, 0, 204, 0.15);
}

.result p {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
</style>
