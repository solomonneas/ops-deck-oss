import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import Config from '../Config';

const useApiMock = vi.fn();
const apiFetchMock = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useApi: (path: string) => useApiMock(path),
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const defaultFiles = [
  {
    name: 'app.json',
    path: '/workspace/app.json',
    size: 1200,
    mtime: '2025-01-01T10:00:00Z',
    content: '{ "ok": true }',
  },
  {
    name: 'missing.txt',
    path: '/workspace/missing.txt',
    size: 0,
    mtime: null,
    content: null,
    missing: true,
  },
];

const defaultSkills = [
  {
    name: 'skill-one',
    location: 'system' as const,
    path: '/system/skill-one',
    description: 'System skill',
    hasSkillMd: true,
    content: '# Skill One\nDetails',
  },
  {
    name: 'skill-two',
    location: 'workspace' as const,
    path: '/workspace/skill-two',
    description: 'Workspace skill',
    hasSkillMd: true,
    content: '## Skill Two\nMore',
  },
];

const defaultRules = [
  {
    name: 'rule-1.md',
    path: '/rules/rule-1.md',
    content: 'Rule content',
    size: 10,
    mtime: '2025-01-02T00:00:00Z',
  },
];

const defaultCrons = [
  {
    id: 'job-1',
    schedule: '0 0 * * *',
    command: 'echo hello',
  },
];

const useApiResponses = new Map<string, any>();

function setUseApiResponse(path: string, response: { data: any; loading: boolean; error: string | null }) {
  useApiResponses.set(path, {
    refetch: vi.fn(),
    ...response,
  });
}

function seedDefaults() {
  setUseApiResponse('/api/config/files', { data: defaultFiles, loading: false, error: null });
  setUseApiResponse('/api/config/skills', { data: defaultSkills, loading: false, error: null });
  setUseApiResponse('/api/config/rules', { data: defaultRules, loading: false, error: null });
  setUseApiResponse('/api/crons', { data: defaultCrons, loading: false, error: null });
}

beforeEach(() => {
  useApiResponses.clear();
  useApiMock.mockImplementation((path: string) => {
    return (
      useApiResponses.get(path) || {
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      }
    );
  });
  apiFetchMock.mockResolvedValue({});
});

describe('Config', () => {
  it('renders with Files tab active by default', () => {
    seedDefaults();
    render(<Config />);

    expect(screen.getByText('Workspace Files')).toBeInTheDocument();
    expect(screen.getByText('Select a file to view')).toBeInTheDocument();
  });

  it('switches tabs between Files, Skills, Rules, and Crons', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByRole('button', { name: 'Skills' }));
    expect(screen.getByText('System Skills')).toBeInTheDocument();
    expect(screen.getByText('Workspace Skills')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rules' }));
    expect(screen.getByText('Rule Files')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Crons' }));
    expect(screen.getByText('Scheduled Jobs')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Files' }));
    expect(screen.getByText('Workspace Files')).toBeInTheDocument();
  });

  it('renders file list and shows content when a file is selected', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByText('app.json'));
    expect(screen.getByText('{ "ok": true }')).toBeInTheDocument();
  });

  it('enters edit mode with textarea and save/cancel buttons', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByText('app.json'));
    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('lists system and workspace skills', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByRole('button', { name: 'Skills' }));

    expect(screen.getByText('System Skills')).toBeInTheDocument();
    expect(screen.getByText('Workspace Skills')).toBeInTheDocument();
    expect(screen.getByText('skill-one')).toBeInTheDocument();
    expect(screen.getByText('skill-two')).toBeInTheDocument();
  });

  it('expands a skill to show SKILL.md content', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByRole('button', { name: 'Skills' }));
    const skillOneButton = screen.getByRole('button', { name: /skill-one/i });
    await user.click(skillOneButton);

    const skillContent = await screen.findByText(/# Skill One/, { selector: 'pre' });
    expect(skillContent).toBeInTheDocument();
    expect(skillContent).toHaveTextContent(/Details/);
  });

  it('renders rule list and supports editing', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByRole('button', { name: 'Rules' }));
    await user.click(screen.getByText('rule-1.md'));

    expect(screen.getByText('Rule content')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays scheduled cron jobs', async () => {
    seedDefaults();
    const user = userEvent.setup();
    render(<Config />);

    await user.click(screen.getByRole('button', { name: 'Crons' }));

    expect(screen.getByText('0 0 * * *')).toBeInTheDocument();
    expect(screen.getByText('echo hello')).toBeInTheDocument();
  });

  it.each([
    {
      name: 'Files',
      path: '/api/config/files',
      loadingText: 'Loading files...',
      errorText: 'Error: boom',
      tabClick: null,
    },
    {
      name: 'Skills',
      path: '/api/config/skills',
      loadingText: 'Loading skills...',
      errorText: 'Error: boom',
      tabClick: 'Skills',
    },
    {
      name: 'Rules',
      path: '/api/config/rules',
      loadingText: 'Loading rules...',
      errorText: 'Error: boom',
      tabClick: 'Rules',
    },
    {
      name: 'Crons',
      path: '/api/crons',
      loadingText: 'Loading crons...',
      errorText: 'Error: boom',
      tabClick: 'Crons',
    },
  ])('handles loading and error states for $name tab', async ({ path, loadingText, errorText, tabClick }) => {
    const user = userEvent.setup();

    setUseApiResponse(path, { data: null, loading: true, error: null });
    const { unmount } = render(<Config />);
    if (tabClick) {
      await user.click(screen.getByRole('button', { name: tabClick }));
    }
    expect(screen.getByText(loadingText)).toBeInTheDocument();

    unmount();
    useApiResponses.clear();
    setUseApiResponse(path, { data: null, loading: false, error: 'boom' });
    render(<Config />);
    if (tabClick) {
      await user.click(screen.getByRole('button', { name: tabClick }));
    }
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });
});
