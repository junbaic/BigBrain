import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import http from '../utils/http';

function Result () {
  const param = useParams();
  const sessionId = param.id;
  const [playerList, setPlayerList] = useState(null);
  const [scoreList, setScoreList] = useState(null);
  console.log(sessionId);
  useEffect(() => {
    (async () => {
      const [resultResp, statusResp] = await Promise.all([
        http.get(`/admin/session/${sessionId}/results`),
        http.get(`/admin/session/${sessionId}/status`)
      ])
      const pointList = statusResp.data.results.questions.map(item => item.point);
      console.log('pointList', pointList);
      const playerList = statusResp.data.results.players;
      console.log('playerList', playerList);
      const scoreList = resultResp.data.results.map((res, index) => {
        const score = calculateScore(res, pointList);
        return [index, score];
      }).sort((a, b) => b[1] - a[1]);
      console.log('scoreList', scoreList);
      setScoreList(scoreList)
      setPlayerList(playerList);
    })();
  }, [])
  return <div>
    <Link to={'/dashboard'} className='button bg-blue-300 m-2 w-52 mobile:w-auto'>Back To Dashboard</Link>
    <div className='w-96 ml-2 rounded-md overflow-hidden mobile:w-auto mobile:mx-2'>
      <div className='bg-green-400 text-white font-bold font-serif text-center p-2'>Top 5 Players</div>
      {scoreList && playerList && scoreList.map((item, index) => {
        const [playerIndex, score] = item;
        const player = playerList[playerIndex];
        return <Fragment key={playerIndex}>
          <div className={`flex p-2 items-center border-gray-600 bg-blue-100 ${index !== scoreList.length - 1 ? 'border-b' : ''}`}>
            <span className={`${index === 0 ? 'font-bold text-3xl' : index === 1 ? 'font-semibold text-2xl' : index === 3 ? 'font-medium text-xl' : ''}`}>{index + 1}.</span>
            <span className='flex-1 mx-1'>{player || 'anonymous'}</span>
            <span>score: {score}</span>
          </div>
        </Fragment>
      })}
    </div>
  </div>
}

const calculateScore = (data, pointList) => {
  const list = data.answers;
  const length = list.length;
  let score = 0;
  for (let i = 0; i < length; i++) {
    const element = list[i];
    if (element.correct) {
      score += pointList[i];
    }
  }
  return score;
}

export default Result;
