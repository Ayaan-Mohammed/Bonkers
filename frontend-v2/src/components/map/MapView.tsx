import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl,
  Popup,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import type { Feature, FeatureCollection, Polygon, Point, LineString } from 'geojson';
import type {
  Parcel,
  ZonesGeoJSON,
  UtilityGeoJSON,
  ZoneFeatureProperties,
  UtilityFeatureProperties,
} from '@/types';
import { Badge } from '@/components/common/Badge';
import { Layers, Map as MapIcon, Satellite, Eye, EyeOff } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tile layer URLs (free, no API key)
// ---------------------------------------------------------------------------

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_ATTR =
  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS Community';

// ---------------------------------------------------------------------------
// Styling helpers
// ---------------------------------------------------------------------------

const ZONE_COLORS: Record<string, string> = {
  agricultural: '#4ade80',
  residential: '#60a5fa',
  commercial: '#f59e0b',
  industrial: '#a78bfa',
  green: '#34d399',
};

const UTILITY_COLORS: Record<string, string> = {
  water: '#38bdf8',
  sewer: '#a78bfa',
  power: '#fbbf24',
  road: '#94a3b8',
};

// Highlighted parcel style (amber, thick border)
const activeParcelStyle: L.PathOptions = {
  color: '#e7ae59',
  weight: 3,
  fillColor: '#e7ae59',
  fillOpacity: 0.18,
  dashArray: undefined,
};

// Neighboring parcel style (faint, thin)
const neighborParcelStyle: L.PathOptions = {
  color: '#9BA0C2',
  weight: 1.5,
  fillColor: '#9BA0C2',
  fillOpacity: 0.06,
  dashArray: '4 4',
};

// Zone overlay style
const zoneStyle = (feature: Feature | undefined): L.PathOptions => {
  const zoneType = (feature?.properties as ZoneFeatureProperties | undefined)?.zone_type ?? '';
  return {
    color: ZONE_COLORS[zoneType] ?? '#888',
    weight: 1.5,
    fillColor: ZONE_COLORS[zoneType] ?? '#888',
    fillOpacity: 0.12,
    dashArray: '6 3',
  };
};

// ---------------------------------------------------------------------------
// FitBounds helper component
// ---------------------------------------------------------------------------

const FitToParcel: React.FC<{ geom: Feature<Polygon> }> = ({ geom }) => {
  const map = useMap();
  useEffect(() => {
    try {
      const geoJsonLayer = L.geoJSON(geom);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
      }
    } catch {
      // silently fail if geometry is malformed
    }
  }, [geom, map]);
  return null;
};

// ---------------------------------------------------------------------------
// MapView component
// ---------------------------------------------------------------------------

export interface MapViewProps {
  /** The primary/active parcel to highlight */
  parcel: Parcel;
  /** All other parcels to render as neighbors (lighter styling) */
  neighbors?: Parcel[];
  /** Master plan zones layer */
  zonesGeoJSON?: ZonesGeoJSON | null;
  /** Utility infrastructure layer */
  utilityGeoJSON?: UtilityGeoJSON | null;
  /** Height class */
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  parcel,
  neighbors = [],
  zonesGeoJSON,
  utilityGeoJSON,
  className = 'h-[520px]',
}) => {
  const [showZones, setShowZones] = useState(false);
  const [showUtility, setShowUtility] = useState(false);

  // Compute center from parcel geometry for initial map position
  const center = useMemo<[number, number]>(() => {
    try {
      const coords = parcel.geom.geometry.coordinates[0];
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      return [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
    } catch {
      return [20.5937, 78.9629]; // India centroid fallback
    }
  }, [parcel]);

  // Area variance calculation
  const variancePct =
    parcel.area_recorded_sqm && parcel.area_gis_sqm
      ? Math.abs(
          ((parcel.area_gis_sqm - parcel.area_recorded_sqm) / parcel.area_recorded_sqm) * 100
        )
      : 0;
  const hasVariance = variancePct > 2.0;

  return (
    <div className="relative">
      {/* Map Layer Toggle Controls (overlaid on top of the map) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setShowZones(!showZones)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono shadow-lg backdrop-blur-md transition-all ${
            showZones
              ? 'bg-emerald-500/90 text-white border border-emerald-400'
              : 'bg-[#1a1610]/90 text-nlip-text-soft border border-nlip-border hover:border-nlip-amber hover:text-nlip-amber'
          }`}
          title="Toggle Master Plan Zones overlay"
        >
          {showZones ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>Zones</span>
        </button>

        <button
          type="button"
          onClick={() => setShowUtility(!showUtility)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono shadow-lg backdrop-blur-md transition-all ${
            showUtility
              ? 'bg-sky-500/90 text-white border border-sky-400'
              : 'bg-[#1a1610]/90 text-nlip-text-soft border border-nlip-border hover:border-nlip-amber hover:text-nlip-amber'
          }`}
          title="Toggle Utility Infrastructure overlay"
        >
          {showUtility ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>Utilities</span>
        </button>
      </div>

      {/* Area Variance Callout Badge (overlaid bottom-left) */}
      {hasVariance && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="px-3 py-2 rounded-lg bg-amber-900/90 border border-amber-600/60 text-xs font-mono text-amber-200 shadow-lg backdrop-blur-md">
            ⚠ Area Variance: <strong>{variancePct.toFixed(1)}%</strong> (
            {parcel.area_recorded_sqm?.toLocaleString()} m² recorded vs{' '}
            {parcel.area_gis_sqm?.toLocaleString()} m² GIS)
          </div>
        </div>
      )}

      {/* Parcel Info Badge (overlaid top-left) */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="px-3 py-2 rounded-lg bg-[#1a1610]/90 border border-nlip-border text-xs font-mono text-nlip-text shadow-lg backdrop-blur-md max-w-[220px]">
          <div className="text-nlip-amber font-bold">{parcel.ulpin}</div>
          <div className="text-nlip-text-soft text-[10px]">
            {parcel.village_name}, {parcel.district_name} [{parcel.state_code}]
          </div>
          <div className="text-nlip-text-faint text-[10px] mt-0.5 capitalize">
            {parcel.land_use_type} · {parcel.source.replace('_', ' ')}
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={16}
        className={`${className} rounded-nlip-sm border border-nlip-border overflow-hidden`}
        zoomControl={true}
        attributionControl={true}
        style={{ background: '#17140f' }}
      >
        {/* Basemap toggle via LayersControl */}
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer url={OSM_URL} attribution={OSM_ATTR} />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTR} />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Auto-fit bounds to parcel polygon */}
        <FitToParcel geom={parcel.geom} />

        {/* Neighboring parcels (lighter, behind) */}
        {neighbors.map((n) => (
          <GeoJSON
            key={n.id}
            data={n.geom}
            style={neighborParcelStyle}
            onEachFeature={(_feature, layer) => {
              layer.bindPopup(
                `<div style="font-family:monospace;font-size:11px;">
                  <strong style="color:#9BA0C2;">${n.ulpin}</strong><br/>
                  ${n.village_name ?? ''}, ${n.district_name ?? ''}<br/>
                  <span style="opacity:0.7">${n.land_use_type}</span>
                </div>`
              );
            }}
          />
        ))}

        {/* Active parcel polygon (highlighted) */}
        <GeoJSON
          key={`active-${parcel.id}`}
          data={parcel.geom}
          style={activeParcelStyle}
          onEachFeature={(_feature, layer) => {
            layer.bindPopup(
              `<div style="font-family:monospace;font-size:11px;">
                <strong style="color:#e7ae59;">◈ ${parcel.ulpin}</strong><br/>
                ${parcel.village_name ?? ''}, ${parcel.district_name ?? ''}<br/>
                Area: ${parcel.area_recorded_sqm?.toLocaleString() ?? '—'} m²<br/>
                GIS: ${parcel.area_gis_sqm?.toLocaleString() ?? '—'} m²
                ${hasVariance ? `<br/><span style="color:#fbbf24">⚠ Variance: ${variancePct.toFixed(1)}%</span>` : ''}
              </div>`
            );
          }}
        />

        {/* Zones overlay */}
        {showZones && zonesGeoJSON && (
          <GeoJSON
            key={`zones-${showZones}`}
            data={zonesGeoJSON}
            style={zoneStyle}
            onEachFeature={(feature, layer) => {
              const props = feature.properties as ZoneFeatureProperties;
              layer.bindPopup(
                `<div style="font-family:monospace;font-size:11px;">
                  <strong>Zone: ${props.zone_type}</strong><br/>
                  ${props.permissible_use ?? 'N/A'}<br/>
                  ${props.permissible_far ? `FAR: ${props.permissible_far}` : ''}
                </div>`
              );
            }}
          />
        )}

        {/* Utility overlay */}
        {showUtility && utilityGeoJSON && (
          <GeoJSON
            key={`utility-${showUtility}`}
            data={utilityGeoJSON}
            style={(feature) => {
              const props = feature?.properties as UtilityFeatureProperties | undefined;
              return {
                color: UTILITY_COLORS[props?.type ?? ''] ?? '#ccc',
                weight: 3,
                opacity: 0.8,
              };
            }}
            pointToLayer={(feature, latlng) => {
              const props = feature.properties as UtilityFeatureProperties;
              return L.circleMarker(latlng, {
                radius: 6,
                fillColor: UTILITY_COLORS[props.type] ?? '#ccc',
                color: '#fff',
                weight: 1.5,
                fillOpacity: 0.9,
              });
            }}
            onEachFeature={(feature, layer) => {
              const props = feature.properties as UtilityFeatureProperties;
              layer.bindPopup(
                `<div style="font-family:monospace;font-size:11px;">
                  <strong>${props.type.toUpperCase()}</strong><br/>
                  Status: ${props.status}
                </div>`
              );
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
