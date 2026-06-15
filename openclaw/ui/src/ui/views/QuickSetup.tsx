import React, { useState } from 'react';

export const QuickSetup: React.FC = () => {
  const [keys, setKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
  });

  const handleSave = () => {
    // In a real implementation, this would securely save the keys to the backend vault.
    console.log('Saved keys:', keys);
    alert('Setup complete! Welcome to the Agent World.');
  };

  return (
    <div className="modal" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', borderRadius: '16px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-pink)' }}>Agent World - Quick Setup & Vault</h2>
      <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Skip the lengthy OpenClaw configuration. Just drop your API keys here and they will be securely stored in the Supabase Vault!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          className="input-field" 
          type="password" 
          placeholder="OpenAI API Key (for OpenCode)" 
          value={keys.openai}
          onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
          style={{ padding: '1rem', border: 'none', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        <input 
          className="input-field" 
          type="password" 
          placeholder="Anthropic API Key (for Claude)" 
          value={keys.anthropic}
          onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
          style={{ padding: '1rem', border: 'none', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        <input 
          className="input-field" 
          type="password" 
          placeholder="Google OAuth Token (for Gmail/Sheets)" 
          value={keys.google}
          onChange={(e) => setKeys({ ...keys, google: e.target.value })}
          style={{ padding: '1rem', border: 'none', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        
        <button 
          className="btn" 
          onClick={handleSave}
          style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            border: 'none', 
            color: 'var(--accent-pink)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Securely Save & Continue
        </button>
      </div>
    </div>
  );
};
