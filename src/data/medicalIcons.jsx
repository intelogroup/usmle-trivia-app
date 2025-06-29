import { medicalIconMapping } from './medicalIconMapping';
import { categoryColorMapping } from './categoryColorMapping';
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
  Building,
  Hospital,
  Building2,
  Truck,
  UserRound
} from './medicalIconsImports';

// Function to get medical icon for a category
export const getMedicalIcon = (categoryName, databaseIcon, props = {}) => {
  // First check our medical icon mapping (prioritized)
  const medicalIcon = medicalIconMapping[categoryName];
  if (medicalIcon) {
    return (iconProps) => <medicalIcon {...props} {...iconProps} />;
  }
  
  // Fallback to database icon if available
  if (databaseIcon) {
    // Map common icon names to their correct Lucide equivalents
    const iconNameMap = {
      'BookOpen': 'BookOpenText',
      'FAMicroscope': 'Microscope',
      'Shield': 'Shield'
    };
    
    const mappedIconName = iconNameMap[databaseIcon] || databaseIcon;
    
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
      BookOpenText,
      Shield,
      Building,
      Hospital,
      Building2,
      Truck,
      UserRound
    };
    
    const IconComponent = availableIcons[mappedIconName];
    if (IconComponent) {
      return (iconProps) => <IconComponent {...props} {...iconProps} />;
    } else {
      console.warn(`Icon "${databaseIcon}" not found in lucide-react`);
    }
  }
  
  // Ultimate fallback
  return (iconProps) => <Activity {...props} {...iconProps} />;
};

// Function to get category color based on name and type
export const getCategoryColor = (categoryName, categoryType) => {
  if (!categoryName) return 'bg-gray-500';
  
  // First check for exact name match
  if (categoryColorMapping[categoryName]) {
    return categoryColorMapping[categoryName];
  }
  
  // Check for partial matches (for slight variations in database names)
  const partialMatch = Object.keys(categoryColorMapping).find(key => 
    key.toLowerCase().includes(categoryName.toLowerCase()) || 
    categoryName.toLowerCase().includes(key.toLowerCase())
  );
  
  if (partialMatch) {
    return categoryColorMapping[partialMatch];
  }
  
  // Check for key words in category name
  const categoryLower = categoryName.toLowerCase();
  
  // System-specific color mapping based on keywords
  if (categoryLower.includes('cardio') || categoryLower.includes('heart')) {
    return 'bg-red-500';
  }
  if (categoryLower.includes('neuro') || categoryLower.includes('brain') || categoryLower.includes('nervous')) {
    return 'bg-purple-500';
  }
  if (categoryLower.includes('pulmonary') || categoryLower.includes('lung') || categoryLower.includes('respiratory')) {
    return 'bg-blue-600';
  }
  if (categoryLower.includes('gastro') || categoryLower.includes('gi') || categoryLower.includes('nutrition')) {
    return 'bg-orange-500';
  }
  if (categoryLower.includes('renal') || categoryLower.includes('kidney') || categoryLower.includes('urology')) {
    return 'bg-amber-500';
  }
  if (categoryLower.includes('endocrine') || categoryLower.includes('diabetes') || categoryLower.includes('metabolism')) {
    return 'bg-orange-600';
  }
  if (categoryLower.includes('hematology') || categoryLower.includes('oncology') || categoryLower.includes('blood')) {
    return 'bg-red-700';
  }
  if (categoryLower.includes('infectious') || categoryLower.includes('infection')) {
    return 'bg-red-400';
  }
  if (categoryLower.includes('reproductive') || categoryLower.includes('gynecology')) {
    return 'bg-pink-600';
  }
  if (categoryLower.includes('psychiatric') || categoryLower.includes('behavioral')) {
    return 'bg-indigo-500';
  }
  if (categoryLower.includes('ophthalm') || categoryLower.includes('eye')) {
    return 'bg-cyan-500';
  }
  if (categoryLower.includes('dermatology') || categoryLower.includes('skin')) {
    return 'bg-pink-500';
  }
  if (categoryLower.includes('anatomy')) {
    return 'bg-blue-500';
  }
  if (categoryLower.includes('physiology')) {
    return 'bg-green-600';
  }
  if (categoryLower.includes('pharmacology') || categoryLower.includes('drug')) {
    return 'bg-teal-500';
  }
  if (categoryLower.includes('pathology')) {
    return 'bg-red-500';
  }
  if (categoryLower.includes('biochemistry')) {
    return 'bg-emerald-500';
  }
  if (categoryLower.includes('microbiology')) {
    return 'bg-indigo-500';
  }
  if (categoryLower.includes('genetics')) {
    return 'bg-violet-500';
  }
  
  // Fallback to type-based colors
  switch (categoryType) {
    case 'system':
      return 'bg-red-500';  // Systems use red spectrum
    case 'subject':
      return 'bg-blue-500'; // Subjects use blue spectrum  
    case 'topic':
      return 'bg-green-500'; // Topics use green spectrum
    default:
      return 'bg-gray-500';
  }
};

export default {
  medicalIconMapping,
  getMedicalIcon,
  getCategoryColor,
  categoryColorMapping
};
