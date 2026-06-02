import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#DC143C',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  animated = true,
  label,
  showPercentage = true,
}: ProgressRingProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayProgress / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold">{Math.round(displayProgress)}%</span>
        )}
        {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
      </div>
    </div>
  );
}

interface MultiRingProps {
  segments: {
    progress: number;
    color: string;
    label: string;
  }[];
  size?: number;
}

export function MultiRing({ segments, size = 200 }: MultiRingProps) {
  const strokeWidth = 12;
  const gap = 4;
  const totalRings = segments.length;
  const maxRadius = (size - strokeWidth) / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {segments.map((segment, index) => {
          const radius = maxRadius - index * (strokeWidth + gap);
          const circumference = radius * 2 * Math.PI;
          const offset = circumference - (segment.progress / 100) * circumference;

          return (
            <g key={index}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
              />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  filter: `drop-shadow(0 0 8px ${segment.color})`,
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="absolute flex items-center"
            style={{
              transform: `rotate(${(index / segments.length) * 360}deg)`,
            }}
          >
            <div
              className="text-[10px] font-medium"
              style={{ color: segment.color }}
            >
              {segment.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}