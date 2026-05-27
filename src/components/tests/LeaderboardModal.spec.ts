import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LeaderboardModal from "../LeaderboardModal.vue";

describe("LeaderboardModal.vue", () => {
  it("does not render when showLeaderboard is false", () => {
    const wrapper = mount(LeaderboardModal, {
      props: { showLeaderboard: false, leaderboard: [] },
    });
    expect(wrapper.find("#leaderboard-modal").exists()).toBe(false);
  });

  it("renders leaderboard entries", () => {
    const leaderboard = [
      { name: "ACE", score: 1000 },
      { name: "BEST", score: 500 },
    ];
    const wrapper = mount(LeaderboardModal, {
      props: { showLeaderboard: true, leaderboard },
    });
    expect(wrapper.text()).toContain("LEADERBOARD");
    expect(wrapper.text()).toContain("ACE");
    expect(wrapper.text()).toContain("1000");
    expect(wrapper.text()).toContain("BEST");
    expect(wrapper.text()).toContain("500");
  });

  it("emits close-leaderboard on close button click", async () => {
    const wrapper = mount(LeaderboardModal, {
      props: { showLeaderboard: true, leaderboard: [{ name: "ACE", score: 1000 }] },
    });
    await wrapper.find(".close-btn").trigger("click");
    expect(wrapper.emitted("close-leaderboard")).toBeTruthy();
  });
});
