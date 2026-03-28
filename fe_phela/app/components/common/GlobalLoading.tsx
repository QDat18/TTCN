import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingProps {
  isLoading: boolean;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FCF8F1]"
        >
          <div className="relative">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-2 border-t-amber-900 border-r-transparent border-b-transparent border-l-transparent rounded-full"
            />
            
            {/* Logo container */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img 
                src="/app/assets/images/logo.png" 
                alt="Phê La Logo" 
                className="w-16 h-16 object-contain"
              />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h2 className="text-amber-900 text-xl font-black tracking-widest uppercase">
              Phê La
            </h2>
            <p className="text-amber-800/60 text-xs mt-2 tracking-[0.2em] font-medium">
              NỐT HƯƠNG ĐẶC SẢN
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoading;
