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
  const [simpleCategoryCounts, setSimpleCategoryCounts] = useState({})
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

        // Load simple category counts
        const simpleCounts = {}
        for (const category of simpleCategories) {
          if (category.id === 'mixed') {
            // For mixed category, get total count of all active questions
            const { count, error: countError } = await supabase
              .from('questions')
              .select('id', { count: 'exact', head: true })
              .eq('is_active', true)
            
            if (!countError) {
              simpleCounts[category.id] = count || 0
            }
          } else {
            // For specific categories, find the corresponding subject tag
            const { data: categoryTag, error: tagError } = await supabase
              .from('tags')
              .select('id')
              .eq('slug', category.id)
              .eq('type', 'subject')
              .eq('is_active', true)
              .single()
            
            if (!tagError && categoryTag) {
              simpleCounts[category.id] = counts.subjects[categoryTag.id] || 0
            } else {
              // Fallback: count by name
              const { data: nameTag, error: nameError } = await supabase
                .from('tags')
                .select('id')
                .ilike('name', `%${category.name}%`)
                .eq('type', 'subject')
                .eq('is_active', true)
                .single()
              
              if (!nameError && nameTag) {
                simpleCounts[category.id] = counts.subjects[nameTag.id] || 0
              } else {
                simpleCounts[category.id] = 0
              }
            }
          }
        }
        setSimpleCategoryCounts(simpleCounts)
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
        const { data: systemsData, error: systemsError } = await supabase
          .from('tags')
          .select('id, name, slug')
          .eq('type', 'system')
          .eq('parent_id', selectedSubject)
          .eq('is_active', true)
          .order('order_index', { ascending: true })

        if (systemsError) throw systemsError

        setSystems(systemsData || [])
        setSelectedSystem('')
        setSelectedTopic('')
      } catch (err) {
        console.error('Error loading systems:', err)
        setError(err.message)
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
        const { data: topicsData, error: topicsError } = await supabase
          .from('tags')
          .select('id, name, slug')
          .eq('type', 'topic')
          .eq('parent_id', selectedSystem)
          .eq('is_active', true)
          .order('order_index', { ascending: true })

        if (topicsError) throw topicsError

        setTopics(topicsData || [])
        setSelectedTopic('')
      } catch (err) {
        console.error('Error loading topics:', err)
        setError(err.message)
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
        const count = await getAvailableQuestionCount(
          selectedSubject,
          selectedSystem,
          selectedTopic || null
        )
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
    if (isSimpleMode) {
      return {
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
      return {
        subjectId: selectedSubject,
        systemId: selectedSystem,
        topicId: selectedTopic || null,
        difficulty,
        questionCount,
        timing,
      }
    }
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
    simpleCategoryCounts,
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
