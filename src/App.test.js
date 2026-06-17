import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ScamSnap app', () => {
  render(<App />);
  const analyzeButton = screen.getByText(/Analyze Now/i);
  expect(analyzeButton).toBeInTheDocument();
});
