import { Question } from "../types";

export async function fetchAIQuestions(): Promise<Question[]> {
  // dummy AI questions supaya build lolos
  return [
    {
      question: "What is a descriptive text?",
      options: [
        "A text that describes a person, place, or thing",
        "A text that tells a story",
        "A text that gives instructions",
        "A text that explains a process"
      ],
      correctAnswer: 0
    }
  ];
}
