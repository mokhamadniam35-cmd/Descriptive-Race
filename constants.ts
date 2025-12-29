
import { Question } from './types';

export const INITIAL_QUESTIONS: Question[] = [
  { id: '1', text: 'What is the main purpose of a descriptive text?', options: ['To tell a story', 'To describe a person, place, or thing', 'To persuade the reader', 'To explain a process'], correctAnswer: 1 },
  { id: '2', text: '"The cat has thick white fur and blue eyes." This sentence is an example of...', options: ['Identification', 'Description', 'Resolution', 'Orientation'], correctAnswer: 1 },
  { id: '3', text: 'Which tense is mostly used in descriptive text?', options: ['Simple Past Tense', 'Simple Future Tense', 'Simple Present Tense', 'Present Continuous Tense'], correctAnswer: 2 },
  { id: '4', text: 'The part of descriptive text that introduces the object to be described is called...', options: ['Description', 'Reiteration', 'Identification', 'Classification'], correctAnswer: 2 },
  { id: '5', text: 'Identify the adjective in this sentence: "The big blue building is my school."', options: ['Building', 'School', 'Big and Blue', 'Is'], correctAnswer: 2 },
  { id: '6', text: 'To describe "Brorobudur Temple", we should focus on its...', options: ['History of kings', 'Physical features and location', 'Legends and myths', 'Daily activities of visitors'], correctAnswer: 1 },
  { id: '7', text: '"It has a very long neck and orange spots." What animal is being described?', options: ['Elephant', 'Giraffe', 'Zebra', 'Lion'], correctAnswer: 1 },
  { id: '8', text: 'Which word is a synonym for "beautiful" in a description?', options: ['Ugly', 'Pretty', 'Plain', 'Dirty'], correctAnswer: 1 },
  { id: '9', text: '"My fluffy rabbit loves eating carrots." The word "fluffy" describes the rabbit\'s...', options: ['Weight', 'Color', 'Fur texture', 'Height'], correctAnswer: 2 },
  { id: '10', text: 'A descriptive text usually focuses on...', options: ['Generic objects', 'A specific participant', 'General groups', 'Imaginary characters'], correctAnswer: 1 }
];

export const WINNING_SCORE = 10;
export const PLAYER_COLORS = ['cyan', 'fuchsia', 'lime', 'amber'] as const;
