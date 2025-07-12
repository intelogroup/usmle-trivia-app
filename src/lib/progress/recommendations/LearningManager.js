import { supabase } from '../../supabase';
import { AuthenticationManager } from '../core/AuthenticationManager';

/**
 * Learning Manager
 * Handles learning recommendations and personalized suggestions
 */
export class LearningManager extends AuthenticationManager {
  /**
   * Get personalized learning recommendations
   */
  async getLearningRecommendations() {
    await this.verifyUserAuth();

    try {
      // Try to use RPC function for recommendations
      const { data, error } = await supabase.rpc('get_learning_recommendations', {
        p_user_id: this.userId
      });

      if (error) {
        console.warn('RPC get_learning_recommendations failed, generating basic recommendations:', error);
        return await this.generateBasicRecommendations();
      }

      return data || [];
    } catch (error) {
      console.warn('Error getting learning recommendations, returning basic ones:', error);
      return await this.generateBasicRecommendations();
    }
  }

  /**
   * Generate basic recommendations based on user performance
   */
  async generateBasicRecommendations() {
    // Get categories where user has low accuracy
    const { data: weakAreas, error } = await supabase
      .from('quiz_responses')
      .select(`
        is_correct,
        questions!inner(
          question_tags!inner(
            tags!inner(name, type)
          )
        )
      `)
      .eq('quiz_sessions.user_id', this.userId);

    if (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }

    // Analyze performance by category
    const categoryPerformance = new Map();
    
    weakAreas.forEach(response => {
      response.questions.question_tags.forEach(qt => {
        const categoryName = qt.tags.name;
        if (!categoryPerformance.has(categoryName)) {
          categoryPerformance.set(categoryName, {
            name: categoryName,
            type: qt.tags.type,
            total: 0,
            correct: 0
          });
        }
        
        const category = categoryPerformance.get(categoryName);
        category.total++;
        if (response.is_correct) {
          category.correct++;
        }
      });
    });

    // Generate recommendations for categories with < 70% accuracy
    const recommendations = [];
    
    categoryPerformance.forEach(category => {
      const accuracy = category.total > 0 ? (category.correct / category.total) * 100 : 0;
      
      if (accuracy < 70 && category.total >= 3) {
        recommendations.push({
          type: 'category_focus',
          category: category.name,
          reason: `Low accuracy (${Math.round(accuracy)}%) in ${category.name}`,
          suggested_action: `Practice more ${category.name} questions`,
          priority: accuracy < 50 ? 'high' : 'medium',
          questions_attempted: category.total,
          current_accuracy: Math.round(accuracy)
        });
      }
    });

    // Sort by priority and accuracy (lowest first)
    recommendations.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return a.current_accuracy - b.current_accuracy;
    });

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
}