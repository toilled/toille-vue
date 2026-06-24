import { describe, it, expect } from 'vitest';
import {
  CITY_SIZE,
  BLOCK_SIZE,
  ROAD_WIDTH,
  CELL_SIZE,
  GRID_SIZE,
  START_OFFSET,
  BOUNDS,
} from '../config';

describe('game config', () => {
  it('exports numeric constants', () => {
    expect(CITY_SIZE).toBe(2000);
    expect(BLOCK_SIZE).toBe(150);
    expect(ROAD_WIDTH).toBe(40);
    expect(CELL_SIZE).toBe(190);
    expect(GRID_SIZE).toBe(10);
  });

  it('START_OFFSET is derived correctly', () => {
    const expected = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
    expect(START_OFFSET).toBe(expected);
  });

  it('BOUNDS is derived correctly', () => {
    const expected = (GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE;
    expect(BOUNDS).toBe(expected);
  });
});
