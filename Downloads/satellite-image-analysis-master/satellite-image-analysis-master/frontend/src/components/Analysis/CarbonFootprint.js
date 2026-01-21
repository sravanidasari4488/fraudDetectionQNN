import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CarbonFootprint.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CarbonFootprint({ location }) {
  const [carbonData, setCarbonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      fetchCarbonData();
    }
  }, [location]);

  const fetchCarbonData = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/carbon-footprint`, {
        location: location,
        buffer_radius_km: 2.0
      });
      
      setCarbonData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate carbon footprint');
    } finally {
      setLoading(false);
    }
  };

  const formatRupees = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  if (!location) {
    return (
      <div className="carbon-container">
        <div className="carbon-placeholder">
          <span className="carbon-icon">🌱</span>
          <p>Enter a location to calculate carbon footprint</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="carbon-container">
        <div className="carbon-loading">
          <span className="spinner"></span>
          <p>Calculating carbon impact...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carbon-container">
        <div className="carbon-error">
          <span>⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (!carbonData) {
    return null;
  }

  const { carbon_analysis } = carbonData;
  const netImpact = carbon_analysis.net_carbon_impact;
  const isCarbonSink = netImpact.co2_per_year > 0;

  return (
    <div className="carbon-container">
      <div className="carbon-header">
        <h2 className="carbon-title">
          <span className="carbon-icon">🌱</span>
          Carbon Footprint Analysis
        </h2>
      </div>

      <div className="carbon-summary">
        <div className={`carbon-status-card ${isCarbonSink ? 'sink' : 'emitter'}`}>
          <div className="status-icon">{isCarbonSink ? '🌳' : '🏭'}</div>
          <div className="status-content">
            <div className="status-label">Net Carbon Impact</div>
            <div className="status-value">
              {netImpact.co2_per_year > 0 ? '+' : ''}{netImpact.co2_per_year.toFixed(2)} tonnes CO₂/year
            </div>
            <div className="status-type">{netImpact.status}</div>
          </div>
          <div className="status-value-rupees">
            {formatRupees(Math.abs(netImpact.value_rupees_per_year))}/year
          </div>
        </div>
      </div>

      <div className="carbon-details">
        <div className="carbon-section">
          <h3 className="section-title">🌲 Carbon Sequestration</h3>
          <div className="carbon-grid">
            <div className="carbon-item">
              <div className="carbon-item-label">Forest</div>
              <div className="carbon-item-value">
                +{carbon_analysis.carbon_sequestration.forest_co2_per_year.toFixed(2)} t CO₂/year
              </div>
              <div className="carbon-item-rupees">
                {formatRupees(carbon_analysis.carbon_sequestration.value_rupees_per_year * 
                  (carbon_analysis.carbon_sequestration.forest_co2_per_year / 
                   carbon_analysis.carbon_sequestration.total_sequestration_co2_per_year))}
              </div>
            </div>
            <div className="carbon-item">
              <div className="carbon-item-label">Vegetation</div>
              <div className="carbon-item-value">
                +{carbon_analysis.carbon_sequestration.vegetation_co2_per_year.toFixed(2)} t CO₂/year
              </div>
              <div className="carbon-item-rupees">
                {formatRupees(carbon_analysis.carbon_sequestration.value_rupees_per_year * 
                  (carbon_analysis.carbon_sequestration.vegetation_co2_per_year / 
                   carbon_analysis.carbon_sequestration.total_sequestration_co2_per_year))}
              </div>
            </div>
            <div className="carbon-item total">
              <div className="carbon-item-label">Total Sequestration</div>
              <div className="carbon-item-value">
                +{carbon_analysis.carbon_sequestration.total_sequestration_co2_per_year.toFixed(2)} t CO₂/year
              </div>
              <div className="carbon-item-rupees">
                {formatRupees(carbon_analysis.carbon_sequestration.value_rupees_per_year)}/year
              </div>
            </div>
          </div>
        </div>

        <div className="carbon-section">
          <h3 className="section-title">🏭 Carbon Emissions</h3>
          <div className="carbon-grid">
            <div className="carbon-item emitter">
              <div className="carbon-item-label">Urban Areas</div>
              <div className="carbon-item-value">
                {carbon_analysis.carbon_emissions.urban_co2_per_year.toFixed(2)} t CO₂/year
              </div>
              <div className="carbon-item-rupees">
                {formatRupees(carbon_analysis.carbon_emissions.cost_rupees_per_year)}/year
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="carbon-info">
        <p>
          <strong>Analysis Area:</strong> {carbon_analysis.area_km2} km² ({carbon_analysis.area_hectares} hectares)
        </p>
        <p>
          <strong>Carbon Credit Rate:</strong> ₹{carbon_analysis.carbon_credit_rate_rupees_per_tonne} per tonne CO₂
        </p>
        <p className="methodology">
          <em>{carbon_analysis.methodology}</em>
        </p>
      </div>
    </div>
  );
}

export default CarbonFootprint;

