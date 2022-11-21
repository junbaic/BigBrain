import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../components/Register';


test('register', async () => {
  const mockFn = jest.fn();
  render(
    <MemoryRouter>
      <Register onRegister={mockFn}/>
    </MemoryRouter>
  );

  const emailInput = screen.getByRole('email');
  const passwordInput = screen.getByRole('password');
  const nameInput = screen.getByRole('name');
  fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
  fireEvent.change(passwordInput, { target: { value: 'test123' } });
  fireEvent.change(nameInput, { target: { value: 'test' } });

  expect(emailInput).toHaveValue('test@test.com');
  expect(passwordInput).toHaveValue('test123');
  expect(nameInput).toHaveValue('test');

  const regBtn = screen.getByText('Register');

  fireEvent.click(regBtn);
  expect(mockFn).toHaveBeenCalledTimes(1);
});
