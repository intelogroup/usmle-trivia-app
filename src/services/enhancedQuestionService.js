import { supabase } from '../lib/supabase';

/**
 * Enhanced Question Service that properly aligns with database schema
 * and supports all planned quiz modes
 */
export class EnhancedQuestionService {
  
  /**
   * Get questions with proper category/tag mapping
   */
  static async getQuestionsForQuiz(config) {
    const {
      categoryId,
      questionCount = 10,
      difficulty = null,
      quizMode = 'quick'
    } = config;

    try {
      let query = supabase
        .from('questions')
        .select(`
          id,
          question_text,
          options,
          correct_option_id,
          explanation,
          difficulty,
          points,
          image_url,
          question_tags!inner(
            tags!inner(
              id,
              name,
              type,
              parent_id
            )
          )
        `);

      // Apply category filter if not mixed
      if (categoryId && categoryId !== 'mixed') {
        // Map category to tag based on type
        const tagType = this.mapCategoryToTagType(categoryId);
        query = query.eq('question_tags.tags.type', tagType);
        
        if (categoryId !== 'all') {
          query = query.ilike('question_tags.tags.name', `%${categoryId}%`);
        }
      }

      // Apply difficulty filter
      if (difficulty && difficulty !== 'mixed') {
        query = query.eq('difficulty', difficulty.toLowerCase());
      }

      // Randomize and limit results
      query = query.order('id', { ascending: false }).limit(questionCount * 3);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      // Randomly select from the fetched questions
      const shuffled = data?.sort(() => 0.5 - Math.random()) || [];
      return shuffled.slice(0, questionCount);

    } catch (error) {
      console.error('Error in getQuestionsForQuiz:', error);
      throw error;
    }
  }

  /**
   * Create quiz session with proper database alignment
   */
  static async createQuizSession(config) {
    const {
      userId,
      quizMode,
      categoryId,
      questionCount,
      difficulty,
      timerConfig,
      settings = {}
    } = config;

    try {
      // Map quiz mode to database session_type
      const sessionType = this.mapQuizModeToSessionType(quizMode);
      
      // Get category tag ID if needed
      let categoryTagId = null;
      if (categoryId && categoryId !== 'mixed') {
        categoryTagId = await this.getCategoryTagId(categoryId);
      }

      const sessionData = {
        user_id: userId,
        session_type: sessionType, // Use correct database field
        category_tag_id: categoryTagId,
        total_questions: questionCount,
        started_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating quiz session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating quiz session:', error);
      throw error;
    }
  }

  /**
   * Record quiz responses with proper batch handling
   */
  static async recordQuizResponses(sessionId, responses) {
    try {
      const responseRecords = responses.map((response, index) => ({
        session_id: sessionId,
        question_id: response.questionId,
        selected_option_id: response.selectedOptionId,
        is_correct: response.isCorrect,
        time_spent_seconds: response.timeSpent || 0,
        answered_at: response.answeredAt || new Date().toISOString()
      }));

      const { error } = await supabase
        .from('quiz_responses')
        .insert(responseRecords);

      if (error) {
        console.error('Error recording quiz responses:', error);
        throw error;
      }

      return responseRecords;
    } catch (error) {
      console.error('Error recording quiz responses:', error);
      throw error;
    }
  }

  /**
   * Complete quiz session with proper statistics
   */
  static async completeQuizSession(sessionId, completionData) {
    const {
      correctAnswers,
      totalTimeSeconds,
      pointsEarned,
      userId
    } = completionData;

    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          completed_at: new Date().toISOString(),
          correct_answers: correctAnswers,
          total_time_seconds: totalTimeSeconds,
          points_earned: pointsEarned
        })
        .eq('id', sessionId)
        .eq('user_id', userId); // Security check

      if (error) {
        console.error('Error completing quiz session:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error completing quiz session:', error);
      throw error;
    }
  }

  /**
   * Get quiz mode configurations
   */
  static getQuizModeConfig(mode) {
    const configs = {
      quick: {
        questionCount: 10,
        timePerQuestion: 60,
        autoAdvance: true,
        showExplanations: 'end',
        sessionType: 'self_paced',
        autoAdvanceDelay: 0.5 // 0.5 second delay as per docs
      },
      timed: {
        questionCount: 20,
        totalTime: 30 * 60, // 30 minutes
        autoAdvance: false,
        showExplanations: 'immediate',
        sessionType: 'timed'
      },
      custom: {
        questionCount: null, // 1-40 user choice
        timePerQuestion: 60, // 1 min/question or self-paced
        autoAdvance: false,
        showExplanations: 'immediate',
        sessionType: 'self_paced'
      },
      block: {
        questionCount: null, // 20-50 per block
        blocksCount: null, // 2-8 blocks
        timePerQuestion: 60, // 1 min/question
        bonusTimePerBlock: 5 * 60, // 5 minutes bonus per block
        autoAdvance: false,
        showExplanations: 'end', // Only after full test
        sessionType: 'timed',
        pauseResume: true // 24-hour persistence
      },
      blitz: {
        questionCount: 5,
        timePerQuestion: 30,
        autoAdvance: true,
        showExplanations: 'end',
        sessionType: 'self_paced',
        difficulty: 'easy' // Easy questions for blitz
      }
    };

    return configs[mode] || configs.quick;
  }

  /**
   * Helper: Map quiz mode to database session_type
   */
  static mapQuizModeToSessionType(quizMode) {
    const modeMap = {
      'quick': 'self_paced',
      'timed': 'timed',
      'custom': 'self_paced',
      'block': 'timed',
      'learn': 'learn_module'
    };
    return modeMap[quizMode] || 'self_paced';
  }

  /**
   * Helper: Map category to tag type
   */
  static mapCategoryToTagType(categoryId) {
    const categoryMap = {
      'cardiology': 'system',
      'neurology': 'system',
      'endocrinology': 'system',
      'psychiatry': 'system',
      'anatomy': 'subject',
      'physiology': 'subject',
      'pathology': 'subject',
      'pharmacology': 'subject'
    };
    return categoryMap[categoryId] || 'system';
  }

  /**
   * Helper: Get category tag ID from database
   */
  static async getCategoryTagId(categoryId) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', `%${categoryId}%`)
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error getting category tag ID:', error);
      return null;
    }
  }

  /**
   * Get available categories from database
   */
  static async getAvailableCategories() {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          type,
          parent_id,
          question_tags(count)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get demo questions for offline mode
   */
  static getDemoQuestions(questionCount = 10) {
    const demoQuestions = [
      {
        id: 'demo-1',
        question_text: 'Which of the following is the most common cause of myocardial infarction?',
        options: [
          { id: 'a', text: 'Coronary artery thrombosis' },
          { id: 'b', text: 'Coronary artery spasm' },
          { id: 'c', text: 'Aortic stenosis' },
          { id: 'd', text: 'Pulmonary embolism' }
        ],
        correct_option_id: 'a',
        explanation: 'Coronary artery thrombosis is the most common cause of myocardial infarction, typically occurring due to plaque rupture.',
        difficulty: 'medium',
        points: 1,
        question_tags: [{ tags: { name: 'Cardiology', type: 'system' } }]
      },
      {
        id: 'demo-2',
        question_text: 'The normal resting heart rate for a healthy adult is:',
        options: [
          { id: 'a', text: '40-50 beats per minute' },
          { id: 'b', text: '60-100 beats per minute' },
          { id: 'c', text: '100-120 beats per minute' },
          { id: 'd', text: '120-140 beats per minute' }
        ],
        correct_option_id: 'b',
        explanation: 'The normal resting heart rate for healthy adults is 60-100 beats per minute.',
        difficulty: 'easy',
        points: 1,
        question_tags: [{ tags: { name: 'Physiology', type: 'subject' } }]
      },
      {
        id: 'demo-3',
        question_text: 'Which hormone is primarily responsible for regulating blood glucose levels?',
        options: [
          { id: 'a', text: 'Cortisol' },
          { id: 'b', text: 'Insulin' },
          { id: 'c', text: 'Thyroxine' },
          { id: 'd', text: 'Growth hormone' }
        ],
        correct_option_id: 'b',
        explanation: 'Insulin is the primary hormone responsible for regulating blood glucose levels by facilitating glucose uptake by cells.',
        difficulty: 'medium',
        points: 1,
        question_tags: [{ tags: { name: 'Endocrinology', type: 'system' } }]
      }
    ];

    // Repeat and shuffle to reach desired count
    const repeatedQuestions = [];
    while (repeatedQuestions.length < questionCount) {
      repeatedQuestions.push(...demoQuestions);
    }

    return repeatedQuestions
      .slice(0, questionCount)
      .map((q, index) => ({ ...q, id: `demo-${index + 1}` }));
  }
} 