import { supabase } from './supabase';
import { account } from './appwrite';

/**
 * Syncs tool configurations to the Cloud (Supabase)
 */
export async function syncToolsToCloud(tools: Array<{ name: string; envData: string }>) {
  try {
    const session = await account.get();
    if (!session) throw new Error("Not authenticated");

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('appwrite_user_id', session.$id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.$id)
      .single();

    if (!subscription || subscription.status !== 'active') {
      throw new Error("SubscriptionRequired");
    }

    for (const tool of tools) {
      // In production, envData should be encrypted using a master key
      await supabase.from('tool_configs').upsert(
        { profile_id: profile.id, tool_name: tool.name, encrypted_env_data: btoa(tool.envData) },
        { onConflict: 'profile_id,tool_name' }
      );
    }
    return true;
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    return false;
  }
}

/**
 * Downloads and restores tool configurations from Cloud
 */
export async function syncToolsFromCloud() {
  try {
    const session = await account.get();
    if (!session) throw new Error("Not authenticated");

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('appwrite_user_id', session.$id)
      .single();

    if (!profile) return [];

    const { data: configs } = await supabase
      .from('tool_configs')
      .select('tool_name, encrypted_env_data')
      .eq('profile_id', profile.id);

    if (!configs) return [];

    return configs.map(config => ({
      name: config.tool_name,
      envData: atob(config.encrypted_env_data)
    }));
  } catch (error) {
    console.error("Cloud Sync Download Error:", error);
    return [];
  }
}
