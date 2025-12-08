import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../../App.vue";
import Menu from "../Menu.vue";
import pages from "../../configs/pages.json";
import { createRouter, createWebHistory } from "vue-router";
import PageContent from "../PageContent.vue";
import flushPromises from "flush-promises";

vi.mock("../../configs/pages.json", () => ({
  default: [
    {
      name: "Home",
      link: "/",
      title: "Home",
      body: ["Home page content"],
    },
    {
      name: "About",
      link: "/about",
      title: "About Me",
      body: ["About page content"],
    },
    {
      name: "Hidden",
      link: "/hidden",
      title: "Hidden",
      hidden: true,
      body: ["Hidden page content"],
    },
  ],
}));

const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", component: PageContent },
      { path: "/:name", component: PageContent },
      { path: "/checker", component: { template: "<div>Checker</div>" } },
    ],
  });
};

describe("App.vue", () => {
  let router: any;

  beforeEach(() => {
    router = createTestRouter();
    global.fetch = vi.fn();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => pages,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the menu with visible pages", async () => {
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
            PageContent: true,
            CyberpunkCity: true,
            Checker: true,
            Activity: true,
            Suggestion: true,
            TypingText: true
        }
      },
    });

    // Wait for fetch to complete
    await flushPromises();

    const menu = wrapper.findComponent(Menu);
    expect(menu.exists()).toBe(true);
    expect(menu.props("pages")).toHaveLength(2); // Home and About, Hidden is excluded
    expect(menu.props("pages")[0].name).toBe("Home");
    expect(menu.props("pages")[1].name).toBe("About");
  });

  it("toggles the Checker component", async () => {
    vi.useFakeTimers();
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
            PageContent: true,
            CyberpunkCity: true,
            Checker: true, // Stub Checker but we check if it is rendered
            Activity: true,
            Suggestion: true,
            TypingText: true
        }
      },
    });
    await flushPromises();

    // Advance timers to show hint
    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();

    const footer = wrapper.find("footer");
    expect(footer.exists()).toBe(true);

    await footer.trigger("click");
    // Since Checker is stubbed, we can check if the component instance data changed
    // or if the stub is present. v-if="checker"
    // Since we stubbed it, we can check wrapper.findComponent(Checker).exists() which should be true if v-if is true.
    // However, if it was false initially, it wouldn't exist.

    // Wait for transition?
    await wrapper.vm.$nextTick();
    // The v-if="checker" should now be true.
    // However, since we used mount and it's inside a Transition, it might be tricky.
    // Let's check internal state
    expect((wrapper.vm as any).checker).toBe(true);

    vi.useRealTimers();
  });

  it("shows and hides the hint", async () => {
    vi.useFakeTimers();
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
            PageContent: true,
            CyberpunkCity: true,
            Checker: true,
            Activity: true,
            Suggestion: true,
            TypingText: true
        }
      },
    });
    await flushPromises();

    expect(wrapper.find("footer").exists()).toBe(false);

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("footer").exists()).toBe(true);

    vi.advanceTimersByTime(3000); // Total 5000
    await wrapper.vm.$nextTick();
    expect(wrapper.find("footer").exists()).toBe(false);

    vi.useRealTimers();
  });

  it("updates document title on route change", async () => {
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
            PageContent: true,
            CyberpunkCity: true,
            Checker: true,
            Activity: true,
            Suggestion: true,
            TypingText: true
        }
      },
    });
    await flushPromises();

    // Initial title (Home)
    expect(document.title).toBe("Elliot > Home");

    // Navigate to About
    router.push("/about");
    await flushPromises();
    expect(document.title).toBe("Elliot > About Me");

    // Navigate to unknown
    router.push("/unknown");
    await flushPromises();
    expect(document.title).toBe("Elliot > 404");
  });

  it("fetches pages on mount", async () => {
      router.push("/");
      await router.isReady();
      const wrapper = mount(App, {
        global: {
          plugins: [router],
          stubs: {
              PageContent: true,
              CyberpunkCity: true,
              Checker: true,
              Activity: true,
              Suggestion: true,
              TypingText: true
          }
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/page?all=true');
      await flushPromises();
      expect((wrapper.vm as any).pages).toHaveLength(3);
  });
});
