'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { supabase } from '@/lib/supabase';
import { ID } from 'appwrite';

export default function ChatHome() {
  const [input, setInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [openAiKey, setOpenAiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');

  // Check auth status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await account.get();
        if (session) {
          setIsAuthenticated(true);
          setUserId(session.$id);
          // Check if credentials exist in Supabase
          const { data } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('appwrite_user_id', session.$id)
            .single();
            
          if (data) {
             const { count } = await supabase
               .from('user_credentials')
               .select('*', { count: 'exact', head: true })
               .eq('profile_id', data.id);
             if (count && count > 0) setHasCredentials(true);
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginOrSignup = async () => {
    setLoading(true);
    try {
      // Check if Appwrite is unconfigured
      if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID === 'replace-with-project-id') {
         console.log("Appwrite unconfigured. Using mock local session.");
         setIsAuthenticated(true);
         setUserId("mock-user-123");
         setShowAuthModal(false);
         setShowCredentialsModal(true);
         setLoading(false);
         return;
      }

      // Try Login first
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setIsAuthenticated(true);
      setUserId(user.$id);
      
      // Ensure Supabase Profile exists (Mock if Supabase is unconfigured)
      try {
        await supabase.from('user_profiles').upsert({ appwrite_user_id: user.$id }, { onConflict: 'appwrite_user_id' });
      } catch (e) {
        console.warn("Supabase profile sync failed. Mocking.");
      }
      
      setShowAuthModal(false);
      setShowCredentialsModal(true);
    } catch (e: any) {
      // If login fails, try signup
      if (e.code === 401 || e.code === 404 || e.message?.includes('Invalid credentials')) {
         try {
           await account.create(ID.unique(), email, password);
           await account.createEmailPasswordSession(email, password);
           const user = await account.get();
           setIsAuthenticated(true);
           setUserId(user.$id);
           
           try {
             await supabase.from('user_profiles').upsert({ appwrite_user_id: user.$id }, { onConflict: 'appwrite_user_id' });
           } catch (e) {
             console.warn("Supabase profile sync failed.");
           }
           
           setShowAuthModal(false);
           setShowCredentialsModal(true);
         } catch (signupError: any) {
           alert('Signup failed: ' + (signupError.message || 'Please try again.'));
         }
      } else {
         alert('Login failed: ' + (e.message || 'Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      // Check Subscription before syncing to cloud
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .single();
        
      if (!subscription || subscription.status !== 'active') {
        setShowCredentialsModal(false);
        setShowUpgradeModal(true);
        setLoading(false);
        return;
      }
      
      // Get Supabase Profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('appwrite_user_id', userId)
        .single();
        
      if (profile) {
        if (openAiKey) {
          await supabase.from('user_credentials').upsert(
            { profile_id: profile.id, provider: 'openai', encrypted_api_key: btoa(openAiKey) },
            { onConflict: 'profile_id,provider' }
          );
        }
        if (anthropicKey) {
          await supabase.from('user_credentials').upsert(
            { profile_id: profile.id, provider: 'anthropic', encrypted_api_key: btoa(anthropicKey) },
            { onConflict: 'profile_id,provider' }
          );
        }
        setHasCredentials(true);
        setShowCredentialsModal(false);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, returnUrl: window.location.href }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert("Checkout failed.");
    }
    setLoading(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!hasCredentials) {
      setShowCredentialsModal(true);
      return;
    }

    // Process message (will be implemented later)
    setInput('');
  };

  return (
    <main className="relative flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans">
      {/* Background ambient effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/30 border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 flex items-center justify-center font-bold text-lg">
            Z
          </div>
          <h1 className="font-semibold text-xl tracking-tight">Zuvix</h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => isAuthenticated ? setShowCredentialsModal(true) : setShowAuthModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            {isAuthenticated ? 'Settings' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Chat Area & Input (Only visible if Authenticated) */}
      {isAuthenticated ? (
        <>
          <div className="flex-1 overflow-y-auto p-6 z-10 flex flex-col">
            {/* Chat Messages will go here */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="text-center text-zinc-500 mb-8">
                Start a conversation with Zuvix.
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pb-8">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pr-4 shadow-2xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Zuvix..."
                  className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-white placeholder-zinc-500 text-lg"
                />
                <button
                  type="submit"
                  className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-4">
                Zuvix uses your provided API keys securely.
              </p>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 z-10 flex flex-col justify-center items-center">
          <div className="text-center max-w-xl space-y-6">
            <div className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <svg className="w-12 h-12 text-purple-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Welcome to Zuvix
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Your personal, cross-platform AI assistant. Bring your own keys and start chatting immediately. Data synced securely across all your devices.
            </p>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <h3 className="text-2xl font-bold mb-2">Join Zuvix</h3>
            <p className="text-zinc-400 mb-6">Create an account to save your chat memory and sync your keys across devices.</p>
            
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors text-white"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors text-white"
              />
              <button 
                onClick={handleLoginOrSignup}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Continue with Email'}
              </button>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors border border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal Overlay */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
            <h3 className="text-2xl font-bold mb-2">Configure Provider</h3>
            <p className="text-zinc-400 mb-6">You need to provide an API key to start chatting. Keys are encrypted and synced to your cloud vault.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">OpenAI API Key</label>
                <input 
                  type="password" 
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Anthropic API Key (Optional)</label>
                <input 
                  type="password" 
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleSaveCredentials}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save & Secure'}
                </button>
                <button 
                  onClick={() => setShowCredentialsModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors border border-white/10"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal Overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-purple-500/30 p-8 rounded-3xl max-w-lg w-full shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
            <h3 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Zuvix Cloud Sync</h3>
            <p className="text-zinc-300 mb-6 text-lg">Local execution is free forever. Upgrade to Cloud Sync to securely share your API Keys and Settings across all your devices.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-lg text-white">Pro Sync Plan</h4>
                  <p className="text-zinc-400">Unlimited encrypted cloud vault</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">$4.99<span className="text-sm font-normal text-zinc-500">/mo</span></p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Redirecting...' : 'Upgrade Now'}
                </button>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-6 py-4 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors border border-white/10"
                >
                  Stay Local
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
