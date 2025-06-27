import { 
  Brain,
  Heart,
  Activity,
  Microscope,
  Pill,
  Syringe,
  Thermometer,
  Baby,
  Bone,
  Eye,
  Stethoscope,
  TestTube,
  Dna,
  FlaskConical,
  ScanLine,
  Atom,
  BrainCircuit,
  Waves,
  CircleDot,
  BookOpenText,
  Shield
} from 'lucide-react'

// Import health-specific icons from healthicons-react
import { 
  Lungs as HealthLungs,
  Kidneys, 
  Dna as HealthDna,
  BloodBag,
  Stomach,
  FemaleReproductiveSystem,
  Virus,
  Bacteria,
  Thyroid,
  Pancreas,
  BloodCells,
  Liver,
  Spine
} from 'healthicons-react'

// Additional Lucide icons to replace FontAwesome
import { Building, Hospital } from 'lucide-react'

// Import additional Lucide icons for replacement
import { Building2, Truck, UserRound } from 'lucide-react'

// Additional Lucide components for consistent medical iconography
const LucideHospital = (props) => <Building2 {...props} />
const LucideAmbulance = (props) => <Truck {...props} />

// Lucide replacement wrapper components for better consistency
const LucideCardiology = (props) => <Heart {...props} />
const LucideNeurology = (props) => <Brain {...props} />
const LucideRadiology = (props) => <ScanLine {...props} />
const LucidePharmacy = (props) => <Pill {...props} />
const LucideEmergency = (props) => <Truck {...props} />

// Medical icon mapping based on category names - overrides database icons
export const medicalIconMapping = {
  // Cardiovascular
  'Cardiovascular System': Heart,
  'Cardiology': Heart,
  'Myocardial Infarction': Heart,
  'Heart': Heart,
  
  // Respiratory
  'Pulmonary & Critical Care': HealthLungs,
  'Respiratory System': HealthLungs,
  'Pulmonology': HealthLungs,
  'Asthma': HealthLungs,
  'Pneumonia': HealthLungs,
  'COPD': HealthLungs,
  
  // Neurological
  'Nervous System': Brain,
  'Neurology': Brain,
  'Stroke': Brain,
  'Ischemic Stroke': Brain,
  'Hemorrhagic Stroke': Brain,
  'Behavioral science': Brain,
  'Psychiatry': Brain,
  'Psychiatric/Behavioral & Substance Use Disorder': Brain,
  
  // Gastrointestinal
  'Gastrointestinal & Nutrition': Stomach,
  'Gastrointestinal System': Stomach,
  'Gastroenterology': Stomach,
  'Peptic Ulcer Disease': Stomach,
  'GERD': Stomach,
  
  // Renal/Urinary
  'Renal, Urinary Systems & Electrolytes': Kidneys,
  'Renal System': Kidneys,
  'Urology': Kidneys,
  'Acute Kidney Injury': Kidneys,
  'Glomerulonephritis': Kidneys,
  
  // Endocrine
  'Endocrine, Diabetes & Metabolism': Thyroid,
  'Endocrinology': Thyroid,
  
  // Hematology
  'Hematology & Oncology': BloodBag,
  'Hematology': BloodBag,
  'Oncology': BloodBag,
  
  // Infectious Diseases
  'Infectious Diseases': Virus,
  'Infectious disease': Virus,
  'Microbiology': Bacteria,
  'Microbiology (General Principles)': Bacteria,
  
  // Pharmacology
  'Pharmacology': Pill,
  'Drugs': Pill,
  'Medications': Pill,
  
  // Anatomy & Physiology
  'Anatomy': Bone,
  'Physiology': Activity,
  'Pathophysiology': Activity,
  
  // Laboratory & Diagnostics
  'Laboratory Medicine': TestTube,
  'Diagnostics': ScanLine,
  'Radiology': ScanLine,
  'Imaging': ScanLine,
  
  // Emergency Medicine
  'Emergency Medicine': Truck,
  'Trauma': Truck,
  'Critical Care': Truck,
  
  // General Medicine
  'Internal Medicine': Stethoscope,
  'Family Medicine': UserRound,
  'General Practice': UserRound,
  
  // Reproductive
  'Reproductive System': FemaleReproductiveSystem,
  'Obstetrics': Baby,
  'Gynecology': FemaleReproductiveSystem,
  
  // Musculoskeletal
  'Musculoskeletal System': Bone,
  'Orthopedics': Bone,
  'Rheumatology': Bone,
  
  // Genetics
  'Genetics': HealthDna,
  'Molecular Biology': HealthDna,
  'Biochemistry': Atom,
  
  // Other Systems
  'Integumentary System': CircleDot,
  'Dermatology': CircleDot,
  'Ophthalmology': Eye,
  'Hepatology': Liver,
  'Pancreatic Disorders': Pancreas,
  'Spinal Disorders': Spine,
  
  // Default fallbacks
  'Mixed': Activity,
  'General': Stethoscope,
  'Other': CircleDot
}

// Function to get medical icon for a category
export const getMedicalIcon = (categoryName, databaseIcon) => {
  // First check our medical icon mapping (prioritized)
  const medicalIcon = medicalIconMapping[categoryName]
  if (medicalIcon) {
    return medicalIcon
  }
  
  // Fallback to database icon if available
  if (databaseIcon) {
    // Map common icon names to their correct Lucide equivalents
    const iconNameMap = {
      'BookOpen': 'BookOpenText',
      'FAMicroscope': 'Microscope',
      'Shield': 'Shield'
    }
    
    const mappedIconName = iconNameMap[databaseIcon] || databaseIcon
    
    // Map of available icons from our imports
    const availableIcons = {
      Brain,
      Heart,
      Activity,
      Microscope,
      Pill,
      Syringe,
      Thermometer,
      Baby,
      Bone,
      Eye,
      Stethoscope,
      TestTube,
      Dna,
      FlaskConical,
      ScanLine,
      Atom,
      BrainCircuit,
      Waves,
      CircleDot,
      Building,
      Hospital,
      Building2,
      Truck,
      UserRound,
      BookOpenText,
      Shield
    }
    
    const IconComponent = availableIcons[mappedIconName]
    if (IconComponent) {
      return IconComponent
    } else {
      console.warn(`Icon "${databaseIcon}" not found in lucide-react`)
    }
  }
  
  // Ultimate fallback
  return Activity
}

// Function to get category color based on name and type
export const getCategoryColor = (categoryName, categoryType) => {
  if (!categoryName) return 'bg-gray-500'
  
  // First check for exact name match
  if (categoryColorMapping[categoryName]) {
    return categoryColorMapping[categoryName]
  }
  
  // Check for partial matches (for slight variations in database names)
  const partialMatch = Object.keys(categoryColorMapping).find(key => 
    key.toLowerCase().includes(categoryName.toLowerCase()) || 
    categoryName.toLowerCase().includes(key.toLowerCase())
  )
  
  if (partialMatch) {
    return categoryColorMapping[partialMatch]
  }
  
  // Check for key words in category name
  const categoryLower = categoryName.toLowerCase()
  
  // System-specific color mapping based on keywords
  if (categoryLower.includes('cardio') || categoryLower.includes('heart')) {
    return 'bg-red-500'
  }
  if (categoryLower.includes('neuro') || categoryLower.includes('brain') || categoryLower.includes('nervous')) {
    return 'bg-purple-500'
  }
  if (categoryLower.includes('pulmonary') || categoryLower.includes('lung') || categoryLower.includes('respiratory')) {
    return 'bg-blue-600'
  }
  if (categoryLower.includes('gastro') || categoryLower.includes('gi') || categoryLower.includes('nutrition')) {
    return 'bg-orange-500'
  }
  if (categoryLower.includes('renal') || categoryLower.includes('kidney') || categoryLower.includes('urology')) {
    return 'bg-amber-500'
  }
  if (categoryLower.includes('endocrine') || categoryLower.includes('diabetes') || categoryLower.includes('metabolism')) {
    return 'bg-orange-600'
  }
  if (categoryLower.includes('hematology') || categoryLower.includes('oncology') || categoryLower.includes('blood')) {
    return 'bg-red-700'
  }
  if (categoryLower.includes('infectious') || categoryLower.includes('infection')) {
    return 'bg-red-400'
  }
  if (categoryLower.includes('reproductive') || categoryLower.includes('gynecology')) {
    return 'bg-pink-600'
  }
  if (categoryLower.includes('psychiatric') || categoryLower.includes('behavioral')) {
    return 'bg-indigo-500'
  }
  if (categoryLower.includes('ophthalm') || categoryLower.includes('eye')) {
    return 'bg-cyan-500'
  }
  if (categoryLower.includes('dermatology') || categoryLower.includes('skin')) {
    return 'bg-pink-500'
  }
  if (categoryLower.includes('anatomy')) {
    return 'bg-blue-500'
  }
  if (categoryLower.includes('physiology')) {
    return 'bg-green-600'
  }
  if (categoryLower.includes('pharmacology') || categoryLower.includes('drug')) {
    return 'bg-teal-500'
  }
  if (categoryLower.includes('pathology')) {
    return 'bg-red-500'
  }
  if (categoryLower.includes('biochemistry')) {
    return 'bg-emerald-500'
  }
  if (categoryLower.includes('microbiology')) {
    return 'bg-indigo-500'
  }
  if (categoryLower.includes('genetics')) {
    return 'bg-violet-500'
  }
  
  // Fallback to type-based colors
  switch (categoryType) {
    case 'system':
      return 'bg-red-500'  // Systems use red spectrum
    case 'subject':
      return 'bg-blue-500' // Subjects use blue spectrum  
    case 'topic':
      return 'bg-green-500' // Topics use green spectrum
    default:
      return 'bg-gray-500'
  }
}

// Color mapping for categories
export const categoryColorMapping = {
  // === SYSTEMS (Body Systems) - Red/Pink spectrum ===
  'Allergy & Immunology': 'bg-rose-500',
  'Dermatology': 'bg-pink-500', 
  'Cardiovascular System': 'bg-red-500',
  'Pulmonary & Critical Care': 'bg-red-600',
  'Gastrointestinal & Nutrition': 'bg-orange-500',
  'Hematology & Oncology': 'bg-red-700',
  'Renal, Urinary Systems & Electrolytes': 'bg-amber-500',
  'Nervous System': 'bg-purple-500',
  'Rheumatology/Orthopedics & Sports': 'bg-stone-500',
  'Infectious Diseases': 'bg-red-400',
  'Endocrine, Diabetes & Metabolism': 'bg-orange-600',
  'Female Reproductive System & Breast': 'bg-pink-600',
  'Male Reproductive System': 'bg-blue-600',
  'Pregnancy, Childbirth & Puerperium': 'bg-pink-400',
  'Biostatistics & Epidemiology': 'bg-slate-500',
  'Ear, Nose & Throat (ENT)': 'bg-teal-500',
  'Psychiatric/Behavioral & Substance Use Disorder': 'bg-indigo-500',
  'Poisoning & Environmental Exposure': 'bg-yellow-600',
  'Ophthalmology': 'bg-cyan-500',
  'Social Sciences (Ethics/Legal/Professional)': 'bg-gray-500',
  'Miscellaneous (Multisystem)': 'bg-neutral-500',
  'Biochemistry (General Principles)': 'bg-emerald-600',
  'Genetics (General Principles)': 'bg-violet-600',
  'Microbiology (General Principles)': 'bg-indigo-600',
  'Pathology (General Principles)': 'bg-red-800',
  'Pharmacology (General Principles)': 'bg-teal-600',

  // === SUBJECTS (Medical Subjects) - Blue/Green spectrum ===
  'Anatomy': 'bg-blue-500',
  'Behavioral science': 'bg-indigo-500',
  'Biochemistry': 'bg-emerald-500',
  'Biostatistics': 'bg-slate-500',
  'Embryology': 'bg-sky-500',
  'Genetics': 'bg-violet-500',
  'Histology': 'bg-blue-600',
  'Immunology': 'bg-green-500',
  'Microbiology': 'bg-indigo-500',
  'Pathology': 'bg-red-500',
  'Pathophysiology': 'bg-orange-500',
  'Pharmacology': 'bg-teal-500',
  'Physiology': 'bg-green-600',

  // === TOPIC COLORS (by system parent) - Lighter variants ===
  // Cardiovascular topics - Red spectrum
  'Aortic and peripheral artery diseases': 'bg-red-400',
  'Congenital heart disease': 'bg-red-300',
  'Coronary heart disease': 'bg-red-600',
  'Valvular heart diseases': 'bg-rose-500',
  'Myopericardial diseases': 'bg-red-500',
  'Cardiac arrhythmias': 'bg-red-700',
  'Cardiovascular drugs': 'bg-red-400',
  'Hypertension': 'bg-red-800',
  'Heart failure and shock': 'bg-red-900',

  // Pulmonary topics - Blue spectrum  
  'Pulmonary infections': 'bg-blue-400',
  'Obstructive lung disease': 'bg-blue-500',
  'Pulmonary vascular disease': 'bg-blue-600',
  'Critical care medicine': 'bg-blue-700',
  'Lung cancer': 'bg-blue-800',
  'Interstitial lung disease': 'bg-sky-500',
  'Sleep disorders': 'bg-indigo-400',

  // Nervous System topics - Purple spectrum
  'Cerebrovascular disease': 'bg-purple-400',
  'Neurodegenerative disorders and dementias': 'bg-purple-500',
  'Spinal cord disorders': 'bg-purple-600',
  'Disorders of peripheral nerves and muscles': 'bg-purple-300',
  'CNS infections': 'bg-purple-700',
  'Seizures and epilepsy': 'bg-purple-800',
  'Traumatic brain injuries': 'bg-purple-900',
  'Headache': 'bg-violet-400',
  'Tumors of the nervous system': 'bg-purple-600',
  'Anesthesia': 'bg-indigo-600',
  'Demyelinating diseases': 'bg-purple-500',

  // GI topics - Green/Orange spectrum
  'Hepatic disorders': 'bg-green-500',
  'Biliary tract disorders': 'bg-green-600',
  'Tumors of the GI tract': 'bg-orange-600',
  'Intestinal and colorectal disorders': 'bg-green-400',
  'Gastroesophageal disorders': 'bg-orange-400',
  'Pancreatic disorders': 'bg-orange-500',
  'Disorders of nutrition': 'bg-lime-500',

  // Endocrine topics - Orange/Yellow spectrum
  'Obesity and dyslipidemia': 'bg-yellow-500',
  'Hypothalamus and pituitary disorders': 'bg-orange-400',
  'Reproductive endocrinology': 'bg-orange-500',
  'Endocrine tumors': 'bg-orange-600',
  'Adrenal disorders': 'bg-orange-700',
  'Diabetes mellitus': 'bg-amber-500',
  'Thyroid disorders': 'bg-yellow-600',

  // Infectious Disease topics - Red/Purple variants
  'Viral infections': 'bg-red-400',
  'HIV and sexually transmitted infections': 'bg-red-500',
  'Parasitic and helminthic infections': 'bg-red-300',
  'Fungal infections': 'bg-orange-400',
  'Bacterial infections': 'bg-red-600',
  'Antimicrobial drugs': 'bg-teal-400',
  'Infection control': 'bg-blue-400',

  // Hematology topics - Deep red spectrum
  'White blood cell disorders': 'bg-red-500',
  'Platelet disorders': 'bg-red-600',
  'Red blood cell disorders': 'bg-red-700',
  'Hemostasis and thrombosis': 'bg-red-800',
  'Principles of oncology': 'bg-red-900',
  'Transfusion medicine': 'bg-rose-600',
  'Plasma cell disorders': 'bg-red-400',

  // Default fallbacks by type
  'system-default': 'bg-red-500',
  'subject-default': 'bg-blue-500', 
  'topic-default': 'bg-green-500',
  'default': 'bg-gray-500'
}

export default {
  medicalIconMapping,
  getMedicalIcon,
  getCategoryColor,
  categoryColorMapping
} 