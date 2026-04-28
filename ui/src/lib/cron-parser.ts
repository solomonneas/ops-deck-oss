// Simple cron expression parser for calendar placement
// Supports standard 5-field cron: min hour dom month dow

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface ParsedCron {
  minutes: number[];
  hours: number[];
  daysOfWeek: number[]; // 0=Sun, 6=Sat
  isAlwaysRunning: boolean;
  humanTime: string;
}

function parseField(field: string, min: number, max: number): number[] {
  if (field === '*') return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  
  const values: number[] = [];
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr);
      const start = range === '*' ? min : parseInt(range);
      for (let i = start; i <= max; i += step) values.push(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) values.push(i);
    } else {
      values.push(parseInt(part));
    }
  }
  return [...new Set(values)].filter(v => v >= min && v <= max).sort((a, b) => a - b);
}

export function parseCron(expression: string): ParsedCron {
  // Handle "every X min" interval schedules
  const everyMatch = expression.match(/^every (\d+) min$/);
  if (everyMatch) {
    const interval = parseInt(everyMatch[1]);
    const runsPerHour = Math.max(1, Math.floor(60 / interval));
    const mins = Array.from({ length: runsPerHour }, (_, i) => i * interval);
    return {
      minutes: mins,
      hours: Array.from({ length: 24 }, (_, i) => i),
      daysOfWeek: [0,1,2,3,4,5,6],
      isAlwaysRunning: true,
      humanTime: `Every ${interval} min`,
    };
  }

  // Handle "at <ISO>" one-shot schedules
  if (expression.startsWith('at ')) {
    const dateStr = expression.slice(3);
    try {
      const d = new Date(dateStr);
      const h = d.getHours();
      const m = d.getMinutes();
      const dow = d.getDay();
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return {
        minutes: [m],
        hours: [h],
        daysOfWeek: [dow],
        isAlwaysRunning: false,
        humanTime: `${displayH}:${m.toString().padStart(2, '0')} ${period} (one-shot)`,
      };
    } catch {
      return { minutes: [0], hours: [0], daysOfWeek: [0,1,2,3,4,5,6], isAlwaysRunning: false, humanTime: expression };
    }
  }

  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) {
    return { minutes: [0], hours: [0], daysOfWeek: [0,1,2,3,4,5,6], isAlwaysRunning: false, humanTime: expression };
  }

  const [minField, hourField, , , dowField] = parts;
  const minutes = parseField(minField, 0, 59);
  const hours = parseField(hourField, 0, 23);
  const daysOfWeek = parseField(dowField, 0, 6);

  // "Always running" = runs more than 12 times per day
  const runsPerDay = minutes.length * hours.length;
  const isAlwaysRunning = runsPerDay > 12;

  const h = hours[0] ?? 0;
  const m = minutes[0] ?? 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const humanTime = `${displayH}:${m.toString().padStart(2, '0')} ${period}`;

  return { minutes, hours, daysOfWeek, isAlwaysRunning, humanTime };
}

export function getNextFires(expression: string, count: number = 5): Date[] {
  // Handle "at <ISO>" one-shot: just return the single fire date
  if (expression.startsWith('at ')) {
    try {
      const d = new Date(expression.slice(3));
      return d > new Date() ? [d] : [];
    } catch { return []; }
  }

  const parsed = parseCron(expression);
  const fires: Date[] = [];
  const now = new Date();

  // For interval schedules, just project forward from now
  if (expression.match(/^every \d+ min$/)) {
    const interval = parseInt(expression.match(/^every (\d+) min$/)![1]) * 60000;
    const start = new Date(Math.ceil(now.getTime() / interval) * interval);
    for (let i = 0; i < count; i++) {
      fires.push(new Date(start.getTime() + i * interval));
    }
    return fires;
  }

  const check = new Date(now);
  const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  while (fires.length < count && check < maxDate) {
    const dow = check.getDay();
    if (parsed.daysOfWeek.includes(dow)) {
      for (const h of parsed.hours) {
        for (const m of parsed.minutes) {
          const fire = new Date(check);
          fire.setHours(h, m, 0, 0);
          if (fire > now && fires.length < count) {
            fires.push(fire);
          }
        }
      }
    }
    check.setDate(check.getDate() + 1);
    check.setHours(0, 0, 0, 0);
  }
  
  return fires.sort((a, b) => a.getTime() - b.getTime()).slice(0, count);
}

export function categorizeCron(name: string): { category: string; color: string } {
  const n = name.toLowerCase();
  
  // backup/sync: blue
  if (n.includes('backup') || n.includes('sync') || n.includes('snapshot'))
    return { category: 'backup/sync', color: '#3b82f6' };
  
  // content/social/blog: yellow/gold
  if (n.includes('content') || n.includes('post') || n.includes('blog') || n.includes('social') || n.includes('youtube') || n.includes('tweet'))
    return { category: 'content', color: '#eab308' };
  
  // security/audit/scan: green
  if (n.includes('security') || n.includes('scan') || n.includes('health') || n.includes('audit') || n.includes('firewall') || n.includes('check'))
    return { category: 'security', color: '#22c55e' };
  
  // reminder/alert: orange
  if (n.includes('remind') || n.includes('alert') || n.includes('notify') || n.includes('ping'))
    return { category: 'reminder', color: '#f97316' };
  
  // email/inbox: cyan
  if (n.includes('email') || n.includes('inbox') || n.includes('mail') || n.includes('newsletter'))
    return { category: 'email', color: '#06b6d4' };
  
  // pipeline/standup/report: purple
  if (n.includes('pipeline') || n.includes('standup') || n.includes('report') || n.includes('brief') || n.includes('summary'))
    return { category: 'pipeline', color: '#a855f7' };
  
  // maintenance/index/cleanup: gray
  if (n.includes('maintenance') || n.includes('index') || n.includes('cleanup') || n.includes('prune') || n.includes('optimize'))
    return { category: 'maintenance', color: '#6b7280' };
  
  // personal (trash, litter, call): pink/rose
  if (n.includes('trash') || n.includes('litter') || n.includes('call') || n.includes('personal') || n.includes('chore'))
    return { category: 'personal', color: '#ec4899' };
  
  return { category: 'other', color: '#6b7280' };
}

export { DAY_NAMES };
