import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhanushv271205_db_user:mD3dgX4PUsrlfsBa@cluster0.5dwtp4g.mongodb.net/whatsapp-crm?appName=Cluster0';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas (whatsapp-crm)');

    // Auto-seed default admin user if none exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@deepikabuiltech.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'Admin'
      });
      console.log('✅ Default Admin user created: admin@deepikabuiltech.com / admin123');
    }
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

// Immediate connection attempt
connectDB();

// Define Mongoose Schemas & Models
const LeadSchema = new mongoose.Schema({
  id: { type: String },
  contactName: String,
  companyName: String,
  phone: { type: String, index: true },
  projectType: String,
  location: String,
  landArea: String,
  estimatedBudget: mongoose.Schema.Types.Mixed,
  timeline: String,
  source: String,
  assignedTo: String,
  status: { type: String, default: 'New' },
  leadScore: { type: Number, default: 80 },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const EnquirySchema = new mongoose.Schema({
  id: { type: String },
  contactName: String,
  phone: { type: String, index: true },
  lastMessage: String,
  status: { type: String, default: 'New' },
  source: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const ContactSchema = new mongoose.Schema({
  id: { type: String },
  fullName: String,
  designation: String,
  phone: { type: String, index: true },
  email: String,
  isDecisionMaker: { type: Boolean, default: true },
  type: String,
  city: String,
  industry: String,
  created_at: { type: Date, default: Date.now }
});

const FollowUpSchema = new mongoose.Schema({
  id: { type: String },
  lead_id: String,
  contactId: String,
  type: String,
  scheduled_date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  notes: String,
  reminder_sent: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const CompanySchema = new mongoose.Schema({
  id: { type: String },
  name: String,
  industry: String,
  location: String,
  phone: String,
  email: String,
  created_at: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  id: { type: String },
  name: String,
  client: String,
  type: String,
  location: String,
  value: Number,
  status: { type: String, default: 'In Progress' },
  progress: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const QuotationSchema = new mongoose.Schema({
  id: { type: String },
  quotationNo: String,
  leadName: String,
  phone: String,
  projectType: String,
  totalAmount: Number,
  status: { type: String, default: 'Draft' },
  created_at: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  id: { type: String },
  title: String,
  assignedTo: String,
  dueDate: Date,
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Pending' },
  created_at: { type: Date, default: Date.now }
});

const VendorSchema = new mongoose.Schema({
  id: { type: String },
  name: String,
  category: String,
  contactPerson: String,
  phone: String,
  email: String,
  city: String,
  created_at: { type: Date, default: Date.now }
});

const SiteVisitSchema = new mongoose.Schema({
  id: { type: String },
  clientName: String,
  phone: String,
  location: String,
  visitDate: Date,
  status: { type: String, default: 'Scheduled' },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  id: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'Sales' },
  phone: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
export const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
export const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
export const SiteVisit = mongoose.models.SiteVisit || mongoose.model('SiteVisit', SiteVisitSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

export const modelsMap = {
  leads: Lead,
  enquiries: Enquiry,
  contacts: Contact,
  followups: FollowUp,
  companies: Company,
  projects: Project,
  quotations: Quotation,
  tasks: Task,
  vendors: Vendor,
  sitevisits: SiteVisit,
  users: User
};
