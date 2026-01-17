// Tag management utilities
// Stores tag pool and colors in localStorage

export interface TagColor {
  bg: string;
  text: string;
  border: string;
}

const DEFAULT_TAG_COLORS: Record<string, TagColor> = {
  'vip': {
    bg: 'bg-[hsl(var(--signal-warning))]',
    text: 'text-[hsl(var(--background))]',
    border: 'border-[hsl(var(--signal-warning))]'
  },
  'premium': {
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    border: 'border-primary'
  },
  'new': {
    bg: 'bg-[hsl(var(--signal-positive))]',
    text: 'text-white',
    border: 'border-[hsl(var(--signal-positive))]'
  },
  'active': {
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    border: 'border-primary'
  },
  'warning': {
    bg: 'bg-[hsl(var(--signal-warning))]',
    text: 'text-white',
    border: 'border-[hsl(var(--signal-warning))]'
  }
};

// Generate a random color for new tags
const generateTagColor = (): TagColor => {
  const colors = [
    { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
    { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500' },
    { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500' },
    { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500' },
    { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-500' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
    { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-500' },
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Load tag colors from localStorage
const loadTagColors = (): Record<string, TagColor> => {
  try {
    const saved = localStorage.getItem('betting-ui-tag-colors');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return { ...DEFAULT_TAG_COLORS };
};

// Save tag colors to localStorage
const saveTagColors = (colors: Record<string, TagColor>) => {
  try {
    localStorage.setItem('betting-ui-tag-colors', JSON.stringify(colors));
  } catch {
    // Ignore errors
  }
};

// Get all tags from accounts
export const getAllTagsFromAccounts = (accounts: Record<string, Array<{ tags?: string[] }>>): string[] => {
  const tagSet = new Set<string>();
  Object.values(accounts).forEach(platformAccounts => {
    platformAccounts.forEach(account => {
      account.tags?.forEach((tag: string) => tagSet.add(tag));
    });
  });
  return Array.from(tagSet).sort();
};

// Get tag color
export const getTagColor = (tag: string): TagColor => {
  const colors = loadTagColors();
  const tagLower = tag.toLowerCase();
  if (colors[tagLower]) {
    return colors[tagLower];
  }
  // Return default if exists
  if (DEFAULT_TAG_COLORS[tagLower]) {
    return DEFAULT_TAG_COLORS[tagLower];
  }
  // Generate and save new color
  const newColor = generateTagColor();
  colors[tagLower] = newColor;
  saveTagColors(colors);
  return newColor;
};

// Set custom tag color
export const setTagColor = (tag: string, color: TagColor) => {
  const colors = loadTagColors();
  colors[tag.toLowerCase()] = color;
  saveTagColors(colors);
};

// Get all tag colors
export const getAllTagColors = (): Record<string, TagColor> => {
  return loadTagColors();
};

// Get CSS classes for tag
export const getTagColorClasses = (tag: string): string => {
  const color = getTagColor(tag);
  return `${color.bg} ${color.text} ${color.border}`;
};
