/**
 * Baileys auth state backed by Supabase (wa_auth_states table).
 * Survives server restart — no filesystem dependency.
 */
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  proto,
  BufferJSON,
} from '@whiskeysockets/baileys';
import { getSupabase } from './supabase.service';
import { logger } from '../config';

const TABLE = 'wa_auth_states';

export async function useSupabaseAuthState(
  sessionId: string
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const supabase = getSupabase();

  const readData = async (key: string): Promise<any> => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('data')
      .eq('session_id', sessionId)
      .eq('key', key)
      .single();
    if (error || !data) return null;
    return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
  };

  const writeData = async (key: string, value: any): Promise<void> => {
    const serialized = JSON.parse(JSON.stringify(value, BufferJSON.replacer));
    const { error } = await supabase.from(TABLE).upsert(
      { session_id: sessionId, key, data: serialized },
      { onConflict: 'session_id,key' }
    );
    if (error) logger.error({ error, key }, 'Failed to write auth state');
  };

  const removeData = async (key: string): Promise<void> => {
    await supabase
      .from(TABLE)
      .delete()
      .eq('session_id', sessionId)
      .eq('key', key);
  };

  // Load or initialize creds
  const creds: AuthenticationCreds =
    (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[]
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
          const result: { [id: string]: SignalDataTypeMap[T] } = {};
          for (const id of ids) {
            const value = await readData(`${type}-${id}`);
            if (value) {
              if (type === 'app-state-sync-key') {
                result[id] = proto.Message.AppStateSyncKeyData.fromObject(
                  value
                ) as any;
              } else {
                result[id] = value;
              }
            }
          }
          return result;
        },
        set: async (data: any): Promise<void> => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(
                value ? writeData(key, value) : removeData(key)
              );
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData('creds', creds),
  };
}
