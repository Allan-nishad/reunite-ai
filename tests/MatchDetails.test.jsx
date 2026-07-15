import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MatchDetails from '../src/components/MatchDetails';

const mockIncident = {
  id: 'INC-302',
  title: 'Black Nike Backpack',
  description: 'With laptop and notebook',
  lastSeen: 'Gate B',
  reportedAt: '8:00 PM',
  status: 'Matching'
};

const mockMatchData = {
  confidence: 94,
  reasons: [
    { text: 'Brand matches: Nike', status: 'match' },
    { text: 'Contents match: Laptop', status: 'match' }
  ],
  timeline: [
    { time: '8:00 PM', event: 'Lost Report Created' },
    { time: '8:21 PM', event: 'Match Identified' }
  ],
  verificationQuestions: [
    'Confirm model of laptop?',
    'Any specific keychains?'
  ],
  actions: [
    { text: 'Verify Owner Identity', status: 'pending' }
  ]
};

describe('MatchDetails Component Tests', () => {
  it('renders confidence score, reasoning statements, and timeline', () => {
    render(
      <MatchDetails 
        incident={mockIncident} 
        matchData={mockMatchData} 
        onResolve={vi.fn()} 
        onBack={vi.fn()} 
      />
    );

    // Confidence
    expect(screen.getByText('94%')).toBeInTheDocument();
    
    // Reasoning
    expect(screen.getByText('Brand matches: Nike')).toBeInTheDocument();
    expect(screen.getByText('Contents match: Laptop')).toBeInTheDocument();

    // Verification questions
    expect(screen.getByText('Confirm model of laptop?')).toBeInTheDocument();
  });

  it('allows workflow checks and triggers resolve', () => {
    vi.useFakeTimers();
    const handleResolve = vi.fn();
    
    render(
      <MatchDetails 
        incident={mockIncident} 
        matchData={mockMatchData} 
        onResolve={handleResolve} 
        onBack={vi.fn()} 
      />
    );

    // Find custom button actions
    const notifyButton = screen.getByText(/Notify Volunteer Desk/i);
    const verifyButton = screen.getByText(/Verify ownership checklist/i);
    const resolveButton = screen.getByRole('button', { name: /Confirm Return & Resolve/i });

    expect(notifyButton).toBeInTheDocument();
    expect(verifyButton).toBeInTheDocument();
    expect(resolveButton).toBeInTheDocument();

    // Check "Confirm Return" button click
    fireEvent.click(resolveButton);

    // Fast-forward simulated delay (1000ms)
    vi.runAllTimers();

    // Checking the resolve callback gets triggered when returned is checked
    expect(handleResolve).toHaveBeenCalledWith('INC-302');
    
    vi.useRealTimers();
  });
});
