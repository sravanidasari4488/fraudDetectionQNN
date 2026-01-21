# Google Maps Integration Setup

This project includes Google Maps for **visualization only** (reference imagery). Google Maps data is **NOT** used for any analysis or statistics.

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create credentials (API Key)
5. Restrict the API key to:
   - **Application restrictions**: HTTP referrers (web sites)
   - **API restrictions**: Maps JavaScript API only

### 2. Configure Environment Variable

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Restart Development Server

After adding the environment variable, restart your React development server:

```bash
npm start
```

## Features

- **Satellite View**: High-resolution satellite imagery
- **Road Labels**: Street names and labels overlaid on satellite view
- **Interactive Map**: Zoom, pan, and explore the locality
- **Marker**: Red marker indicates the selected locality location
- **Reference Imagery Only**: Clearly labeled as visualization/reference only

## Component Usage

The `GoogleMaps` component is automatically integrated into the Analysis page. It appears in the "Satellite View" tab after an analysis is completed.

### Props

- `lat` (number): Latitude of the location
- `lon` (number): Longitude of the location  
- `localityName` (string, optional): Name of the locality for the marker

## Error Handling

If the API key is missing or invalid, the component will display a clear error message instead of crashing the application.

## Important Notes

⚠️ **STRICT RULE**: Google Maps is used **ONLY** for visualization. It is **NOT** used for:
- Land cover classification
- Analysis calculations
- Statistics generation
- Any data processing

The map is clearly labeled as "Reference Imagery" to make this distinction clear to users.



