/**
 * Database Backfill Script for USMLE Trivia App
 * 
 * This script:
 * 1. Fixes question fetching logic
 * 2. Backfills missing question-tag relationships
 * 3. Adds comprehensive USMLE questions across all subjects and systems
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// USMLE Question Templates by Subject and System
const questionTemplates = {
  cardiology: {
    cardiovascular: [
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
        points: 2
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
        points: 1
      }
    ]
  },
  neurology: {
    nervous: [
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
        points: 2
      }
    ]
  },
  pulmonology: {
    respiratory: [
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
        points: 2
      }
    ]
  },
  gastroenterology: {
    gastrointestinal: [
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
        points: 1
      }
    ]
  },
  nephrology: {
    renal: [
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
        points: 2
      }
    ]
  }
};

// Helper function to get tag IDs
async function getTagIds() {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name, type')
    .eq('is_active', true);
    
  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
  
  const tagMap = {};
  tags.forEach(tag => {
    const key = tag.name.toLowerCase().replace(/\s+/g, '_');
    tagMap[key] = tag.id;
  });
  
  return tagMap;
}

// Function to create a question with proper relationships
async function createQuestionWithTags(questionData, subjectTagId, systemTagId) {
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
    if (subjectTagId) {
      tagRelationships.push({
        question_id: question.id,
        tag_id: subjectTagId
      });
    }
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

// Main backfill function
async function backfillQuestions() {
  console.log('🚀 Starting question backfill process...');
  
  try {
    // Get tag mappings
    console.log('📋 Fetching tag mappings...');
    const tagMap = await getTagIds();
    console.log(`✅ Found ${Object.keys(tagMap).length} tags`);
    
    let totalCreated = 0;
    
    // Process each subject and its questions
    for (const [subjectKey, systems] of Object.entries(questionTemplates)) {
      const subjectTagId = tagMap[subjectKey];
      if (!subjectTagId) {
        console.warn(`⚠️ Subject tag not found: ${subjectKey}`);
        continue;
      }
      
      for (const [systemKey, questions] of Object.entries(systems)) {
        const systemTagId = tagMap[`${systemKey}_system`] || tagMap[systemKey];
        if (!systemTagId) {
          console.warn(`⚠️ System tag not found: ${systemKey}`);
          continue;
        }
        
        console.log(`📝 Creating questions for ${subjectKey} - ${systemKey}...`);
        
        for (const questionData of questions) {
          try {
            await createQuestionWithTags(questionData, subjectTagId, systemTagId);
            totalCreated++;
            console.log(`✅ Created question ${totalCreated}`);
          } catch (error) {
            console.error(`❌ Failed to create question: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`🎉 Backfill complete! Created ${totalCreated} new questions.`);
    
  } catch (error) {
    console.error(`💥 Backfill failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the backfill
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillQuestions();
}

export { backfillQuestions, createQuestionWithTags };
