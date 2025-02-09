import { render, screen, fireEvent } from '@testing-library/react';
import Account from './page.jsx'; 
import '@testing-library/jest-dom';


test('renders Account and checks for key elements', async () => {
    render(<Account />);
  
    // Check if the username is displayed
    expect(screen.getByRole('heading', { name: /username/i })).toBeInTheDocument();
  
    // Check if the "Edit Mode" button is visible
    const editButton = screen.getByRole('button', { name: /edit mode/i });
    expect(editButton).toBeInTheDocument();
  
    // Check if the "Game Recs Category 1" is visible
    expect(screen.getByText('Game Recs Category 1')).toBeInTheDocument();
  
    // Ensure that multiple "Game 1" elements are found (all games)
    const games = screen.getAllByText(/Game 1/i);
    expect(games.length).toBeGreaterThan(0); // Ensure there is at least one match for "Game 1"
  
    // You can also do the same for other games
    expect(screen.getAllByText(/Game 2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Game 3/i).length).toBeGreaterThan(0);
  });