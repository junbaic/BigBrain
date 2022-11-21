import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

function Modal (props) {
  // create a dom node
  const modalNode = document.createElement('div');
  document.body.appendChild(modalNode);
  // remove it when dispose
  useEffect(() => () => document.body.removeChild(modalNode))

  const modal = <div className='animate-fade-in fixed top-0 w-screen h-screen flex justify-center z-50 items-center bg-black bg-opacity-25' onClick={props.onCancel}>
    <div className='animate-slide-up bg-white py-2 px-4 rounded' style={{ width: props.width || null }} onClick={(e) => e.stopPropagation()}>
      {props.title && <h2 className='font-bold text-xl leading-7 mb-2'>{props.title}</h2>}
      {props.children}
      <div className='flex mt-2 justify-center'>
        {props.showCancel && <button className='button text-black bg-gray-300' onClick={props.onCancel}>{props.cancelText}</button>}
        <button className={`button bg-blue-400 hover:bg-blue-500 ${props.showCancel ? 'ml-2' : ''}`} onClick={props.onConfirm}>{props.confirmText}</button>
      </div>
    </div>
  </div>

  return createPortal(modal, modalNode);
}

Modal.propTypes = {
  title: PropTypes.string,
  content: PropTypes.node,
  width: PropTypes.string,
  showCancel: PropTypes.bool,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
}

Modal.defaultProps = {
  showCancel: true,
  onCancel: () => {},
  onConfirm: () => {},
  cancelText: 'Cancel',
  confirmText: 'Confirm'
}

export default Modal;
