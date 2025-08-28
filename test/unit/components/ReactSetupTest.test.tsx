import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';

// Simple test component to verify React setup
const TestComponent = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

describe('React Setup Test', () => {
  it('should render a simple React component without hook errors', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument();
  });
  
  it('should handle React hooks correctly', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const button = screen.getByRole('button', { name: 'Increment' });
    
    await act(async () => {
      await user.click(button);
    });
    
    // The component should re-render with the new count
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
  
  it('should have React available globally', () => {
    expect(React).toBeDefined();
    expect(React.useState).toBeDefined();
    expect(React.createElement).toBeDefined();
  });
});