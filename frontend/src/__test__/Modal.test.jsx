import { act, fireEvent, screen, render } from '@testing-library/react';
import Modal from '../components/Modal';
import { delay } from './_utils';

test('Modal', async () => {
  const onConfirm = jest.fn();
  render(
    <Modal title="test modal" onConfirm={onConfirm}/>
  );
  await delay(100);
  const title = screen.getByText('test modal');
  expect(title).toBeInTheDocument();
  const confirmbtn = screen.getByText('Confirm');
  await act(async () => {
    fireEvent.click(confirmbtn);
  })
  expect(onConfirm).toHaveBeenCalledTimes(1);
})