export const SLIDE_SCHEMA = {
  title: { fields: [
    { key: 'title', label: 'Presentation Title', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtitle', type: 'text', required: false },
    { key: 'date', label: 'Date / Quarter', type: 'text', required: false },
    { key: 'author', label: 'Presenter Name', type: 'text', required: false, sensitive: true },
    { key: 'company', label: 'Company Name', type: 'text', required: false, sensitive: true },
  ]},
  agenda: { fields: [
    { key: 'title', label: 'Slide Title', type: 'text', required: true },
    { key: 'items', label: 'Agenda Items', type: 'list', required: true, maxItems: 8 },
  ]},
  content: { fields: [
    { key: 'title', label: 'Slide Title', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtitle', type: 'text', required: false },
    { key: 'body', label: 'Body Content', type: 'richtext', required: false },
    { key: 'bullets', label: 'Bullet Points', type: 'list', required: false, maxItems: 6 },
    { key: 'bigStat', label: 'Hero Stat/Number', type: 'text', required: false, sensitive: true },
    { key: 'infographic', label: 'Infographic Type', type: 'infographic', required: false },
  ]},
  dashboard: { fields: [
    { key: 'title', label: 'Slide Title', type: 'text', required: true },
    { key: 'metrics', label: 'KPI Metrics', type: 'metrics', required: true, maxItems: 6 },
  ]},
  table: { fields: [
    { key: 'title', label: 'Slide Title', type: 'text', required: true },
    { key: 'headers', label: 'Column Headers', type: 'list', required: true },
    { key: 'rows', label: 'Table Rows', type: 'table', required: true },
  ]},
  'section-overview': { fields: [
    { key: 'title', label: 'Section Title', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtitle', type: 'text', required: false },
    { key: 'body', label: 'Overview Text', type: 'richtext', required: false },
  ]},
  'highlight-list': { fields: [
    { key: 'title', label: 'Slide Title', type: 'text', required: true },
    { key: 'items', label: 'Highlight Items', type: 'highlights', required: true, maxItems: 6 },
  ]},
  'thank-you': { fields: [
    { key: 'title', label: 'Closing Title', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtitle / Contact', type: 'text', required: false },
  ]},
};

export const SENSITIVE_FIELD_KEYS = ['author', 'company', 'bigStat'];

export const SLIDE_TYPES = Object.keys(SLIDE_SCHEMA);
