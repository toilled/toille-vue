import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectGallery from "../ProjectGallery.vue";

const mockPush = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

const defaultProvide = {
  navigateToSection: vi.fn(),
};

describe("ProjectGallery.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const projects = [
    { icon: "🌐", title: "Web App", description: "A cool web app", link: "/projects/web", linkType: "route" as const, tag: "Vue" },
    { icon: "🎮", title: "Game", description: "A fun game", link: "https://example.com", linkType: "external" as const },
    { icon: "📱", title: "Mobile", description: "Mobile app", link: "#section", tag: "React" },
  ];

  function mountWithProvide(props: Record<string, unknown> = {}) {
    return mount(ProjectGallery, {
      props,
      global: { provide: defaultProvide },
    });
  }

  it("renders all projects", () => {
    const wrapper = mountWithProvide({ projects });
    expect(wrapper.text()).toContain("Web App");
    expect(wrapper.text()).toContain("Game");
    expect(wrapper.text()).toContain("Mobile");
  });

  it("renders tags when present", () => {
    const wrapper = mountWithProvide({ projects });
    expect(wrapper.text()).toContain("Vue");
    expect(wrapper.text()).toContain("React");
  });

  it("calls router.push for route links", async () => {
    const wrapper = mountWithProvide({ projects });
    await wrapper.findAll(".project-card")[0].trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/projects/web");
  });

  it("opens external links in new window", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const wrapper = mountWithProvide({ projects });
    await wrapper.findAll(".project-card")[1].trigger("click");
    expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank", "noopener noreferrer");
    openSpy.mockRestore();
  });

  it("calls navigateToSection for hash links", async () => {
    const wrapper = mountWithProvide({ projects });
    await wrapper.findAll(".project-card")[2].trigger("click");
    expect(defaultProvide.navigateToSection).toHaveBeenCalledWith("section");
  });

  it("does nothing when no link", async () => {
    const wrapper = mountWithProvide({
      projects: [{ icon: "🌐", title: "No Link", description: "Desc" }],
    });
    await wrapper.find(".project-card").trigger("click");
    expect(mockPush).not.toHaveBeenCalled();
  });
});
