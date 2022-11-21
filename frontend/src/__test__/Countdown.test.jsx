import React from 'react';
import { render, waitFor } from '@testing-library/react';
import CountDown from '../components/Countdown';

test('countdown test', async () => {
  let isEnd = false;
  const promise = new Promise((resolve) => {
    render(
      <CountDown
        endTimeStamp={Date.now() + 1000}
        onTimeEnd={() => {
          isEnd = true;
          resolve();
        }}/>
    );
  })
  expect(isEnd).toBe(false);
  await waitFor(() => promise)
  expect(isEnd).toBe(true);
});
