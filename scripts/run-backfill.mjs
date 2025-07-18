/**
 * Simple backfill runner for USMLE questions
 * Run with: node scripts/run-backfill.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIwMDg1NCwiZXhwIjoyMDY1Nzc2ODU0fQ.V1-SQLXxMeMj6P638-gRpU3i38m2CqYdT2C8nLubLpc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comprehensive USMLE questions
const newQuestions = [
  // Cardiology Questions
  {
    question_text: "A 65-year-old man presents with crushing chest pain radiating to his left arm. ECG shows ST-elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
    options: [
      { id: "a", text: "Left anterior descending artery" },
      { id: "b", text: "Right coronary artery" },
      { id: "c", text: "Left circumflex artery" },
      { id: "d", text: "Posterior descending artery" }
    ],
    correct_option_id: "b",
    explanation: "ST-elevation in leads II, III, and aVF indicates an inferior wall MI, which is typically caused by right coronary artery occlusion.",
    difficulty: "medium",
    points: 2,
    subject: "cardiology",
    system: "cardiovascular_system"
  },
  {
    question_text: "A 45-year-old woman presents with palpitations and dizziness. ECG shows a narrow complex tachycardia at 180 bpm. What is the first-line treatment?",
    options: [
      { id: "a", text: "Adenosine 6mg IV push" },
      { id: "b", text: "Amiodarone 150mg IV" },
      { id: "c", text: "Valsalva maneuver" },
      { id: "d", text: "Synchronized cardioversion" }
    ],
    correct_option_id: "c",
    explanation: "For stable SVT, vagal maneuvers (Valsalva) should be attempted first before pharmacological intervention.",
    difficulty: "easy",
    points: 1,
    subject: "cardiology",
    system: "cardiovascular_system"
  },
  // Neurology Questions
  {
    question_text: "A 70-year-old man presents with sudden onset of right-sided weakness and aphasia. CT shows no hemorrhage. What is the most appropriate immediate treatment?",
    options: [
      { id: "a", text: "Aspirin 325mg" },
      { id: "b", text: "Alteplase (tPA)" },
      { id: "c", text: "Heparin infusion" },
      { id: "d", text: "Clopidogrel 600mg" }
    ],
    correct_option_id: "b",
    explanation: "For acute ischemic stroke within the therapeutic window, alteplase (tPA) is the treatment of choice if no contraindications exist.",
    difficulty: "medium",
    points: 2,
    subject: "neurology",
    system: "nervous_system"
  },
  // Pulmonology Questions
  {
    question_text: "A 25-year-old tall, thin man presents with sudden onset chest pain and dyspnea. Chest X-ray shows a 30% right-sided pneumothorax. What is the most appropriate management?",
    options: [
      { id: "a", text: "Observation and oxygen" },
      { id: "b", text: "Needle decompression" },
      { id: "c", text: "Chest tube insertion" },
      { id: "d", text: "Emergency thoracotomy" }
    ],
    correct_option_id: "c",
    explanation: "A pneumothorax >20% in a symptomatic patient requires chest tube insertion for drainage.",
    difficulty: "medium",
    points: 2,
    subject: "pulmonology",
    system: "respiratory_system"
  },
  // Gastroenterology Questions
  {
    question_text: "A 55-year-old man with a history of NSAID use presents with epigastric pain and coffee-ground vomiting. What is the most likely diagnosis?",
    options: [
      { id: "a", text: "Gastroesophageal reflux disease" },
      { id: "b", text: "Peptic ulcer disease with bleeding" },
      { id: "c", text: "Gastric cancer" },
      { id: "d", text: "Mallory-Weiss tear" }
    ],
    correct_option_id: "b",
    explanation: "Coffee-ground vomiting in a patient with NSAID use strongly suggests peptic ulcer disease with upper GI bleeding.",
    difficulty: "easy",
    points: 1,
    subject: "gastroenterology",
    system: "gastrointestinal_system"
  },
  // Nephrology Questions
  {
    question_text: "A 30-year-old woman presents with facial swelling, proteinuria, and hematuria 2 weeks after a strep throat infection. What is the most likely diagnosis?",
    options: [
      { id: "a", text: "Acute tubular necrosis" },
      { id: "b", text: "Post-infectious glomerulonephritis" },
      { id: "c", text: "Minimal change disease" },
      { id: "d", text: "Diabetic nephropathy" }
    ],
    correct_option_id: "b",
    explanation: "Post-infectious glomerulonephritis typically occurs 1-3 weeks after streptococcal infection and presents with nephritic syndrome.",
    difficulty: "medium",
    points: 2,
    subject: "nephrology",
    system: "renal_system"
  },
  // Endocrinology Questions
  {
    question_text: "A 35-year-old woman presents with weight loss, palpitations, and heat intolerance. TSH is suppressed and free T4 is elevated. What is the most likely diagnosis?",
    options: [
      { id: "a", text: "Hashimoto's thyroiditis" },
      { id: "b", text: "Graves' disease" },
      { id: "c", text: "Toxic multinodular goiter" },
      { id: "d", text: "Thyroid cancer" }
    ],
    correct_option_id: "b",
    explanation: "Classic symptoms of hyperthyroidism with suppressed TSH and elevated T4 in a young woman most commonly indicates Graves' disease.",
    difficulty: "easy",
    points: 1,
    subject: "endocrinology",
    system: "endocrine_system"
  },
  // Infectious Disease Questions
  {
    question_text: "A 25-year-old man presents with fever, headache, and a petechial rash that includes the palms and soles. He recently returned from camping. What is the most likely diagnosis?",
    options: [
      { id: "a", text: "Lyme disease" },
      { id: "b", text: "Rocky Mountain spotted fever" },
      { id: "c", text: "Meningococcemia" },
      { id: "d", text: "Viral exanthem" }
    ],
    correct_option_id: "b",
    explanation: "Petechial rash involving palms and soles after outdoor exposure is classic for Rocky Mountain spotted fever.",
    difficulty: "medium",
    points: 2,
    subject: "infectious_disease",
    system: "immune_system"
  }
];

async function getTagMap() {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name, type')
    .eq('is_active', true);
    
  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
  
  const tagMap = {};
  tags.forEach(tag => {
    const key = tag.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    tagMap[key] = tag.id;
  });
  
  return tagMap;
}

async function createQuestionWithTags(questionData, tagMap) {
  try {
    // Insert the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        question_text: questionData.question_text,
        options: questionData.options,
        correct_option_id: questionData.correct_option_id,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty,
        points: questionData.points,
        is_active: true,
        usage_count: 0,
        correct_count: 0
      })
      .select()
      .single();
      
    if (questionError) {
      throw new Error(`Failed to create question: ${questionError.message}`);
    }
    
    // Create question-tag relationships
    const tagRelationships = [];
    
    // Add subject tag
    const subjectTagId = tagMap[questionData.subject];
    if (subjectTagId) {
      tagRelationships.push({
        question_id: question.id,
        tag_id: subjectTagId
      });
    }
    
    // Add system tag
    const systemTagId = tagMap[questionData.system];
    if (systemTagId) {
      tagRelationships.push({
        question_id: question.id,
        tag_id: systemTagId
      });
    }
    
    if (tagRelationships.length > 0) {
      const { error: tagError } = await supabase
        .from('question_tags')
        .insert(tagRelationships);
        
      if (tagError) {
        console.warn(`⚠️ Failed to create tag relationships for question ${question.id}: ${tagError.message}`);
      }
    }
    
    return question;
  } catch (error) {
    console.error(`❌ Error creating question: ${error.message}`);
    throw error;
  }
}

async function runBackfill() {
  console.log('🚀 Starting USMLE questions backfill...');
  
  try {
    // Get tag mappings
    console.log('📋 Fetching tag mappings...');
    const tagMap = await getTagMap();
    console.log(`✅ Found ${Object.keys(tagMap).length} tags`);
    console.log('Available tags:', Object.keys(tagMap));
    
    let totalCreated = 0;
    
    // Create each question
    for (const questionData of newQuestions) {
      try {
        await createQuestionWithTags(questionData, tagMap);
        totalCreated++;
        console.log(`✅ Created question ${totalCreated}: ${questionData.question_text.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Failed to create question: ${error.message}`);
      }
    }
    
    console.log(`🎉 Backfill complete! Created ${totalCreated} new questions.`);
    
  } catch (error) {
    console.error(`💥 Backfill failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the backfill
runBackfill();
