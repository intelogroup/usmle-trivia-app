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
};
