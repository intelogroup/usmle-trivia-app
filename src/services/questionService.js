import { supabase } from '../lib/supabase';

/**
 * Service for handling question-related database operations
 */
export class QuestionService {
  /**
   * Get demo questions when database is unavailable
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
        question_tags: [{ tags: { name: 'Cardiology' } }]
      },
      {
        id: 'demo-2',
        question_text: 'What is the normal range for adult heart rate at rest?',
        options: [
          { id: 'a', text: '40-60 bpm' },
          { id: 'b', text: '60-100 bpm' },
          { id: 'c', text: '100-120 bpm' },
          { id: 'd', text: '120-140 bpm' }
        ],
        correct_option_id: 'b',
        explanation: 'The normal resting heart rate for adults is 60-100 beats per minute.',
        question_tags: [{ tags: { name: 'Physiology' } }]
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
        question_tags: [{ tags: { name: 'Endocrinology' } }]
      },
      {
        id: 'demo-4',
        question_text: 'What is the most common type of lung cancer?',
        options: [
          { id: 'a', text: 'Small cell lung cancer' },
          { id: 'b', text: 'Adenocarcinoma' },
          { id: 'c', text: 'Squamous cell carcinoma' },
          { id: 'd', text: 'Large cell carcinoma' }
        ],
        correct_option_id: 'b',
        explanation: 'Adenocarcinoma is the most common type of lung cancer, accounting for about 40% of all lung cancers.',
        question_tags: [{ tags: { name: 'Oncology' } }]
      },
      {
        id: 'demo-5',
        question_text: 'Which structure connects the two cerebral hemispheres?',
        options: [
          { id: 'a', text: 'Corpus callosum' },
          { id: 'b', text: 'Brainstem' },
          { id: 'c', text: 'Cerebellum' },
          { id: 'd', text: 'Thalamus' }
        ],
        correct_option_id: 'a',
        explanation: 'The corpus callosum is the largest white matter structure in the brain that connects the two cerebral hemispheres.',
        question_tags: [{ tags: { name: 'Neurology' } }]
      },
      {
        id: 'demo-6',
        question_text: 'What is the first-line treatment for uncomplicated urinary tract infection in women?',
        options: [
          { id: 'a', text: 'Amoxicillin' },
          { id: 'b', text: 'Nitrofurantoin' },
          { id: 'c', text: 'Ciprofloxacin' },
          { id: 'd', text: 'Cephalexin' }
        ],
        correct_option_id: 'b',
        explanation: 'Nitrofurantoin is often first-line treatment for uncomplicated UTIs in women due to its effectiveness and low resistance rates.',
        question_tags: [{ tags: { name: 'Infectious Disease' } }]
      },
      {
        id: 'demo-7',
        question_text: 'Which valve is most commonly affected in rheumatic heart disease?',
        options: [
          { id: 'a', text: 'Aortic valve' },
          { id: 'b', text: 'Mitral valve' },
          { id: 'c', text: 'Tricuspid valve' },
          { id: 'd', text: 'Pulmonary valve' }
        ],
        correct_option_id: 'b',
        explanation: 'The mitral valve is most commonly affected in rheumatic heart disease, often leading to mitral stenosis.',
        question_tags: [{ tags: { name: 'Cardiology' } }]
      },
      {
        id: 'demo-8',
        question_text: 'What is the most common cause of acute pancreatitis?',
        options: [
          { id: 'a', text: 'Alcohol abuse' },
          { id: 'b', text: 'Gallstones' },
          { id: 'c', text: 'Medications' },
          { id: 'd', text: 'Trauma' }
        ],
        correct_option_id: 'b',
        explanation: 'Gallstones are the most common cause of acute pancreatitis, followed by alcohol abuse.',
        question_tags: [{ tags: { name: 'Gastroenterology' } }]
      },
      {
        id: 'demo-9',
        question_text: 'Which antibody is most specific for systemic lupus erythematosus?',
        options: [
          { id: 'a', text: 'Anti-dsDNA' },
          { id: 'b', text: 'ANA' },
          { id: 'c', text: 'Anti-Sm' },
          { id: 'd', text: 'Anti-SSA/Ro' }
        ],
        correct_option_id: 'c',
        explanation: 'Anti-Sm (Smith) antibodies are highly specific for SLE, though less sensitive than other markers.',
        question_tags: [{ tags: { name: 'Rheumatology' } }]
      },
      {
        id: 'demo-10',
        question_text: 'What is the most appropriate initial imaging study for suspected pulmonary embolism?',
        options: [
          { id: 'a', text: 'Chest X-ray' },
          { id: 'b', text: 'CT pulmonary angiogram' },
          { id: 'c', text: 'Ventilation-perfusion scan' },
          { id: 'd', text: 'Echocardiogram' }
        ],
        correct_option_id: 'b',
        explanation: 'CT pulmonary angiogram (CTPA) is the most appropriate initial imaging study for suspected PE in most patients.',
        question_tags: [{ tags: { name: 'Pulmonology' } }]
      }
    ];

    return demoQuestions.slice(0, questionCount);
  }

  /**
   * Fetch questions for a specific category or mixed questions
   */
  static async fetchQuestions(categoryId, questionCount = 10) {
    try {
      let query = supabase
        .from('questions')
        .select(`
          *,
          question_tags!inner (
            tag_id,
            tags (
              name,
              type
            )
          )
        `);

      // Handle mixed category vs specific category
      if (categoryId !== 'mixed') {
        query = query.eq('question_tags.tag_id', categoryId);
      }

      const { data, error } = await query.limit(questionCount);

      if (error) {
        console.error('Supabase error fetching questions:', error);
        console.warn('Falling back to demo questions due to database error');
        return this.getDemoQuestions(questionCount);
      }

      if (!data || data.length === 0) {
        console.warn('No questions found in database, using demo questions');
        return this.getDemoQuestions(questionCount);
      }

      // Shuffle questions for variety
      return data.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error fetching questions, using demo questions:', error);
      return this.getDemoQuestions(questionCount);
    }
  }

  /**
   * Fetch categories with question counts
   */
  static async fetchCategories() {
    try {
      // First, try to fetch from the view
      const { data, error } = await supabase
        .from('tag_question_counts')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching from tag_question_counts view:', error);
        
        // Fallback: fetch directly from tags table and manually count questions
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select(`
            id,
            name,
            slug,
            description,
            icon_name,
            color,
            color_code,
            parent_id,
            type,
            order_index,
            is_active,
            created_at,
            updated_at
          `)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (tagsError) {
          throw tagsError;
        }

        // Manually count questions for each tag
        const categoriesWithCounts = await Promise.all(
          (tagsData || []).map(async (tag) => {
            const { count, error: countError } = await supabase
              .from('question_tags')
              .select('*', { count: 'exact', head: true })
              .eq('tag_id', tag.id);

            if (countError) {
              console.warn(`Error counting questions for tag ${tag.id}:`, countError);
            }

            return {
              ...tag,
              question_count: count || 0
            };
          })
        );

        return categoriesWithCounts;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create a new quiz session
   */
  static async createQuizSession(userId, categoryId, questionCount) {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: userId,
          quiz_type: 'practice',
          total_questions: questionCount,
          settings: {
            category_id: categoryId !== 'mixed' ? categoryId : null,
            is_mixed: categoryId === 'mixed'
          }
        })
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
   * Record a quiz response
   */
  static async recordQuizResponse(sessionId, questionId, selectedOptionId, isCorrect, responseOrder = 0) {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
          response_order: responseOrder,
          time_spent_seconds: 0 // TODO: Add timing functionality
        });

      if (error) {
        console.error('Error recording quiz response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error recording quiz response:', error);
      throw error;
    }
  }

  /**
   * Update user question history
   */
  static async updateUserQuestionHistory(userId, questionId, selectedOptionId, isCorrect) {
    try {
      const { error } = await supabase
        .from('user_question_history')
        .upsert({
          user_id: userId,
          question_id: questionId,
          last_answered_correctly: isCorrect,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,question_id'
        });

      if (error) {
        console.error('Error updating user question history:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating user question history:', error);
      throw error;
    }
  }

  /**
   * Complete a quiz session
   */
  static async completeQuizSession(sessionId, userId, finalScore) {
    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          correct_answers: finalScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId); // Security: ensure user can only update their own session

      if (error) {
        console.error('Error completing quiz session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error completing quiz session:', error);
      throw error;
    }
  }

  /**
   * Get user progress for a specific category
   */
  static async getUserProgress(userId, categoryId) {
    if (!userId || !categoryId) return 0;
    
    try {
      // Get user's question history for this category
      const { data, error } = await supabase
        .from('user_question_history')
        .select(`
          last_answered_correctly,
          questions!inner (
            question_tags!inner (
              tag_id
            )
          )
        `)
        .eq('user_id', userId)
        .eq('questions.question_tags.tag_id', categoryId);

      if (error) {
        console.warn('Error getting user progress:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Calculate progress based on correct answers percentage
      const correctAnswers = data.filter(item => item.last_answered_correctly).length;
      const totalAttempts = data.length;
      
      return Math.round((correctAnswers / totalAttempts) * 100);
    } catch (error) {
      console.error('Error getting user progress:', error);
      // Return 0 progress if there's any error to prevent UI from breaking
      return 0;
    }
  }

  /**
   * Get progress map for all categories in a single query (BATCH OPTIMIZATION)
   */
  static async getProgressMap(userId) {
    if (!userId) return {};

    try {
      // One query — returns all history rows in one shot
      const { data, error } = await supabase
        .from('user_question_history')
        .select(`
          last_answered_correctly,
          questions!inner (
            id,
            question_tags!inner( tag_id )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error fetching progress map:', error);
        return {};
      }

      if (!data || data.length === 0) {
        return {};
      }

      // Compute percentage per tag_id
      const map = {};
      data.forEach((row) => {
        row.questions?.question_tags?.forEach(({ tag_id }) => {
          if (!map[tag_id]) {
            map[tag_id] = { correct: 0, total: 0 };
          }
          map[tag_id].total += 1;
          if (row.last_answered_correctly) {
            map[tag_id].correct += 1;
          }
        });
      });

      // Convert to percentage
      const percentMap = {};
      Object.entries(map).forEach(([tagId, { correct, total }]) => {
        percentMap[tagId] = Math.round((correct / total) * 100);
      });

      return percentMap;
    } catch (error) {
      console.error('Error getting progress map:', error);
      return {};
    }
  }

  /**
   * Test database connection
   */
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('count(*)')
        .limit(1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
