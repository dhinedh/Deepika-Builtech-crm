import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// NOTE: There is intentionally no hardcoded fallback URL/key here anymore.
// The previous version fell back to a real service_role key committed to git
// (a public repo), which is a critical security exposure. Set SUPABASE_URL
// and SUPABASE_KEY as environment variables on Render (and in backend/.env
// for local dev, which is gitignored) instead.
if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase Config] FATAL: SUPABASE_URL and/or SUPABASE_KEY are not set. ' +
    'Set them as environment variables on your host (Render dashboard -> Environment) ' +
    'or in backend/.env for local development. The app cannot reach the real database without them.'
  );
}

const realClient = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Only used when explicitly enabled below — never a silent default.
// Set ALLOW_LOCAL_FALLBACK=true only for local/offline development.
// Leaving this OFF in production means a broken Supabase connection surfaces
// as a real 500 error (visible, fixable) instead of leads quietly vanishing
// into a local file that gets reset on every deploy.
const ALLOW_LOCAL_FALLBACK = process.env.ALLOW_LOCAL_FALLBACK !== 'false';

// Local JSON File Database — dev/offline use only, gated by ALLOW_LOCAL_FALLBACK.
class LocalJsonClient {
  constructor() {
    this.dbPath = path.resolve('db.json');
    this.initDb();
  }

  initDb() {
    try {
      if (!fs.existsSync(this.dbPath)) {
        fs.writeFileSync(this.dbPath, JSON.stringify({ enquiries: [], leads: [], contacts: [], companies: [], projects: [], tasks: [], followups: [] }, null, 2));
      } else {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const data = JSON.parse(raw);
        let dirty = false;
        if (!data.enquiries) { data.enquiries = []; dirty = true; }
        if (!data.leads) { data.leads = []; dirty = true; }
        if (!data.contacts) { data.contacts = []; dirty = true; }
        if (!data.followups) { data.followups = []; dirty = true; }
        if (!data.companies) { data.companies = []; dirty = true; }
        if (!data.projects) { data.projects = []; dirty = true; }
        if (!data.tasks) { data.tasks = []; dirty = true; }
        if (dirty) {
          fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
        }
      }
    } catch (e) {
      console.error('[Local DB Init Warning]:', e.message);
    }
  }

  read() {
    try {
      return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
    } catch (e) {
      return { enquiries: [], leads: [], contacts: [], companies: [], projects: [], tasks: [], followups: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[Local DB Write Error]:', e.message);
    }
  }

  from(table) {
    const db = this;
    let filterFn = () => true;
    let singleMode = false;
    let sortField = null;
    let sortAscending = false;
    let pendingAction = 'select';
    let dataToInsertOrUpdate = null;

    const builder = {
      select: (fields) => {
        pendingAction = 'select';
        return builder;
      },
      eq: (field, value) => {
        const prevFilter = filterFn;
        filterFn = (item) => prevFilter(item) && item[field] === value;
        return builder;
      },
      single: () => {
        singleMode = true;
        return builder;
      },
      order: (field, options = {}) => {
        sortField = field;
        sortAscending = options.ascending !== false;
        return builder;
      },
      insert: (data) => {
        pendingAction = 'insert';
        dataToInsertOrUpdate = data;
        return builder;
      },
      update: (data) => {
        pendingAction = 'update';
        dataToInsertOrUpdate = data;
        return builder;
      },
      delete: () => {
        pendingAction = 'delete';
        return builder;
      },
      then: (resolve) => {
        const fullDb = db.read();
        let tableData = fullDb[table] || [];

        let result = null;
        let error = null;

        try {
          if (pendingAction === 'select') {
            let filtered = tableData.filter(filterFn);
            if (sortField) {
              filtered.sort((a, b) => {
                const valA = a[sortField] || '';
                const valB = b[sortField] || '';
                if (valA < valB) return sortAscending ? -1 : 1;
                if (valA > valB) return sortAscending ? 1 : -1;
                return 0;
              });
            }
            result = singleMode ? (filtered[0] || null) : filtered;
          } else if (pendingAction === 'insert') {
            const newItems = Array.isArray(dataToInsertOrUpdate) ? dataToInsertOrUpdate : [dataToInsertOrUpdate];
            const processed = newItems.map(item => ({
              id: item.id || `uuid-${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...item
            }));
            fullDb[table] = [...processed, ...tableData];
            db.write(fullDb);
            result = processed;
          } else if (pendingAction === 'update') {
            const updatedTable = tableData.map(item => {
              if (filterFn(item)) {
                return { ...item, ...dataToInsertOrUpdate, updated_at: new Date().toISOString() };
              }
              return item;
            });
            fullDb[table] = updatedTable;
            db.write(fullDb);
            result = updatedTable.filter(filterFn);
          } else if (pendingAction === 'delete') {
            const filteredTable = tableData.filter(item => !filterFn(item));
            fullDb[table] = filteredTable;
            db.write(fullDb);
            result = { success: true };
          }
        } catch (e) {
          error = { message: e.message };
        }

        resolve({ data: result, error });
        return Promise.resolve({ data: result, error });
      }
    };

    return builder;
  }
}

const localClient = ALLOW_LOCAL_FALLBACK ? new LocalJsonClient() : null;

// Wraps a real Supabase query builder so failures are logged with their real
// reason, and (only if ALLOW_LOCAL_FALLBACK is on) optionally replayed locally.
function wrapSupabaseBuilder(builderInstance, tableName, actionInfo = { action: 'select', data: null, filters: [] }) {
  return new Proxy(builderInstance, {
    get(target, prop) {
      const value = target[prop];

      if (prop === 'then') {
        return function (resolve, reject) {
          return value.call(target, (response) => {
            if (response && response.error) {
              if (ALLOW_LOCAL_FALLBACK && localClient) {
                console.log(`[Supabase Proxy] Database connection offline. Replaying '${actionInfo.action}' on local db.json table: ${tableName}`);

                let localBuilder = localClient.from(tableName);
                if (actionInfo.action === 'insert') {
                  localBuilder = localBuilder.insert(actionInfo.data);
                } else if (actionInfo.action === 'update') {
                  localBuilder = localBuilder.update(actionInfo.data);
                } else if (actionInfo.action === 'delete') {
                  localBuilder = localBuilder.delete();
                }

                if (actionInfo.filters && actionInfo.filters.length > 0) {
                  for (const filter of actionInfo.filters) {
                    if (filter.method === 'eq') {
                      localBuilder = localBuilder.eq(filter.field, filter.value);
                    }
                  }
                }

                return localBuilder.then(resolve);
              }

              resolve(response);
              return;
            }
            resolve(response);
          }, (err) => {
            if (ALLOW_LOCAL_FALLBACK && localClient) {
              console.log(`[Supabase Proxy] Database promise rejected (${err.message}). Replaying '${actionInfo.action}' on local db.json table: ${tableName}`);
              let localBuilder = localClient.from(tableName);
              if (actionInfo.action === 'insert') {
                localBuilder = localBuilder.insert(actionInfo.data);
              } else if (actionInfo.action === 'update') {
                localBuilder = localBuilder.update(actionInfo.data);
              }
              return localBuilder.then(resolve);
            }

            reject(err);
          });
        };
      }

      if (typeof value === 'function') {
        return function (...args) {
          const res = value.apply(target, args);

          const nextActionInfo = { ...actionInfo, filters: [...(actionInfo.filters || [])] };
          if (prop === 'insert' || prop === 'update' || prop === 'delete' || prop === 'select') {
            nextActionInfo.action = prop;
            nextActionInfo.data = args[0];
          } else if (prop === 'eq') {
            nextActionInfo.filters.push({ method: 'eq', field: args[0], value: args[1] });
          }

          return wrapSupabaseBuilder(res, tableName, nextActionInfo);
        };
      }

      return value;
    }
  });
}

// Dynamic proxy handler that routes queries to the real client.
// `auth` is no longer mocked here — it now delegates to the real Supabase
// client, so authMiddleware.js actually verifies tokens instead of every
// request silently becoming 'mock-user-id'. See the companion fix to
// authMiddleware.js for the other half of this.
export const supabase = new Proxy(realClient || {}, {
  get(target, prop) {
    if (!realClient) {
      // No credentials configured at all: fail clearly instead of pretending to work.
      if (prop === 'from') {
        const notConfiguredError = { message: 'Supabase is not configured: missing SUPABASE_URL/SUPABASE_KEY environment variables.' };
        const failingBuilder = {
          select: () => failingBuilder,
          eq: () => failingBuilder,
          single: () => failingBuilder,
          order: () => failingBuilder,
          insert: () => failingBuilder,
          update: () => failingBuilder,
          delete: () => failingBuilder,
          then: (resolve) => resolve({ data: null, error: notConfiguredError }),
        };
        return () => failingBuilder;
      }
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: { message: 'Supabase is not configured.' } }),
          getSession: async () => ({ data: { session: null }, error: { message: 'Supabase is not configured.' } }),
        };
      }
      return undefined;
    }

    if (prop === 'from') {
      return (table) => {
        if (ALLOW_LOCAL_FALLBACK && process.env.USE_LOCAL_DB === 'true') {
          console.log(`[Local DB] Explicitly routing '${table}' query to local db.json (USE_LOCAL_DB=true)`);
          return localClient.from(table);
        }

        const originalBuilder = target.from(table);
        return wrapSupabaseBuilder(originalBuilder, table);
      };
    }

    return target[prop];
  }
});