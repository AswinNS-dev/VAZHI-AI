import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useTrafficStore } from '../store/trafficStore';
import type { IntersectionData, ApproachData } from '../types/traffic';
import {
  URBAN_NODES,
  ROAD_GEOMETRIES,
  URBAN_ROADS_GEOJSON,
  URBAN_BUILDINGS_GEOJSON,
  ROUNDABOUT_J3_GEOJSON,
  interpolateRoadPosition,
} from '../data/urbanNetwork';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  Layers,
  Siren,
  X,
  Crosshair,
} from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

mapboxgl.accessToken = MAPBOX_TOKEN;

export const MapCenter: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const frame = useTrafficStore((s) => s.frame);
  const is3D = useTrafficStore((s) => s.is3D);
  const setIs3D = useTrafficStore((s) => s.setIs3D);
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);
  const setSelectedVehicle = useTrafficStore((s) => s.setSelectedVehicle);

  const [equipmentTab, setEquipmentTab] = useState<'Equipment' | 'Control' | 'Comm'>('Equipment');
  const [isEquipmentVisible, setIsEquipmentVisible] = useState(true);

  // References for HTML map markers
  const junctionMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const haloMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const hospitalMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const vehicleMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const intersections = frame?.intersections || {};
  const roads = frame?.roads || {};
  const emergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);
  const activeCorridorRoads = new Set(emergencies.flatMap((e) => e.route_roads || []));
  const activeAmbulance = emergencies[0];

  const selectedJunction: IntersectionData | undefined = intersections[selectedJunctionId];
  const approaches = selectedJunction?.approaches || {};

  const getRoadColor = (occupancyPct: number) => {
    if (occupancyPct >= 85) return '#EF4444'; // Critical
    if (occupancyPct >= 70) return '#F97316'; // High
    if (occupancyPct >= 40) return '#F59E0B'; // Moderate
    return '#10B981'; // Free Flow
  };

  // 1. Initialize Mapbox GL 3D Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Real-world dark digital twin vector basemap
      center: [80.2480, 13.0415], // Central Tamil Nadu urban corridor
      zoom: 15.0,
      pitch: 58, // Angled 3D perspective camera (matching reference image)
      bearing: -22, // Tilted camera angle
      maxPitch: 75,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // A. Real-world 3D Extruded Buildings Layer from Mapbox global building footprints
      const layers = map.getStyle()?.layers || [];
      let labelLayerId: string | undefined;
      for (const l of layers) {
        if (l.type === 'symbol' && l.layout && (l.layout as any)['text-field']) {
          labelLayerId = l.id;
          break;
        }
      }

      if (!map.getLayer('3d-buildings-global')) {
        map.addLayer(
          {
            id: '3d-buildings-global',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#131F35',
                30, '#172744',
                80, '#1F3459',
                180, '#274270',
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                13.05, ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13, 0,
                13.05, ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.9,
            },
          },
          labelLayerId
        );
      }

      // B. Procedural High-Density Digital Twin 3D Buildings (surrounding corridor)
      if (!map.getSource('urban-buildings')) {
        map.addSource('urban-buildings', {
          type: 'geojson',
          data: URBAN_BUILDINGS_GEOJSON,
        });

        map.addLayer(
          {
            id: '3d-buildings-local',
            source: 'urban-buildings',
            type: 'fill-extrusion',
            paint: {
              'fill-extrusion-color': ['get', 'color'],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'base_height'],
              'fill-extrusion-opacity': 0.92,
            },
          },
          labelLayerId
        );
      }

      // C. Primary Urban Simulation Road Network Layers
      if (!map.getSource('urban-roads')) {
        map.addSource('urban-roads', {
          type: 'geojson',
          data: URBAN_ROADS_GEOJSON,
        });

        // Road Bed Outer Casing
        map.addLayer({
          id: 'road-bed-casing',
          type: 'line',
          source: 'urban-roads',
          paint: {
            'line-color': '#080E1B',
            'line-width': 22,
            'line-opacity': 1,
          },
        });

        // Road Surface Carriageway
        map.addLayer({
          id: 'road-bed-inner',
          type: 'line',
          source: 'urban-roads',
          paint: {
            'line-color': '#131E33',
            'line-width': 15,
            'line-opacity': 1,
          },
        });

        // Center Lane Dashes
        map.addLayer({
          id: 'road-lane-dashes',
          type: 'line',
          source: 'urban-roads',
          paint: {
            'line-color': '#2A3F64',
            'line-width': 1.8,
            'line-dasharray': [3, 4],
            'line-opacity': 0.85,
          },
        });
      }

      // D. Roundabout at Junction 3
      if (!map.getSource('roundabout-j3')) {
        map.addSource('roundabout-j3', {
          type: 'geojson',
          data: ROUNDABOUT_J3_GEOJSON,
        });

        map.addLayer({
          id: 'roundabout-bed',
          type: 'line',
          source: 'roundabout-j3',
          paint: {
            'line-color': '#131E33',
            'line-width': 18,
            'line-opacity': 1,
          },
        });

        map.addLayer({
          id: 'roundabout-ring',
          type: 'line',
          source: 'roundabout-j3',
          paint: {
            'line-color': '#F59E0B',
            'line-width': 3,
            'line-opacity': 0.85,
          },
        });
      }

      // E. Dynamic Traffic Congestion Overlays
      if (!map.getSource('traffic-roads')) {
        map.addSource('traffic-roads', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        // Traffic glow layer
        map.addLayer({
          id: 'traffic-glow',
          type: 'line',
          source: 'traffic-roads',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 14,
            'line-blur': 8,
            'line-opacity': 0.65,
          },
        });

        // Traffic core line
        map.addLayer({
          id: 'traffic-core',
          type: 'line',
          source: 'traffic-roads',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 5.5,
            'line-opacity': 0.98,
          },
        });
      }

      // F. Emergency Corridor Neon Glowing Path
      if (!map.getSource('emergency-corridor')) {
        map.addSource('emergency-corridor', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: 'emergency-corridor-glow',
          type: 'line',
          source: 'emergency-corridor',
          paint: {
            'line-color': '#EF4444',
            'line-width': 22,
            'line-blur': 10,
            'line-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'emergency-corridor-core',
          type: 'line',
          source: 'emergency-corridor',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 6,
            'line-opacity': 1,
          },
        });
      }

      // 3D Ambient Lighting for realistic building shadows and highlights
      try {
        map.setLight({
          anchor: 'viewport',
          color: '#B8CEEE',
          intensity: 0.45,
          position: [1.5, 90, 50],
        });
      } catch (e) {
        console.debug('Lighting ignored:', e);
      }

      // Setup Road Hover & Click handlers
      map.on('click', 'road-bed-inner', (e) => {
        if (e.features && e.features[0]) {
          const roadId = e.features[0].properties?.id;
          if (roadId) setSelectedRoadId(roadId);
        }
      });

      map.on('mouseenter', 'road-bed-inner', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0] && tooltipRef.current) {
          const props = e.features[0].properties;
          const roadId = props?.id;
          const roadData = roads[roadId];
          const occ = roadData?.occupancy_pct ?? 0;
          const speed = roadData?.speed_limit_kmh ?? 50;

          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${e.point.x + 15}px`;
          tooltipRef.current.style.top = `${e.point.y - 15}px`;
          tooltipRef.current.innerHTML = `
            <div style="font-weight: 800; color: #FFF; margin-bottom: 2px;">${props?.name || roadId}</div>
            <div style="color: #94A3B8; font-size: 10px;">ID: <strong style="color: #38BDF8;">${roadId}</strong></div>
            <div style="color: #94A3B8; font-size: 10px;">Occupancy: <strong style="color: ${getRoadColor(occ)};">${Math.round(occ)}%</strong></div>
            <div style="color: #94A3B8; font-size: 10px;">Vehicles: <strong style="color: #FFF;">${roadData?.vehicles?.length || 0}</strong> | Limit: ${speed} km/h</div>
          `;
        }
      });

      map.on('mousemove', 'road-bed-inner', (e) => {
        if (tooltipRef.current && tooltipRef.current.style.display === 'block') {
          tooltipRef.current.style.left = `${e.point.x + 15}px`;
          tooltipRef.current.style.top = `${e.point.y - 15}px`;
        }
      });

      map.on('mouseleave', 'road-bed-inner', () => {
        map.getCanvas().style.cursor = '';
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
      });
    });

    return () => {
      Object.values(junctionMarkersRef.current).forEach((m) => m.remove());
      Object.values(vehicleMarkersRef.current).forEach((m) => m.remove());
      if (haloMarkerRef.current) haloMarkerRef.current.remove();
      if (hospitalMarkerRef.current) hospitalMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle 2D / 3D Mode Toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (is3D) {
      map.easeTo({
        pitch: 58,
        bearing: -22,
        duration: 900,
      });
      if (map.getLayer('3d-buildings-global')) {
        map.setPaintProperty('3d-buildings-global', 'fill-extrusion-opacity', 0.9);
      }
      if (map.getLayer('3d-buildings-local')) {
        map.setPaintProperty('3d-buildings-local', 'fill-extrusion-opacity', 0.92);
      }
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 900,
      });
      if (map.getLayer('3d-buildings-global')) {
        map.setPaintProperty('3d-buildings-global', 'fill-extrusion-opacity', 0);
      }
      if (map.getLayer('3d-buildings-local')) {
        map.setPaintProperty('3d-buildings-local', 'fill-extrusion-opacity', 0);
      }
    }
  }, [is3D, mapLoaded]);

  // 3. Create or Update Static Markers (Junctions J1-J4, Roundabout Halo, Hospital)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Junction Markers: J1, J2, J3, J4
    ['J1', 'J2', 'J3', 'J4'].forEach((jId) => {
      const node = URBAN_NODES[jId];
      if (!node) return;

      const inter = intersections[jId];
      const currentPhase = inter?.current_phase || 'ALL_RED';
      const isSelected = selectedJunctionId === jId;
      const signals = inter?.signals || { NORTH: 'RED', SOUTH: 'RED', EAST: 'RED', WEST: 'RED' };

      let marker = junctionMarkersRef.current[jId];

      if (!marker) {
        const el = document.createElement('div');
        el.className = 'junction-marker-3d';
        el.id = `marker-${jId}`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedJunctionId(jId);
          map.flyTo({
            center: node.coords,
            zoom: 16.2,
            pitch: is3D ? 60 : 0,
            duration: 900,
          });
        });

        marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(node.coords)
          .addTo(map);

        junctionMarkersRef.current[jId] = marker;
      }

      // Update marker DOM content
      const el = marker.getElement();
      const phaseColor = currentPhase.includes('GREEN') ? '#10B981' : currentPhase.includes('YELLOW') ? '#F59E0B' : '#EF4444';

      el.innerHTML = `
        <div class="junction-badge ${isSelected ? 'selected' : ''}">
          <span class="junction-phase-dot" style="background: ${phaseColor}; color: ${phaseColor};"></span>
          <span class="junction-id-text">${jId}</span>
        </div>
        <div class="signal-marker-3d">
          <span class="signal-led ${signals.NORTH === 'GREEN' ? 'active' : ''}" style="background: #10B981; color: #10B981;"></span>
          <span class="signal-led ${signals.EAST === 'YELLOW' ? 'active' : ''}" style="background: #F59E0B; color: #F59E0B;"></span>
          <span class="signal-led ${signals.SOUTH === 'RED' ? 'active' : ''}" style="background: #EF4444; color: #EF4444;"></span>
        </div>
      `;
    });

    // Roundabout Priority Halo at Junction 3 (matching reference image)
    if (!haloMarkerRef.current) {
      const haloEl = document.createElement('div');
      haloEl.className = 'junction-halo-ring';
      haloMarkerRef.current = new mapboxgl.Marker({ element: haloEl, anchor: 'center' })
        .setLngLat(URBAN_NODES.J3.coords)
        .addTo(map);
    }

    // Hospital POI 3D Marker
    if (!hospitalMarkerRef.current) {
      const hospEl = document.createElement('div');
      hospEl.className = 'hospital-marker-3d';
      hospEl.id = 'marker-hospital';
      hospEl.innerHTML = `
        <div class="hospital-cross-badge">+</div>
        <span class="hospital-label-text">Govt Hospital</span>
      `;
      hospEl.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedJunctionId('J3');
        map.flyTo({
          center: URBAN_NODES.HOSPITAL.coords,
          zoom: 16.2,
          pitch: is3D ? 60 : 0,
          duration: 900,
        });
      });

      hospitalMarkerRef.current = new mapboxgl.Marker({ element: hospEl, anchor: 'bottom' })
        .setLngLat(URBAN_NODES.HOSPITAL.coords)
        .addTo(map);
    }
  }, [mapLoaded, intersections, selectedJunctionId, is3D]);

  // 4. Update Dynamic Traffic Road Congestion Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('traffic-roads') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    Object.entries(roads).forEach(([roadId, road]) => {
      const geom = ROAD_GEOMETRIES[roadId];
      if (!geom) return;

      const occ = road.occupancy_pct || 0;
      const color = getRoadColor(occ);

      features.push({
        type: 'Feature',
        id: roadId,
        properties: {
          id: roadId,
          name: geom.name,
          occupancy: occ,
          color: color,
        },
        geometry: {
          type: 'LineString',
          coordinates: geom.coordinates,
        },
      });
    });

    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [mapLoaded, roads]);

  // 5. Update Glowing Emergency Corridor Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('emergency-corridor') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (!activeAmbulance || activeCorridorRoads.size === 0) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const corridorFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    activeCorridorRoads.forEach((rId) => {
      const geom = ROAD_GEOMETRIES[rId];
      if (geom) {
        corridorFeatures.push({
          type: 'Feature',
          properties: { id: rId, name: geom.name },
          geometry: {
            type: 'LineString',
            coordinates: geom.coordinates,
          },
        });
      }
    });

    source.setData({
      type: 'FeatureCollection',
      features: corridorFeatures,
    });
  }, [mapLoaded, activeAmbulance, activeCorridorRoads]);

  // 6. Real-time Vehicle Markers (Positioned along road geometry from simulation state)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const activeVehicleIds = new Set<string>();

    Object.entries(roads).forEach(([roadId, road]) => {
      (road.vehicles || []).forEach((v) => {
        activeVehicleIds.add(v.id);

        const { coords } = interpolateRoadPosition(roadId, v.position_m || 30);
        let marker = vehicleMarkersRef.current[v.id];

        if (!marker) {
          const el = document.createElement('div');
          el.id = `veh-${v.id}`;

          if (v.is_emergency) {
            el.className = 'ambulance-marker-3d';
            el.innerHTML = `<span>🚑</span><span class="ambulance-tag">${v.id.slice(-4).toUpperCase()}</span>`;
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              setSelectedVehicle(v);
              map.flyTo({ center: coords, zoom: 16.5, duration: 800 });
            });
          } else {
            el.className = 'vehicle-marker-3d';
            const icon = v.vehicle_type === 'BUS' ? '🚌' : v.vehicle_type === 'TRUCK' ? '🚛' : v.vehicle_type === 'BIKE' ? '🏍️' : '🚗';
            const bg = v.in_queue ? '#EF4444' : '#1E293B';
            el.innerHTML = `
              <div class="vehicle-icon-box" style="background: ${bg}; border: 1px solid ${v.in_queue ? '#F87171' : '#334155'};">
                ${icon}
              </div>
            `;
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              setSelectedVehicle(v);
            });
          }

          marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat(coords)
            .addTo(map);

          vehicleMarkersRef.current[v.id] = marker;
        } else {
          marker.setLngLat(coords);
          const el = marker.getElement();
          if (!v.is_emergency) {
            const iconBox = el.querySelector('.vehicle-icon-box') as HTMLElement | null;
            if (iconBox) {
              iconBox.style.background = v.in_queue ? '#EF4444' : '#1E293B';
              iconBox.style.borderColor = v.in_queue ? '#F87171' : '#334155';
            }
          }
        }
      });
    });

    // Remove vehicles that left the simulation network
    Object.keys(vehicleMarkersRef.current).forEach((vId) => {
      if (!activeVehicleIds.has(vId)) {
        vehicleMarkersRef.current[vId].remove();
        delete vehicleMarkersRef.current[vId];
      }
    });
  }, [mapLoaded, roads, setSelectedVehicle]);

  // Camera Actions
  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [80.2480, 13.0415],
      zoom: 15.0,
      pitch: is3D ? 58 : 0,
      bearing: is3D ? -22 : 0,
      duration: 1000,
    });
  };

  const handleCenterNetwork = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [80.2450, 13.0425],
      zoom: 15.4,
      duration: 800,
    });
  };

  return (
    <div className="map-workspace">
      {/* 3D WebGL Mapbox Canvas Container */}
      <div className="maplibre-wrapper">
        <div ref={mapContainerRef} className="maplibre-canvas-container" />
      </div>

      {/* Interactive Cyber Tooltip for road hover */}
      <div ref={tooltipRef} className="map-cyber-tooltip" style={{ display: 'none' }} />

      {/* Network Badge: Tamil Nadu Urban Simulation */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: isEquipmentVisible ? '300px' : '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(8, 14, 26, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #1E2D48',
          borderRadius: '20px',
          padding: '4px 12px',
          zIndex: 15,
          transition: 'left 0.25s ease',
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#F1F5F9', letterSpacing: '0.08em' }}>
          TAMIL NADU URBAN SIMULATION (3D DIGITAL TWIN)
        </span>
      </div>

      {/* Map Controls: 2D/3D toggle, Compass, Zoom, Center */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20,
        }}
      >
        {/* 2D / 3D Toggle Pill (3D DEFAULT) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(10, 16, 28, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '2px',
          }}
        >
          <button
            id="btn-map-2d"
            onClick={() => setIs3D(false)}
            style={{
              background: !is3D ? '#0284C7' : 'transparent',
              color: !is3D ? '#FFF' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '16px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            2D
          </button>
          <button
            id="btn-map-3d"
            onClick={() => setIs3D(true)}
            style={{
              background: is3D ? '#0284C7' : 'transparent',
              color: is3D ? '#FFF' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '16px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            3D
          </button>
        </div>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={handleResetView}
          title="Reset Perspective Camera"
        >
          <Compass size={15} color="#38BDF8" />
        </button>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={handleCenterNetwork}
          title="Center Network"
        >
          <Crosshair size={15} color="#38BDF8" />
        </button>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={() => mapRef.current?.zoomIn()}
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={() => mapRef.current?.zoomOut()}
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
      </div>

      {/* Floating Panel 1: Equipment / System Overview (Top-Left matching reference image) */}
      {isEquipmentVisible ? (
        <div
          className="floating-overlay-card"
          style={{ top: '16px', left: '16px', width: '270px', padding: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
              Tamil Nadu State Traffic Hub
            </h4>
            <button
              onClick={() => setIsEquipmentVisible(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Subheader Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {(['Equipment', 'Control', 'Comm'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEquipmentTab(t)}
                style={{
                  background: equipmentTab === t ? '#10B981' : 'transparent',
                  color: equipmentTab === t ? '#FFF' : '#64748B',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Grid Stats matching reference image */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>4 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 262</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Faulty Controllers</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#F59E0B' }}>8</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lamps Off</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>12 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 262</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lamp Faults</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>120 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 481</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Detectors Active</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>262 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 262</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Controllers</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>0</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Active Alarms</div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEquipmentVisible(true)}
          className="btn-pill btn-pill-dark"
          style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 15, fontSize: '11px' }}
        >
          <Layers size={13} /> Hub Equipment
        </button>
      )}

      {/* Floating Panel 2: Junction Telemetry Panel (Bottom Center matching reference image) */}
      <div
        className="floating-overlay-card"
        style={{
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          padding: '12px 16px',
        }}
      >
        {/* Header row: Junction Title, Phase Badge, Remaining seconds */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
              {selectedJunction?.name || `Junction ${selectedJunctionId}`}
            </h4>
            <div style={{ display: 'flex', gap: '3px' }}>
              {['J1', 'J2', 'J3', 'J4'].map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedJunctionId(id);
                    const node = URBAN_NODES[id];
                    if (node && mapRef.current) {
                      mapRef.current.flyTo({ center: node.coords, zoom: 16.0, duration: 800 });
                    }
                  }}
                  style={{
                    background: selectedJunctionId === id ? '#0284C7' : '#142036',
                    color: selectedJunctionId === id ? '#FFF' : '#64748B',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: '#10B981',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
              }}
            >
              {selectedJunction?.current_phase || 'WEST GREEN'}
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
              {selectedJunction?.time_remaining || 18}s remaining
            </span>
          </div>
        </div>

        {/* 4 Approach Columns (North, South, East, West) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {(['NORTH', 'SOUTH', 'EAST', 'WEST'] as const).map((dir) => {
            const app: ApproachData | undefined = approaches[dir];
            const occPct = app?.downstream_occupancy_pct || (dir === 'EAST' ? 81 : dir === 'NORTH' ? 68 : dir === 'WEST' ? 54 : 32);
            const vehCount = app?.vehicle_count || (dir === 'EAST' ? 12 : dir === 'NORTH' ? 10 : dir === 'WEST' ? 8 : 4);
            const queue = app?.queue_length || (dir === 'EAST' ? 5 : dir === 'NORTH' ? 3 : dir === 'WEST' ? 2 : 1);
            const maxWait = Math.round(app?.max_waiting_time || (dir === 'EAST' ? 76 : dir === 'NORTH' ? 42 : dir === 'WEST' ? 34 : 18));

            return (
              <div
                key={dir}
                style={{
                  background: 'rgba(19, 30, 53, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFF' }}>{dir}</span>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: app?.signal_color === 'GREEN' ? '#10B981' : app?.signal_color === 'YELLOW' ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Vehicles: <strong style={{ color: '#FFF' }}>{vehCount}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Queue: <strong style={{ color: '#FFF' }}>{queue}</strong>
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  Max Wait: <strong style={{ color: maxWait > 60 ? '#F59E0B' : '#FFF' }}>{maxWait}s</strong>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748B', marginBottom: '2px' }}>
                    <span>Occupancy</span>
                    <span style={{ color: occPct >= 80 ? '#EF4444' : '#38BDF8', fontWeight: 700 }}>{Math.round(occPct)}%</span>
                  </div>
                  <div style={{ height: '3px', background: '#0D1628', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${occPct}%`,
                        background: occPct >= 80 ? '#EF4444' : occPct >= 60 ? '#F97316' : '#10B981',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Panel 3: Active Emergency Corridor Stepper (Bottom Right matching reference image) */}
      {activeAmbulance && (
        <div
          className="floating-overlay-card glow-pulse-red"
          style={{
            bottom: '16px',
            right: '16px',
            width: '270px',
            padding: '12px',
            borderColor: 'rgba(239, 68, 68, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Siren size={15} color="#EF4444" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>
                {activeAmbulance.ambulance_id} – To Hospital
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 800, fontFamily: 'monospace' }}>
              {Math.floor(activeAmbulance.eta_seconds / 60)}:{Math.floor(activeAmbulance.eta_seconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>
            {activeAmbulance.route_display || 'J1 → J2 → J3 → Hospital'}
          </div>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {(activeAmbulance.intersections || ['J1', 'J2', 'J3']).map((jId) => {
              const status = activeAmbulance.prepared_intersections?.[jId]?.status || 'PREPARING';
              const isReady = status === 'READY' || status === 'PASSING';
              return (
                <div key={jId} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isReady ? '#10B981' : '#F59E0B',
                      margin: '0 auto 2px auto',
                      boxShadow: isReady ? '0 0 6px #10B981' : 'none',
                    }}
                  />
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#FFF' }}>{jId}</div>
                  <div style={{ fontSize: '8px', color: isReady ? '#34D399' : '#FBBF24' }}>{status}</div>
                </div>
              );
            })}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  margin: '0 auto 2px auto',
                  boxShadow: '0 0 8px #EF4444',
                }}
              />
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#FFF' }}>HOSPITAL</div>
              <div style={{ fontSize: '8px', color: '#38BDF8' }}>1.2 km</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCenter;
