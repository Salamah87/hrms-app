import { query, testConnection } from '@/lib/db';

let dbAvailable: boolean | null = null;

export async function isDbAvailable(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  try {
    const result = await testConnection();
    dbAvailable = result.connected;
    return dbAvailable;
  } catch {
    dbAvailable = false;
    return false;
  }
}

export async function pgGetCollection<T>(name: string): Promise<T> {
  const result = await query('SELECT data FROM collections WHERE name = $1', [name]);
  if (result.rows.length === 0) {
    return (name === 'employees' || name === 'notifications' || name === 'holidays' ||
            name === 'leave-types' || name === 'leave-balances' || name === 'performance' ||
            name === 'competencies' || name === 'competency-ratings' || name === 'overtime' ||
            name === 'onboarding' || name === 'salary-components' || name === 'recruitment'
    ) ? [] as unknown as T : ({} as T);
  }
  return result.rows[0].data as T;
}

export async function pgSetCollection(name: string, data: unknown): Promise<void> {
  await query("SELECT upsert_collection($1, $2::jsonb)", [name, JSON.stringify(data)]);
}
