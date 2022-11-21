import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import http, { getLoginName, SessionStorage } from '../utils/http';
import PropTypes from 'prop-types';
import * as CONSTANT from '../utils/constant';
import CountDown from './Countdown';
import SvgIcon from './SvgIcon';
import { linkParseToEmbedUrl, showToast } from '../utils/utils';

function Game () {
  const param = useParams();
  const sessionId = param.id;
  const [playerId, setPlayerId] = useState(null)
  const [started, setStarted] = useState(false)
  const [currQuestion, setCurrQuestion] = useState(null);
  const [rightAnswer, setRightAnswer] = useState([]);
  const [isTimeEnd, setIsTimeEnd] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const nav = useNavigate();
  const { current: Timer } = useRef({
    status: null,
    question: null,
  })

  useEffect(() => {
    (async () => {
      // get saved playerId get playerId
      const data = SessionStorage.get();
      if (data && data.sessionId === sessionId) {
        setPlayerId(data.playerId);
        return;
      }
      // join
      const resp = await http.post(`/play/join/${sessionId}`, {
        name: getLoginName(),
      });
      setPlayerId(resp.data.playerId);
      // save session id & player id pair
      SessionStorage.save(sessionId, resp.data.playerId);
    })();
  }, [])

  // when player id changed, try to get status
  // if failed nav to dashboard
  useEffect(() => {
    if (playerId !== null && quizResult === null) {
      // get whether game is started
      Timer.status = setInterval(async () => {
        try {
          const resp = await http.get(`/play/${playerId}/status`);
          const _started = resp.data.started;
          if (_started === true) {
            clearInterval(Timer.status);
            startPollQuestion();
          }
          if (started !== _started) {
            setStarted(resp.data.started);
          }
        } catch (e) {
          clearInterval(Timer.status);
          nav('/dashboard');
        }
      }, 1000)
    }
  }, [playerId])

  const startPollQuestion = () => {
    clearInterval(Timer.question);
    // start to poll
    Timer.question = setInterval(() => {
      pollQuestion(Timer.question);
    }, 1000);
  }

  const pollQuestion = async (timer) => {
    try {
      const resp = await http.get(`/play/${playerId}/question`);
      if (!currQuestion || resp.data.question.id !== currQuestion.id) {
        setCurrQuestion(resp.data.question);
        setIsTimeEnd(false)
        setRightAnswer([]);
        clearInterval(timer)
      }
    } catch (e) {
      // quiz may end
      clearInterval(timer);
      getResult();
    }
  }

  const getResult = async () => {
    const resp = await http.get(`/play/${playerId}/results`);
    setQuizResult(resp.data);
  }

  // when game is not started
  if (!started) {
    return <div className='w-screen h-screen flex-center bg-green-300'>
      <div className='top-0 z-10 w-screen flex-center py-9 bg-white font-bold animate-pulse text-3xl mobile:px-12'>LOBBY:Wait for the admin to start the game</div>
    </div>
  }

  // when no question data
  if (currQuestion === null) {
    return <div>waiting data...</div>
  }

  // result
  if (quizResult !== null) {
    return <>
      <Link to='/dashboard' className='m-2 button bg-blue-300 hover:bg-blue-400 w-auto'>
        Back To Dashboard
      </Link>
      {quizResult.map((item, index) => (
        <Fragment key={index}>
          <div className={`m-2 p-2 ${item.correct ? 'bg-green-400 text-gray-100' : 'bg-red-400 text-gray-600'} rounded`}>
            <span className='text-3xl'>{index + 1}.</span>
            <span>your answers: {item.answerIds.map(idx => CONSTANT.LETTERS_SEQUENCE[idx]).join(' ')}</span>
          </div>
        </Fragment>
      ))}
    </>
  }

  const {
    id,
    description,
    type,
    answers = [],
    point,
    isoTimeLastQuestionStarted,
    timeLimit,
    url,
  } = currQuestion

  const onTimeEnd = async () => {
    try {
      const resp = await http.get(`/play/${playerId}/answer`);
      setIsTimeEnd(true);
      setRightAnswer(resp.data.answerIds)
      startPollQuestion();
    } catch (e) {
      console.error(e);
      // this case may be causes by admin
      // accident advance to next question before time completed
      // so we switch to next question to prevent page stuck
      startPollQuestion();
    }
  }

  return <div className='h-screen w-screen flex mobile:flex-col-reverse'>
    <div className='flex-col w-80 m-4 mobile:w-auto mobile:flex-1'>
      <div className='bg-green-200 p-3 rounded text-lg text-gray-800'>{description}</div>
      <div className='flex items-center'>
        <div className='my-2 flex items-center bg-green-600 select-none text-white w-min rounded overflow-hidden'>
          <div className='py-1 px-2'>point</div>
          <div className='py-1 px-2 bg-green-500'>{point}</div>
        </div>
        {!isTimeEnd && <div className='flex items-center ml-2'>
          <SvgIcon.Clock/>
          <div className='ml-1'>
            <CountDown
              endTimeStamp={CountDown.calculateEndTime(
                isoTimeLastQuestionStarted,
                timeLimit,
              )}
              onTimeEnd={onTimeEnd}
            />
          </div>
        </div>}
      </div>
      <GameAnswer
        id={id}
        answers={answers}
        type={type}
        playerId={playerId}
        isTimeEnd={isTimeEnd}
        rightAnswer={rightAnswer}/>
      {isTimeEnd && <div className='animate-pulse font-bold text-center text-2xl'>Waiting for admin action</div>}
    </div>
    <div className='flex-1 mr-4 mobile:mt-2 mobile:mx-2 mobile:flex-none'>
      {url && <iframe
        width="100%"
        height="250"
        src={linkParseToEmbedUrl(url, true)}
        title="YouTube video player"
        className='mt-2 rounded-md'
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"/>}
    </div>
  </div>
}

function GameAnswer (props) {
  const [selectList, setSelectList] = useState([]);

  useEffect(() => {
    setSelectList([]);
  }, [props.id])

  useEffect(() => {
    const rightAnswer = props.rightAnswer || [];
    setSelectList(oldList => {
      return props.answers.map((str, index) => ({
        str,
        index: index,
        selected: oldList[index] ? oldList[index].selected : false,
        correct: rightAnswer.includes(index),
      }));
    })
  }, [props.answers, props.rightAnswer])

  const onItemClick = async (index) => {
    if (props.isTimeEnd) {
      showToast('time is end, waiting...');
      return;
    }
    selectList[index].selected = !selectList[index].selected;

    if (props.type === CONSTANT.QUESTION_TYPE.SINGLE) {
      for (let i = 0; i < selectList.length; i++) {
        if (index !== i) {
          selectList[i].selected = false;
        }
      }
    }

    const list = selectList
      .filter(item => item.selected)
      .map(item => item.index);

    if (list.length === 0) {
      setSelectList([...selectList]);
      return;
    }

    // update answer
    await http.put(`/play/${props.playerId}/answer`, {
      answerIds: list,
    })
    setSelectList([...selectList]);
  }

  return selectList.map((item, index) => (
    <Fragment key={item.str}>
      <div
        className={`border-green-400 flex items-center border my-1 p-2 rounded ${
          !props.isTimeEnd
            ? item.selected
              ? 'bg-green-600 text-white'
              : 'bg-white hover:bg-green-100'
            : item.selected
              ? item.correct ? 'bg-green-400' : 'bg-yellow-500'
              : item.correct ? 'bg-red-500' : ''}`}
        onClick={() => onItemClick(index)}>
        {props.isTimeEnd && item.selected
          ? item.correct
              ? <SvgIcon.Check/>
              : <SvgIcon.Close/>
          : item.correct
            ? <SvgIcon.Check/>
            : <></>}
        <div>{CONSTANT.LETTERS_SEQUENCE[index]}. {item.str}</div>
      </div>
    </Fragment>
  ))
}

GameAnswer.propTypes = {
  id: PropTypes.string,
  answers: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.number,
  playerId: PropTypes.number,
  isTimeEnd: PropTypes.bool,
  rightAnswer: PropTypes.arrayOf(PropTypes.number),
}

export default Game;
