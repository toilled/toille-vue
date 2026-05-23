import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ErrorBoundary from "../ErrorBoundary.vue";

describe("ErrorBoundary.vue", () => {
  it("renders slot content when no error", () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: "<div>Normal Content</div>" },
    });
    expect(wrapper.text()).toContain("Normal Content");
    expect(wrapper.find(".error-boundary").exists()).toBe(false);
  });

  it("renders error state when internal error state is set", async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: "<div>Normal Content</div>" },
    });
    const vm = wrapper.vm as never as {
      $: { setupState: { hasError: boolean; errorMessage: string } };
    };
    vm.$.setupState.hasError = true;
    vm.$.setupState.errorMessage = "Test error";
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".error-boundary").exists()).toBe(true);
    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Test error");
    expect(wrapper.text()).toContain("Try Again");
  });

  it("resets error on Try Again click", async () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: "<div>Normal Content</div>" },
    });
    const vm = wrapper.vm as never as {
      $: { setupState: { hasError: boolean } };
    };
    vm.$.setupState.hasError = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".error-boundary").exists()).toBe(true);
    await wrapper.find("button").trigger("click");
    expect(wrapper.find(".error-boundary").exists()).toBe(false);
    expect(wrapper.text()).toContain("Normal Content");
  });
});
