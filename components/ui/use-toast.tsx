// components/ui/use-toast.ts
import React from 'react';
import { useState } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

// Simple toast implementation for development
let toastCounter = 0;
const toastListeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...currentToasts]));
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = { id, ...props };
  
  currentToasts.push(newToast);
  notifyListeners();

  // Auto remove after 5 seconds
  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notifyListeners();
  }, 5000);

  return { id };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);

  // Subscribe to toast changes
  React.useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      const index = toastListeners.indexOf(setToasts);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        currentToasts = currentToasts.filter(t => t.id !== toastId);
      } else {
        currentToasts = [];
      }
      notifyListeners();
    },
  };
}