import { motion } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, onClear, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-crimson/50 focus:border-crimson/50
              transition-all duration-300
              ${icon ? 'pl-10' : ''}
              ${onClear ? 'pr-10' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {onClear && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl resize-none
            bg-white/5 border border-white/10
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-crimson/50 focus:border-crimson/50
            transition-all duration-300
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl appearance-none cursor-pointer
              bg-white/5 border border-white/10
              text-white
              focus:outline-none focus:ring-2 focus:ring-crimson/50 focus:border-crimson/50
              transition-all duration-300
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-black">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={18} className="text-gray-400" />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {label && <p className="font-medium">{label}</p>}
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      <motion.button
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-300
          ${checked ? 'bg-crimson' : 'bg-white/20'}
        `}
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-lg"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
      {tags.map((tag) => (
        <motion.span
          key={tag}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-crimson/20 text-crimson text-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="hover:text-white"
          >
            <X size={14} />
          </button>
        </motion.span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder-gray-500"
      />
    </div>
  );
}