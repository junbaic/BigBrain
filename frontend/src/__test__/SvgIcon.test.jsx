import React from 'react';
import { render, screen } from '@testing-library/react';
import SvgIcon from '../components/SvgIcon';

test('svg icon test', async () => {
  render(<SvgIcon.Edit/>);
  const icon = screen.getByRole('icon');
  expect(icon).toBeInTheDocument();
});
