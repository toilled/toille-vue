import { describe, it, expect, vi } from "vitest";
import { GameModeManager } from "../GameModeManager";
import { GameContext, GameMode } from "../types";

describe("GameModeManager", () => {
  let context: GameContext;
  let manager: GameModeManager;

  beforeEach(() => {
    context = {} as GameContext;
    manager = new GameModeManager(context);
  });

  it("starts with no mode", () => {
    expect(manager.getMode()).toBeNull();
  });

  it("sets and gets a mode", () => {
    const mode: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    manager.setMode(mode);
    expect(manager.getMode()).toBe(mode);
    expect(mode.init).toHaveBeenCalledWith(context);
  });

  it("clears a mode", () => {
    const mode: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    manager.setMode(mode);
    manager.clearMode();
    expect(manager.getMode()).toBeNull();
    expect(mode.cleanup).toHaveBeenCalled();
  });

  it("calls cleanup on old mode when setting new mode", () => {
    const mode1: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    const mode2: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    manager.setMode(mode1);
    manager.setMode(mode2);
    expect(mode1.cleanup).toHaveBeenCalled();
    expect(mode2.init).toHaveBeenCalled();
  });

  it("forwards update to current mode", () => {
    const mode: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    manager.setMode(mode);
    manager.update(0.1, 100);
    expect(mode.update).toHaveBeenCalledWith(0.1, 100);
  });

  it("forwards key events to current mode", () => {
    const mode: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    manager.setMode(mode);
    const event = new KeyboardEvent("keydown", { key: "w" });
    manager.onKeyDown(event);
    expect(mode.onKeyDown).toHaveBeenCalledWith(event);

    const event2 = new KeyboardEvent("keyup", { key: "w" });
    manager.onKeyUp(event2);
    expect(mode.onKeyUp).toHaveBeenCalledWith(event2);
  });

  it("forwards mouse events to current mode", () => {
    const mode: GameMode = {
      init: vi.fn(),
      update: vi.fn(),
      cleanup: vi.fn(),
      onKeyDown: vi.fn(),
      onKeyUp: vi.fn(),
      onClick: vi.fn(),
      onMouseMove: vi.fn(),
    };
    manager.setMode(mode);
    const event = new MouseEvent("click");
    manager.onClick(event);
    expect(mode.onClick).toHaveBeenCalledWith(event);

    const event2 = new MouseEvent("mousemove");
    manager.onMouseMove(event2);
    expect(mode.onMouseMove).toHaveBeenCalledWith(event2);
  });

  it("does not crash when forwarding events with no mode", () => {
    expect(() => {
      manager.update(0.1, 100);
      manager.onKeyDown(new KeyboardEvent("keydown"));
      manager.onKeyUp(new KeyboardEvent("keyup"));
      manager.onClick(new MouseEvent("click"));
      manager.onMouseMove(new MouseEvent("mousemove"));
    }).not.toThrow();
  });
});
