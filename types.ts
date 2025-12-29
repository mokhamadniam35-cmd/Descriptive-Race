
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface PlayerState {
  id: number;
  name: string;
  score: number;
  currentQuestionIndex: number;
  isCorrect?: boolean | null;
  lastAnswerTime: number;
}

export enum GameStatus {
  START = 'START',
  LOBBY = 'LOBBY',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}
