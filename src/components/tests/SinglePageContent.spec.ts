import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("../../configs/pages.json", () => ({
  default: [
    { name: "Home", link: "/", title: "Home Page", body: ["Welcome paragraph."], icon: "🏠" },
    { name: "About", link: "/about", title: "About Me", body: ["About paragraph."] },
    { name: "Interests", link: "/interests", title: "Interests", body: ["Interests content."] },
    { name: "Hidden", link: "/hidden", title: "Hidden", body: ["Hidden content."], hidden: true },
  ],
}));

vi.mock("../../configs/titles.json", () => ({
  default: { title: "Test", subtitle: "Sub" },
}));

vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({ path: "/" })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import SinglePageContent from "../SinglePageContent.vue";

function getStubs() {
  return {
    Paragraph: { template: "<div><slot /></div>" },
    SkillCard: { template: "<div class='skill-card-stub'><slot /></div>", props: ["skills", "category"] },
    SectionDivider: { template: "<div class='divider-stub'><slot /></div>" },
    AnimatedPageTitle: { template: "<span class='title-stub'>{{ title }}</span>", props: ["title"] },
  };
}

describe("SinglePageContent.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all non-hidden pages", () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.text()).toContain("Home Page");
    expect(wrapper.text()).toContain("About Me");
    expect(wrapper.text()).not.toContain("Hidden");
  });

  it("renders section ids based on page links", () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.find("#home").exists()).toBe(true);
    expect(wrapper.find("#about").exists()).toBe(true);
    expect(wrapper.find("#hidden").exists()).toBe(false);
  });

  it("renders home section with special content", () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.text()).toContain("What I Do");
    expect(wrapper.text()).toContain("Full-Stack Development");
  });

  it("renders about section with skills", () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.find("#about").exists()).toBe(true);
  });

  it("renders interests section with music", () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.text()).toContain("Music & Creative");
  });
});
