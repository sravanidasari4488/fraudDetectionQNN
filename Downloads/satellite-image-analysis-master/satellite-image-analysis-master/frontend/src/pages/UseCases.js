import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/UI/ThemeToggle';
import './UseCases.css';

function UseCases() {
  const { themes } = useTheme();
  const useCases = [
    {
      id: 1,
      title: 'Land Cover Classification',
      icon: '🌍',
      description: 'Analyze and classify land cover types including urban areas, forests, vegetation, and water bodies using satellite imagery.',
      features: [
        'Real-time satellite image analysis',
        'Accurate land cover percentage calculation',
        'Support for multiple satellite sources (Sentinel-2, Dynamic World)',
        'Detailed classification reports'
      ],
      useCase: 'Urban planners, environmental researchers, and government agencies use this to monitor land use changes, plan infrastructure development, and assess environmental impact.'
    },
    {
      id: 2,
      title: 'Physical Feature Detection',
      icon: '🗺️',
      description: 'Automatically detect and mark physical features in satellite images including water bodies, vegetation patches, urban areas, and agricultural fields.',
      features: [
        'Water body detection using MNDWI',
        'Vegetation patch identification',
        'Urban area mapping',
        'Agricultural field detection'
      ],
      useCase: 'Useful for disaster management, agricultural monitoring, urban planning, and environmental conservation. Helps identify critical infrastructure and natural resources.'
    },
    {
      id: 3,
      title: 'Crop Suitability Analysis',
      icon: '🌾',
      description: 'Get AI-powered crop recommendations based on regional climate, soil conditions, and land cover analysis using Google Gemini API.',
      features: [
        'AI-powered crop recommendations',
        'Climate-based suitability scoring',
        'Season-specific growing advice',
        'Yield potential estimation'
      ],
      useCase: 'Farmers and agricultural consultants can use this to make informed decisions about crop selection, optimize agricultural productivity, and plan seasonal farming activities.'
    },
    {
      id: 4,
      title: 'Urbanisation Risk Assessment',
      icon: '🏙️',
      description: 'Calculate Urbanisation Risk Score (URS) to assess the impact of urban development on natural resources and infrastructure.',
      features: [
        'Comprehensive URS calculation',
        'Risk level classification (Low, Moderate, High, Critical)',
        'Population density analysis',
        'Infrastructure stress assessment'
      ],
      useCase: 'City planners, policy makers, and environmental agencies use this to evaluate urban sprawl, plan sustainable development, and mitigate environmental risks.'
    },
    {
      id: 5,
      title: 'Climate Risk Assessment',
      icon: '🌡️',
      description: 'Assess climate-related risks including flood, heat, and drought risks based on weather data and land cover characteristics.',
      features: [
        'Flood risk assessment',
        'Heat island effect analysis',
        'Drought vulnerability evaluation',
        'Weather alert integration'
      ],
      useCase: 'Emergency management teams, insurance companies, and urban planners use this to prepare for climate events, assess vulnerability, and develop mitigation strategies.'
    },
    {
      id: 6,
      title: 'Air Quality Monitoring',
      icon: '🌬️',
      description: 'Monitor air quality indicators including PM2.5, PM10, NO₂, SO₂, CO, and O₃ with health advisories and US AQI standards.',
      features: [
        'Real-time air quality data',
        'US EPA AQI standards',
        'Health advisory recommendations',
        'Pollutant breakdown analysis'
      ],
      useCase: 'Public health officials, environmental agencies, and citizens use this to monitor air pollution levels, make health decisions, and track environmental quality trends.'
    },
    {
      id: 7,
      title: 'Disaster Management',
      icon: '🚨',
      description: 'Track natural disasters and weather alerts in real-time to support emergency response and disaster preparedness.',
      features: [
        'Real-time disaster alerts',
        'Weather warning system',
        'Distance-based risk assessment',
        'Severity classification'
      ],
      useCase: 'Emergency response teams, disaster management agencies, and local governments use this to coordinate responses, issue warnings, and protect communities.'
    },
    {
      id: 8,
      title: 'Environmental Monitoring',
      icon: '🌿',
      description: 'Monitor environmental changes over time including deforestation, water body changes, and vegetation health.',
      features: [
        'Time-series analysis',
        'Change detection',
        'Vegetation health monitoring',
        'Water resource tracking'
      ],
      useCase: 'Conservation organizations, environmental researchers, and government agencies use this to track ecosystem health, monitor conservation efforts, and enforce environmental regulations.'
    }
  ];

  return (
    <div className="use-cases-page">
      <div className="use-cases-container">
        <header className="use-cases-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1 }}>
              <h1 className="use-cases-title">
                <span className="use-cases-icon">💡</span>
                Use Cases
              </h1>
              <p className="use-cases-subtitle">
                Discover how our Geospatial Intelligence System can help solve real-world problems
              </p>
            </div>
            <ThemeToggle />
          </div>
          <Link to="/" className="back-link">
            ← Back to Analysis
          </Link>
        </header>

        <div className="use-cases-grid">
          {useCases.map((useCase) => (
            <div key={useCase.id} className="use-case-card">
              <div className="use-case-header">
                <span className="use-case-icon">{useCase.icon}</span>
                <h2 className="use-case-title">{useCase.title}</h2>
              </div>
              
              <p className="use-case-description">{useCase.description}</p>
              
              <div className="use-case-features">
                <h3 className="features-title">Key Features:</h3>
                <ul className="features-list">
                  {useCase.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="use-case-application">
                <h3 className="application-title">Real-World Application:</h3>
                <p className="application-text">{useCase.useCase}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="use-cases-footer">
          <h2 className="footer-title">Ready to Get Started?</h2>
          <p className="footer-text">
            Start analyzing your region today and unlock insights from satellite imagery and geospatial data.
          </p>
          <Link to="/" className="cta-button">
            Start Analysis →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UseCases;

