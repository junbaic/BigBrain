export const QUESTION_TYPE = {
  MULTI: 1,
  SINGLE: 2,
}

export const QUESTION_TYPE_ARR = [
  QUESTION_TYPE.SINGLE,
  QUESTION_TYPE.MULTI,
];

export const QUESTION_TYPE_MAP = {
  [QUESTION_TYPE.MULTI]: 'multiple choice',
  [QUESTION_TYPE.SINGLE]: 'single choice',
}

export const ANSWER_COUNT = {
  MIN: 2,
  MAX: 6,
}

// sec
export const TIME_LIMIT = {
  MIN: 5,
  MAX: 300,
  DEFAULT: 60,
}

export const POINT = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 10,
}

export const LETTERS_SEQUENCE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
