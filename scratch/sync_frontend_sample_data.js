const fs = require('fs');
const path = require('path');

const db = JSON.parse(fs.readFileSync('backend/db.json', 'utf8'));

const cleanLeads = db.leads.map(l => {
  const { created_at, updated_at, ...rest } = l;
  return rest;
});

const cleanEnquiries = db.enquiries.map(e => {
  const { created_at, updated_at, ...rest } = e;
  return rest;
});

const cleanContacts = db.contacts.map(c => {
  const { created_at, updated_at, ...rest } = c;
  return rest;
});

const tsContent = `import type { Lead, Project, User, Contact, Company, FollowUp, Enquiry } from '../types';

export const sampleUsers: User[] = [
  { id: 'u1', name: 'Admin', email: 'admin@deepika.com', role: 'Admin', status: 'Active' },
];

export const sampleCompanies: Company[] = [];

export const sampleContacts: Contact[] = ${JSON.stringify(cleanContacts, null, 2)};

export const sampleLeads: Lead[] = ${JSON.stringify(cleanLeads, null, 2)};

export const sampleEnquiries: Enquiry[] = ${JSON.stringify(cleanEnquiries, null, 2)};

export const sampleProjects: Project[] = [];
export const sampleFollowUps: FollowUp[] = [];
`;

fs.writeFileSync('frontend/src/store/sampleData.ts', tsContent);
console.log('Successfully synced clean TypeScript objects to frontend/src/store/sampleData.ts!');
