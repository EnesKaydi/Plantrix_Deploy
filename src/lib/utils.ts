import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Get level indentation for UI
export function getLevelIndentation(level: number): string {
  return `${(level - 1) * 1.5}rem`;
}

// Get level prefix for task titles (*, **, ***)
export function getLevelPrefix(level: number): string {
  return '*'.repeat(level);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Debounce function for auto-save
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// File size formatter
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Color variants for task completion status
export function getTaskColorVariant(isCompleted: boolean, isSelected: boolean) {
  if (isCompleted) {
    return isSelected 
      ? 'bg-success-100 border-success-500 text-success-700'
      : 'bg-success-50 border-success-300 text-success-600';
  }
  
  if (isSelected) {
    return 'bg-primary-100 border-primary-500 text-primary-700';
  }
  
  return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
} 