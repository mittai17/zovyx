-- Create Subscriptions Table for Stripe Sync
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL UNIQUE, -- Appwrite user ID or Supabase Auth ID
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing')),
  price_id text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscription
CREATE POLICY "Users can view their own subscription"
ON subscriptions FOR SELECT
USING (auth.uid()::text = user_id);

-- Allow service role to update subscriptions (via Stripe Webhook)
CREATE POLICY "Service role can manage subscriptions"
ON subscriptions FOR ALL
USING (true)
WITH CHECK (true);
