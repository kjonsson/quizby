import { useEffect, useMemo, useState } from "react";
import { Question as QuestionType } from "./types";
import { shuffle, sum, unescape } from "lodash";

const QUIZ_API_BASE_URL = "https://opentdb.com/api.php";
const NUMBER_OF_QUESTIONS = 5;

const getQuestions = async (numberOfQuestions: number) => {
  const res = await fetch(
    `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=9&type=multiple`
  );
  const data = (await res.json()) as { results: QuestionType[] };
  return data.results;
};

const Question = ({
  onClickAnswer,
  question,
  questionNumber,
}: {
  onClickAnswer: (answer: string, questionNumber: number) => void;
  question: QuestionType;
  questionNumber: number;
}) => {
  const answers = useMemo(() => {
    return shuffle([...question.incorrect_answers, question.correct_answer]);
  }, [question]);

  return (
    <div className="py-4">
      <div>{unescape(question.question)}</div>
      <div>Correct answer is {question.correct_answer}</div>
      <div>
        {answers.map((answer) => (
          <span
            className="px-2 mx-2 border border-red-500 hover:cursor-pointer"
            onClick={() => onClickAnswer(answer, questionNumber)}
          >
            {" "}
            {answer}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

const Game = () => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    async function _getQuestions(NUMBER_OF_QUESTIONS: number) {
      const questionsResult = await getQuestions(NUMBER_OF_QUESTIONS);
      console.log("questions Result", questionsResult);
      setQuestions(questionsResult);
      const newAnswers = new Array(questionsResult.length).fill("");
      setAnswers(newAnswers);
    }
    _getQuestions(NUMBER_OF_QUESTIONS);
  }, []);

  if (!(questions.length > 0)) {
    return <div>Loading ...</div>;
  }

  const handleClickAnswer = (answer: string, questionNumber: number) => {
    const newAnswers = answers.slice();
    newAnswers[questionNumber] = answer;
    setAnswers(newAnswers);
  };

  return (
    <div>
      <div>
        Score:{" "}
        {sum(
          answers.map(
            (answer, answerIdx) =>
              answer === questions[answerIdx].correct_answer
          )
        )}
        Answers:{" "}
        {answers.map((answer, idx) => (
          <span>
            {idx} - {answer}
          </span>
        ))}
      </div>
      {questions.map((question, questionIdx) => (
        <Question
          question={question}
          onClickAnswer={handleClickAnswer}
          questionNumber={questionIdx}
        />
      ))}
    </div>
  );
};

export default Game;
