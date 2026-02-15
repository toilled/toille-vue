export const CITY_SIZE = 2000;
export const BLOCK_SIZE = 150;
export const ROAD_WIDTH = 40;
export const CELL_SIZE = BLOCK_SIZE + ROAD_WIDTH;
export const GRID_SIZE = Math.floor(CITY_SIZE / CELL_SIZE);
export const START_OFFSET = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
// Reduced BOUNDS to keep traffic strictly within city grid (was + CELL_SIZE)
export const BOUNDS = (GRID_SIZE * CELL_SIZE) / 2;
export const DRONE_COUNT = 300;
