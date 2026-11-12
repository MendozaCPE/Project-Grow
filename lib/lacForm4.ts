// LAC Form 4 Definition and Types

export type RatingValue = "SD" | "D" | "N" | "A" | "SA";

export const ratingOptions: { value: RatingValue; label: string; full: string }[] = [
  { value: "SD", label: "SD", full: "Strongly Disagree" },
  { value: "D", label: "D", full: "Disagree" },
  { value: "N", label: "N", full: "Neutral" },
  { value: "A", label: "A", full: "Agree" },
  { value: "SA", label: "SA", full: "Strongly Agree" },
];

export interface LACFormAnswers {
  // Header
  name: string;
  
  // Part A - Ratings (q1-q7)
  q1?: RatingValue;
  q2?: RatingValue;
  q3?: RatingValue;
  q4?: RatingValue;
  q5?: RatingValue;
  q6?: RatingValue;
  q7?: RatingValue;
  
  // Part A - Comments (c1-c7)
  c1?: string;
  c2?: string;
  c3?: string;
  c4?: string;
  c5?: string;
  c6?: string;
  c7?: string;
  
  // Part B - Reflection (b1-b3)
  b1?: string;
  b2?: string;
  b3?: string;
}

export interface PartAStatement {
  id: string;
  number: number;
  text: string;
  commentHint: string;
  defaultComment: string;
}

export const partASections = {
  lacSession: {
    title: "THE LAC SESSION",
    statements: [
      {
        id: "q1",
        number: 1,
        text: "I learned a lot from my colleagues in this LAC session.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "The sharing of experiences, strategies, and constructive feedback provided valuable insights on enhancing teaching practices through collegial discussions and professional collaboration.",
      },
      {
        id: "q2",
        number: 2,
        text: "The LAC session deepened my understanding of the SLM content.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "The session strengthened my understanding of how collegial discussions and feedback can improve instructional delivery and support continuous professional growth.",
      },
      {
        id: "q3",
        number: 3,
        text: "My perspective on the topic/s covered has changed as a result of the LAC session.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "I realized that constructive feedback and collaborative learning are essential in improving teaching effectiveness and learner outcomes.",
      },
      {
        id: "q4",
        number: 4,
        text: "I participated actively in the LAC session by sharing my assignment and insights, asking questions, and giving feedback on what colleagues shared.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "I actively participated in discussions and shared ideas and experiences related to effective teaching practices and professional collaboration.",
      },
      {
        id: "q5",
        number: 5,
        text: "I interacted with different people during the LAC session.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "The session provided opportunities to collaborate, exchange best practices, and learn from fellow teachers' experiences.",
      },
    ] as PartAStatement[],
  },
  actionPlan: {
    title: "ACTION PLAN",
    statements: [
      {
        id: "q6",
        number: 6,
        text: "I feel motivated to apply in my region/division/district what I have learned in this lesson.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "The session motivated me to apply effective teaching strategies, seek constructive feedback, and strengthen collaboration with colleagues to improve learner performance.",
      },
      {
        id: "q7",
        number: 7,
        text: "I intend to apply what I have learned from the lesson in my region/division/district.",
        commentHint: "For example, if you disagree or strongly disagree, please indicate why",
        defaultComment: "I will apply the insights gained from this LAC session by engaging in collegial discussions, utilizing feedback for improvement, and sharing best practices to enhance teaching and learning.",
      },
    ] as PartAStatement[],
  },
};

export const partBQuestions = [
  {
    id: "b1",
    number: 1,
    text: "I need further clarification and/or resources on the following topics:",
    required: false,
  },
  {
    id: "b2",
    number: 2,
    text: "I encountered the following problems or challenges:",
    required: false,
  },
  {
    id: "b3",
    number: 3,
    text: "What insights did I gain from this activity, and how will I apply them to improve my work performance?",
    required: true,
  },
];

export function validateFormAnswers(answers: LACFormAnswers): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check name
  if (!answers.name || answers.name.trim() === "") {
    errors.push("Name of Member is required");
  }

  // Check all ratings q1-q7
  const ratingKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];
  ratingKeys.forEach((key) => {
    if (!answers[key as keyof LACFormAnswers]) {
      const statement = [...partASections.lacSession.statements, ...partASections.actionPlan.statements]
        .find(s => s.id === key);
      errors.push(`Rating for statement ${statement?.number || key} is required`);
    }
  });

  // Check b3 (required reflection)
  if (!answers.b3 || answers.b3.trim() === "") {
    errors.push("Question 3 in Part B (Reflection) is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
