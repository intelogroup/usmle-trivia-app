import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

/**
 * Simplified Quiz Store for Terragon Branch
 * Provides centralized state management for quiz features
 * Following MVP principles: simple, functional, maintainable
 */
const useQuizStore = create()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ===== BASIC QUIZ STATE =====
      currentQuestionIndex: 0,
      selectedOption: null,
      isAnswered: false,
      score: 0,
      userAnswers: [],
      timeLeft: 60,
      isMuted: false,
      
      // ===== QUIZ CONFIGURATION =====
      config: {
        categoryId: 'mixed',
        questionCount: 10,
        difficulty: null,
        timePerQuestion: 60,
        autoAdvance: true,
        showExplanations: true,
      },

      // ===== ACTIONS =====
      
      // Select an option
      selectOption: (optionId) => set((state) => {
        if (state.isAnswered) return state
        return { selectedOption: optionId }
      }),
      
      // Submit current answer
      submitAnswer: (question, timeSpent = null) => set((state) => {
        if (state.selectedOption === null || state.isAnswered) return state
        
        const isCorrect = state.selectedOption === question.correct_option_id
        
        // Create answer record
        const answerData = {
          questionIndex: state.currentQuestionIndex,
          questionId: question.id,
          question: question,
          selectedOptionId: state.selectedOption,
          isCorrect,
          timeSpent: timeSpent || (state.config.timePerQuestion - state.timeLeft),
          timedOut: false,
          timestamp: Date.now()
        }
        
        return {
          userAnswers: [...state.userAnswers, answerData],
          isAnswered: true,
          score: isCorrect ? state.score + 1 : state.score
        }
      }),
      
      // Handle timeout
      handleTimeout: (question) => set((state) => {
        if (state.isAnswered) return state
        
        const answerData = {
          questionIndex: state.currentQuestionIndex,
          questionId: question.id,
          question: question,
          selectedOptionId: null,
          isCorrect: false,
          timeSpent: state.config.timePerQuestion,
          timedOut: true,
          timestamp: Date.now()
        }
        
        return {
          userAnswers: [...state.userAnswers, answerData],
          isAnswered: true,
          timeLeft: 0
        }
      }),
      
      // Move to next question
      nextQuestion: () => set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedOption: null,
        isAnswered: false,
        timeLeft: state.config.timePerQuestion
      })),
      
      // Reset quiz
      resetQuiz: () => set(() => ({
        currentQuestionIndex: 0,
        selectedOption: null,
        isAnswered: false,
        score: 0,
        userAnswers: [],
        timeLeft: 60
      })),
      
      // Update timer
      updateTimer: (timeLeft) => set(() => ({ timeLeft })),
      
      // Toggle mute
      toggleMute: () => set((state) => {
        const newMuted = !state.isMuted
        localStorage.setItem('quizMuted', newMuted.toString())
        return { isMuted: newMuted }
      }),
      
      // Update configuration
      updateConfig: (newConfig) => set((state) => ({
        config: { ...state.config, ...newConfig }
      })),
      
      // ===== COMPUTED GETTERS =====
      getAccuracy: () => {
        const state = get()
        if (state.userAnswers.length === 0) return 0
        const correctAnswers = state.userAnswers.filter(answer => answer.isCorrect).length
        return Math.round((correctAnswers / state.userAnswers.length) * 100)
      },
      
      getProgress: (totalQuestions) => {
        const state = get()
        if (totalQuestions === 0) return 0
        return ((state.currentQuestionIndex + 1) / totalQuestions) * 100
      },
      
      canSubmit: () => {
        const state = get()
        return state.selectedOption !== null && !state.isAnswered
      },
      
      isLastQuestion: (totalQuestions) => {
        const state = get()
        return state.currentQuestionIndex >= totalQuestions - 1
      }
    })),
    {
      name: 'quiz-store',
      partialize: (state) => ({
        // Only persist UI preferences
        isMuted: state.isMuted,
        config: {
          showExplanations: state.config.showExplanations,
          autoAdvance: state.config.autoAdvance,
        }
      })
    }
  )
)

export default useQuizStore
