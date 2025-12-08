/**
 * @interface Page
 * @description Defines the structure for a page object, used for routing and content display.
 */
export interface Page {
  /**
   * @property {string} name - The name of the page, used for display in the menu.
   */
  name: string;
  /**
   * @property {string} link - The URL path for the page (e.g., "/home").
   */
  link: string;
  /**
   * @property {string} title - The title of the page, displayed in the page's header.
   */
  title: string;
  /**
   * @property {string[]} body - An array of strings, where each string is a paragraph of the page's content.
   */
  body: string[];
  /**
   * @property {boolean} [hidden] - Optional flag to hide the page from the menu.
   */
  hidden?: boolean;
}