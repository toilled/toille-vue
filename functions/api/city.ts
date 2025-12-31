// functions/api/city.ts
import { CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH, CELL_SIZE, GRID_SIZE, START_OFFSET } from '../../src/game/config';

export interface CityData {
  buildings: BuildingData[];
  floorTiles: FloorTileData[];
}

export interface FloorTileData {
  x: number;
  z: number;
  size: number;
}

export interface BuildingData {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  isLeaderboard: boolean;
  style: 'SIMPLE' | 'SPIRE' | 'TIERED' | 'GREEBLED';
  tiers?: TierData[];
  spire?: SpireData;
  greebles?: GreebleData[];
  antenna?: AntennaData;
  billboard?: BillboardData;
}

export interface TierData {
  width: number;
  height: number;
  depth: number;
  y: number;
}

export interface SpireData {
  width: number;
  height: number;
  depth: number;
  y: number;
}

export interface GreebleData {
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
}

export interface AntennaData {
  height: number;
  y: number;
}

export interface BillboardData {
    width: number;
    height: number;
    face: number; // 0, 1, 2, 3
    texIndex: number;
    offset: number;
    y: number;
}

export const onRequestGet = async () => {
    const cityData: CityData = {
        buildings: [],
        floorTiles: []
    };

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
            const isLeaderboardBuilding = x === 5 && z === 5;

            // 1. Floor Tile Logic
            if (!isLeaderboardBuilding && Math.random() > 0.8) {
                const floorSize = BLOCK_SIZE - 2;
                cityData.floorTiles.push({
                    x: START_OFFSET + x * CELL_SIZE,
                    z: START_OFFSET + z * CELL_SIZE,
                    size: floorSize
                });
                continue;
            }

            // 2. Building Generation
            const xPos = START_OFFSET + x * CELL_SIZE;
            const zPos = START_OFFSET + z * CELL_SIZE;

            let h = 40 + Math.random() * 120;
            let w = BLOCK_SIZE - 10 - Math.random() * 20;
            let d = BLOCK_SIZE - 10 - Math.random() * 20;

            if (isLeaderboardBuilding) {
                h = 250;
                w = BLOCK_SIZE - 10;
                d = BLOCK_SIZE - 10;
            }

            let style = "SIMPLE";
            if (!isLeaderboardBuilding) {
                const r = Math.random();
                if (r > 0.9) style = "SPIRE";
                else if (r > 0.7) style = "TIERED";
                else if (r > 0.5) style = "GREEBLED";
            }

            const building: BuildingData = {
                x: xPos,
                z: zPos,
                width: w,
                height: h,
                depth: d,
                isLeaderboard: isLeaderboardBuilding,
                style: style as any
            };

            // Style specifics
            if (style === "TIERED") {
                const tiers = 1 + Math.floor(Math.random() * 2);
                let currentH = h;
                let currentW = w;
                let currentD = d;
                building.tiers = [];

                for (let t = 0; t < tiers; t++) {
                    const tierH = 20 + Math.random() * 40;
                    currentW *= 0.6 + Math.random() * 0.2;
                    currentD *= 0.6 + Math.random() * 0.2;

                    building.tiers.push({
                        width: currentW,
                        height: tierH,
                        depth: currentD,
                        y: currentH
                    });

                    currentH += tierH;
                }
            } else if (style === "SPIRE") {
                const spireH = h * 0.5 + Math.random() * h;
                const spireW = w * 0.5;
                const spireD = d * 0.5;
                building.spire = {
                    width: spireW,
                    height: spireH,
                    depth: spireD,
                    y: h
                };
            } else if (style === "GREEBLED") {
                const count = 4 + Math.floor(Math.random() * 6);
                building.greebles = [];
                for (let g = 0; g < count; g++) {
                    const gw = 5 + Math.random() * 10;
                    const gh = 5 + Math.random() * 20;
                    const gd = 5 + Math.random() * 10;
                    let gx, gy, gz;

                    const face = Math.floor(Math.random() * 4);
                    if (face === 0) {
                        gx = 0; gy = Math.random() * h; gz = d / 2 + gd / 2;
                    } else if (face === 1) {
                        gx = 0; gy = Math.random() * h; gz = -d / 2 - gd / 2;
                    } else if (face === 2) {
                        gx = w / 2 + gw / 2; gy = Math.random() * h; gz = 0;
                    } else {
                        gx = -w / 2 - gw / 2; gy = Math.random() * h; gz = 0;
                    }
                    building.greebles.push({
                        width: gw,
                        height: gh,
                        depth: gd,
                        x: gx, y: gy, z: gz
                    });
                }
            }

            // Antenna
            if (style !== "SPIRE" && Math.random() > 0.7) {
                const antennaH = 20 + Math.random() * 50;
                building.antenna = {
                    height: antennaH,
                    y: h // Starts at the top of the main block (logic in original: antenna.position.y = h)
                         // Wait, in original: `let topY = h; antenna.position.y = topY;`
                         // BoxGeometry centers at 0, translated by 0.5y.
                         // So position y=h means base is at h if anchor is bottom.
                         // But boxGeo is translated (0, 0.5, 0).
                         // So if position is h, the bottom of the box is at h.
                         // Correct.
                };
            }

            // Billboard
            // The original logic uses `billboardMaterials.length` to pick texture.
            // I'll pick an index here (assume 4 for now, or arbitrary, client needs to map it).
            // Let's assume 4 textures.
            if (!isLeaderboardBuilding && h > 60 && Math.random() > 0.7) {
                 const texIndex = Math.floor(Math.random() * 4); // Assuming 4 textures
                 const bbW = 20 + Math.random() * 15;
                 const bbH = 10 + Math.random() * 10;
                 const face = Math.floor(Math.random() * 4);
                 const offset = 1;
                 const y = h * (0.5 + Math.random() * 0.3); // In original logic

                 building.billboard = {
                     width: bbW,
                     height: bbH,
                     face: face,
                     texIndex: texIndex,
                     offset: offset,
                     y: y
                 };
            }

            cityData.buildings.push(building);
        }
    }

    return new Response(JSON.stringify(cityData), {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600"
        }
    });
};
