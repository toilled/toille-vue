import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CodePlayground from '../CodePlayground.vue';

const mockDestroy = vi.fn();
const mockToString = vi.fn(() => 'console.log("hello");');

vi.mock('@codemirror/view', () => ({
  EditorView: Object.assign(
    vi.fn(() => ({
      destroy: mockDestroy,
      state: { doc: { toString: mockToString } },
    })),
    { lineWrapping: 'lineWrapping', theme: vi.fn(() => ({})) }
  ),
  keymap: { of: vi.fn(() => ({})) },
  lineNumbers: vi.fn(() => ({})),
  highlightActiveLine: vi.fn(() => ({})),
  highlightActiveLineGutter: vi.fn(() => ({})),
}));

vi.mock('@codemirror/state', () => ({
  EditorState: {
    create: vi.fn(() => ({})),
  },
}));

vi.mock('@codemirror/lang-javascript', () => ({
  javascript: vi.fn(() => ({})),
}));

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: {},
}));

vi.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  history: vi.fn(() => ({})),
  historyKeymap: [],
}));

vi.mock('@codemirror/language', () => ({
  bracketMatching: vi.fn(() => ({})),
  foldGutter: vi.fn(() => ({})),
  indentOnInput: vi.fn(() => ({})),
}));

describe('CodePlayground.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createWrapper() {
    return mount(CodePlayground, {
      attachTo: document.body,
    });
  }

  it('renders the playground header with title', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('h2').text()).toBe('JS Playground');
    wrapper.unmount();
  });

  it('renders editor and console panes', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.editor-pane').exists()).toBe(true);
    expect(wrapper.find('.output-pane').exists()).toBe(true);
    expect(wrapper.find('.pane-label').exists()).toBe(true);
    const labels = wrapper.findAll('.pane-label');
    expect(labels[0].text()).toBe('EDITOR');
    expect(labels[1].text()).toBe('CONSOLE');
    wrapper.unmount();
  });

  it('renders Run and Clear buttons', () => {
    const wrapper = createWrapper();
    const runBtn = wrapper.find('.run-btn');
    const clearBtn = wrapper.find('.clear-btn');
    expect(runBtn.exists()).toBe(true);
    expect(runBtn.text()).toBe('Run');
    expect(clearBtn.exists()).toBe(true);
    expect(clearBtn.text()).toBe('Clear');
    wrapper.unmount();
  });

  it('renders the sandbox iframe', () => {
    const wrapper = createWrapper();
    const iframe = wrapper.find('iframe');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('sandbox')).toBe('allow-scripts');
    wrapper.unmount();
  });

  it('shows empty console placeholder', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.console-empty').exists()).toBe(true);
    expect(wrapper.find('.console-empty').text()).toBe('Click Run to execute your code...');
    wrapper.unmount();
  });

  it('renders status bar with JavaScript label', () => {
    const wrapper = createWrapper();
    const statusBar = wrapper.find('.status-bar');
    expect(statusBar.exists()).toBe(true);
    expect(statusBar.text()).toContain('JavaScript');
    wrapper.unmount();
  });

  it('run button sets iframe srcdoc and disables while running', async () => {
    const wrapper = createWrapper();
    const runBtn = wrapper.find('.run-btn');

    expect(runBtn.attributes('disabled')).toBeUndefined();

    await runBtn.trigger('click');

    const iframe = wrapper.find('iframe');
    expect((iframe.element as HTMLIFrameElement).srcdoc).toContain('console.log');
    expect(runBtn.attributes('disabled')).toBe('');
    expect(runBtn.text()).toBe('Running...');
    wrapper.unmount();
  });

  it('clear button resets console entries', async () => {
    const wrapper = createWrapper();

    // Directly push to consoleEntries via the component
    const vm = wrapper.vm as unknown as {
      consoleEntries: { type: string; text: string }[];
    };
    vm.consoleEntries.push({ type: 'log', text: 'test output' });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.console-entry').length).toBe(1);

    await wrapper.find('.clear-btn').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.console-entry').length).toBe(0);
    expect(wrapper.find('.console-empty').exists()).toBe(true);
    wrapper.unmount();
  });

  it('displays console log entries with correct styling', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      consoleEntries: { type: string; text: string }[];
    };

    vm.consoleEntries.push({ type: 'log', text: 'hello world' });
    await wrapper.vm.$nextTick();

    const entry = wrapper.find('.console-entry');
    expect(entry.exists()).toBe(true);
    expect(entry.classes()).toContain('console-log');
    expect(entry.find('.console-prefix').text()).toBe('>');
    expect(entry.find('.console-text').text()).toBe('hello world');
    wrapper.unmount();
  });

  it('displays console error entries with error styling', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      consoleEntries: { type: string; text: string }[];
    };

    vm.consoleEntries.push({ type: 'error', text: 'something broke' });
    await wrapper.vm.$nextTick();

    const entry = wrapper.find('.console-entry');
    expect(entry.classes()).toContain('console-error');
    expect(entry.find('.console-prefix').text()).toBe('!');
    expect(entry.find('.console-text').text()).toBe('something broke');
    wrapper.unmount();
  });

  it('displays console warn entries with warn styling', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      consoleEntries: { type: string; text: string }[];
    };

    vm.consoleEntries.push({ type: 'warn', text: 'be careful' });
    await wrapper.vm.$nextTick();

    const entry = wrapper.find('.console-entry');
    expect(entry.classes()).toContain('console-warn');
    expect(entry.find('.console-prefix').text()).toBe('?');
    expect(entry.find('.console-text').text()).toBe('be careful');
    wrapper.unmount();
  });

  it('shows error count in status bar when errors exist', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      errorCount: number;
    };

    vm.errorCount = 2;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.status-error').exists()).toBe(true);
    expect(wrapper.find('.status-error').text()).toBe('2 errors');
    wrapper.unmount();
  });

  it('shows singular error text for one error', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      errorCount: number;
    };

    vm.errorCount = 1;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.status-error').text()).toBe('1 error');
    wrapper.unmount();
  });

  it('shows last run time in status bar after execution', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      lastRunTime: number | null;
    };

    vm.lastRunTime = 42;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.status-bar').text()).toContain('Last run: 42ms');
    wrapper.unmount();
  });

  it('cleans up event listener and editor on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const wrapper = createWrapper();
    wrapper.unmount();

    expect(mockDestroy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('handles multiple console entries', async () => {
    const wrapper = createWrapper();
    const vm = wrapper.vm as unknown as {
      consoleEntries: { type: string; text: string }[];
    };

    vm.consoleEntries.push({ type: 'log', text: 'first' });
    vm.consoleEntries.push({ type: 'error', text: 'second' });
    vm.consoleEntries.push({ type: 'warn', text: 'third' });
    await wrapper.vm.$nextTick();

    const entries = wrapper.findAll('.console-entry');
    expect(entries.length).toBe(3);
    expect(entries[0].classes()).toContain('console-log');
    expect(entries[1].classes()).toContain('console-error');
    expect(entries[2].classes()).toContain('console-warn');
    wrapper.unmount();
  });
});
