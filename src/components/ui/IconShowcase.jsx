import React from 'react';

// Lucide React Icons
import { Heart, Brain, Eye, Stethoscope } from 'lucide-react';

// Health Icons
import { Lungs, Kidneys, Dna, BloodBag } from 'healthicons-react';

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faHospital, 
  faPills, 
  faSyringe,
  faHeartbeat,
  faMicroscope,
  faXRay,
  faAmbulance 
} from '@fortawesome/free-solid-svg-icons';

// Iconify Icons
import { Icon } from '@iconify/react';

const IconShowcase = () => {
  const iconSections = [
    {
      title: "Lucide React Icons",
      description: "Clean, customizable icons with consistent design",
      icons: [
        { component: <Heart className="w-6 h-6 text-red-500" />, name: "Heart", usage: "import { Heart } from 'lucide-react'" },
        { component: <Brain className="w-6 h-6 text-purple-500" />, name: "Brain", usage: "import { Brain } from 'lucide-react'" },
        { component: <Eye className="w-6 h-6 text-blue-500" />, name: "Eye", usage: "import { Eye } from 'lucide-react'" },
        { component: <Stethoscope className="w-6 h-6 text-green-500" />, name: "Stethoscope", usage: "import { Stethoscope } from 'lucide-react'" }
      ]
    },
    {
      title: "Health Icons React",
      description: "Medical-specific icons designed for healthcare applications",
      icons: [
        { component: <Lungs className="w-6 h-6 text-cyan-500" />, name: "Lungs", usage: "import { Lungs } from 'healthicons-react'" },
        { component: <Kidneys className="w-6 h-6 text-yellow-600" />, name: "Kidneys", usage: "import { Kidneys } from 'healthicons-react'" },
        { component: <Dna className="w-6 h-6 text-indigo-500" />, name: "DNA", usage: "import { Dna } from 'healthicons-react'" },
        { component: <BloodBag className="w-6 h-6 text-red-600" />, name: "Blood Bag", usage: "import { BloodBag } from 'healthicons-react'" }
      ]
    },
    {
      title: "FontAwesome Icons",
      description: "Popular icon library with extensive medical icons",
      icons: [
        { component: <FontAwesomeIcon icon={faUserMd} className="w-6 h-6 text-blue-600" />, name: "Doctor", usage: "import { faUserMd } from '@fortawesome/free-solid-svg-icons'" },
        { component: <FontAwesomeIcon icon={faHospital} className="w-6 h-6 text-gray-600" />, name: "Hospital", usage: "import { faHospital } from '@fortawesome/free-solid-svg-icons'" },
        { component: <FontAwesomeIcon icon={faPills} className="w-6 h-6 text-orange-500" />, name: "Pills", usage: "import { faPills } from '@fortawesome/free-solid-svg-icons'" },
        { component: <FontAwesomeIcon icon={faHeartbeat} className="w-6 h-6 text-pink-500" />, name: "Heartbeat", usage: "import { faHeartbeat } from '@fortawesome/free-solid-svg-icons'" }
      ]
    },
    {
      title: "Iconify Icons",
      description: "Massive collection of icons from multiple icon sets",
      icons: [
        { component: <Icon icon="medical-icon:i-cardiology" className="w-6 h-6 text-red-500" />, name: "Cardiology", usage: 'icon="medical-icon:i-cardiology"' },
        { component: <Icon icon="medical-icon:i-neurology" className="w-6 h-6 text-purple-500" />, name: "Neurology", usage: 'icon="medical-icon:i-neurology"' },
        { component: <Icon icon="medical-icon:i-radiology" className="w-6 h-6 text-blue-500" />, name: "Radiology", usage: 'icon="medical-icon:i-radiology"' },
        { component: <Icon icon="medical-icon:i-pharmacy" className="w-6 h-6 text-green-500" />, name: "Pharmacy", usage: 'icon="medical-icon:i-pharmacy"' }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Icon Library Showcase
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Four powerful icon libraries working together in your USMLE Trivia app
        </p>
      </div>

      {iconSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {section.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {section.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.icons.map((icon, iconIndex) => (
              <div key={iconIndex} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  {icon.component}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                    {icon.name}
                  </h3>
                  <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded mt-1 block truncate">
                    {icon.usage}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          🎯 Usage Tips
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Lucide:</span>
            <span>Best for general UI icons, consistent design system</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-green-600 dark:text-green-400">HealthIcons:</span>
            <span>Perfect for medical/healthcare specific icons</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-orange-600 dark:text-orange-400">FontAwesome:</span>
            <span>Extensive library, great for branding and social icons</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-purple-600 dark:text-purple-400">Iconify:</span>
            <span>Massive collection, access to 100+ icon sets</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconShowcase; 