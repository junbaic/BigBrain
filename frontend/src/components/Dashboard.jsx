import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http, { clearLoginData } from '../utils/http';
import { copy, showToast } from '../utils/utils';
import CountDown from './Countdown';
import Modal from './Modal';
import SvgIcon from './SvgIcon';

/**
 * all games
 * title,
 * num of quiz
 * thumbnail
 * total time to complete
 */
function Dashboard () {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoomStopPopup, setShowRoomStopPopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [stopSessionId, setStopSessionId] = useState(false);
  const [currQuizData, setCurrQuizData] = useState(null);
  const nav = useNavigate();
  const quizNameInput = useRef();

  const onLogOut = async () => {
    try {
      await http.post('/admin/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      clearLoginData()
      nav('/');
    }
  }

  const onCreate = async () => {
    const name = quizNameInput.current.value;
    if (!name) {
      showToast('invalid name');
      return;
    }
    const resp = await http.post('/admin/quiz/new', { name });
    setShowCreateModal(false);
    nav(`/edit?id=${resp.data.quizId}`);
  }

  const updateData = async () => {
    const resp = await http.get('/admin/quiz');
    setQuizzes(resp.data.quizzes);
  }

  // pull data when first render
  useEffect(() => {
    updateData();
  }, [])

  // when refresh quiz list, select firsh quiz to display as default
  useEffect(() => {
    if (quizzes && quizzes.length && (!currQuizData || !currQuizData.id)) {
      onQuizClick(quizzes[0]);
    }
  }, [quizzes])

  const onDelete = async (id) => {
    await http.delete(`/admin/quiz/${id}`);
    setCurrQuizData(null);
    const index = quizzes.findIndex((item) => item.id === id);
    if (index !== -1) {
      setQuizzes(list => {
        list.splice(index, 1);
        return [...list];
      })
    }
  }

  const onEdit = (id) => nav(`/edit?id=${id}`)

  const onQuizStart = async (id) => {
    // start
    await http.post(`/admin/quiz/${id}/start`);
    // get information
    const resp = await http.get(`/admin/quiz/${id}`);
    const sessionId = resp.data.active;
    setCurrQuizData(quiz => {
      return createCustomData(quiz, {
        sessionId: sessionId,
        active: true,
      });
    })
    getStatus(id, sessionId);
  }

  const onQuizAdvance = async () => {
    try {
      // if can advance
      if (!ifCanAdvance(currQuizData)) {
        showToast('cannot advance until the question is over');
        return;
      }
      await http.post(`/admin/quiz/${currQuizData.id}/advance`);
      // just give an interactive feedback
      showToast('Advance');
      // reset the canAdvance
      setCurrQuizData(createCustomData(currQuizData, {
        canAdvance: false,
      }));
      // whether the game's position is move to the end
      if (isStatusEnd(currQuizData)) {
        // if yes, popup a modal to let admin decide to whether check result or not
        setStopSessionId(currQuizData.sessionId);
        setShowRoomStopPopup(true);
      }
    } catch (e) {
      console.error(e);
    }
    getStatus(currQuizData.id, currQuizData.sessionId);
  }

  const onQuizStop = async (id) => {
    try {
      await http.post(`/admin/quiz/${id}/end`);
    } catch (e) {
      console.error(e);
      updateData();
    }
    setStopSessionId(id);
    setShowRoomStopPopup(true);
    getStatus(id);
  }

  const onQuizClick = async (quizData) => {
    getStatus(quizData.id, quizData.active)
  }

  const getStatus = async (quizId, sessionId) => {
    const reqs = [
      http.get(`/admin/quiz/${quizId}`),
    ]
    if (sessionId) {
      reqs.push(http.get(`/admin/session/${sessionId}/status`));
    }
    const [resp1, resp2] = await Promise.all(reqs);
    const { data } = resp1;
    let newCurrData = createCustomData(currQuizData, {
      id: quizId,
      questionNum: data.questions.length,
      createdAt: data.createdAt,
      name: data.name,
      active: !!data.active,
      sessionId: data.active,
      questions: data.questions,
      thumbnail: data.thumbnail,
    });
    if (resp2) {
      const { data: { results: data } } = resp2;
      newCurrData = createCustomData(newCurrData, {
        id: quizId,
        active: data.active,
        isoTimeLastQuestionStarted: data.isoTimeLastQuestionStarted,
        position: data.position,
        playerCount: data.players.length,
        questionNum: data.questions.length,
      });
    }
    newCurrData = createCustomData(newCurrData, {
      id: quizId,
      canAdvance: ifCanAdvance(newCurrData),
    })
    console.log(newCurrData);
    setCurrQuizData(newCurrData);
  }

  const onTimeEnd = () => {
    setCurrQuizData(createCustomData(currQuizData, {
      id: currQuizData.id,
      canAdvance: true, // can advance
    }))
  }

  const _endTime = getCurrEndTimeStamp(currQuizData);

  return <div className='w-screen h-screen'>
    <div className="relative flex bg-white h-16 box-border px-4 py-2 w-screen">
      <button className='button2' onClick={() => setShowCreateModal(true)}>Create</button>
      <button className='underline ml-auto' onClick={() => setShowLogoutPopup(true)}>Log out</button>
    </div>
    <div className='flex mt-2 mobile:flex-col'>
      {currQuizData && currQuizData.id && <div className={`transition-all w-1/3 mx-3 mobile:w-auto flex flex-col ${currQuizData.active ? 'bg-green-200' : 'bg-indigo-100'} rounded p-2`}>
        <div className='text-lg font-bold'>{currQuizData.name}</div>
        <div className='my-1'>
          <span>{currQuizData.active ? 'Active' : 'Inactive'}</span>
        </div>
        <div className='my-1'>
          <div>
            {currQuizData.active
              ? <>Questions: {currQuizData.position + 1}/{currQuizData.questionNum}</>
              : <>Questions: {currQuizData.questionNum}</>
            }
          </div>
          {currQuizData.active && <div>Num Of Players: {currQuizData.playerCount}</div>}
          {currQuizData.active && <div className='mt-2'>
            <button className={`button2 ${currQuizData.canAdvance ? '' : 'pointer-events-none opacity-50'}`} onClick={onQuizAdvance}>
              {currQuizData.position !== -1 && <span className={`${currQuizData.canAdvance ? 'absolute animate-ping' : 'hidden'}`}>Advance</span>}
              <span>{currQuizData.position === -1 ? 'Start Answering' : 'Advance'}</span>
              {_endTime && !currQuizData.canAdvance && <span>
                (<CountDown endTimeStamp={_endTime} onTimeEnd={onTimeEnd}/>s)
                </span>}
            </button>
            <button className={'button2 ml-1'} onClick={() => onQuizStop(currQuizData.id)}>Stop</button>
            {currQuizData.sessionId && <button className='button2 ml-1' onClick={() => {
              const link = `${location.origin}/game/${currQuizData.sessionId}`;
              copy(link);
              showToast('Copied!');
            }}>Copy Link</button>}
          </div>}
          {!currQuizData.active && <div className='mt-2'>
            <button className='button2' onClick={() => onQuizStart(currQuizData.id)}>Start</button>
            {currQuizData.sessionId && <button className='button2 ml-1 bg-blue-300' onClick={() => nav(`/result/${currQuizData.sessionId}`)}>Check Result</button>}
            <button className='button2 ml-1' onClick={() => onEdit(currQuizData.id)}>Edit</button>
            <button className='button2 ml-1' onClick={() => onDelete(currQuizData.id)}>Delete</button>
            <button className='button2 ml-1 items-center' onClick={() => nav(`/history/${currQuizData.id}`)}><SvgIcon.Clock className="w-3 h-3"/> History</button>
          </div>}
        </div>
        <img className='w-full h-40 rounded-md mt-2' src={currQuizData.thumbnail} alt='thumbnail'/>
      </div>}
      <div className='flex flex-col flex-1 mx-3 h-min mobile:mt-2 mobile:w-auto'>
        {quizzes.map((item) => (
          <Fragment key={item.id}>
            <div
              className={`lg:flex lg:items-center lg:justify-between px-2 py-3 border-b hover:bg-blue-100 cursor-pointer active:bg-blue-300 ${currQuizData && currQuizData.id === item.id ? 'bg-blue-200' : 'bg-gray-200'}`}
              onClick={() => onQuizClick(item)}>
              <div className='flex-1 min-w-0'>
                <h2 className='text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate'>{item.name}</h2>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>

    {showCreateModal && <Modal title="create quiz"
      width="80%"
      onConfirm={onCreate}
      onCancel={() => setShowCreateModal(false)}>
      <div className='flex items-center mb-5'>
        <label className='whitespace-nowrap mr-2'>Quiz name:</label>
        <input className='input rounded-lg' ref={quizNameInput} role='inputName'></input>
      </div>
    </Modal>}
    {showRoomStopPopup && <Modal
      title='Quiz Stopped'
      width='300px'
      confirmText='Check it'
      onCancel={() => setShowRoomStopPopup(false) }
      onConfirm={() => {
        setShowRoomStopPopup(false);
        nav(`/result/${stopSessionId}`);
      }}>
        <p>Would you like to view the results?</p>
      </Modal>}
    {showLogoutPopup && <Modal
      title='Do you want to log out?'
      onCancel={() => setShowLogoutPopup(false)}
      onConfirm={() => {
        setShowLogoutPopup(false);
        onLogOut();
      }}
    >
      </Modal>}
  </div>
}

const createCustomData = (oldData, newData) => {
  if (!oldData) oldData = {};
  if (!newData) newData = {};
  if (oldData.id !== newData.id) {
    return newData;
  } else {
    return {
      ...oldData,
      ...newData,
    }
  }
}

const isStatusEnd = (currQuizData) => {
  return currQuizData.position >= currQuizData.questionNum - 1;
}

/**
 * get current question end timestamp
 * @param {*} currQuizData
 * @returns {-1 | null | number}\
 * null: no end time
 * other: expected return value
 */
const getCurrEndTimeStamp = (currQuizData) => {
  try {
    if (currQuizData.position === -1) {
      return null;
    }
    const currentQuestion = currQuizData.questions[currQuizData.position];
    if (currQuizData) {
      const timeStamp = new Date(currQuizData.isoTimeLastQuestionStarted).valueOf();
      const endTimeStamp = timeStamp + currentQuestion.timeLimit * 1000;
      return endTimeStamp;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

// is the game ready to go next
const ifCanAdvance = (currQuizData) => {
  const currEndTimeStamp = getCurrEndTimeStamp(currQuizData);
  if (currEndTimeStamp === -1) {
    return false;
  } else {
    return Date.now() >= currEndTimeStamp;
  }
}

export default Dashboard;
