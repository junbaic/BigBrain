import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import http from '../utils/http';

function History () {
  const param = useParams();
  const id = param.id;
  const [oldSessions, setOldSessions] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    ((async () => {
      const resp = await http.get(`/admin/quiz/${id}`)
      setOldSessions(resp.data.oldSessions || []);
    })());
  }, []);

  return <div>
    <Link to={'/dashboard'} className='button bg-blue-300 m-2 w-52 mobile:w-auto'>Back To Dashboard</Link>
    {oldSessions.map(item => (
      <div key={item} className='flex items-center justify-between px-2 py-3 border-b'>
        <div>{item}</div>
        <button className='button2' onClick={() => nav(`/result/${item}`)}>Check</button>
      </div>
    ))}
  </div>
}

export default History;
