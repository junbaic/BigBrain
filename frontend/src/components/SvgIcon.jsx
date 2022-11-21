import PropTypes from 'prop-types';

function SvgIcon () {}

const SvgIconCommonPropsTypes = {
  strokeColor: PropTypes.string,
  className: PropTypes.string,
}

const SvgIconCommonDefaultProps = {
  strokeColor: '#333333',
  className: 'h-6 w-6',
}

function createIcon (name, comp) {
  comp.propTypes = SvgIconCommonPropsTypes;
  comp.defaultProps = SvgIconCommonDefaultProps;
  SvgIcon[name] = comp;
}

function IconWrap (props) {
  return <svg role='icon' xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke={props.strokeColor} strokeWidth="2">
    {props.children}
  </svg>
}

IconWrap.propTypes = {
  ...SvgIconCommonPropsTypes,
  children: PropTypes.node,
};

createIcon('Edit', function EditIcon (props) {
  return <IconWrap {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </IconWrap>
})

createIcon('Check', function CheckIcon (props) {
  return <IconWrap {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </IconWrap>
})

createIcon('Clock', function ClockIcon (props) {
  return <IconWrap {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </IconWrap>
})

createIcon('User', function UserIcon (props) {
  return <IconWrap {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </IconWrap>
})

createIcon('Trash', function AddIcon (props) {
  return <IconWrap {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </IconWrap>
})

createIcon('Close', function CloseIcon (props) {
  return <IconWrap {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </IconWrap>
})

export default SvgIcon;
