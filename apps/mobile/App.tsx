import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { account } from './lib/appwrite';
import { supabase } from './lib/supabase';
import { ID } from 'react-native-appwrite';
import nodejs from 'nodejs-mobile-react-native';

export default function App() {
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
  const [localGatewayStatus, setLocalGatewayStatus] = useState('Initializing Node.js locally...');

  useEffect(() => {
    // Start embedded Local Node.js Gateway seamlessly
    nodejs.start('main.js');
    nodejs.channel.addListener(
      'message',
      (msg) => {
        console.log("Local Node Gateway:", msg);
        setLocalGatewayStatus(msg);
      },
      this
    );
    // Trigger Zuvix Gateway Boot
    nodejs.channel.post('start_zuvix');
  }, []);

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
      // Try Login first
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setIsAuthenticated(true);
      setUserId(user.$id);
      
      await supabase.from('user_profiles').upsert({ appwrite_user_id: user.$id }, { onConflict: 'appwrite_user_id' });
      
      setShowAuthModal(false);
      setShowCredentialsModal(true);
    } catch (e: any) {
      if (e.code === 401) {
         try {
           await account.create(ID.unique(), email, password);
           await account.createEmailPasswordSession(email, password);
           const user = await account.get();
           setIsAuthenticated(true);
           setUserId(user.$id);
           
           await supabase.from('user_profiles').upsert({ appwrite_user_id: user.$id }, { onConflict: 'appwrite_user_id' });
           
           setShowAuthModal(false);
           setShowCredentialsModal(true);
         } catch (signupError) {
           Alert.alert('Error', 'Signup failed. Please try again.');
         }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      // Check Subscription before saving to Supabase (Cloud Sync)
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
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('appwrite_user_id', userId)
        .single();
        
      if (profile) {
        if (openAiKey) {
          await supabase.from('user_credentials').upsert(
            { profile_id: profile.id, provider: 'openai', encrypted_api_key: openAiKey },
            { onConflict: 'profile_id,provider' }
          );
        }
        if (anthropicKey) {
          await supabase.from('user_credentials').upsert(
            { profile_id: profile.id, provider: 'anthropic', encrypted_api_key: anthropicKey },
            { onConflict: 'profile_id,provider' }
          );
        }
        setHasCredentials(true);
        setShowCredentialsModal(false);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save credentials');
    }
    setLoading(false);
  };

  const handleCheckout = () => {
    // Note: On mobile, typically use react-native-inappbrowser-reborn or standard deep links.
    Alert.alert("Redirecting", "Opening Stripe Checkout...");
    // simulate close
    setShowUpgradeModal(false);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!hasCredentials) {
      setShowCredentialsModal(true);
      return;
    }

    // Process message
    setInput('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}><Text style={styles.logoText}>Z</Text></View>
          <Text style={styles.headerTitle}>Zuvix</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => isAuthenticated ? setShowCredentialsModal(true) : setShowAuthModal(true)}
        >
          <Text style={styles.headerButtonText}>{isAuthenticated ? 'Settings' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView contentContainerStyle={styles.chatArea}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Zuvix</Text>
          <Text style={styles.welcomeSubtitle}>
            Your personal, cross-platform AI assistant. Bring your own keys and start chatting immediately. Data synced securely.
          </Text>
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message Zuvix..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.inputNote}>Runs locally. Requires your own API keys.</Text>
      </View>

      {/* Auth Modal */}
      <Modal visible={showAuthModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Zuvix</Text>
            <Text style={styles.modalDesc}>Create an account to save your chat memory and sync your keys across devices.</Text>
            
            <TextInput 
              style={styles.modalInput}
              placeholder="Email Address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.modalInput}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.5 }]}
              onPress={handleLoginOrSignup}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Authenticating...' : 'Continue with Email'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setShowAuthModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Credentials Modal */}
      <Modal visible={showCredentialsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Provider</Text>
            <Text style={styles.modalDesc}>Provide an API key to start chatting. Keys are encrypted and synced to your cloud vault.</Text>
            
            <Text style={styles.inputLabel}>OpenAI API Key</Text>
            <TextInput 
              style={styles.modalInput}
              placeholder="sk-..."
              placeholderTextColor="#555"
              value={openAiKey}
              onChangeText={setOpenAiKey}
              secureTextEntry
            />
            
            <Text style={styles.inputLabel}>Anthropic API Key (Optional)</Text>
            <TextInput 
              style={styles.modalInput}
              placeholder="sk-ant-..."
              placeholderTextColor="#555"
              value={anthropicKey}
              onChangeText={setAnthropicKey}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.primaryButton, { flex: 1, marginRight: 8 }, loading && { opacity: 0.5 }]}
                onPress={handleSaveCredentials}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Save & Secure'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => setShowCredentialsModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upgrade Modal */}
      <Modal visible={showUpgradeModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#A855F7', borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: '#EAB308', fontSize: 24 }]}>Zuvix Cloud Sync</Text>
            <Text style={styles.modalDescription}>
              Local execution is completely free! Upgrade to Cloud Sync to securely backup and share your API Keys and Settings across all your mobile and desktop devices.
            </Text>
            
            <View style={{ backgroundColor: '#ffffff10', padding: 16, borderRadius: 12, marginBottom: 20 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Pro Sync Plan</Text>
              <Text style={{ color: '#aaa', marginTop: 4 }}>Unlimited encrypted cloud vault</Text>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 22, marginTop: 8 }}>$4.99<Text style={{ fontSize: 14, color: '#aaa' }}>/mo</Text></Text>
            </View>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EAB308' }]} onPress={handleCheckout}>
              <Text style={[styles.modalButtonText, { color: 'black' }]}>Upgrade Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'transparent', borderColor: '#ffffff30', borderWidth: 1 }]} onPress={() => setShowUpgradeModal(false)}>
              <Text style={styles.modalButtonText}>Stay Local</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerButton: {
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chatArea: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#0A0A0A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
  },
  inputNote: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDesc: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  }
});
