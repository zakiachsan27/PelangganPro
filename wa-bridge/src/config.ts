import pino from 'pino';

export const config = {
  port: parseInt(process.env.WA_BRIDGE_PORT || '3001', 10),
  bridgeSecret: process.env.WA_BRIDGE_SECRET || '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export const logger = pino({
  transport: {
    target: 'pino/file',
    options: { destination: 1 }, // stdout
  },
  level: process.env.LOG_LEVEL || 'info',
});
