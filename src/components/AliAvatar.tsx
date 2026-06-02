import { motion } from 'framer-motion';

interface AliAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glow?: boolean;
}

export function AliAvatar({ size = 'md', animated = true, glow = true }: AliAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const glowSizes = {
    sm: '0 0 15px rgba(139, 92, 246, 0.4)',
    md: '0 0 20px rgba(139, 92, 246, 0.5)',
    lg: '0 0 30px rgba(139, 92, 246, 0.6)',
    xl: '0 0 50px rgba(139, 92, 246, 0.7)',
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}
      style={{
        boxShadow: glow ? glowSizes[size] : 'none',
      }}
      animate={animated ? {
        scale: [1, 1.05, 1],
        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-crimson to-purple-600" />
      
      {/* Ali Avatar Placeholder - Geometric AI Symbol */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="aliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer ring */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#aliGrad)" strokeWidth="2" filter="url(#glow)" />
        
        {/* Inner circle */}
        <circle cx="50" cy="50" r="35" fill="none" stroke="url(#aliGrad)" strokeWidth="1.5" />
        
        {/* AI Symbol - stylized brain/circuit pattern */}
        <g fill="url(#aliGrad)" filter="url(#glow)">
          {/* Central node */}
          <circle cx="50" cy="50" r="8" />
          
          {/* Neural connections */}
          <path d="M50 42 L50 30" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="50" cy="25" r="4" />
          
          <path d="M58 50 L70 50" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="75" cy="50" r="4" />
          
          <path d="M50 58 L50 70" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="50" cy="75" r="4" />
          
          <path d="M42 50 L30 50" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="25" cy="50" r="4" />
          
          {/* Corner nodes */}
          <path d="M44 44 L35 35" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="30" cy="30" r="3" />
          
          <path d="M56 44 L65 35" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="70" cy="30" r="3" />
          
          <path d="M44 56 L35 65" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="30" cy="70" r="3" />
          
          <path d="M56 56 L65 65" stroke="url(#aliGrad)" strokeWidth="2" fill="none" />
          <circle cx="70" cy="70" r="3" />
        </g>
      </svg>
      
      {/* Pulsing glow effect */}
      {animated && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-400" />
      )}
    </motion.div>
  );
}

interface AliChatBubbleProps {
  message: string;
  isBot?: boolean;
}

export function AliChatBubble({ message, isBot = true }: AliChatBubbleProps) {
  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {isBot && <AliAvatar size="sm" animated={false} />}
      <div
        className={`
          relative px-4 py-3 rounded-2xl max-w-[80%] backdrop-blur-xl
          ${isBot 
            ? 'bg-gradient-to-br from-purple-600/20 to-crimson/20 border border-purple-500/20' 
            : 'bg-white/10 border border-white/10'
          }
        `}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        {isBot && (
          <div className="absolute -bottom-1 left-4 w-3 h-3 bg-purple-600/20 border-r border-b border-purple-500/20 transform rotate-45" />
        )}
      </div>
    </motion.div>
  );
}

interface AliTypingIndicatorProps {
  show?: boolean;
}

export function AliTypingIndicator({ show = true }: AliTypingIndicatorProps) {
  if (!show) return null;

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AliAvatar size="sm" animated={false} />
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-white/5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}