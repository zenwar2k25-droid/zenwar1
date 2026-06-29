import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ModalOptions {
  title?: string;
  message: string;
  type?: 'confirm' | 'alert' | 'prompt';
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
  danger?: boolean;
}

interface ModalContextType {
  confirm: (options: Omit<ModalOptions, 'type'> | string) => Promise<boolean>;
  alert: (options: Omit<ModalOptions, 'type'> | string) => Promise<void>;
  prompt: (options: Omit<ModalOptions, 'type'> | string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [resolveCallback, setResolveCallback] = useState<((value: any) => void) | null>(null);

  const openModal = useCallback((opts: ModalOptions) => {
    setOptions(opts);
    setInputValue(opts.defaultValue || '');
    setIsOpen(true);
    return new Promise<any>((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const confirm = useCallback((opts: Omit<ModalOptions, 'type'> | string) => {
    const defaultOpts = typeof opts === 'string' ? { title: 'Confirmation', message: opts } : opts;
    return openModal({ ...defaultOpts, type: 'confirm' });
  }, [openModal]);

  const alert = useCallback((opts: Omit<ModalOptions, 'type'> | string) => {
    const defaultOpts = typeof opts === 'string' ? { title: 'Alert', message: opts } : opts;
    return openModal({ ...defaultOpts, type: 'alert' });
  }, [openModal]);

  const prompt = useCallback((opts: Omit<ModalOptions, 'type'> | string) => {
    const defaultOpts = typeof opts === 'string' ? { title: 'Input Required', message: opts } : opts;
    return openModal({ ...defaultOpts, type: 'prompt' });
  }, [openModal]);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) {
      if (options?.type === 'prompt') {
        resolveCallback(inputValue);
      } else if (options?.type === 'confirm') {
        resolveCallback(true);
      } else {
        resolveCallback(undefined);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) {
      if (options?.type === 'prompt') {
        resolveCallback(null);
      } else if (options?.type === 'confirm') {
        resolveCallback(false);
      } else {
        resolveCallback(undefined);
      }
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={options.type !== 'alert' ? handleCancel : undefined}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[var(--bg-app)] border border-[var(--border-card)] rounded-2xl shadow-2xl overflow-hidden glass-panel"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${options.danger ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
                    {options.danger ? <AlertTriangle size={24} /> : (options.type === 'confirm' ? <HelpCircle size={24} /> : <Info size={24} />)}
                  </div>
                  <div className="flex-1 mt-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{options.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed whitespace-pre-wrap">
                      {options.message}
                    </p>
                    
                    {options.type === 'prompt' && (
                      <div className="mt-4">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all font-medium"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirm();
                            if (e.key === 'Escape') handleCancel();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)]/50 border-t border-[var(--border-card)] px-6 py-4 flex gap-3 justify-end">
                {options.type !== 'alert' && (
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all border border-transparent cursor-pointer"
                  >
                    {options.cancelText || 'Cancel'}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                    options.danger 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-[var(--color-primary)] hover:brightness-110 text-white shadow-[var(--color-primary)]/20'
                  }`}
                >
                  {options.confirmText || (options.type === 'alert' ? 'OK' : 'Confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};
