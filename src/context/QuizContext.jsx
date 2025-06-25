import { createContext, useContext, useReducer } from 'react';

const QuizContext = createContext(null);

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  isComplete: false,
  loading: false,
  error: null,
  startTime: null,
  endTime: null,
  category: null,
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        questions: action.payload.questions,
        category: action.payload.category,
        startTime: new Date(),
        loading: false,
      };
    
    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: {
          ...state.answers,
          [state.currentQuestionIndex]: action.payload,
        },
      };
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        isComplete: true,
        endTime: new Date(),
        score: action.payload.score,
      };
    
    case 'RESET_QUIZ':
      return initialState;
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const actions = {
    startQuiz: (questions, category) => {
      dispatch({
        type: 'START_QUIZ',
        payload: { questions, category },
      });
    },
    
    answerQuestion: (answer) => {
      dispatch({
        type: 'ANSWER_QUESTION',
        payload: answer,
      });
    },
    
    nextQuestion: () => {
      dispatch({ type: 'NEXT_QUESTION' });
    },
    
    completeQuiz: (score) => {
      dispatch({
        type: 'COMPLETE_QUIZ',
        payload: { score },
      });
    },
    
    resetQuiz: () => {
      dispatch({ type: 'RESET_QUIZ' });
    },
    
    setLoading: (loading) => {
      dispatch({
        type: 'SET_LOADING',
        payload: loading,
      });
    },
    
    setError: (error) => {
      dispatch({
        type: 'SET_ERROR',
        payload: error,
      });
    },
  };

  return (
    <QuizContext.Provider value={{ ...state, ...actions }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
} 