import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EconomicImpact.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function EconomicImpact({ location, population }) {
  const [economicData, setEconomicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      fetchEconomicData();
    }
  }, [location, population]);

  const fetchEconomicData = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/economic-impact`, {
        location: location,
        buffer_radius_km: 2.0,
        population: population
      });
      
      setEconomicData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate economic impact');
    } finally {
      setLoading(false);
    }
  };

  const formatRupees = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)} K`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  if (!location) {
    return (
      <div className="economic-container">
        <div className="economic-placeholder">
          <span className="economic-icon">💰</span>
          <p>Enter a location to calculate economic impact</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="economic-container">
        <div className="economic-loading">
          <span className="spinner"></span>
          <p>Calculating economic impact...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="economic-container">
        <div className="economic-error">
          <span>⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (!economicData) {
    return null;
  }

  const { economic_analysis } = economicData;

  return (
    <div className="economic-container">
      <div className="economic-header">
        <h2 className="economic-title">
          <span className="economic-icon">💰</span>
          Economic Impact Analysis
        </h2>
        <div className="currency-badge">INR (Indian Rupees)</div>
      </div>

      <div className="economic-summary">
        <div className="total-value-card">
          <div className="total-label">Total Economic Value</div>
          <div className="total-value">
            {formatRupees(economic_analysis.total_economic_value_rupees)}
          </div>
          <div className="total-subtitle">Annual Economic Potential</div>
        </div>
      </div>

      <div className="economic-details">
        <div className="economic-section">
          <h3 className="section-title">🏘️ Property Values</h3>
          <div className="economic-grid">
            <div className="economic-item">
              <div className="economic-item-label">Urban Property</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.property_values_rupees.urban_property_value)}
              </div>
            </div>
            <div className="economic-item">
              <div className="economic-item-label">Forest Land</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.property_values_rupees.forest_property_value)}
              </div>
            </div>
            <div className="economic-item">
              <div className="economic-item-label">Vegetation Land</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.property_values_rupees.vegetation_property_value)}
              </div>
            </div>
            <div className="economic-item">
              <div className="economic-item-label">Water Bodies</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.property_values_rupees.water_property_value)}
              </div>
            </div>
            <div className="economic-item highlight">
              <div className="economic-item-label">Total Property Value</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.property_values_rupees.total_property_value)}
              </div>
            </div>
            <div className="economic-item premium">
              <div className="economic-item-label">Green Space Premium</div>
              <div className="economic-item-value">
                +{formatRupees(economic_analysis.property_values_rupees.green_space_premium)}
              </div>
              <div className="economic-item-note">Additional value from green space</div>
            </div>
          </div>
        </div>

        <div className="economic-section">
          <h3 className="section-title">🏖️ Tourism Potential (Annual)</h3>
          <div className="economic-grid">
            <div className="economic-item">
              <div className="economic-item-label">Forest Tourism</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.tourism_potential_rupees_per_year.forest_tourism)}/year
              </div>
            </div>
            <div className="economic-item">
              <div className="economic-item-label">Water Tourism</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.tourism_potential_rupees_per_year.water_tourism)}/year
              </div>
            </div>
            <div className="economic-item">
              <div className="economic-item-label">Vegetation Tourism</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.tourism_potential_rupees_per_year.vegetation_tourism)}/year
              </div>
            </div>
            <div className="economic-item">
              <div className="economic-item-label">Urban Tourism</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.tourism_potential_rupees_per_year.urban_tourism)}/year
              </div>
            </div>
            <div className="economic-item highlight">
              <div className="economic-item-label">Total Tourism Potential</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.tourism_potential_rupees_per_year.total_tourism_potential)}/year
              </div>
            </div>
          </div>
        </div>

        <div className="economic-section">
          <h3 className="section-title">🌾 Agricultural & Health Benefits</h3>
          <div className="economic-grid">
            <div className="economic-item">
              <div className="economic-item-label">Agricultural Productivity</div>
              <div className="economic-item-value">
                {formatRupees(economic_analysis.agricultural_potential_rupees_per_year)}/year
              </div>
              <div className="economic-item-note">Based on vegetation area</div>
            </div>
            {economic_analysis.health_cost_savings_rupees_per_year && (
              <div className="economic-item health">
                <div className="economic-item-label">Health Cost Savings</div>
                <div className="economic-item-value">
                  {formatRupees(economic_analysis.health_cost_savings_rupees_per_year)}/year
                </div>
                <div className="economic-item-note">
                  Savings from green space (Population: {population?.toLocaleString('en-IN') || 'N/A'})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="economic-info">
        <p>
          <strong>Analysis Area:</strong> {economic_analysis.area_km2} km²
        </p>
        <p>
          <strong>Land Cover:</strong> Urban {economic_analysis.land_cover_breakdown.urban_km2} km², 
          Forest {economic_analysis.land_cover_breakdown.forest_km2} km², 
          Vegetation {economic_analysis.land_cover_breakdown.vegetation_km2} km², 
          Water {economic_analysis.land_cover_breakdown.water_km2} km²
        </p>
        <p className="methodology">
          <em>{economic_analysis.methodology}</em>
        </p>
      </div>
    </div>
  );
}

export default EconomicImpact;

