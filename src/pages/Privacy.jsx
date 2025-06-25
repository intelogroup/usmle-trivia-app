import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Stethoscope, Shield } from 'lucide-react'

const Privacy = () => {
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
            <Shield size={32} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 dark:text-dark-50 mb-4">
            Privacy Policy
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
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, participate in quizzes, or contact us for support.
            </p>
            <h3>Personal Information</h3>
            <ul>
              <li>Name and email address</li>
              <li>Profile information (school, bio, country)</li>
              <li>Quiz performance and study progress</li>
              <li>Account preferences and settings</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Track your learning progress and provide personalized content</li>
              <li>Send you technical notices and security alerts</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Generate leaderboards and performance statistics</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
            </p>
            <ul>
              <li><strong>Aggregate Data:</strong> We may share anonymous, aggregate statistics about users</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Service Providers:</strong> With trusted partners who assist in operating our service</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul>
              <li>Secure data transmission using SSL encryption</li>
              <li>Secure database storage with access controls</li>
              <li>Regular security audits and updates</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and personal data at any time.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Delete your account and personal data</li>
              <li>Export your quiz performance data</li>
              <li>Opt out of non-essential communications</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze site usage. You can control cookie settings through your browser.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our service is intended for users 13 years and older. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>9. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@usmletrivia.com.
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

export default Privacy 