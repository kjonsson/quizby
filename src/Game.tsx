import { useEffect, useMemo, useState } from "react";
import { Question as QuestionType } from "./types";
import { shuffle } from "lodash";
import sanitizeHtml from "sanitize-html";

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
  currentAnswer,
}: {
  onClickAnswer: (answer: string, questionNumber: number) => void;
  question: QuestionType;
  questionNumber: number;
  currentAnswer: string;
}) => {
  const answers = useMemo(() => {
    return shuffle([...question.incorrect_answers, question.correct_answer]);
  }, [question]);

  return (
    <div className="w-full max-w-2xl py-4">
      <div className="pb-2 text-gray-300">Question {questionNumber + 1}</div>
      <div
        className="pb-2 text-2xl text-white"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
      ></div>
      <div className="flex flex-col">
        {answers.map((answer) => (
          <div
            className="my-2 flex items-center rounded border border-gray-700 bg-gray-800 pl-4 hover:cursor-pointer"
            onClick={() => onClickAnswer(answer, questionNumber)}
          >
            <input
              type="radio"
              checked={currentAnswer === answer}
              className="h-4 w-4 border-gray-600 bg-gray-700 ring-offset-gray-800 "
              readOnly
            />
            <div
              className="ml-2 w-full py-4 text-sm font-medium text-white"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(answer) }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

enum GAME_STATES {
  NOT_STARTED,
  PLAYING,
  GAME_OVER,
}

const Questions = ({
  answers,
  handleClickAnswer,
  handleClickEndGame,
  questions,
}: {
  answers: string[];
  handleClickAnswer: (answer: string, questionNumber: number) => void;
  handleClickEndGame: () => void;
  questions: QuestionType[];
}) => {
  return (
    <div className="flex min-h-full w-full   flex-col items-center justify-center px-4 py-16">
      {questions.map((question, questionIdx) => (
        <Question
          key={questionIdx}
          question={question}
          onClickAnswer={handleClickAnswer}
          questionNumber={questionIdx}
          currentAnswer={answers[questionIdx]}
        />
      ))}
      <button onClick={handleClickEndGame}>Submit</button>
    </div>
  );
};

const GameOver = ({
  correctAnswers,
  handleClickPlayAgain,
  totalQuestions,
}: {
  correctAnswers: number;
  handleClickPlayAgain: () => void;
  totalQuestions: number;
}) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-16 text-4xl text-white">
      <div>
        Answered {correctAnswers} / {totalQuestions}
      </div>
      <button onClick={handleClickPlayAgain}>Play again</button>
    </div>
  );
};

const Game = () => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GAME_STATES>(GAME_STATES.PLAYING);

  useEffect(() => {
    async function _getQuestions(NUMBER_OF_QUESTIONS: number) {
      const questionsResult = await getQuestions(NUMBER_OF_QUESTIONS);
      setQuestions(questionsResult);
      const newAnswers = new Array(questionsResult.length).fill("");
      setAnswers(newAnswers);
    }
    if (gameState === GAME_STATES.PLAYING) {
      _getQuestions(NUMBER_OF_QUESTIONS);
    }
  }, [gameState]);

  const handleClickAnswer = (answer: string, questionNumber: number) => {
    const newAnswers = answers.slice();
    newAnswers[questionNumber] = answer;
    setAnswers(newAnswers);
  };

  const handleClickEndGame = () => {
    setGameState(GAME_STATES.GAME_OVER);
  };

  const handleClickPlayAgain = () => {
    setQuestions([]);
    setAnswers([]);
    setGameState(GAME_STATES.PLAYING);
  };

  const calculateTotal = (questions: QuestionType[], answers: string[]) => {
    let total = 0;

    questions.map((question, questionIdx) => {
      if (question.correct_answer === answers[questionIdx]) {
        total += 1;
      }
    });

    return total;
  };

  return (
    <div className="min-h-full w-full   bg-gray-900 px-4">
      {(gameState === GAME_STATES.PLAYING ||
        gameState === GAME_STATES.NOT_STARTED) && (
        <Questions
          answers={answers}
          handleClickAnswer={handleClickAnswer}
          handleClickEndGame={handleClickEndGame}
          questions={questions}
        />
      )}
      {gameState === GAME_STATES.GAME_OVER && (
        <GameOver
          correctAnswers={calculateTotal(questions, answers)}
          totalQuestions={questions.length}
          handleClickPlayAgain={handleClickPlayAgain}
        />
      )}
    </div>
  );
};

export default Game;
