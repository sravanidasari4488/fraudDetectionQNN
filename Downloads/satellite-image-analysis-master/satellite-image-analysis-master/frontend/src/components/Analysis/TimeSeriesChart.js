import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import './TimeSeriesChart.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function TimeSeriesChart({ location }) {
  const { themes } = useTheme();
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  
  // Get theme colors for charts
  const borderColor = themes.colors.border || '#e5e7eb';
  const textSecondaryColor = themes.colors.textSecondary || '#64748b';
  const surfaceColor = themes.colors.surface || '#ffffff';
  const textColor = themes.colors.text || '#1e293b';

  useEffect(() => {
    if (location) {
      fetchTimeSeries();
    }
  }, [location]);

  const fetchTimeSeries = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/time-series`, {
        location: location,
        buffer_radius_km: 2.0,
        interval_years: 1
      });
      
      setTimeSeriesData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch time-series data');
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return (
      <div className="time-series-container">
        <div className="time-series-placeholder">
          <span className="chart-icon">📊</span>
          <p>Enter a location to view time-series analysis</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="time-series-container">
        <div className="time-series-loading">
          <span className="spinner"></span>
          <p>Analyzing historical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-series-container">
        <div className="time-series-error">
          <span>⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (!timeSeriesData || !timeSeriesData.time_series || timeSeriesData.time_series.length === 0) {
    return (
      <div className="time-series-container">
        <div className="time-series-placeholder">
          <span className="chart-icon">📊</span>
          <p>No time-series data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = timeSeriesData.time_series.map(item => ({
    year: item.year,
    Urban: item.land_cover.urban,
    Forest: item.land_cover.forest,
    Vegetation: item.land_cover.vegetation,
    Water: item.land_cover.water
  }));

  const changes = timeSeriesData.changes || {};

  return (
    <div className="time-series-container">
      <div className="time-series-header">
        <h2 className="time-series-title">
          <span className="chart-icon">📊</span>
          Time-Series Analysis
        </h2>
        <div className="chart-controls">
          <button
            className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            Line Chart
          </button>
          <button
            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {changes.period_years && (
        <div className="changes-summary">
          <h3>Changes Over {changes.period_years} Years</h3>
          <div className="changes-grid">
            <div className="change-item">
              <span className="change-label">Urban:</span>
              <span className={`change-value ${changes.urban_change > 0 ? 'positive' : 'negative'}`}>
                {changes.urban_change > 0 ? '+' : ''}{changes.urban_change.toFixed(1)}%
              </span>
            </div>
            <div className="change-item">
              <span className="change-label">Forest:</span>
              <span className={`change-value ${changes.forest_change > 0 ? 'positive' : 'negative'}`}>
                {changes.forest_change > 0 ? '+' : ''}{changes.forest_change.toFixed(1)}%
              </span>
            </div>
            <div className="change-item">
              <span className="change-label">Vegetation:</span>
              <span className={`change-value ${changes.vegetation_change > 0 ? 'positive' : 'negative'}`}>
                {changes.vegetation_change > 0 ? '+' : ''}{changes.vegetation_change.toFixed(1)}%
              </span>
            </div>
            <div className="change-item">
              <span className="change-label">Water:</span>
              <span className={`change-value ${changes.water_change > 0 ? 'positive' : 'negative'}`}>
                {changes.water_change > 0 ? '+' : ''}{changes.water_change.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                dataKey="year" 
                stroke={textSecondaryColor}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={textSecondaryColor}
                style={{ fontSize: '12px' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: surfaceColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color: textColor
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Urban" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="Forest" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Vegetation" stroke="#84cc16" strokeWidth={2} />
              <Line type="monotone" dataKey="Water" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                dataKey="year" 
                stroke={textSecondaryColor}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={textSecondaryColor}
                style={{ fontSize: '12px' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: surfaceColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  color: textColor
                }}
              />
              <Legend />
              <Bar dataKey="Urban" fill="#8b5cf6" />
              <Bar dataKey="Forest" fill="#10b981" />
              <Bar dataKey="Vegetation" fill="#84cc16" />
              <Bar dataKey="Water" fill="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="time-series-info">
        <p>
          <strong>Period:</strong> {timeSeriesData.start_date} to {timeSeriesData.end_date}
        </p>
        <p>
          <strong>Interval:</strong> {timeSeriesData.interval_years} year(s)
        </p>
      </div>
    </div>
  );
}

export default TimeSeriesChart;

