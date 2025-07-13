/**
 * Service for fetching question counts by different tag combinations
 */

import { supabase } from '../../lib/supabase';

/**
 * Get question counts for all subjects
 * @returns {Promise<Object>} Object with subject IDs as keys and counts as values
 */
export async function getQuestionCountsBySubject() {
  try {
    const { data, error } = await supabase
      .from('question_tags')
      .select(`
        tag_id,
        tags!inner(type)
      `)
      .eq('tags.type', 'subject')
      .eq('tags.is_active', true);

    if (error) throw error;

    // Count questions per subject
    const counts = {};
    data.forEach(item => {
      counts[item.tag_id] = (counts[item.tag_id] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error fetching question counts by subject:', error);
    return {};
  }
}

/**
 * Get question counts for all systems
 * @returns {Promise<Object>} Object with system IDs as keys and counts as values
 */
export async function getQuestionCountsBySystem() {
  try {
    const { data, error } = await supabase
      .from('question_tags')
      .select(`
        tag_id,
        tags!inner(type)
      `)
      .eq('tags.type', 'system')
      .eq('tags.is_active', true);

    if (error) throw error;

    // Count questions per system
    const counts = {};
    data.forEach(item => {
      counts[item.tag_id] = (counts[item.tag_id] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error fetching question counts by system:', error);
    return {};
  }
}

/**
 * Get question counts for all topics
 * @returns {Promise<Object>} Object with topic IDs as keys and counts as values
 */
export async function getQuestionCountsByTopic() {
  try {
    const { data, error } = await supabase
      .from('question_tags')
      .select(`
        tag_id,
        tags!inner(type)
      `)
      .eq('tags.type', 'topic')
      .eq('tags.is_active', true);

    if (error) throw error;

    // Count questions per topic
    const counts = {};
    data.forEach(item => {
      counts[item.tag_id] = (counts[item.tag_id] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error fetching question counts by topic:', error);
    return {};
  }
}

/**
 * Get question count for a specific subject-system combination
 * @param {string} subjectId - Subject tag ID
 * @param {string} systemId - System tag ID
 * @param {string} topicId - Optional topic tag ID
 * @returns {Promise<number>} Number of questions available
 */
export async function getQuestionCountForCombination(subjectId, systemId, topicId = null) {
  try {
    let query = supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Build the query to find questions that have both subject and system tags
    if (subjectId && systemId) {
      // Use a more complex query to find questions with both tags
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_tags!inner(tag_id)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Filter questions that have both required tags
      const questionIds = new Set();
      const questionTagMap = {};

      // Group tags by question
      data.forEach(item => {
        if (!questionTagMap[item.id]) {
          questionTagMap[item.id] = [];
        }
        questionTagMap[item.id].push(item.question_tags.tag_id);
      });

      // Find questions with both subject and system tags
      Object.entries(questionTagMap).forEach(([questionId, tagIds]) => {
        const hasSubject = tagIds.includes(subjectId);
        const hasSystem = tagIds.includes(systemId);
        const hasTopic = !topicId || tagIds.includes(topicId);

        if (hasSubject && hasSystem && hasTopic) {
          questionIds.add(questionId);
        }
      });

      return questionIds.size;
    }

    // Fallback for single tag queries
    if (subjectId) {
      const { count, error } = await supabase
        .from('question_tags')
        .select('question_id', { count: 'exact', head: true })
        .eq('tag_id', subjectId);

      if (error) throw error;
      return count || 0;
    }

    if (systemId) {
      const { count, error } = await supabase
        .from('question_tags')
        .select('question_id', { count: 'exact', head: true })
        .eq('tag_id', systemId);

      if (error) throw error;
      return count || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error fetching question count for combination:', error);
    return 0;
  }
}

/**
 * Get all question counts in one call for efficiency
 * @returns {Promise<Object>} Object containing counts for subjects, systems, and topics
 */
export async function getAllQuestionCounts() {
  try {
    const [subjectCounts, systemCounts, topicCounts] = await Promise.all([
      getQuestionCountsBySubject(),
      getQuestionCountsBySystem(),
      getQuestionCountsByTopic()
    ]);

    return {
      subjects: subjectCounts,
      systems: systemCounts,
      topics: topicCounts
    };
  } catch (error) {
    console.error('Error fetching all question counts:', error);
    return {
      subjects: {},
      systems: {},
      topics: {}
    };
  }
}

/**
 * Get available question count for current selection
 * @param {string} subjectId - Selected subject ID
 * @param {string} systemId - Selected system ID  
 * @param {string} topicId - Selected topic ID (optional)
 * @returns {Promise<number>} Available question count
 */
export async function getAvailableQuestionCount(subjectId, systemId, topicId = null) {
  if (!subjectId || !systemId) {
    return 0;
  }

  return await getQuestionCountForCombination(subjectId, systemId, topicId);
}
