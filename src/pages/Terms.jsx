import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Stethoscope } from 'lucide-react'

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-expo-950 dark:to-expo-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-6 shadow-lg">
            <Stethoscope size={32} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 dark:text-dark-50 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-dark-300 text-lg">
            Last updated: January 2024
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-expo-850 rounded-2xl p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-expo-700"
        >
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using USMLE Trivia, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of USMLE Trivia materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2>3. Medical Disclaimer</h2>
            <p>
              USMLE Trivia is for educational purposes only. The content provided should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>

            <h2>4. Accuracy of Materials</h2>
            <p>
              The materials appearing on USMLE Trivia could include technical, typographical, or photographic errors. We do not warrant that any of the materials on the website are accurate, complete, or current.
            </p>

            <h2>5. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>

            <h2>6. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>

            <h2>7. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@usmletrivia.com.
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="font-medium">Back to Sign Up</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms 