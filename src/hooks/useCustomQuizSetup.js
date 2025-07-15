import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getAllQuestionCounts, getAvailableQuestionCount } from '../services/questions/questionCountService'

/**
 * Custom hook for managing Custom Quiz Setup state and logic
 * Extracted from CustomQuizSetup.jsx to follow the 250-line rule
 */
export const useCustomQuizSetup = () => {
  // Simple mode categories
  const simpleCategories = [
    { id: 'mixed', name: 'Mixed Questions', icon: '🎯', description: 'Questions from all medical subjects' },
    { id: 'cardiology', name: 'Cardiology', icon: '❤️', description: 'Heart and cardiovascular system' },
    { id: 'neurology', name: 'Neurology', icon: '🧠', description: 'Brain and nervous system' },
    { id: 'respiratory', name: 'Respiratory', icon: '🫁', description: 'Lungs and breathing system' },
    { id: 'gastroenterology', name: 'Gastroenterology', icon: '🫃', description: 'Digestive system' },
    { id: 'endocrinology', name: 'Endocrinology', icon: '🩺', description: 'Hormones and metabolism' },
    { id: 'infectious', name: 'Infectious Disease', icon: '🦠', description: 'Infections and immunity' },
    { id: 'pharmacology', name: 'Pharmacology', icon: '💊', description: 'Medications and treatments' }
  ]

  // State
  const [isSimpleMode, setIsSimpleMode] = useState(true)
  const [subjects, setSubjects] = useState([])
  const [systems, setSystems] = useState([])
  const [topics, setTopics] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSystem, setSelectedSystem] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [timing, setTiming] = useState('timed')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionCounts, setQuestionCounts] = useState({
    subjects: {},
    systems: {},
    topics: {}
  })
  const [availableQuestions, setAvailableQuestions] = useState(0)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load subjects (tags with type 'subject')
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('tags')
          .select('id, name, slug')
          .eq('type', 'subject')
          .eq('is_active', true)
          .order('order_index', { ascending: true })

        if (subjectsError) throw subjectsError

        setSubjects(subjectsData || [])

        // Load question counts
        const counts = await getAllQuestionCounts()
        setQuestionCounts(counts)
      } catch (err) {
        console.error('Error loading quiz setup data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load systems when subject changes
  useEffect(() => {
    const loadSystems = async () => {
      if (!selectedSubject) {
        setSystems([])
        setSelectedSystem('')
        return
      }

      try {
        // First, get the subject UUID from the slug if needed
        let subjectId = selectedSubject;

        // If selectedSubject looks like a slug (no hyphens indicating UUID), convert it
        if (!selectedSubject.includes('-')) {
          const { data: subjectData, error: subjectError } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', selectedSubject)
            .eq('type', 'subject')
            .single();

          if (subjectError) {
            console.warn('Could not find subject by slug:', selectedSubject);
            // For now, just load all systems since parent_id relationships may not be set up
            subjectId = null;
          } else {
            subjectId = subjectData.id;
          }
        }

        // Load systems - for now, load all systems since parent_id relationships aren't set up
        const { data: systemsData, error: systemsError } = await supabase
          .from('tags')
          .select('id, name, slug')
          .eq('type', 'system')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (systemsError) throw systemsError

        setSystems(systemsData || [])
        setSelectedSystem('')
        setSelectedTopic('')
      } catch (err) {
        console.error('Error loading systems:', err)
        // Don't set error for this - just log it and continue
        setSystems([])
      }
    }

    loadSystems()
  }, [selectedSubject])

  // Load topics when system changes
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedSystem) {
        setTopics([])
        setSelectedTopic('')
        return
      }

      try {
        // For now, load all topics since parent_id relationships may not be fully set up
        const { data: topicsData, error: topicsError } = await supabase
          .from('tags')
          .select('id, name, slug')
          .eq('type', 'topic')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (topicsError) throw topicsError

        setTopics(topicsData || [])
        setSelectedTopic('')
      } catch (err) {
        console.error('Error loading topics:', err)
        // Don't set error for this - just log it and continue
        setTopics([])
      }
    }

    loadTopics()
  }, [selectedSystem])

  // Update available questions count
  useEffect(() => {
    const updateAvailableQuestions = async () => {
      if (!selectedSubject || !selectedSystem) {
        setAvailableQuestions(0)
        return
      }

      try {
        const count = await getAvailableQuestionCount({
          subjectId: selectedSubject,
          systemId: selectedSystem,
          topicId: selectedTopic || null,
          difficulty: difficulty || null
        })
        setAvailableQuestions(count)
      } catch (err) {
        console.error('Error getting available question count:', err)
        setAvailableQuestions(0)
      }
    }

    updateAvailableQuestions()
  }, [selectedSubject, selectedSystem, selectedTopic, difficulty])

  // Validation
  const canStart = isSimpleMode 
    ? selectedSubject && questionCount > 0 && questionCount <= 40
    : selectedSubject && selectedSystem && questionCount > 0 && questionCount <= 40 && availableQuestions > 0

  // Navigation data creation
  const createNavigationState = () => {
    console.log('🎯 [useCustomQuizSetup] Creating navigation state');
    console.log('📊 [useCustomQuizSetup] Current selections:', {
      isSimpleMode,
      selectedSubject,
      selectedSystem,
      selectedTopic,
      questionCount,
      difficulty,
      timing,
      availableQuestions
    });

    let navigationState;
    if (isSimpleMode) {
      navigationState = {
        categoryId: selectedSubject,
        categoryName: simpleCategories.find(c => c.id === selectedSubject)?.name || 'Mixed Questions',
        questionCount,
        difficulty: difficulty || null,
        timePerQuestion: 60,
        quizMode: 'custom',
        autoAdvance: true,
        showExplanations: true
      }
    } else {
      navigationState = {
        subjectId: selectedSubject,
        systemId: selectedSystem,
        topicId: selectedTopic || null,
        difficulty,
        questionCount,
        timing,
      }
    }

    console.log('🎯 [useCustomQuizSetup] Navigation state created:', navigationState);
    return navigationState;
  }

  return {
    // State
    isSimpleMode,
    subjects,
    systems,
    topics,
    selectedSubject,
    selectedSystem,
    selectedTopic,
    difficulty,
    questionCount,
    timing,
    loading,
    error,
    questionCounts,
    availableQuestions,
    simpleCategories,
    canStart,

    // Actions
    setIsSimpleMode,
    setSelectedSubject,
    setSelectedSystem,
    setSelectedTopic,
    setDifficulty,
    setQuestionCount,
    setTiming,
    createNavigationState
  }
}
