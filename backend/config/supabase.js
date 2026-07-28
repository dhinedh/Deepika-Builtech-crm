import { connectDB, modelsMap, User } from './mongodb.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

connectDB();

/**
 * MongoDB-backed query wrapper mirroring the Supabase JS interface.
 * Routes all .from('table') calls directly to Mongoose models.
 */
class MongoSupabaseClient {
  from(tableName) {
    const model = modelsMap[tableName.toLowerCase()];
    
    let filters = {};
    let sortObj = {};
    let isSingle = false;

    const builder = {
      select: (fields = '*') => {
        return builder;
      },
      eq: (field, value) => {
        // Map 'id' filter to either _id or custom string id if present
        if (field === 'id') {
          filters['$or'] = [{ _id: value }, { id: value }];
        } else {
          filters[field] = value;
        }
        return builder;
      },
      order: (field, { ascending = true } = {}) => {
        sortObj[field] = ascending ? 1 : -1;
        return builder;
      },
      single: () => {
        isSingle = true;
        return builder;
      },
      then: async (resolve, reject) => {
        try {
          if (!model) {
            return resolve({ data: isSingle ? null : [], error: null });
          }
          let query = model.find(filters);
          if (Object.keys(sortObj).length > 0) {
            query = query.sort(sortObj);
          }
          const rawDocs = await query.exec();
          const mappedDocs = rawDocs.map(doc => {
            const obj = doc.toObject();
            obj.id = obj.id || obj._id.toString();
            return obj;
          });

          if (isSingle) {
            const singleDoc = mappedDocs[0] || null;
            return resolve({ data: singleDoc, error: singleDoc ? null : new Error('Not found') });
          }
          return resolve({ data: mappedDocs, error: null });
        } catch (err) {
          return resolve({ data: null, error: err });
        }
      },
      insert: async (records) => {
        try {
          if (!model) return { data: null, error: new Error(`Table ${tableName} not found`) };
          const recordsArr = Array.isArray(records) ? records : [records];
          const inserted = await model.insertMany(recordsArr);
          const mapped = inserted.map(doc => {
            const obj = doc.toObject();
            obj.id = obj.id || obj._id.toString();
            return obj;
          });
          return {
            data: mapped,
            error: null,
            select: () => Promise.resolve({ data: mapped, error: null })
          };
        } catch (err) {
          return { data: null, error: err, select: () => Promise.resolve({ data: null, error: err }) };
        }
      },
      update: (updateData) => {
        return {
          eq: (field, value) => {
            let updateFilter = {};
            if (field === 'id') {
              updateFilter['$or'] = [{ _id: value }, { id: value }];
            } else {
              updateFilter[field] = value;
            }
            return {
              select: async () => {
                try {
                  if (!model) return { data: null, error: new Error(`Table ${tableName} not found`) };
                  const doc = await model.findOneAndUpdate(updateFilter, updateData, { new: true });
                  if (!doc) return { data: [], error: new Error('Record not found') };
                  const obj = doc.toObject();
                  obj.id = obj.id || obj._id.toString();
                  return { data: [obj], error: null };
                } catch (err) {
                  return { data: null, error: err };
                }
              },
              then: async (resolve) => {
                try {
                  if (!model) return resolve({ data: null, error: new Error(`Table ${tableName} not found`) });
                  const doc = await model.findOneAndUpdate(updateFilter, updateData, { new: true });
                  if (!doc) return resolve({ data: [], error: new Error('Record not found') });
                  const obj = doc.toObject();
                  obj.id = obj.id || obj._id.toString();
                  return resolve({ data: [obj], error: null });
                } catch (err) {
                  return resolve({ data: null, error: err });
                }
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: async (field, value) => {
            try {
              if (!model) return { error: new Error(`Table ${tableName} not found`) };
              let delFilter = {};
              if (field === 'id') {
                delFilter['$or'] = [{ _id: value }, { id: value }];
              } else {
                delFilter[field] = value;
              }
              await model.deleteMany(delFilter);
              return { error: null };
            } catch (err) {
              return { error: err };
            }
          }
        };
      },
      upsert: async (records) => {
        try {
          if (!model) return { data: null, error: new Error(`Table ${tableName} not found`) };
          const recordsArr = Array.isArray(records) ? records : [records];
          const results = [];
          for (const rec of recordsArr) {
            const filter = rec.phone ? { phone: rec.phone } : rec.id ? { id: rec.id } : { _id: rec._id };
            const doc = await model.findOneAndUpdate(filter, rec, { upsert: true, new: true });
            const obj = doc.toObject();
            obj.id = obj.id || obj._id.toString();
            results.push(obj);
          }
          return { data: results, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    };

    return builder;
  }

  auth = {
    getUser: async (token) => {
      try {
        const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_custom_tokens';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);
        if (!user) return { data: { user: null }, error: new Error('User not found') };
        const userObj = user.toObject();
        userObj.id = userObj.id || userObj._id.toString();
        return { data: { user: userObj }, error: null };
      } catch (err) {
        return { data: { user: null }, error: err };
      }
    },
    signInWithPassword: async ({ email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return { data: null, error: new Error('Invalid email or password') };
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return { data: null, error: new Error('Invalid email or password') };
        const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_custom_tokens';
        const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });
        const userObj = user.toObject();
        userObj.id = userObj.id || userObj._id.toString();
        return { data: { session: { access_token: token }, user: userObj }, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    signUp: async ({ email, password, options = {} }) => {
      try {
        const existing = await User.findOne({ email });
        if (existing) return { data: null, error: new Error('User already exists') };
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          email,
          password: hashedPassword,
          name: options.data?.full_name || email.split('@')[0],
          role: options.data?.role || 'Sales'
        });
        const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_custom_tokens';
        const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });
        const userObj = user.toObject();
        userObj.id = userObj.id || userObj._id.toString();
        return { data: { session: { access_token: token }, user: userObj }, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  };
}

export const supabase = new MongoSupabaseClient();