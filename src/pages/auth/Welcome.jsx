import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Target, TrendingUp, Heart } from "lucide-react";

const Welcome = () => {
  const features = [
    {
      icon: Target,
      title: "High-Yield Content",
      description: "Focus on the most important concepts for USMLE success",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics",
    },
    {
      icon: Users,
      title: "Compete & Learn",
      description: "Join thousands of medical students worldwide",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.2,
          }}
          className="mb-8"
        >
          <div className="relative mx-auto w-20 h-20 glass-strong rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">+</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to
            <br />
            <span className="text-accent-300">USMLE Trivia</span>
          </h1>
          <p className="text-white/80 text-lg">
            Master medicine, one question at a time
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-4 mb-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
                className="flex items-center space-x-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="space-y-3"
        >
          <Link
            to="/signup"
            className="block w-full bg-white text-primary-600 rounded-xl py-4 px-6 font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="block w-full bg-white/20 text-white rounded-xl py-4 px-6 font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="mt-8 text-white/60 text-sm"
        >
          <p>Join over 10,000+ medical students</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
