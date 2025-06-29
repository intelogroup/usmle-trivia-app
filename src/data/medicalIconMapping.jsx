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
  Shield,
  HealthLungs,
  Kidneys,
  HealthDna,
  BloodBag,
  Stomach,
  FemaleReproductiveSystem,
  Virus,
  Bacteria,
  Thyroid,
  Pancreas,
  BloodCells,
  Liver,
  Spine,
  Building,
  Hospital,
  Building2,
  Truck,
  UserRound,
  LucideHospital,
  LucideAmbulance,
  LucideCardiology,
  LucideNeurology,
  LucideRadiology,
  LucidePharmacy,
  LucideEmergency
} from './medicalIconsImports';

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
};
