import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import NoughtsAndCrosses from "../NoughtsAndCrosses.vue";
import { useNoughtsAndCrosses } from "../../composables/useNoughtsAndCrosses";

vi.mock("../../composables/useNoughtsAndCrosses");

describe("NoughtsAndCrosses.vue", () => {
  it("should declare a winner when a player gets three in a row", async () => {
    const board = ref(['X', 'O', 'X', 'O', 'X', 'O', 'X', '', '']);
    const winner = ref('X');
    const makeMove = vi.fn();
    const resetGame = vi.fn();

    useNoughtsAndCrosses.mockReturnValue({
      board,
      winner,
      makeMove,
      resetGame,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.html()).toContain("Player X wins!");
  });

  it("should declare a draw when all cells are filled and there is no winner", async () => {
    const board = ref(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']);
    const winner = ref('draw');
    const makeMove = vi.fn();
    const resetGame = vi.fn();

    useNoughtsAndCrosses.mockReturnValue({
      board,
      winner,
      makeMove,
      resetGame,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.html()).toContain("It's a draw!");
  });
});