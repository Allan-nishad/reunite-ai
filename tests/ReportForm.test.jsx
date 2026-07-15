import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportForm from '../src/components/ReportForm';

describe('ReportForm Component Tests', () => {
  it('renders all form fields correctly', () => {
    render(<ReportForm onAddIncident={vi.fn()} setActiveTab={vi.fn()} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. John Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Black Nike Backpack/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Provide physical features/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Report/i })).toBeInTheDocument();
  });

  it('submits manual report successfully when required fields are filled', () => {
    const handleAddIncident = vi.fn();
    render(<ReportForm onAddIncident={handleAddIncident} setActiveTab={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/e.g. Black Nike Backpack/i), { target: { value: 'Lost Keys' } });
    fireEvent.change(screen.getByPlaceholderText(/Provide physical features/i), { target: { value: 'Keys with green keychain' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Report/i }));

    expect(handleAddIncident).toHaveBeenCalled();
    expect(screen.getByText(/Incident Successfully Logged/i)).toBeInTheDocument();
  });

  it('auto-fills and submits when a Demo Shortcut is clicked', async () => {
    const handleAddIncident = vi.fn();
    render(<ReportForm onAddIncident={handleAddIncident} setActiveTab={vi.fn()} />);

    // Click the Nike Backpack shortcut
    const shortcutButton = screen.getByRole('button', { name: /Nike Backpack/i });
    fireEvent.click(shortcutButton);

    // Form fields are populated (placeholder changes to value)
    await waitFor(() => {
      const input = screen.getByDisplayValue('Black Nike Backpack');
      expect(input).toBeInTheDocument();
    });

    // Wait for the simulated delay (900ms) to trigger submission
    await waitFor(() => {
      expect(handleAddIncident).toHaveBeenCalled();
      expect(screen.getByText(/Incident Successfully Logged/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
