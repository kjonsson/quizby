import { useEffect, useState } from "react";
import { QuestionType, QuestionResponseType } from "./types";
import { shuffle } from "lodash";
import sanitizeHtml from "sanitize-html";

const NUMBER_OF_QUESTIONS = 10;

const fetchQuestions = async (numberOfQuestions: number) => {
  const res = await fetch(
    `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=9&type=multiple`
  );
  const data = (await res.json()) as { results: QuestionResponseType[] };
  const results = data.results;

  const formattedResults = results.map((result, idx) => {
    return {
      answerOptions: shuffle([
        ...result.incorrect_answers.map((v) => ({
          isCorrect: false,
          text: v,
        })),
        { isCorrect: true, text: result.correct_answer },
      ]),
      question: result.question,
      answer: "",
      confirmed: false,
      number: idx + 1,
    };
  });

  return formattedResults;
};

const useQuestions = () => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setIsLoading(true);
    fetchQuestions(NUMBER_OF_QUESTIONS).then((question) => {
      setQuestions(question);
      setIsLoading(false);
    });
  }, []);

  const answerQuestion = (answer: string) => {
    if (currentQuestion.confirmed) {
      return;
    }

    setQuestions([
      ...questions.slice(0, currentQuestionIndex),
      {
        ...currentQuestion,
        answer: answer,
      },
      ...questions.slice(currentQuestionIndex + 1),
    ]);
  };

  const confirmQuestion = () => {
    setQuestions([
      ...questions.slice(0, currentQuestionIndex),
      {
        ...currentQuestion,
        confirmed: true,
      },
      ...questions.slice(currentQuestionIndex + 1),
    ]);

    const correctAnswer = questions[currentQuestionIndex].answerOptions.find(
      (v) => v.isCorrect
    )?.text;

    if (correctAnswer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };

  const restartGame = () => {
    setQuestions([]);
    setScore(0);
    setIsLoading(true);
    setCurrentQuestionIndex(0);

    fetchQuestions(NUMBER_OF_QUESTIONS).then((question) => {
      setQuestions(question);
      setIsLoading(false);
    });
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return {
    currentQuestion: questions[currentQuestionIndex],
    answerQuestion,
    confirmQuestion,
    score,
    restartGame,
    isLoading,
    nextQuestion,
    gameFinished: currentQuestionIndex === questions.length,
    numberOfQuestions: questions.length,
  };
};

const Game = () => {
  const {
    currentQuestion,
    answerQuestion,
    confirmQuestion,
    nextQuestion,
    gameFinished,
    score,
    numberOfQuestions,
    restartGame,
    isLoading,
  } = useQuestions();

  if (isLoading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-2xl py-4">
          <div className="pb-2 text-center text-6xl text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-2xl py-4">
          <div className="pb-2 text-center text-6xl text-white">
            You finished!
            <br />
            <span className="text-3xl font-bold">Score:</span> {score} /{" "}
            {numberOfQuestions}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              className="rounded bg-blue-500 py-2 px-4 text-2xl font-bold text-white hover:bg-blue-700"
              onClick={() => restartGame()}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-2xl py-4">
          <div className="pb-2 text-center text-6xl text-white">
            No questions found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full   bg-gray-900 px-4">
      <div className="flex min-h-full w-full   flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl py-4">
          <div className="pb-2 text-gray-300">
            Question {currentQuestion.number} of {numberOfQuestions} - Score{" "}
            {score}
          </div>
          <div
            className="pb-2 text-2xl text-white"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(currentQuestion.question),
            }}
          ></div>
          <div className="flex flex-col">
            {currentQuestion.answerOptions.map((answerOption) => {
              const isSelected = currentQuestion.answer === answerOption.text;
              const isCorrect = answerOption.isCorrect;
              const isConfirmed = currentQuestion.confirmed;

              let bg = "bg-gray-800";

              if (isConfirmed && isCorrect) {
                bg = "bg-green-500";
              } else if (isSelected && !isConfirmed) {
                bg = "bg-yellow-500";
              } else if (isSelected && isConfirmed) {
                bg = "bg-red-500";
              }

              return (
                <div
                  className={`my-2 flex items-center rounded border border-gray-700 ${bg} pl-4 transition-all hover:scale-105 hover:cursor-pointer`}
                  onClick={() => answerQuestion(answerOption.text)}
                >
                  <div
                    className="ml-2 w-full py-4 text-sm font-medium text-white"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(answerOption.text),
                    }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col justify-items-end py-2">
            {currentQuestion.confirmed ? (
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => nextQuestion()}
              >
                Next
              </button>
            ) : (
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => confirmQuestion()}
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
