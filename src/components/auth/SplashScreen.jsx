import { motion } from "framer-motion";
import { Trophy, Heart, Stethoscope, BookOpen } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-600 to-purple-700 flex items-center justify-center">
      <div className="text-center">
        {/* App Logo Animation */}
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
          <div className="relative mx-auto w-24 h-24 glass-strong rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <Stethoscope className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* App Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-4"
        >
          <h1 className="text-4xl font-bold text-white mb-2">USMLE Trivia</h1>
          <p className="text-white/80 text-lg">
            Master Medicine, One Question at a Time
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <div className="flex items-center space-x-2 glass-subtle rounded-full px-4 py-2.5 border border-white/20">
            <BookOpen className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Study Smart</span>
          </div>
          <div className="flex items-center space-x-2 glass-subtle rounded-full px-4 py-2.5 border border-white/20">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">
              Track Progress
            </span>
          </div>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-white rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
