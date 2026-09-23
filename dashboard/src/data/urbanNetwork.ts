// urbanNetwork.ts - Tamil Nadu Urban Simulation Corridor
// Comprehensive digital twin network: nodes, primary & secondary road grid, urban parcels, and 3D buildings

export interface NetworkNode {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  type: 'intersection' | 'hospital' | 'entry_exit';
}

// 1. Geographic Network Nodes (Tamil Nadu Corridor: Anna Salai / Bharathi Nagar Rd)
export const URBAN_NODES: Record<string, NetworkNode> = {
  J1: {
    id: 'J1',
    name: 'Junction 1 (West Feeder)',
    coords: [80.2341, 13.0418],
    type: 'intersection',
  },
  J2: {
    id: 'J2',
    name: 'Junction 2 (Central Hub)',
    coords: [80.2450, 13.0425],
    type: 'intersection',
  },
  J3: {
    id: 'J3',
    name: 'Junction 3 (Hospital Gateway)',
    coords: [80.2562, 13.0431],
    type: 'intersection',
  },
  J4: {
    id: 'J4',
    name: 'Junction 4 (South Sector)',
    coords: [80.2448, 13.0315],
    type: 'intersection',
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    name: 'Govt Multi Super Speciality Hospital',
    coords: [80.2680, 13.0440],
    type: 'hospital',
  },
  // Entry / Exit Feeders
  ENTRY_W: { id: 'ENTRY_W', name: 'West Gate Inflow', coords: [80.2240, 13.0414], type: 'entry_exit' },
  EXIT_W: { id: 'EXIT_W', name: 'West Gate Outflow', coords: [80.2240, 13.0414], type: 'entry_exit' },

  ENTRY_J1_N: { id: 'ENTRY_J1_N', name: 'J1 North Inflow', coords: [80.2341, 13.0490], type: 'entry_exit' },
  EXIT_J1_N: { id: 'EXIT_J1_N', name: 'J1 North Outflow', coords: [80.2341, 13.0490], type: 'entry_exit' },

  ENTRY_J1_S: { id: 'ENTRY_J1_S', name: 'J1 South Inflow', coords: [80.2341, 13.0345], type: 'entry_exit' },
  EXIT_J1_S: { id: 'EXIT_J1_S', name: 'J1 South Outflow', coords: [80.2341, 13.0345], type: 'entry_exit' },

  ENTRY_J2_N: { id: 'ENTRY_J2_N', name: 'J2 North Inflow', coords: [80.2450, 13.0500], type: 'entry_exit' },
  EXIT_J2_N: { id: 'EXIT_J2_N', name: 'J2 North Outflow', coords: [80.2450, 13.0500], type: 'entry_exit' },

  ENTRY_J3_N: { id: 'ENTRY_J3_N', name: 'J3 North Inflow', coords: [80.2562, 13.0505], type: 'entry_exit' },
  EXIT_J3_N: { id: 'EXIT_J3_N', name: 'J3 North Outflow', coords: [80.2562, 13.0505], type: 'entry_exit' },

  ENTRY_J3_S: { id: 'ENTRY_J3_S', name: 'J3 South Inflow', coords: [80.2562, 13.0355], type: 'entry_exit' },
  EXIT_J3_S: { id: 'EXIT_J3_S', name: 'J3 South Outflow', coords: [80.2562, 13.0355], type: 'entry_exit' },

  ENTRY_J4_S: { id: 'ENTRY_J4_S', name: 'J4 South Inflow', coords: [80.2448, 13.0230], type: 'entry_exit' },
  EXIT_J4_S: { id: 'EXIT_J4_S', name: 'J4 South Outflow', coords: [80.2448, 13.0230], type: 'entry_exit' },

  ENTRY_J4_E: { id: 'ENTRY_J4_E', name: 'J4 East Inflow', coords: [80.2540, 13.0315], type: 'entry_exit' },
  EXIT_J4_E: { id: 'EXIT_J4_E', name: 'J4 East Outflow', coords: [80.2540, 13.0315], type: 'entry_exit' },

  ENTRY_J4_W: { id: 'ENTRY_J4_W', name: 'J4 West Inflow', coords: [80.2355, 13.0315], type: 'entry_exit' },
  EXIT_J4_W: { id: 'EXIT_J4_W', name: 'J4 West Outflow', coords: [80.2355, 13.0315], type: 'entry_exit' },
};

// 2. Primary Simulation Road Geometries
export interface RoadGeometry {
  id: string;
  name: string;
  from: string;
  to: string;
  coordinates: [number, number][];
  length_m: number;
}

export const ROAD_GEOMETRIES: Record<string, RoadGeometry> = {
  // Main East-West Corridor (Anna Salai / Bharathi Nagar Rd)
  ROAD_J1_J2: {
    id: 'ROAD_J1_J2',
    name: 'Anna Salai (J1 → J2)',
    from: 'J1',
    to: 'J2',
    coordinates: [
      [80.2341, 13.0418],
      [80.2378, 13.0420],
      [80.2414, 13.0422],
      [80.2450, 13.0425],
    ],
    length_m: 450,
  },
  ROAD_J2_J1: {
    id: 'ROAD_J2_J1',
    name: 'Anna Salai (J2 → J1)',
    from: 'J2',
    to: 'J1',
    coordinates: [
      [80.2450, 13.0425],
      [80.2414, 13.0422],
      [80.2378, 13.0420],
      [80.2341, 13.0418],
    ],
    length_m: 450,
  },
  ROAD_J2_J3: {
    id: 'ROAD_J2_J3',
    name: 'Bharathi Nagar Rd (J2 → J3)',
    from: 'J2',
    to: 'J3',
    coordinates: [
      [80.2450, 13.0425],
      [80.2486, 13.0427],
      [80.2524, 13.0429],
      [80.2562, 13.0431],
    ],
    length_m: 400,
  },
  ROAD_J3_J2: {
    id: 'ROAD_J3_J2',
    name: 'Bharathi Nagar Rd (J3 → J2)',
    from: 'J3',
    to: 'J2',
    coordinates: [
      [80.2562, 13.0431],
      [80.2524, 13.0429],
      [80.2486, 13.0427],
      [80.2450, 13.0425],
    ],
    length_m: 400,
  },
  ROAD_J3_HOSP: {
    id: 'ROAD_J3_HOSP',
    name: 'Hospital Link Rd (J3 → Hospital)',
    from: 'J3',
    to: 'HOSPITAL',
    coordinates: [
      [80.2562, 13.0431],
      [80.2600, 13.0434],
      [80.2640, 13.0437],
      [80.2680, 13.0440],
    ],
    length_m: 300,
  },
  ROAD_HOSP_J3: {
    id: 'ROAD_HOSP_J3',
    name: 'Hospital Link Rd (Hospital → J3)',
    from: 'HOSPITAL',
    to: 'J3',
    coordinates: [
      [80.2680, 13.0440],
      [80.2640, 13.0437],
      [80.2600, 13.0434],
      [80.2562, 13.0431],
    ],
    length_m: 300,
  },
  // North-South link between J2 and J4
  ROAD_J2_J4: {
    id: 'ROAD_J2_J4',
    name: 'Ponniyalur Link (J2 → J4)',
    from: 'J2',
    to: 'J4',
    coordinates: [
      [80.2450, 13.0425],
      [80.2449, 13.0385],
      [80.2448, 13.0345],
      [80.2448, 13.0315],
    ],
    length_m: 350,
  },
  ROAD_J4_J2: {
    id: 'ROAD_J4_J2',
    name: 'Ponniyalur Link (J4 → J2)',
    from: 'J4',
    to: 'J2',
    coordinates: [
      [80.2448, 13.0315],
      [80.2448, 13.0345],
      [80.2449, 13.0385],
      [80.2450, 13.0425],
    ],
    length_m: 350,
  },
  // West Inflow / Outflow (Coimbatore Rd)
  IN_J1_W: {
    id: 'IN_J1_W',
    name: 'Coimbatore Rd Inflow',
    from: 'ENTRY_W',
    to: 'J1',
    coordinates: [
      [80.2240, 13.0414],
      [80.2290, 13.0416],
      [80.2341, 13.0418],
    ],
    length_m: 300,
  },
  OUT_J1_W: {
    id: 'OUT_J1_W',
    name: 'Coimbatore Rd Outflow',
    from: 'J1',
    to: 'EXIT_W',
    coordinates: [
      [80.2341, 13.0418],
      [80.2290, 13.0416],
      [80.2240, 13.0414],
    ],
    length_m: 300,
  },
  // J1 North/South (Avinashi Rd)
  IN_J1_N: {
    id: 'IN_J1_N',
    name: 'Avinashi Rd to J1',
    from: 'ENTRY_J1_N',
    to: 'J1',
    coordinates: [[80.2341, 13.0490], [80.2341, 13.0418]],
    length_m: 250,
  },
  OUT_J1_N: {
    id: 'OUT_J1_N',
    name: 'Avinashi Rd from J1',
    from: 'J1',
    to: 'EXIT_J1_N',
    coordinates: [[80.2341, 13.0418], [80.2341, 13.0490]],
    length_m: 250,
  },
  IN_J1_S: {
    id: 'IN_J1_S',
    name: 'Feeder South to J1',
    from: 'ENTRY_J1_S',
    to: 'J1',
    coordinates: [[80.2341, 13.0345], [80.2341, 13.0418]],
    length_m: 250,
  },
  OUT_J1_S: {
    id: 'OUT_J1_S',
    name: 'Feeder from J1 South',
    from: 'J1',
    to: 'EXIT_J1_S',
    coordinates: [[80.2341, 13.0418], [80.2341, 13.0345]],
    length_m: 250,
  },
  // J2 North (Mount Rd)
  IN_J2_N: {
    id: 'IN_J2_N',
    name: 'Mount Rd to J2',
    from: 'ENTRY_J2_N',
    to: 'J2',
    coordinates: [[80.2450, 13.0500], [80.2450, 13.0425]],
    length_m: 250,
  },
  OUT_J2_N: {
    id: 'OUT_J2_N',
    name: 'Mount Rd from J2',
    from: 'J2',
    to: 'EXIT_J2_N',
    coordinates: [[80.2450, 13.0425], [80.2450, 13.0500]],
    length_m: 250,
  },
  // J3 North/South
  IN_J3_N: {
    id: 'IN_J3_N',
    name: 'Kamarajar Rd to J3',
    from: 'ENTRY_J3_N',
    to: 'J3',
    coordinates: [[80.2562, 13.0505], [80.2562, 13.0431]],
    length_m: 250,
  },
  OUT_J3_N: {
    id: 'OUT_J3_N',
    name: 'Kamarajar Rd from J3',
    from: 'J3',
    to: 'EXIT_J3_N',
    coordinates: [[80.2562, 13.0431], [80.2562, 13.0505]],
    length_m: 250,
  },
  IN_J3_S: {
    id: 'IN_J3_S',
    name: 'Gandhi Rd to J3',
    from: 'ENTRY_J3_S',
    to: 'J3',
    coordinates: [[80.2562, 13.0355], [80.2562, 13.0431]],
    length_m: 250,
  },
  OUT_J3_S: {
    id: 'OUT_J3_S',
    name: 'Gandhi Rd from J3',
    from: 'J3',
    to: 'EXIT_J3_S',
    coordinates: [[80.2562, 13.0431], [80.2562, 13.0355]],
    length_m: 250,
  },
  // J4 South/East/West
  IN_J4_S: {
    id: 'IN_J4_S',
    name: 'South Sector Inflow',
    from: 'ENTRY_J4_S',
    to: 'J4',
    coordinates: [[80.2448, 13.0230], [80.2448, 13.0315]],
    length_m: 250,
  },
  OUT_J4_S: {
    id: 'OUT_J4_S',
    name: 'South Sector Outflow',
    from: 'J4',
    to: 'EXIT_J4_S',
    coordinates: [[80.2448, 13.0315], [80.2448, 13.0230]],
    length_m: 250,
  },
  IN_J4_E: {
    id: 'IN_J4_E',
    name: 'Industrial Rd to J4',
    from: 'ENTRY_J4_E',
    to: 'J4',
    coordinates: [[80.2540, 13.0315], [80.2448, 13.0315]],
    length_m: 250,
  },
  OUT_J4_E: {
    id: 'OUT_J4_E',
    name: 'Industrial Rd from J4',
    from: 'J4',
    to: 'EXIT_J4_E',
    coordinates: [[80.2448, 13.0315], [80.2540, 13.0315]],
    length_m: 250,
  },
  IN_J4_W: {
    id: 'IN_J4_W',
    name: 'Bypass Rd to J4',
    from: 'ENTRY_J4_W',
    to: 'J4',
    coordinates: [[80.2355, 13.0315], [80.2448, 13.0315]],
    length_m: 250,
  },
  OUT_J4_W: {
    id: 'OUT_J4_W',
    name: 'Bypass Rd from J4',
    from: 'J4',
    to: 'EXIT_J4_W',
    coordinates: [[80.2448, 13.0315], [80.2355, 13.0315]],
    length_m: 250,
  },
};

// 3. Roundabout Geometry at Junction 3 (Hospital Gateway Roundabout matching reference)
export const ROUNDABOUT_J3_GEOJSON: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: { id: 'ROUNDABOUT_J3', name: 'Hospital Gateway Roundabout' },
  geometry: {
    type: 'LineString',
    coordinates: Array.from({ length: 33 }).map((_, i) => {
      const angle = (i / 32) * Math.PI * 2;
      const rLng = 0.00065;
      const rLat = 0.00055;
      return [80.2562 + Math.cos(angle) * rLng, 13.0431 + Math.sin(angle) * rLat];
    }),
  },
};

// 4. Secondary Urban Street Network (Creates realistic city blocks and cross streets)
export function generateSecondaryRoads(): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

  // Parallel north service lane
  features.push({
    type: 'Feature',
    properties: { id: 'SEC_N_CORRIDOR', name: 'North Service Ring' },
    geometry: {
      type: 'LineString',
      coordinates: [
        [80.2240, 13.0465],
        [80.2341, 13.0468],
        [80.2450, 13.0470],
        [80.2562, 13.0472],
        [80.2680, 13.0475],
      ],
    },
  });

  // Parallel south service lane
  features.push({
    type: 'Feature',
    properties: { id: 'SEC_S_CORRIDOR', name: 'South Service Ring' },
    geometry: {
      type: 'LineString',
      coordinates: [
        [80.2240, 13.0375],
        [80.2341, 13.0378],
        [80.2450, 13.0380],
        [80.2562, 13.0382],
        [80.2680, 13.0385],
      ],
    },
  });

  // Cross streets connecting North and South
  const crossLngs = [80.2285, 80.2395, 80.2505, 80.2615];
  crossLngs.forEach((lng, idx) => {
    features.push({
      type: 'Feature',
      properties: { id: `CROSS_${idx + 1}`, name: `Sector ${idx + 1} Crossway` },
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng, 13.0495],
          [lng, 13.0350],
        ],
      },
    });
  });

  return { type: 'FeatureCollection', features };
}

// 5. Urban Parcels / City Ground Blocks (Gives structure to the ground beneath buildings)
export function generateUrbanParcels(): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];

  // Define city blocks bordered by the roads
  const parcelDefs = [
    // North blocks
    [80.2245, 13.0428, 80.2335, 13.0460, '#09101E'],
    [80.2347, 13.0428, 80.2390, 13.0462, '#0B1324'],
    [80.2400, 13.0429, 80.2444, 13.0465, '#09101E'],
    [80.2456, 13.0432, 80.2500, 13.0468, '#0E172B'],
    [80.2510, 13.0433, 80.2556, 13.0468, '#0B1324'],
    [80.2568, 13.0437, 80.2610, 13.0470, '#09101E'],
    [80.2620, 13.0442, 80.2675, 13.0472, '#0B1324'],

    // South blocks
    [80.2245, 13.0380, 80.2335, 13.0408, '#0B1324'],
    [80.2347, 13.0382, 80.2390, 13.0410, '#09101E'],
    [80.2400, 13.0384, 80.2444, 13.0412, '#0E172B'],
    [80.2456, 13.0385, 80.2500, 13.0415, '#0B1324'],
    [80.2510, 13.0386, 80.2556, 13.0418, '#09101E'],
    [80.2568, 13.0388, 80.2610, 13.0422, '#0B1324'],
    [80.2620, 13.0390, 80.2675, 13.0426, '#09101E'],

    // Hospital Campus Boundary Parcel
    [80.2665, 13.0420, 80.2715, 13.0465, '#101A2F'],
  ];

  parcelDefs.forEach(([minLng, minLat, maxLng, maxLat, color], i) => {
    features.push({
      type: 'Feature',
      id: `parcel-${i}`,
      properties: { color },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [minLng as number, minLat as number],
            [maxLng as number, minLat as number],
            [maxLng as number, maxLat as number],
            [minLng as number, maxLat as number],
            [minLng as number, minLat as number],
          ],
        ],
      },
    });
  });

  return { type: 'FeatureCollection', features };
}

// 6. Realistic 3D Extruded City Buildings (Densely packed along the street corridors with depth and shadows)
export function generate3DBuildings(): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];

  let seed = 1337;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // High-density urban blocks immediately flanking the roads
  // [minLng, minLat, maxLng, maxLat, cols, rows, baseHeight]
  const streetBlocks: [number, number, number, number, number, number, number][] = [
    // 1. North strip of Coimbatore Rd (West Feeder to J1)
    [80.2245, 13.0426, 80.2335, 13.0460, 6, 3, 32],

    // 2. North strip of Anna Salai (J1 to J2)
    [80.2348, 13.0428, 80.2442, 13.0464, 7, 3, 44],

    // 3. North strip of Bharathi Nagar Rd (J2 to J3 - Major Commercial Strip)
    [80.2458, 13.0433, 80.2555, 13.0468, 7, 3, 58],

    // 4. North strip of Hospital Link (J3 to Hospital)
    [80.2570, 13.0438, 80.2660, 13.0470, 6, 3, 36],

    // 5. South strip of Coimbatore Rd
    [80.2245, 13.0380, 80.2335, 13.0406, 6, 2, 28],

    // 6. South strip of Anna Salai (J1 to J2)
    [80.2348, 13.0382, 80.2442, 13.0410, 7, 2, 38],

    // 7. South strip of Bharathi Nagar Rd (J2 to J3)
    [80.2458, 13.0385, 80.2555, 13.0415, 7, 2, 48],

    // 8. South strip of Hospital Link
    [80.2570, 13.0388, 80.2660, 13.0420, 6, 2, 34],

    // 9. West flank of J2-J4 corridor (Ponniyalur Link)
    [80.2370, 13.0325, 80.2435, 13.0375, 4, 3, 30],

    // 10. East flank of J2-J4 corridor
    [80.2460, 13.0325, 80.2525, 13.0375, 4, 3, 32],

    // 11. South Sector J4 Surroundings
    [80.2370, 13.0245, 80.2525, 13.0305, 7, 3, 26],
  ];

  let idCounter = 1;

  // Dark slate digital twin palette matching reference image
  const buildingPalette = [
    '#131F35', // dark navy slate
    '#172642', // steel slate
    '#1B2E4E', // illuminated facade
    '#101A2C', // deep shadow block
    '#15233B', // structural cyan tint
    '#192945', // charcoal slate
  ];

  streetBlocks.forEach(([minLng, minLat, maxLng, maxLat, cols, rows, baseH]) => {
    const stepLng = (maxLng - minLng) / cols;
    const stepLat = (maxLat - minLat) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Leave occasional courtyard or alleyway
        if (rnd() > 0.88) continue;

        // Realistic footprint with street setbacks
        const padLng = stepLng * 0.12;
        const padLat = stepLat * 0.12;
        const bLng = minLng + c * stepLng + padLng;
        const bLat = minLat + r * stepLat + padLat;
        const bW = stepLng - padLng * 2;
        const bH = stepLat - padLat * 2;

        // Height variation: landmark towers vs standard blocks
        const isTower = rnd() > 0.85;
        const isMidRise = rnd() > 0.55;
        const heightMultiplier = isTower ? 1.8 + rnd() * 0.5 : isMidRise ? 1.2 + rnd() * 0.3 : 0.75 + rnd() * 0.3;
        const height = Math.round(baseH * heightMultiplier);

        const color = buildingPalette[Math.floor(rnd() * buildingPalette.length)];

        features.push({
          type: 'Feature',
          id: `bld-${idCounter++}`,
          properties: {
            id: `bld-${idCounter}`,
            height: Math.max(14, height),
            base_height: 0,
            color: color,
            name: isTower ? 'Commercial Tower' : 'Urban Block',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [bLng, bLat],
                [bLng + bW, bLat],
                [bLng + bW, bLat + bH],
                [bLng, bLat + bH],
                [bLng, bLat],
              ],
            ],
          },
        });
      }
    }
  });

  // Dedicated Government Hospital Medical Complex Buildings (Distinctive multi-pavilion 3D structure)
  const hospLng = 80.2680;
  const hospLat = 13.0440;

  // Emergency & Trauma Center (Front Pavilion)
  features.push({
    type: 'Feature',
    id: 'hosp-emergency',
    properties: {
      id: 'hosp-emergency',
      height: 46,
      base_height: 0,
      color: '#1E2C48',
      name: 'Emergency & Trauma Pavilion',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [hospLng + 0.0003, hospLat - 0.0008],
          [hospLng + 0.0016, hospLat - 0.0008],
          [hospLng + 0.0016, hospLat + 0.0006],
          [hospLng + 0.0003, hospLat + 0.0006],
          [hospLng + 0.0003, hospLat - 0.0008],
        ],
      ],
    },
  });

  // Multi-Speciality Inpatient Tower
  features.push({
    type: 'Feature',
    id: 'hosp-main-tower',
    properties: {
      id: 'hosp-main-tower',
      height: 68,
      base_height: 0,
      color: '#182742',
      name: 'Main Hospital Inpatient Tower',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [hospLng + 0.0007, hospLat + 0.0008],
          [hospLng + 0.0022, hospLat + 0.0008],
          [hospLng + 0.0022, hospLat + 0.0020],
          [hospLng + 0.0007, hospLat + 0.0020],
          [hospLng + 0.0007, hospLat + 0.0008],
        ],
      ],
    },
  });

  // Surgical Sciences Wing
  features.push({
    type: 'Feature',
    id: 'hosp-surgical',
    properties: {
      id: 'hosp-surgical',
      height: 38,
      base_height: 0,
      color: '#142036',
      name: 'Surgical Sciences Wing',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [hospLng + 0.0018, hospLat - 0.0006],
          [hospLng + 0.0028, hospLat - 0.0006],
          [hospLng + 0.0028, hospLat + 0.0006],
          [hospLng + 0.0018, hospLat + 0.0006],
          [hospLng + 0.0018, hospLat - 0.0006],
        ],
      ],
    },
  });

  return { type: 'FeatureCollection', features };
}

// 7. Utility: Interpolate [lng, lat] coordinate along a road geometry given position_m
export function interpolateRoadPosition(
  roadId: string,
  position_m: number
): { coords: [number, number]; bearing: number } {
  const road = ROAD_GEOMETRIES[roadId];
  if (!road || !road.coordinates || road.coordinates.length < 2) {
    return { coords: [80.2341, 13.0418], bearing: 0 };
  }

  const coords = road.coordinates;
  const ratio = Math.max(0, Math.min(1, position_m / (road.length_m || 300)));

  if (coords.length === 2) {
    const lng = coords[0][0] + (coords[1][0] - coords[0][0]) * ratio;
    const lat = coords[0][1] + (coords[1][1] - coords[0][1]) * ratio;
    const bearing = calculateBearing(coords[0], coords[1]);
    return { coords: [lng, lat], bearing };
  }

  const numSegments = coords.length - 1;
  const segIndex = Math.min(Math.floor(ratio * numSegments), numSegments - 1);
  const segRatio = ratio * numSegments - segIndex;

  const p1 = coords[segIndex];
  const p2 = coords[segIndex + 1];

  const lng = p1[0] + (p2[0] - p1[0]) * segRatio;
  const lat = p1[1] + (p2[1] - p1[1]) * segRatio;
  const bearing = calculateBearing(p1, p2);

  return { coords: [lng, lat], bearing };
}

function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const dLng = (p2[0] - p1[0]) * Math.cos(((p1[1] + p2[1]) * Math.PI) / 360);
  const dLat = p2[1] - p1[1];
  const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  return (angle + 360) % 360;
}

// 8. Static GeoJSON Exports
export const URBAN_ROADS_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: 'FeatureCollection',
  features: Object.values(ROAD_GEOMETRIES).map((r) => ({
    type: 'Feature',
    id: r.id,
    properties: {
      id: r.id,
      name: r.name,
      length_m: r.length_m,
    },
    geometry: {
      type: 'LineString',
      coordinates: r.coordinates,
    },
  })),
};

export const SECONDARY_ROADS_GEOJSON = generateSecondaryRoads();
export const URBAN_PARCELS_GEOJSON = generateUrbanParcels();
export const URBAN_BUILDINGS_GEOJSON = generate3DBuildings();

export const ROAD_LABELS_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { label: 'Anna Salai Corridor' },
      geometry: { type: 'Point', coordinates: [80.2395, 13.0421] },
    },
    {
      type: 'Feature',
      properties: { label: 'Bharathi Nagar Rd' },
      geometry: { type: 'Point', coordinates: [80.2505, 13.0428] },
    },
    {
      type: 'Feature',
      properties: { label: 'Coimbatore Rd' },
      geometry: { type: 'Point', coordinates: [80.2285, 13.0415] },
    },
    {
      type: 'Feature',
      properties: { label: 'Hospital Road' },
      geometry: { type: 'Point', coordinates: [80.2625, 13.0436] },
    },
    {
      type: 'Feature',
      properties: { label: 'Avinashi Rd' },
      geometry: { type: 'Point', coordinates: [80.2341, 13.0458] },
    },
    {
      type: 'Feature',
      properties: { label: 'Ponniyalur Link Rd' },
      geometry: { type: 'Point', coordinates: [80.2449, 13.0370] },
    },
  ],
};
