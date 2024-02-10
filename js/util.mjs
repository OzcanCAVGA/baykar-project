export const formatData = (data) => {
  return data.map((item) => {
    const questionLength = 40;
    const questionStartIndex = Math.floor(
      Math.random() * (item.body.length - questionLength + 1)
    );
    const question = `${item.body.slice(
      questionStartIndex,
      questionStartIndex + questionLength
    )}...`;

    const answers = [];
    for (let index = 0; index < 4; index++) {
      const answerLength = 10;
      const answerStartIndex = Math.floor(
        Math.random() * (item.title.length - answerLength + 1)
      );

      const answer = {
        text: item.title.slice(
          answerStartIndex,
          answerStartIndex + answerLength
        ),
        correct: false,
      };
      answers.push(answer);
    }

    setRandomCorrectOption(answers);
    return {
      id: item.id,
      question,
      answers,
    };
  });
};

const setRandomCorrectOption = (answers) => {
  const randomOptionIndex = Math.floor(Math.random() * 4);
  answers[randomOptionIndex].correct = true;
};
