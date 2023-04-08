import { useEffect, useState } from "react";
import { QuestionType, QuestionResponseType } from "./types";
import { shuffle } from "lodash";
import sanitizeHtml from "sanitize-html";

const NUMBER_OF_QUESTIONS = 2;

const fetchQuestions = async (numberOfQuestions: number) => {
  const res = await fetch(
    `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=9&type=multiple`
  );
  const data = (await res.json()) as { results: QuestionResponseType[] };
  return data.results;
};

const useQuestions = () => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuestions(NUMBER_OF_QUESTIONS).then((questions) => {
      const newQuestions = questions.map((question) => {
        return {
          answerOptions: shuffle([
            ...question.incorrect_answers.map((v) => ({
              isCorrect: false,
              text: v,
            })),
            { isCorrect: true, text: question.correct_answer },
          ]),
          question: question.question,
          answer: "",
          confirmed: false,
        };
      });
      setQuestions(newQuestions);
    });
  }, []);

  const answerQuestion = (questionNumber: number, answer: string) => {
    if (!answer) {
      return;
    }

    const newQuestions = Array.from(questions);
    newQuestions[questionNumber].answer = answer;
    setQuestions(newQuestions);
  };

  const confirmQuestion = (questionNumber: number) => {
    if (!questions[questionNumber].answer) {
      return;
    }

    const newQuestions = Array.from(questions);
    newQuestions[questionNumber].confirmed = true;
    setQuestions(newQuestions);

    const correctAnswer = questions[questionNumber].answerOptions.find(
      (v) => v.isCorrect
    )?.text;

    if (correctAnswer === questions[questionNumber].answer) {
      setScore(score + 1);
    }
  };

  return { questions, answerQuestion, confirmQuestion, score };
};

const Game = () => {
  const [questionNumber, setQuestionNumber] = useState(0);
  const { questions, answerQuestion, confirmQuestion, score } = useQuestions();

  const question = questions[questionNumber];

  if (questionNumber >= questions.length) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-2xl py-4">
          <div className="pb-2 text-center text-6xl text-white">
            You finished! - Score {score} / {questions.length}
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
            Question {questionNumber + 1} - Score {score}
          </div>
          <div
            className="pb-2 text-2xl text-white"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(question.question),
            }}
          ></div>
          <div className="flex flex-col">
            {question.answerOptions.map((answerOption) => {
              const isSelected = question.answer === answerOption.text;
              const isCorrect = answerOption.isCorrect;
              const isConfirmed = question.confirmed;

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
                  onClick={() =>
                    answerQuestion(questionNumber, answerOption.text)
                  }
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
            {question.confirmed ? (
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => setQuestionNumber(questionNumber + 1)}
              >
                Next
              </button>
            ) : (
              <button
                className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                onClick={() => confirmQuestion(questionNumber)}
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
