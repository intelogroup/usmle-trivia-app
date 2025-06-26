import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Confetti = ({ trigger, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 6)]
  }));

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              className={`absolute w-2 h-2 ${piece.color} rounded-sm`}
              style={{ left: `${piece.left}%`, top: '-10px' }}
              initial={{ 
                y: -20, 
                rotate: 0,
                opacity: 1 
              }}
              animate={{ 
                y: window.innerHeight + 20,
                rotate: 360,
                opacity: 0
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeIn"
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default Confetti; 