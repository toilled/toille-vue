import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SignalFinder from '../SignalFinder.vue';

describe('SignalFinder.vue', () => {
  it('renders when visible is true', () => {
    const wrapper = mount(SignalFinder, {
      props: { visible: true, signalStrength: 0.5 },
    });
    expect(wrapper.find('#signal-finder').exists()).toBe(true);
    expect(wrapper.text()).toContain('SIGNAL DETECTED');
  });

  it('does not render when visible is false', () => {
    const wrapper = mount(SignalFinder, {
      props: { visible: false, signalStrength: 0 },
    });
    expect(wrapper.find('#signal-finder').exists()).toBe(false);
  });

  it('displays signal strength percentage', () => {
    const wrapper = mount(SignalFinder, {
      props: { visible: true, signalStrength: 0.75 },
    });
    expect(wrapper.text()).toContain('75%');
  });

  it('renders 5 signal bars', () => {
    const wrapper = mount(SignalFinder, {
      props: { visible: true, signalStrength: 0.5 },
    });
    expect(wrapper.findAll('.signal-bar')).toHaveLength(5);
  });
});
