import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';
import Result from '../components/Result';
import { delay } from './_utils';


jest.mock('../utils/http', () => {
  const id = 12345;
  const createAt = new Date().toISOString();
  const name = 'test quizz';
  let active = false;
  let sessionId = null;
  let stage = -1;
  return {
    get: async (url) => {
      if (url === '/admin/quiz') {
        return {
          data: {
            quizzes: [
              {
                active: sessionId,
                createAt: createAt,
                id: id,
                name: name,
                oldSession: [],
                owner: '',
                thumbnail: null,
              }
            ]
          }
        }
      } else if (url === `/admin/quiz/${id}`) {
        return {
          data: {
            active: sessionId,
            createAt: createAt,
            name: name,
            oldSession: [],
            owner: '',
            questions: [],
            thumbnail: null,
          }
        }
      } else if (url === `/admin/session/${sessionId}/status`) {
        return {
          data: {
            results: {
              active: active,
              answerAvailable: false,
              isoTimeLastQuestionStarted: null,
              position: stage,
              players: [],
              questions: [],
            }
          }
        }
      } else if (url === `/admin/session/${sessionId}/results`) {
        return {
          data: {
            results: [],
          }
        }
      }
    },
    post: async (url) => {
      if (url === '/admin/auth/login') {
        return {
          data: {
            token: 'XXXX',
          }
        }
      } else if (url === '/admin/quiz/new') {
        return {
          data: {
            quizId: 'testId',
          }
        }
      } else if (url === `/admin/quiz/${id}/start`) {
        active = true;
        sessionId = 23456;
        return {
          data: {},
        }
      } else if (url === `/admin/quiz/${id}/advance`) {
        stage += 1;
        return {
          data: {
            stage: stage,
          }
        }
      }
    },
    clearLoginData: () => {},
    saveLoginData: () => {},
  }
})

// Avoid printing too many logs
jest.spyOn(global.console, 'log').mockImplementation(() => {
  return () => {}
})

describe('dashboard', () => {
  test('Creates a new game', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path='/edit' element={<>game</>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </MemoryRouter>
    );
    // wait for state changed to settle down
    await act(async () => {
      await delay(10);
    })
    const createBtn = screen.getByText('Create');

    await act(async () => {
      fireEvent.click(createBtn);
      await delay(100);
      const input = screen.getByRole('inputName');
      fireEvent.change(input, { target: { value: 'test_quiz' } });
      expect(input).toHaveValue('test_quiz');
    })

    await act(async () => {
      const confirmBtn = screen.getByText('Confirm');
      fireEvent.click(confirmBtn);
    })

    const game = screen.getByText('game');
    expect(game).toBeInTheDocument();
  });

  test('Start a game', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </MemoryRouter>
    );
    await act(async () => {
      await delay(10);
      const startBtn = screen.getByText('Start');
      fireEvent.click(startBtn);
      await delay(100);
    });
    const startBtn2 = screen.getByText('Start Answering');
    expect(startBtn2).toBeInTheDocument();
  });

  test('Ends a game & Loads the results page', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path='/result/:id' element={<Result/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </MemoryRouter>
    );
    await act(async () => {
      await delay(10);
      const button = screen.getByText('Start Answering');
      fireEvent.click(button);
    })
    const text = screen.getByText('Would you like to view the results?');
    expect(text).toBeInTheDocument();

    const checkBtn = screen.getByText('Check it');
    await act(async () => {
      fireEvent.click(checkBtn);
      await delay(100);
    })
    const backBtn = screen.getByText('Back To Dashboard');
    expect(backBtn).toBeInTheDocument();
  });

  test('log out', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path='/' exact element={<>root</>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </MemoryRouter>
    );
    await act(async () => {
      await delay(10);
      const logOutBtn = screen.getByText('Log out');
      fireEvent.click(logOutBtn);
    })
    await act(async () => {
      await delay(100);
      const confirmBtn = screen.getByText('Confirm');
      fireEvent.click(confirmBtn);
    })
    const result = screen.getByText('root');
    expect(result).toBeInTheDocument();
  });

  test('Logs back into the application', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' exact element={<Login/>}/>
          <Route path='/dashboard' element={<>dashboard</>}/>
        </Routes>
      </MemoryRouter>
    );

    const emailInput = screen.getByRole('email');
    const passwordInput = screen.getByRole('password');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'test123' } });

    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('test123');

    const logBtn = screen.getByText('Login');
    
    await act(async () => {
      fireEvent.click(logBtn);
    })
    const dashboard = screen.getByText('dashboard');
    expect(dashboard).toBeInTheDocument();
  });
});