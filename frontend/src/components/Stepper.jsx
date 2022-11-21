import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

function Stepper (props) {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const _update = (val) => {
    if (val < props.min) {
      val = props.min
    } else if (val > props.max) {
      val = props.max
    }
    if (value !== val) {
      setValue(val);
      props.onChange(val);
    }
  }

  const onSub = (num) => {
    if (value > props.min) {
      _update(value - num);
    }
  }

  const onAdd = (num) => {
    if (value < props.max) {
      _update(value + num);
    }
  }

  const {
    builder = (val) => val,
    step = [1],
  } = props;

  const listPrev = useMemo(() => {
    return [...step.sort((a, b) => b - a)];
  }, []);
  const listNext = useMemo(() => {
    return [...step.sort((a, b) => a - b)];
  }, []);

  return <div className='flex items-center'>
    {listPrev.map(num => (
      <button key={num} className='button2 mr-2 hover:bg-gray-100' onClick={() => onSub(num)}>-{num !== 1 ? Math.abs(num) : ''}</button>
    ))}
    {builder(value)}
    {listNext.map(num => (
      <button key={num} className='button2 ml-2' onClick={() => onAdd(num)}>+{num !== 1 ? Math.abs(num) : ''}</button>
    ))}
  </div>
}

Stepper.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number,
  step: PropTypes.arrayOf(PropTypes.number),
  builder: PropTypes.func,
  onChange: PropTypes.func,
}

export default Stepper;
