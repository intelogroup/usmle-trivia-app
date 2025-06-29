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
} from 'lucide-react';

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
} from 'healthicons-react';

// Additional Lucide icons to replace FontAwesome
import { Building, Hospital } from 'lucide-react';

// Import additional Lucide icons for replacement
import { Building2, Truck, UserRound } from 'lucide-react';

// Additional Lucide components for consistent medical iconography
const LucideHospital = (props) => <Building2 {...props} />;
const LucideAmbulance = (props) => <Truck {...props} />;

// Lucide replacement wrapper components for better consistency
const LucideCardiology = (props) => <Heart {...props} />;
const LucideNeurology = (props) => <Brain {...props} />;
const LucideRadiology = (props) => <ScanLine {...props} />;
const LucidePharmacy = (props) => <Pill {...props} />;
const LucideEmergency = (props) => <Truck {...props} />;

export { 
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
};
