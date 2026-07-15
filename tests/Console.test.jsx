import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Console from '../src/components/Console';

// Mock list of initial incidents and found items
const mockIncidents = [
  { id: 'INC-302', type: 'Lost Item', title: 'Black Nike Backpack', description: 'With notebook and laptop', lastSeen: 'Gate B', reportedAt: '8:00 PM', status: 'Pending' }
];

const mockFoundItems = [
  { id: 'FND-105', description: 'Blue jacket', foundLocation: 'Gate A', timeFound: '8:25 PM', status: 'Matched' }
];

describe('Console Component Tests', () => {
  it('renders Operations Console, lists logs, and lists active incidents', () => {
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

    // Verify it renders the dashboard elements
    expect(screen.getByText(/Open Incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/Black Nike Backpack/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Klaus/i)).toBeInTheDocument();
  });

  it('triggers Simulation and finds match when a matching found item is logged', async () => {
    const setIncidents = vi.fn();
    const setFoundItems = vi.fn();
    const setAiLogs = vi.fn();

    render(
      <Console 
        incidents={mockIncidents} 
        setIncidents={setIncidents} 
        foundItems={mockFoundItems} 
        setFoundItems={setFoundItems} 
        aiLogs={[]} 
        setAiLogs={setAiLogs} 
      />
    );

    // Type a matching description (Nike Backpack)
    fireEvent.change(screen.getByPlaceholderText(/Klaus/i), {
      target: { value: 'Nike Backpack found near Section 104' }
    });

    // Submit found form
    fireEvent.click(screen.getByRole('button', { name: /Start AI Match Search/i }));

    // Wait for the simulated step steps to finish
    await waitFor(() => {
      expect(setIncidents).toHaveBeenCalled();
    }, { timeout: 6000 });
  });
});
