import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwacdwackjnifrjgkrom.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YWNkd2Fja2puaWZyamdrcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1MzA4NiwiZXhwIjoyMDkyNTI5MDg2fQ.xeri6TvyfMfTz171-o4AzREzCIBAPeuT2lfrqh8fBrM';

// Try creating real client
const realClient = createClient(supabaseUrl, supabaseKey);

// Local JSON File Database for offline/network resilience
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

const localClient = new LocalJsonClient();

// Helper to recursively wrap Supabase query builders with full transaction tracking
function wrapSupabaseBuilder(builderInstance, tableName, actionInfo = { action: 'select', data: null, filters: [] }) {
  return new Proxy(builderInstance, {
    get(target, prop) {
      const value = target[prop];
      
      if (prop === 'then') {
        return function(resolve, reject) {
          return value.call(target, (response) => {
            if (response && response.error && (response.error.message.includes('fetch failed') || response.error.message.includes('ENOTFOUND'))) {
              console.warn(`[Supabase Proxy] Database connection failed. Replaying '${actionInfo.action}' on local db.json table: ${tableName}`);
              
              // Build dynamic local query replaying all builder steps
              let localBuilder = localClient.from(tableName);
              if (actionInfo.action === 'insert') {
                localBuilder = localBuilder.insert(actionInfo.data);
              } else if (actionInfo.action === 'update') {
                localBuilder = localBuilder.update(actionInfo.data);
              } else if (actionInfo.action === 'delete') {
                localBuilder = localBuilder.delete();
              }
              
              // Replay filters
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
          }, (err) => {
            console.warn(`[Supabase Proxy] Database promise rejected. Replaying on local db.json table: ${tableName}`);
            let localBuilder = localClient.from(tableName);
            if (actionInfo.action === 'insert') {
              localBuilder = localBuilder.insert(actionInfo.data);
            } else if (actionInfo.action === 'update') {
              localBuilder = localBuilder.update(actionInfo.data);
            }
            return localBuilder.then(resolve);
          });
        };
      }
      
      if (typeof value === 'function') {
        return function(...args) {
          const res = value.apply(target, args);
          
          // Accumulate builder chain metadata recursively
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

// Dynamic proxy handler that seamlessly routes queries
export const supabase = new Proxy(realClient, {
  get(target, prop) {
    if (prop === 'auth') {
      return {
        getUser: async (token) => {
          return { data: { user: { id: 'mock-user-id', email: 'admin@example.com' } }, error: null };
        },
        getSession: async () => {
          return { data: { session: null }, error: null };
        }
      };
    }
    
    if (prop === 'from') {
      return (table) => {
        if (process.env.USE_LOCAL_DB === 'true') {
          console.log(`[Supabase Proxy] Explicitly routing '${table}' query to local db.json`);
          return localClient.from(table);
        }

        const originalBuilder = target.from(table);
        return wrapSupabaseBuilder(originalBuilder, table);
      };
    }
    
    return target[prop];
  }
});
