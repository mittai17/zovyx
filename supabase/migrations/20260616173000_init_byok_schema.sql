-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for storing User Metadata tied to Appwrite ID
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appwrite_user_id TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for storing encrypted credentials
CREATE TABLE user_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- e.g., 'openai', 'anthropic'
  encrypted_api_key TEXT NOT NULL, -- Stored encrypted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, provider)
);

-- Create table for storing synced tool environment data
CREATE TABLE tool_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  encrypted_env_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, tool_name)
);

-- Enable RLS (Requires custom JWT logic if passing Appwrite tokens to Supabase)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_configs ENABLE ROW LEVEL SECURITY;
