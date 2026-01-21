import React, { useState } from 'react';
import axios from 'axios';
import './AIInsights.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AIInsights({ location, landCover, weatherData, climateRisks, airQuality, urbanisationRisk }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use direct location-based analysis (no Sentinel-2 required)
      const response = await axios.post(`${API_URL}/ai-insights`, {
        location: location,
        use_satellite_data: false  // Use Gemini directly without Sentinel-2
      });
      
      setInsights(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return (
      <div className="ai-insights-container">
        <div className="ai-insights-placeholder">
          <span className="ai-icon">🤖</span>
          <p>Enter a location to get AI-powered insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-container">
      <div className="ai-insights-header">
        <h2 className="ai-insights-title">
          <span className="ai-icon">🤖</span>
          AI-Powered Insights
        </h2>
        <button 
          onClick={fetchInsights} 
          className="generate-insights-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Generating...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Insights
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="ai-insights-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {insights && (
        <div className="ai-insights-content">
          <div className="insights-meta">
            <span className="model-badge">Powered by Gemini 2.5 Flash</span>
            <span className="insights-date">
              Generated: {new Date(insights.generated_at).toLocaleString()}
            </span>
          </div>
          
          <div className="insights-text">
            {insights.insights.split('\n').map((paragraph, index) => {
              if (!paragraph.trim()) return null;
              
              // Format headings
              if (paragraph.match(/^\d+\.\s+[A-Z]/)) {
                return (
                  <h3 key={index} className="insights-heading">
                    {paragraph}
                  </h3>
                );
              }
              
              // Format bullet points
              if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                return (
                  <div key={index} className="insights-bullet">
                    {paragraph}
                  </div>
                );
              }
              
              return (
                <p key={index} className="insights-paragraph">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {!insights && !loading && (
        <div className="ai-insights-prompt">
          <p>Click "Generate Insights" to get AI-powered analysis and recommendations</p>
        </div>
      )}
    </div>
  );
}

export default AIInsights;

