import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SkillCard from "../SkillCard.vue";

describe("SkillCard.vue", () => {
  const skills = [
    { name: "JavaScript", icon: "🟨" },
    { name: "TypeScript", icon: "/ts-icon.svg", link: "https://typescriptlang.org" },
  ];

  it("renders skills with emoji icons", () => {
    const wrapper = mount(SkillCard, { props: { skills } });
    expect(wrapper.text()).toContain("JavaScript");
    expect(wrapper.text()).toContain("TypeScript");
  });

  it("renders category when provided", () => {
    const wrapper = mount(SkillCard, { props: { skills, category: "Languages" } });
    expect(wrapper.text()).toContain("Languages");
  });

  it("does not render category when not provided", () => {
    const wrapper = mount(SkillCard, { props: { skills } });
    expect(wrapper.find(".skill-category").exists()).toBe(false);
  });

  it("renders link as anchor when link is provided", () => {
    const wrapper = mount(SkillCard, { props: { skills } });
    const links = wrapper.findAll("a");
    expect(links.length).toBe(1);
    expect(links[0].attributes("href")).toBe("https://typescriptlang.org");
    expect(links[0].attributes("target")).toBe("_blank");
  });

  it("renders img for svg icons", () => {
    const wrapper = mount(SkillCard, { props: { skills } });
    const imgs = wrapper.findAll("img");
    expect(imgs.length).toBe(1);
    expect(imgs[0].attributes("src")).toBe("/ts-icon.svg");
  });
});
