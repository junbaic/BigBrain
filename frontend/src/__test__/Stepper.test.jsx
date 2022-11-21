import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Stepper from '../components/Stepper';

test('stepper test', async () => {
  let count = 0;
  const onChange = () => {
    count++;
  }
  render(<Stepper min={0} max={10} value={0} onChange={onChange}/>);
  let stepper = screen.getByText('0');
  expect(stepper).toBeInTheDocument();

  const addBtn = screen.getByText('+');
  fireEvent.click(addBtn);
  stepper = screen.getByText('1');
  expect(stepper).toBeInTheDocument();

  const subBtn = screen.getByText('-');
  fireEvent.click(subBtn);
  stepper = screen.getByText('0');
  expect(stepper).toBeInTheDocument();

  expect(count).toEqual(2);
});
