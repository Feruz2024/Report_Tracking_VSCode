import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/api';

function AccountantDashboardSummary({ onNavigateTab }) {
  const [summary, setSummary] = useState({ activeCampaigns: 0, closedCampaigns: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaignSummary = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/accountant-campaigns/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const campaigns = await response.json();
        
        const active = campaigns.filter(c => c.status === 'ACTIVE').length;
        const closed = campaigns.filter(c => c.status === 'CLOSED').length;
        
        setSummary({ activeCampaigns: active, closedCampaigns: closed });
        setError('');
      } catch (err) {
        setError('Failed to fetch accountant dashboard summary. Please try again later.');
        console.error("Error fetching accountant dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignSummary();
  }, []);

  if (loading) {
    return <p>Loading dashboard summary...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="dashboard-summary">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Accountant Dashboard</h2>
      <div className="summary-cards">
        <div className="summary-card" onClick={() => onNavigateTab ? onNavigateTab('campaign_summary') : null}>
          <h3>Active Campaigns</h3>
          <p className="count">{summary.activeCampaigns}</p>
        </div>
        <div className="summary-card" onClick={() => onNavigateTab ? onNavigateTab('campaign_summary') : null}>
          <h3>Closed Campaigns</h3>
          <p className="count">{summary.closedCampaigns}</p>
        </div>
        {/* Add more cards as needed, e.g., for upcoming deadlines or financial summaries */}
      </div>
    </div>
  );
}

export default AccountantDashboardSummary;
