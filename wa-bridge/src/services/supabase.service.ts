import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, logger } from '../config';

let client: SupabaseClient;

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    client = createClient(config.supabaseUrl, config.supabaseServiceKey);
    logger.info('Supabase service client initialized');
  }
  return client;
}
