import React from 'react';
import { render, screen } from '@testing-library/react';
import Banner from '.src/components/Banner'; // Import the Banner component

describe('Create post button', () => {
  test('should be disabled for guest users', () => {
    const guestUser = { isGuest: true };
    const currentPage = { page: 'home' };
    render(<Banner user={guestUser} currentPage={currentPage} handleCreatePostClick={() => {}} />);
    const button = screen.getByText('📝 Create Post');

    // Check if the button has the class 'create-post-button-disabled', indicating it's disabled
    expect(button).toHaveClass('create-post-button-disabled');
    expect(button).toBeDisabled();
  });

  test('should be enabled for registered users', () => {
    const registeredUser = { isGuest: false };
    const currentPage = { page: 'home' };
    render(<Banner user={registeredUser} currentPage={currentPage} handleCreatePostClick={() => {}} />);
    const button = screen.getByText('📝 Create Post');

    // Check if the button is not disabled and has the correct class
    expect(button).not.toHaveClass('create-post-button-disabled');
    expect(button).toBeEnabled();
  });

  test('should call handleCreatePostClick when clicked (for registered user)', () => {
    const registeredUser = { isGuest: false };
    const currentPage = { page: 'home' };
    const handleCreatePostClick = jest.fn(); // Mock function to track click
    render(<Banner user={registeredUser} currentPage={currentPage} handleCreatePostClick={handleCreatePostClick} />);
    const button = screen.getByText('📝 Create Post');
    button.click();
    expect(handleCreatePostClick).toHaveBeenCalled();
  });
});