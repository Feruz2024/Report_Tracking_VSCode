import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main management sections', () => {
  render(<App />);
  expect(screen.getByText(/Task Tracker: Client Management/i)).toBeInTheDocument();
  expect(screen.getByText(/Campaign Management/i)).toBeInTheDocument();
  expect(screen.getByText(/Station Management/i)).toBeInTheDocument();
  expect(screen.getByText(/Media Analyst Management/i)).toBeInTheDocument();
});
