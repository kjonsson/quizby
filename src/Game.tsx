import { useEffect, useMemo, useState } from "react";
import { Question as QuestionType } from "./types";
import { shuffle, sum, unescape } from "lodash";

const QUIZ_API_BASE_URL = "https://opentdb.com/api.php";
const NUMBER_OF_QUESTIONS = 5;

const BACKGROUND_COLOR = "rgb(26, 26, 26)";
const QUESTION_BACKGROUND_COLOR = "rgb(38, 38, 38)";
const BUTTON_COLOR = "rgb(80, 70, 230)";

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
      <div className="pb-2 text-gray-300">Question {questionNumber + 1}</div>
      <div className="pb-2 text-2xl text-white">
        {unescape(question.question)}
      </div>
      <div className="flex flex-col">
        {answers.map((answer) => (
          <div className="flex max-w-lg items-center rounded border border-gray-700 pl-4">
            <input
              id="bordered-radio-1"
              type="radio"
              value=""
              name="bordered-radio"
              className="h-4 w-4 border-gray-600 bg-gray-700 text-blue-600  ring-offset-gray-800 focus:ring-blue-600"
              onClick={() => onClickAnswer(answer, questionNumber)}
            />
            <label
              htmlFor="bordered-radio-1"
              className="ml-2 w-full py-4 text-sm font-medium text-white"
            >
              {answer}
            </label>
          </div>
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
    return (
      <div className="min-h-full w-full bg-gray-800 px-4 text-white">
        Loading ...
      </div>
    );
  }

  const handleClickAnswer = (answer: string, questionNumber: number) => {
    const newAnswers = answers.slice();
    newAnswers[questionNumber] = answer;
    setAnswers(newAnswers);
  };

  return (
    <div className="min-h-full w-full bg-gray-800 px-4">
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
