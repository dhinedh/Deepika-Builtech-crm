import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Download, FileText, Filter, Calendar } from 'lucide-react';
import './Reports.css';

const salesData = [
  { month: 'Jan', leads: 45, won: 12 },
  { month: 'Feb', leads: 52, won: 15 },
  { month: 'Mar', leads: 48, won: 18 },
  { month: 'Apr', leads: 61, won: 22 },
  { month: 'May', leads: 55, won: 20 },
  { month: 'Jun', leads: 67, won: 25 },
];

const revenueData = [
  { month: 'Jan', revenue: 120 },
  { month: 'Feb', revenue: 150 },
  { month: 'Mar', revenue: 180 },
  { month: 'Apr', revenue: 210 },
  { month: 'May', revenue: 190 },
  { month: 'Jun', revenue: 240 },
];

const collectionData = [
  { name: 'Collected', value: 450, color: '#1D9E75' },
  { name: 'Outstanding', value: 120, color: '#BA7517' },
  { name: 'Overdue', value: 45, color: '#E24B4A' },
];

const Reports: React.FC = () => {
  return (
    <div className="reports-module">
      <div className="module-header">
        <div className="header-info">
          <h2>Analytics & Insights</h2>
          <p className="muted-text">Real-time business performance tracking</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary"><Calendar size={18} /> Last 6 Months</button>
          <button className="btn btn-secondary"><Download size={18} /> Export PDF</button>
        </div>
      </div>

      <div className="reports-grid">
        {/* Row 1: Sales & Revenue */}
        <div className="card report-card">
          <div className="card-header">
            <h3>Leads vs Conversion Trend</h3>
            <span className="badge badge-info">Performance</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#1B50A0" name="New Leads" radius={[4, 4, 0, 0]} />
                <Bar dataKey="won" fill="#1D9E75" name="Deals Won" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Revenue Growth (₹ Lakhs)</h3>
            <span className="badge badge-success">+12.5% YoY</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D2C5E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D2C5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0D2C5E" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Collection & Team */}
        <div className="card report-card">
          <div className="card-header">
            <h3>Payment Collection Status</h3>
          </div>
          <div className="chart-container flex items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={collectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {collectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Team Performance</h3>
          </div>
          <div className="table-container" style={{border: 'none'}}>
            <table style={{fontSize: '13px'}}>
              <thead>
                <tr>
                  <th>Salesperson</th>
                  <th>Leads</th>
                  <th>Won</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Anitha R</td>
                  <td>124</td>
                  <td>18</td>
                  <td>₹ 145 L</td>
                </tr>
                <tr>
                  <td>Suresh Kumar</td>
                  <td>98</td>
                  <td>12</td>
                  <td>₹ 98 L</td>
                </tr>
                <tr>
                  <td>Rajesh M</td>
                  <td>110</td>
                  <td>15</td>
                  <td>₹ 112 L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
