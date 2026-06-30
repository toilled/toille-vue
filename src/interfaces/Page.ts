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
  /**
   * @property {string} [icon] - Optional icon to display next to the title.
   */
  icon?: string;
  /**
   * @property {string} [accent] - Optional accent color for the page's visual theming.
   */
  accent?: string;
  /**
   * @property {string} [metaDescription] - Optional meta description for SEO.
   */
  metaDescription?: string;
  /**
   * @property {string} [metaKeywords] - Optional meta keywords for SEO.
   */
  metaKeywords?: string;
  /**
   * @property {PageSection[]} [sections] - Optional extra content sections rendered below the body.
   */
  sections?: PageSection[];
}

/**
 * @interface PageSection
 * @description A content section rendered below the page body, driven by the section type.
 */
export interface PageSection {
  /**
   * @property {string} type - The section type: 'divider', 'cards', 'skills', 'musicCard', or 'interestGrid'.
   */
  type: 'divider' | 'cards' | 'skills' | 'musicCard' | 'interestGrid';
  /**
   * @property {string} [heading] - Optional heading displayed above the section content.
   */
  heading?: string;
  /**
   * @property {string} [headingKey] - Optional i18n translation key for the heading.
   */
  headingKey?: string;
  /**
   * @property {string} [icon] - Optional icon for the section (used by divider and musicCard).
   */
  icon?: string;
  /**
   * @property {number} [columns] - Number of grid columns (used by cards section).
   */
  columns?: number;
  /**
   * @property {PageSectionItem[]} [items] - Content items (used by cards and interestGrid).
   */
  items?: PageSectionItem[];
  /**
   * @property {PageSectionGroup[]} [groups] - Skill groups (used by skills section).
   */
  groups?: PageSectionGroup[];
  /**
   * @property {string} [linkUrl] - Optional URL for a link (used by musicCard).
   */
  linkUrl?: string;
  /**
   * @property {string} [linkText] - Optional link label text (used by musicCard).
   */
  linkText?: string;
  /**
   * @property {string} [linkTextKey] - Optional i18n translation key for the link text.
   */
  linkTextKey?: string;
  /**
   * @property {string} [title] - Optional title text (used by musicCard).
   */
  title?: string;
  /**
   * @property {string} [titleKey] - Optional i18n translation key for the title.
   */
  titleKey?: string;
  /**
   * @property {string} [description] - Optional description text (used by cards and musicCard).
   */
  description?: string;
  /**
   * @property {string} [descriptionKey] - Optional i18n translation key for the description.
   */
  descriptionKey?: string;
}

/**
 * @interface PageSectionItem
 * @description An individual item within a section, such as a card or grid entry.
 */
export interface PageSectionItem {
  /**
   * @property {string} [icon] - Optional icon for the item.
   */
  icon?: string;
  /**
   * @property {string} [title] - Optional title for the item.
   */
  title?: string;
  /**
   * @property {string} [titleKey] - Optional i18n translation key for the title.
   */
  titleKey?: string;
  /**
   * @property {string} [description] - Optional description for the item.
   */
  description?: string;
  /**
   * @property {string} [descriptionKey] - Optional i18n translation key for the description.
   */
  descriptionKey?: string;
  /**
   * @property {string} [text] - Optional display text (used by interestGrid items).
   */
  text?: string;
  /**
   * @property {string} [textKey] - Optional i18n translation key for the text.
   */
  textKey?: string;
}

/**
 * @interface PageSectionGroup
 * @description A group of skills within a skills section, with an optional category label.
 */
export interface PageSectionGroup {
  /**
   * @property {string} [category] - Optional category label for the skill group.
   */
  category?: string;
  /**
   * @property {string} [categoryKey] - Optional i18n translation key for the category.
   */
  categoryKey?: string;
  /**
   * @property {PageSectionSkill[]} [skills] - The skills in this group.
   */
  skills?: PageSectionSkill[];
}

/**
 * @interface PageSectionSkill
 * @description A single skill entry with a name, optional icon, and optional link.
 */
export interface PageSectionSkill {
  /**
   * @property {string} name - The skill name.
   */
  name: string;
  /**
   * @property {string} [icon] - Optional icon path or emoji for the skill.
   */
  icon?: string;
  /**
   * @property {string} [link] - Optional URL to learn more about the skill.
   */
  link?: string;
}
