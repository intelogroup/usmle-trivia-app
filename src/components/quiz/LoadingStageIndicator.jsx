import React from 'react';
import { motion } from 'framer-motion';
import { Database, Image as ImageIcon, Zap, CheckCircle } from 'lucide-react';

const LoadingStageIndicator = ({ currentStage }) => {
  const getStageIcon = (stage) => {
    const icons = {
      'questions': <Database className="w-5 h-5" />,
      'images': <ImageIcon className="w-5 h-5" />,
      'cache': <Zap className="w-5 h-5" />,
      'complete': <CheckCircle className="w-5 h-5" />
    };
    return icons[stage] || null;
  };

  const getStageDescription = (stage) => {
    const descriptions = {
      'questions': 'Fetching quiz questions...',
      'images': 'Loading question images...',
      'cache': 'Optimizing for performance...',
      'complete': 'Almost ready!'
    };
    return descriptions[stage] || 'Loading...';
  };

  return (
    <div className="text-center mb-8">
      <motion.div
        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 text-white"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {getStageIcon(currentStage)}
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Preparing Quiz
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {getStageDescription(currentStage)}
      </p>
      <div className="flex justify-between mt-6">
        {['questions', 'images', 'cache', 'complete'].map((stage, index) => {
          const isActive = currentStage === stage;
          const isCompleted = ['questions', 'images', 'cache', 'complete'].indexOf(currentStage) > index;
          
          return (
            <div key={stage} className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? '#3B82F6' : '#E5E7EB'
                }}
                className={`w-3 h-3 rounded-full mb-1 ${
                  isCompleted || isActive 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span className={`text-xs ${
                isCompleted || isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-400'
              }`}>
                {stage === 'questions' ? 'Questions' :
                 stage === 'images' ? 'Images' :
                 stage === 'cache' ? 'Cache' : 'Ready'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingStageIndicator;
