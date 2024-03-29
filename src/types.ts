export interface AnswerOption {
  isCorrect: boolean;
  text: string;
}

export interface QuestionType {
  answerOptions: AnswerOption[];
  question: string;
  answer: string;
  confirmed: boolean;
  number: number;
}

export interface QuestionResponseType {
  incorrect_answers: string[];
  correct_answer: string;
  question: string;
}
