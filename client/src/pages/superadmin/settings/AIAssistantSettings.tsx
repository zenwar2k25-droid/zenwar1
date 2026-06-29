import React, { useState } from 'react';
import { Bot, RefreshCw, Trash2, Save, Sparkles, MessageSquare, ToggleLeft, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIAssistantSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    enableChatbot: true,
    enableLandingChatbot: true,
    assistantName: 'Zenwar AI',
    welcomeMessage: 'Hi there! I am Zenwar AI, your 24x7 Business Assistant. How can I help you manage your workshop today?',
    theme: 'system',
    quickReplies: "How do I create a Business?, What is Website Builder?, How to manage Inventory?",
    enableSuggestions: true,
    enableFeedback: false,
    enableTypingAnimation: true
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
    // In a real app, save to backend
  };

  const handleKnowledgeRefresh = () => {
    // API call to re-index knowledge
    alert('Knowledge Refresh Triggered! Re-indexing all modules, routes, and permissions...');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat histories globally?')) {
      alert('Chat history cleared.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="text-purple-500" />
            AI Assistant Configuration
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage the global behavior, appearance, and knowledge of Zenwar AI.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Settings */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Settings2 size={18} /> General Settings
          </h3>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">Enable Chatbot (App)</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Show chatbot to authenticated users</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" checked={config.enableChatbot} onChange={(e) => setConfig({...config, enableChatbot: e.target.checked})} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">Enable on Landing Page</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Show chatbot to public visitors</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" checked={config.enableLandingChatbot} onChange={(e) => setConfig({...config, enableLandingChatbot: e.target.checked})} />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Assistant Name</label>
              <input 
                type="text" 
                value={config.assistantName}
                onChange={(e) => setConfig({...config, assistantName: e.target.value})}
                className="mt-1 w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Welcome Message</label>
              <textarea 
                value={config.welcomeMessage}
                onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                rows={3}
                className="mt-1 w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Quick Replies (Comma separated)</label>
              <input 
                type="text" 
                value={config.quickReplies}
                onChange={(e) => setConfig({...config, quickReplies: e.target.value})}
                className="mt-1 w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Advanced & Actions */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <ToggleLeft size={18} /> UI & Experience
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">Typing Animation</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Show bouncing dots while AI thinks</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" checked={config.enableTypingAnimation} onChange={(e) => setConfig({...config, enableTypingAnimation: e.target.checked})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">Smart Suggestions</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Recommend next questions</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary" checked={config.enableSuggestions} onChange={(e) => setConfig({...config, enableSuggestions: e.target.checked})} />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-red-500/20 rounded-xl p-6">
            <h3 className="font-bold text-red-500 mb-6 flex items-center gap-2">
              <RefreshCw size={18} /> Data & Knowledge Management
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">Knowledge Refresh</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Re-index all modules, features, and settings.</p>
                </div>
                <button onClick={handleKnowledgeRefresh} className="px-4 py-2 bg-[var(--bg-sidebar)] border border-[var(--border-card)] text-sm font-semibold rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                  Refresh Now
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">Clear Chat History</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Delete all user conversations.</p>
                </div>
                <button onClick={handleClearHistory} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
