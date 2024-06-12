import * as React from 'react';
import {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import Map, {Popup, Source, Layer} from 'react-map-gl';
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const countryData = {
  BRA: {name: 'Brazil', rooms: 50},
  USA: {name: 'United States', rooms: 80},
  CAN: {name: 'Canada', rooms: 30},
  FRA: {name: 'France', rooms: 40},
  CHN: {name: 'China', rooms: 60},
  IND: {name: 'India', rooms: 70},
  RUS: {name: 'Russia', rooms: 50},
  AUS: {name: 'Australia', rooms: 20},
  ZAF: {name: 'South Africa', rooms: 30},
  ARG: {name: 'Argentina', rooms: 40},
  MEX: {name: 'Mexico', rooms: 35},
  GTM: {name: 'Guatemala', rooms: 15},
  BLZ: {name: 'Belize', rooms: 10},
  HND: {name: 'Honduras', rooms: 20},
  NIC: {name: 'Nicaragua', rooms: 12},
  CRI: {name: 'Costa Rica', rooms: 18},
  PAN: {name: 'Panama', rooms: 22}
};

const continents = {
  'North America': {
    name: 'North America',
    countries: ['USA', 'CAN', 'MEX']
  },
  'Central America': {
    name: 'Central America',
    countries: ['GTM', 'BLZ', 'HND', 'NIC', 'CRI', 'PAN']
  },
  'South America': {name: 'South America', countries: ['BRA', 'ARG']},
  'Europe': {name: 'Europe', countries: ['FRA', 'RUS']},
  'Africa': {name: 'Africa', countries: ['ZAF']},
  'Asia': {name: 'Asia', countries: ['CHN', 'IND', 'RUS']},
  'Oceania': {name: 'Oceania', countries: ['AUS']},
};

export default function App() {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedContinent, setSelectedContinent] = useState('All Continents');
  const [viewState, setViewState] = useState({
    latitude: 30,
    longitude: 0,
    zoom: 1.5
  });

  const onHover = useCallback((event) => {
    const country = event.features && event.features[0];

    setHoverInfo((selectedContinent === "All Continents") && country && countryColors[country.properties.ISO_A3] ? {
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      countryCode: country.properties.ISO_A3,
      countryName: countryData[country.properties.ISO_A3].name,
      rooms: countryData[country.properties.ISO_A3].rooms,
    } : undefined);
  }, []);

  const onContinentChange = (event) => {
    const selected = event.target.value;
    setSelectedContinent(selected);

  };

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#fd7d7d', '#FFA500', '#A52A2A', '#DEB887', '#18b9bb'
  ];

  const assignColors = (countries, colors) => {

    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    const countryColors = {};

    countries.forEach((country, index) => {
      countryColors[country] = shuffledColors[index];
    });


    return countryColors;
  };

  const countryCodes = [
    'BRA', 'USA', 'CAN', 'FRA', 'CHN', 'IND', 'RUS', 'AUS', 'ZAF', 'ARG',
    'MEX', 'GTM', 'BLZ', 'HND', 'NIC', 'CRI', 'PAN'
  ];

  const [countryColors, setCountryColors] = useState(assignColors(countryCodes, colors));

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);


    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [selectedCountries, setSelectedCountries] = useState(Object.keys(countryColors));

  const fillStyle = {
    id: 'fill',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'ISO_A3'],
        ...selectedCountries.reduce(
          (acc, code) => selectedContinent === 'All Continents' || continents[selectedContinent].countries.includes(code) ? [...acc, code, hexToRgba(countryColors[code], 0.5)] : acc,
          []
        ),
        'rgba(255, 255, 255, 1)',
      ],
      'fill-opacity': 1,
      'fill-outline-color': [
        'match',
        ['get', 'ISO_A3'],
        ...selectedCountries.reduce(
          (acc, code) => selectedContinent === 'All Continents' || continents[selectedContinent].countries.includes(code) ? [...acc, code, countryColors[code]] : acc,
          []
        ),
        '#888888',
      ],
    },
  };

  const highlightStyle = {
    id: 'highlight',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'ISO_A3'],
        hoverInfo && (selectedContinent === 'All Continents' || continents[selectedContinent].countries.includes(hoverInfo.countryCode)) ? hoverInfo.countryCode : '',
        hoverInfo && (selectedContinent === 'All Continents' || continents[selectedContinent].countries.includes(hoverInfo.countryCode)) ? hexToRgba(countryColors[hoverInfo.countryCode], 0.8) : 'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 1)',
      ],
      'fill-opacity': 1,
    },
    filter: ['==', 'ISO_A3', hoverInfo && (selectedContinent === 'All Continents' || continents[selectedContinent].countries.includes(hoverInfo.countryCode)) ? hoverInfo.countryCode : ''],
  };

  function refreshData() {
    setViewState({
      latitude: 30,
      longitude: 0,
      zoom: 1.5
    });
    setSelectedContinent('All Continents');
    const countryColors2 = assignColors(countryCodes, colors);
    setCountryColors(countryColors2);
    console.log(Object.keys(countryColors2));
    setSelectedCountries(Object.keys(countryColors2))

  }

  return (
    <>
      <div style={{display: 'flex', gap: '5px', paddingBottom: '10px'}}>
        <button onClick={refreshData}>Refresh data</button>

        <select onChange={onContinentChange} value={selectedContinent}>
          <option value="All Continents">All Continents</option>
          {Object.keys(continents).map((continent) => (
            <option key={continent} value={continent}>{continent}</option>
          ))}
        </select>
      </div>

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{height: '100%', width: '100%', borderRadius: '3px', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.9)'}}
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        onMouseMove={onHover}
        interactiveLayerIds={['fill']}
        renderAll ContinentsCopies={false}
        attributionControl={false}
      >
        <Source type="geojson" data="/countries.geojson">
          <Layer {...fillStyle} />
          {hoverInfo && <Layer {...highlightStyle} />}
        </Source>
        {hoverInfo && (selectedContinent === 'All Continents' || continents[selectedContinent].countries.includes(hoverInfo.countryCode)) && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            offset={[60, 100]}
            closeButton={false}
            className="country-info"
            style={{display: 'flow'}}
          >
            <div>
              <strong>{hoverInfo.countryName}</strong><br/>
              Rooms: {hoverInfo.rooms}
            </div>
          </Popup>
        )}
      </Map>
    </>
  );
};

export function renderToDom(container) {
  createRoot(container).render(<App/>);
}
