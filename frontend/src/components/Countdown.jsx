import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function CountDown (props) {
  const [leftSec, setLeftSec] = useState(null);

  // calculate time between now and end time
  const calculateTime = () => {
    const { endTimeStamp } = props;
    if (endTimeStamp === null) {
      return null;
    }
    const now = Date.now();
    const ret = Math.ceil((endTimeStamp - now) / 1000);
    return ret >= 0 ? ret : 0;
  }

  useEffect(() => {
    const fn = () => {
      const time = calculateTime();
      setLeftSec(time);
      if (time != null && time <= 0) {
        clearInterval(timer);
        typeof props.onTimeEnd === 'function' && props.onTimeEnd();
      }
    };
    const timer = setInterval(fn, 1000);
    fn();
    return () => {
      clearInterval(timer);
    }
  }, [props.endTimeStamp, props.onTimeEnd])

  return <>{leftSec}</>
}

CountDown.propTypes = {
  endTimeStamp: PropTypes.number,
  onTimeEnd: PropTypes.func,
}

CountDown.calculateEndTime = (startTime, duration) => {
  return new Date(startTime).valueOf() + duration * 1000;
}

export default CountDown;
