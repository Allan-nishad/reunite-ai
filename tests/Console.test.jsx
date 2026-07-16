import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Console from '../src/components/Console';

const mockIncidents = [
  { id: 'INC-302', type: 'Lost Item', title: 'Black Nike Backpack', description: 'With notebook and laptop', lastSeen: 'Gate B', reportedAt: '8:00 PM', status: 'Pending' }
];

const mockFoundItems = [
  { id: 'FND-105', description: 'Blue jacket', foundLocation: 'Gate A', timeFound: '8:25 PM', status: 'Matched' }
];

afterEach(() => {
  vi.useRealTimers();
});

describe('Console Component Tests', () => {
  it('renders Operations Console with correct UI elements', () => {
    render(
      <Console
        incidents={mockIncidents}
        setIncidents={vi.fn()}
        foundItems={mockFoundItems}
        setFoundItems={vi.fn()}
        aiLogs={[]}
        setAiLogs={vi.fn()}
      />
    );

    expect(screen.getByText(/Open Incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/Black Nike Backpack/i)).toBeInTheDocument();
    // Verify the description textarea is accessible via aria-label
    expect(screen.getByLabelText(/Item Description/i)).toBeInTheDocument();
  });

  it('triggers AI simulation when found item form is submitted', async () => {
    const setAiLogs = vi.fn();

    // Use fake timers to skip 3.8s animation delay
    vi.useFakeTimers();

    render(
      <Console
        incidents={mockIncidents}
        setIncidents={vi.fn()}
        foundItems={mockFoundItems}
        setFoundItems={vi.fn()}
        aiLogs={[]}
        setAiLogs={setAiLogs}
      />
    );

    // Type in the description field
    fireEvent.change(screen.getByLabelText(/Item Description/i), {
      target: { value: 'Nike Backpack found near Section 104' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Start AI Match Search/i }));

    // Verify simulation started — the button click triggers setIsSimulating(true)
    // The submit button should become disabled during simulation
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Simulation is running — the component should be in simulating state
    // (button or loader visible, setAiLogs will be called when it completes)
    // This verifies the form submit and simulation trigger path works
    expect(screen.getByRole('status', { name: /AI matching in progress/i })).toBeInTheDocument();
  }, 10000);
});
