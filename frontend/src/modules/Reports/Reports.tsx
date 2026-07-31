import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Download, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { useCRMStore } from '../../store/useCRMStore';
import { format, subMonths } from 'date-fns';
import './Reports.css';

const STATUS_COLORS: Record<string, string> = {
  'New': '#1B50A0',
  'Enquiry': '#0D2C5E',
  'Contacted': '#2B6CB0',
  'Qualified': '#3182CE',
  'Site Visit': '#DD6B20',
  'Quotation': '#D69E2E',
  'Quotation Requested': '#ED8936',
  'Negotiation': '#805AD5',
  'Won': '#1D9E75',
  'Lost': '#E53E3E',
  'Other': '#718096'
};

const CHART_COLORS = ['#1B50A0', '#1D9E75', '#E8622A', '#805AD5', '#D69E2E', '#3182CE', '#E53E3E', '#718096'];

const Reports: React.FC = () => {
  const { leads, fetchLeads, fetchEnquiries, fetchFollowUps } = useCRMStore();
  const [timeRange, setTimeRange] = useState<number>(6); // Default 6 months

  useEffect(() => {
    fetchLeads();
    if (fetchEnquiries) fetchEnquiries();
    if (fetchFollowUps) fetchFollowUps();
  }, []);

  // 1. Build dynamic monthly trends based on actual lead creation dates
  const generateMonthlyTrends = () => {
    const monthsMap: Record<string, { month: string; leads: number; won: number; revenue: number; order: number }> = {};
    
    // Initialize past N months
    const today = new Date();
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = subMonths(today, i);
      const key = format(d, 'MMM yyyy');
      monthsMap[key] = {
        month: format(d, 'MMM'),
        leads: 0,
        won: 0,
        revenue: 0,
        order: i
      };
    }

    // Populate with real lead data from CRM store
    leads.forEach(lead => {
      if (!lead.createdAt) return;
      const leadDate = new Date(lead.createdAt);
      if (isNaN(leadDate.getTime())) return;

      const key = format(leadDate, 'MMM yyyy');
      if (monthsMap[key]) {
        monthsMap[key].leads += 1;
        const budget = Number(lead.estimatedBudget) || 0;
        if (lead.status === 'Won') {
          monthsMap[key].won += 1;
          monthsMap[key].revenue += budget;
        }
      }
    });

    return Object.values(monthsMap);
  };

  const monthlyTrends = generateMonthlyTrends();
  const hasLeadData = leads.length > 0;

  // 2. Dynamic Lead Status Breakdown (for Pie Chart)
  const statusCounts: Record<string, number> = {};
  leads.forEach(l => {
    const st = l.status || 'New';
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  const statusDistributionData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#718096'
  }));

  // 3. Dynamic Lead Source Performance Table
  const sourcePerformance: Record<string, { source: string; leads: number; won: number; revenue: number }> = {};
  leads.forEach(l => {
    const src = l.source || 'WhatsApp Bot';
    if (!sourcePerformance[src]) {
      sourcePerformance[src] = { source: src, leads: 0, won: 0, revenue: 0 };
    }
    sourcePerformance[src].leads += 1;
    const budget = Number(l.estimatedBudget) || 0;
    if (l.status === 'Won') {
      sourcePerformance[src].won += 1;
      sourcePerformance[src].revenue += budget;
    }
  });

  const sourceTableData = Object.values(sourcePerformance);

  // Summary Metrics calculated from live store
  const totalLeads = leads.length;
  const totalWonDeals = leads.filter(l => l.status === 'Won').length;
  const totalPipelineRevenue = leads.reduce((acc, l) => acc + (Number(l.estimatedBudget) || 0), 0);
  const totalWonRevenue = leads
    .filter(l => l.status === 'Won')
    .reduce((acc, l) => acc + (Number(l.estimatedBudget) || 0), 0);

  const conversionRate = totalLeads > 0 ? ((totalWonDeals / totalLeads) * 100).toFixed(1) : '0.0';

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="reports-module">
      <div className="module-header">
        <div className="header-info">
          <h2>Analytics & Insights</h2>
          <p className="muted-text">Real-time business performance from active database</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setTimeRange(timeRange === 6 ? 12 : 6)}>
            <Calendar size={18} /> {timeRange === 6 ? 'Last 6 Months' : 'Last 12 Months'}
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-content">
            <p className="label">Total Recorded Leads</p>
            <div className="stat-value-group">
              <h3>{totalLeads}</h3>
            </div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-content">
            <p className="label">Deals Won</p>
            <div className="stat-value-group">
              <h3>{totalWonDeals} <span style={{fontSize: '12px', color: '#1D9E75', fontWeight: 600}}>({conversionRate}% Conv.)</span></h3>
            </div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-content">
            <p className="label">Pipeline Value</p>
            <div className="stat-value-group">
              <h3>₹ {totalPipelineRevenue} L</h3>
            </div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-content">
            <p className="label">Won Deal Value</p>
            <div className="stat-value-group">
              <h3>₹ {totalWonRevenue} L</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        {/* Row 1: Sales & Revenue Trends */}
        <div className="card report-card">
          <div className="card-header">
            <h3>Leads vs Conversion Trend</h3>
            <span className="badge badge-info">Live Database</span>
          </div>
          <div className="chart-container">
            {hasLeadData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#1B50A0" name="New Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="won" fill="#1D9E75" name="Deals Won" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-state">
                <BarChart3 size={36} style={{color: '#a0aec0', marginBottom: '8px'}} />
                <p>No lead records found for trend analysis.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Revenue Growth (₹ Lakhs)</h3>
            <span className="badge badge-success">Won Budget Total</span>
          </div>
          <div className="chart-container">
            {hasLeadData ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D2C5E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0D2C5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val: any) => [`₹ ${val} L`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#0D2C5E" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-state">
                <TrendingUp size={36} style={{color: '#a0aec0', marginBottom: '8px'}} />
                <p>No revenue data recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Status Breakdown & Lead Source Performance */}
        <div className="card report-card">
          <div className="card-header">
            <h3>Lead Pipeline Status Distribution</h3>
          </div>
          <div className="chart-container flex items-center">
            {statusDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-state">
                <p>No status distribution data available.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Lead Source Performance</h3>
          </div>
          <div className="table-container" style={{border: 'none'}}>
            <table style={{fontSize: '13px'}}>
              <thead>
                <tr>
                  <th>Lead Source</th>
                  <th>Leads</th>
                  <th>Won</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {sourceTableData.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{textAlign: 'center', padding: '24px', color: '#718096'}}>
                      No lead sources recorded yet.
                    </td>
                  </tr>
                ) : (
                  sourceTableData.map(row => (
                    <tr key={row.source}>
                      <td><span className="font-600">{row.source}</span></td>
                      <td>{row.leads}</td>
                      <td><span className="success-text font-600">{row.won}</span></td>
                      <td>₹ {row.revenue} L</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

