import { getPostsFromApi } from "./question.mjs";
import { formatData } from "./util.mjs";

const progressBarFull = document.querySelector(".progresBarFull");
const second = document.querySelector(".second");
const nextBtn = document.querySelector(".next-btn");
const answerInputs = document.getElementsByName("answer");
const numberCount = document.querySelector(".quiznumber");
const quizCard = document.querySelector(".quiz-card");

let selectedAnswers = [];
let quizAnswerIndex = 0;
let timerSecond = 30;
let questionsCache = [];
let counter;

function updateProgressBar(index, length) {
  progressBarFull.style.width = (index / length) * 100 + "%";
}

function updateQuizNumberCounter(quizIndex, questionLength) {
  numberCount.innerText = `${quizIndex + 1} of ${questionLength} questions`;
}

function buildTableHTML(selectedAnswers) {
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Question</th>
          <th>Correct Answer</th>
          <th>Selected Answer</th>
        </tr>
      </thead>
      <tbody>
  `;

  selectedAnswers.forEach((answer) => {
    const correctAnswer = answer.question.answers.find((a) => a.correct).text;
    const selectedAnswerText = answer.selectedAnswer || "Not answered";

    tableHTML += `
      <tr>
        <td>${answer.question.question}</td>
        <td>${correctAnswer}</td>
        <td>${selectedAnswerText}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  return tableHTML;
}

async function getQuestions() {
  try {
    if (questionsCache.length === 0) {
      const data = await getPostsFromApi();
      questionsCache = formatData(data);
      return questionsCache;
    } else {
      return questionsCache;
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

async function saveSelectedAnswer(id, index) {
  const questions = await getQuestions();
  const currentQuestion = questions.find((question) => question.id === id);
  console.log(currentQuestion);
  const selectedAnswer = currentQuestion.answers[index];
  console.log(selectedAnswer);

  selectedAnswers.push({
    question: currentQuestion,
    selectedAnswer: selectedAnswer.text,
  });
  console.log([...selectedAnswers]);
}

function setInputState(flag) {
  Array.from(answerInputs).forEach((item) => (item.disabled = flag));
}

function timer(time = 0) {
  counter = setInterval(timeControl, 1000);

  function timeControl() {
    if (time <= timerSecond) {
      second.innerHTML = time;
    } else if (time > timerSecond) {
      quizAnswerIndex++;
      displayQuestion(quizAnswerIndex);
      clearInterval(counter);
    }
    if (time == 10) {
      setInputState(false);
    }
    time++;
  }
}

async function displayQuestion(index) {
  try {
    const questions = await getQuestions();
    const currentQuizData = questions[index];

    updateProgressBar(index, questions.length);
    updateQuizNumberCounter(index, questions.length);
    clearInterval(counter);

    if (index < questions.length) {
      timer();
      const htmlQuestions = `<h3 class="questions">${currentQuizData.question}</h3>`;
      document.querySelector(".question__container").innerHTML = htmlQuestions;

      const htmlAnswers = `
        <ul>
          ${currentQuizData.answers
            .map((answer) => {
              return `
                <li>
                  <input type="radio" name="answer" id="${answer.text}" class="answer">
                  <label for="${answer.text}"  id="${answer.correct}"> ${answer.text}</label>
                </li>
              `;
            })
            .join("")}
        </ul>
      `;

      document.querySelector(".options").innerHTML = htmlAnswers;

      currentQuizData.answers.forEach((answer, index) => {
        document.getElementById(answer.text).onclick = () =>
          saveSelectedAnswer(currentQuizData.id, index);
      });

      setInputState(true);
    } else {
      displayAnswersTable();
    }
  } catch (error) {
    console.error("Error displaying question:", error);
    errorMessage.textContent = "An error occurred while loading the question.";
  }
}

nextBtn.addEventListener("click", () => {
  quizAnswerIndex++;
  displayQuestion(quizAnswerIndex);
});

async function displayAnswersTable() {
  const questions = await getQuestions();
  const tableHTML = buildTableHTML(selectedAnswers);
  quizCard.innerHTML = tableHTML;
}

displayQuestion(quizAnswerIndex);
