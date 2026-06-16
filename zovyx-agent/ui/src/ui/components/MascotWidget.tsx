import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const MascotWidget: React.FC = () => {
  const [isHit, setIsHit] = useState(false);

  const handleTap = () => {
    setIsHit(true);
    setTimeout(() => setIsHit(false), 500);
  };

  return (
    <motion.div
      onClick={handleTap}
      animate={{
        scale: isHit ? 0.8 : 1,
        y: isHit ? 20 : [0, -10, 0], // Bouncing effect when idle
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        },
        scale: { type: "spring", stiffness: 300 }
      }}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: '#fff',
        boxShadow: 'inset 4px 4px 8px rgba(255, 255, 255, 0.8), inset -4px -4px 8px rgba(0, 0, 0, 0.05), 4px 4px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9999
      }}
    >
      <div style={{ fontSize: '2rem' }}>
        {isHit ? '😣' : '😊'}
      </div>
    </motion.div>
  );
};
