import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/api'; // Corrected import

function AccountantCampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/accountant-campaigns/'); // Use authFetch
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCampaigns(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch campaign summary. Please try again later.');
        console.error("Error fetching accountant campaign summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <p>Loading campaign summary...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (campaigns.length === 0) {
    return <p>No active or closed campaigns found.</p>;
  }

  return (
    <div>
      <h3>Campaign Summary (Active & Closed)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Campaign Name</th>
            <th style={tableHeaderStyle}>Client</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Anticipated Completion</th>
            <th style={tableHeaderStyle}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => (
            <tr key={campaign.id} style={tableRowStyle}>
              <td style={tableCellStyle}>{campaign.name}</td>
              <td style={tableCellStyle}>{campaign.client_name}</td>
              <td style={tableCellStyle}>{campaign.status}</td>
              <td style={tableCellStyle}>{campaign.anticipated_campaign_completion_date ? new Date(campaign.anticipated_campaign_completion_date).toLocaleDateString() : 'N/A'}</td>
              <td style={tableCellStyle}>{new Date(campaign.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableHeaderStyle = {
  borderBottom: '2px solid #ddd',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: '#f9f9f9',
};

const tableRowStyle = {
  borderBottom: '1px solid #eee',
};

const tableCellStyle = {
  padding: '12px',
  textAlign: 'left',
};

export default AccountantCampaignList;
