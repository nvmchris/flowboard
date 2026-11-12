import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeAll(() => {
  // jsdom does not implement <dialog> or matchMedia.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query })) as unknown as typeof window.matchMedia;
});

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('renders the demo board on first visit', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: 'Backlog column' })).toBeInTheDocument();
    expect(screen.getByText('Export board as JSON')).toBeInTheDocument();
  });

  it('adds a card to a column', async () => {
    const user = userEvent.setup();
    render(<App />);
    const todo = screen.getByRole('region', { name: 'To Do column' });
    await user.click(within(todo).getByRole('button', { name: /add card/i }));
    await user.type(within(todo).getByPlaceholderText('What needs to be done?'), 'Ship v1{Enter}');
    expect(within(todo).getByText('Ship v1')).toBeInTheDocument();
  });

  it('filters cards with the search box', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'dark mode');
    expect(screen.getByText('Polish dark mode palette')).toBeInTheDocument();
    expect(screen.queryByText('Export board as JSON')).not.toBeInTheDocument();
  });

  it('deletes a card and restores it with undo', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Card cover images'));
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.queryByText('Card cover images')).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('status', { name: 'Notifications' })).getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Card cover images')).toBeInTheDocument();
  });
});
