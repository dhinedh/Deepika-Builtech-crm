import fs from 'fs';
import path from 'path';

const basePath = path.join('d:', 'ZECH SOFT', 'projects', 'deepika', 'deepika crn', 'backend');
const routesDir = path.join(basePath, 'routes');
const configDir = path.join(basePath, 'config');

if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

// 1. Create supabase client config
const supabaseContent = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
`;
fs.writeFileSync(path.join(configDir, 'supabase.js'), supabaseContent);

// 2. Create route files
const resources = [
  'auth', 'leads', 'contacts', 'companies', 'projects', 
  'quotations', 'tasks', 'followUps', 'vendors', 'siteVisits'
];

resources.forEach(resource => {
  const content = `import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET all ${resource}
router.get('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('${resource}').select('*');
    // if (error) throw error;
    res.json({ message: 'Get all ${resource}', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single ${resource}
router.get('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('${resource}').select('*').eq('id', req.params.id).single();
    // if (error) throw error;
    res.json({ message: \`Get ${resource} \${req.params.id}\`, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new ${resource}
router.post('/', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('${resource}').insert([req.body]).select();
    // if (error) throw error;
    res.status(201).json({ message: 'Create a new ${resource}', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update ${resource}
router.put('/:id', async (req, res) => {
  try {
    // const { data, error } = await supabase.from('${resource}').update(req.body).eq('id', req.params.id).select();
    // if (error) throw error;
    res.json({ message: \`Update ${resource} \${req.params.id}\`, data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE ${resource}
router.delete('/:id', async (req, res) => {
  try {
    // const { error } = await supabase.from('${resource}').delete().eq('id', req.params.id);
    // if (error) throw error;
    res.json({ message: \`Delete ${resource} \${req.params.id}\` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`;
  fs.writeFileSync(path.join(routesDir, resource + 'Routes.js'), content);
});

// 3. Create updated server.js content
const serverContent = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

// Import Routes
${resources.map(r => `import ${r}Routes from './routes/${r}Routes.js';`).join('\\n')}

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Status
app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend is running and connected to frontend!', status: 'success' });
});

// Mount Routes
${resources.map(r => `app.use('/api/${r.toLowerCase()}', ${r}Routes);`).join('\\n')}

app.listen(port, () => {
  console.log(\`Backend server listening on port \${port}\`);
});
`;

fs.writeFileSync(path.join(basePath, 'server.js'), serverContent);

console.log('Backend architecture generated successfully!');
