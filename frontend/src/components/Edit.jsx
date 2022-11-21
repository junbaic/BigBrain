import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import http from '../utils/http';
import { generateId, linkParseToEmbedUrl, showToast } from '../utils/utils';
import PropTypes from 'prop-types';
import Stepper from './Stepper';
import * as CONSTANT from '../utils/constant';
import SvgIcon from './SvgIcon';
import Modal from './Modal';

function Edit () {
  const [params, setParams] = useSearchParams();
  const id = params.get('id');
  const questionId = params.get('q');

  const [quizData, setQuizData] = useState(null);
  const [currQuestion, setCurrQuestion] = useState(null);
  const [currQuestionIndex, setCurrQuestionIndex] = useState(-1);
  const [questionList, setQuestionList] = useState([]);
  const [isEditName, setIsEditName] = useState(false);
  const [isSideClose, setIsSideClose] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const scrollElemMain = useRef();
  const nameInput = useRef();
  const thumbnailInput = useRef();
  const fileInputRef = useRef();

  const routeQuestion = (list, index) => {
    if (index === currQuestionIndex) {
      return;
    }
    if (list[index]) {
      setCurrQuestion({ ...list[index] });
      setCurrQuestionIndex(index);
      setParams({
        id: id,
        q: list[index].id,
      })
    } else {
      console.log(list, index);
      showToast('Can\'t find the Question');
    }
  }

  useEffect(() => {
    (async () => {
      const resp = await http.get('/admin/quiz/' + id);
      const questions = resp.data.questions;
      // delete resp.data.questions;
      setQuizData(resp.data);
      setQuestionList(questions);
      const index = questions.findIndex(q => q.id === questionId);
      if (index !== -1) {
        routeQuestion(questions, index);
      }
    })();
  }, []);

  if (quizData === null) {
    return <></>
  }

  const {
    name,
    createdAt,
    owner,
    thumbnail,
  } = quizData;

  const _updateQuiz = async ({ questions, name, thumbnail }) => {
    return http.put(`/admin/quiz/${id}`, {
      questions, name, thumbnail,
    })
  }

  const onAddQuestion = async () => {
    const newList = [
      ...questionList,
      createDefaultQuestionItem(questionList.map(item => item.id)),
    ];
    await _updateQuiz({
      questions: newList,
    })
    showToast('Added!');
    setQuestionList(newList);
    setTimeout(() => {
      scrollElemMain.current.scroll({
        top: Number.MAX_SAFE_INTEGER,
        behavior: 'smooth'
      });
    }, 100);
  }

  const onDeleteQuestion = async (index) => {
    questionList.splice(index, 1);
    const newList = [...questionList];
    await _updateQuiz({
      questions: newList,
    })
    setQuestionList(newList);
    if (index === currQuestionIndex) {
      setCurrQuestionIndex(-1);
      setCurrQuestion(null);
    }
  }

  const onQuestionClick = (index) => {
    routeQuestion(questionList, index);
  }

  const onQuestionSave = async (data) => {
    if (questionList[currQuestionIndex] !== null) {
      Object.assign(questionList[currQuestionIndex], data);
      const newQuestionList = questionList;
      await _updateQuiz({ questions: newQuestionList });
      setQuestionList([...newQuestionList])
      showToast('save successfully');
    } else {
      showToast('can not found the question');
    }
  }

  const onChangeName = async () => {
    const newName = nameInput.current.value;
    setIsEditName(false);
    if (newName) {
      await _updateQuiz({ name: newName });
      setQuizData({
        ...quizData,
        name: newName,
      });
    }
  }

  const onSelectFile = async (e) => {
    if (e.target.files.length >= 0) {
      const rawText = await e.target.files[0].text();
      try {
        const json = JSON.parse(rawText);
        await _updateQuiz(json);
        const { name, thumbnail, questions } = json;
        const newQuizData = { ...quizData };
        if (name) {
          newQuizData.name = name
        }
        if (thumbnail) {
          newQuizData.thumbnail = thumbnail
        }
        if (questions) {
          newQuizData.questions = questions;
          setQuestionList(questions);
        }
        setQuizData(newQuizData);
        showToast('Import Successfully');
      } catch (e) {
        console.log(e);
        showToast('format error');
      }
    } else {
      showToast('Select file failed')
    }
  }

  return <div className='w-auto flex flex-col sm:flex-row h-screen'>
    <div className={`flex flex-col lg:w-96 md:w-80 mx-2 pt-5 pb-2 h-full mobile:transition-all mobile:py-2 mobile:fixed mobile:top-0 mobile:bg-white mobile:w-2/3 mobile:z-20 mobile:px-2 mobile:mx-auto mobile:transform ${isSideClose ? 'mobile:-translate-x-full' : ''}`}>
      <Link to={'/dashboard'} className='button bg-blue-300 hover:bg-blue-400 mb-2'>Back to DashBoard</Link>
      <button className='button bg-yellow-600 hover:bg-yellow-400 mb-2' onClick={() => fileInputRef.current.click()}>Import from JSON</button>
      <input type={'file'} name='file' id='file' ref={fileInputRef} className='hidden' onChange={onSelectFile}/>
      <div className='shadow-md bg-indigo-100 rounded-md px-3 py-2 flex items-center mb-2'>
        {!isEditName
          ? <>
              <span className='px-3 py-2 sm:text-sm'>{name}</span>
              <button className='ml-auto' onClick={() => setIsEditName(true)}>
                <SvgIcon.Edit/>
              </button>
            </>
          : <>
            <input
              ref={nameInput}
              defaultValue={name}
              placeholder={name}
              className='input rounded-md'
            />
            <button className='ml-2' onClick={onChangeName}>
              <SvgIcon.Check/>
            </button>
          </>}
      </div>
      <div className='flex items-center w-auto my-1 p-2'>
        <SvgIcon.Clock className='w-3 h-3 mr-1'/>
        <span className='text-xs'>{new Date(createdAt).toLocaleString()}</span>
      </div>
      <div className={`group w-full bg-cover select-none cursor-pointer flex-center ${thumbnail ? 'h-32 ' : 'h-10'}`}
        onClick={() => setShowThumbnail(true)}
        style={{ backgroundImage: `url(${thumbnail})` }}>
        <span className={`${!thumbnail ? '' : 'text-2xl hidden group-hover:block'}`}>Set Thumbnail</span>
      </div>
      <div className='flex items-center my-1 p-2'>
        <SvgIcon.User className='w-4 h-4 mr-1'/>
        <span className='text-lg font-bold'>{owner}</span>
      </div>
      <div ref={scrollElemMain} className='mb-auto overflow-scroll'>
        {questionList.map((item, index) => {
          return <Fragment key={item.id}>
            <QuestionItem
              {...item}
              index={index}
              active={index === currQuestionIndex}
              onClick={() => onQuestionClick(index)}
              onDelete={() => onDeleteQuestion(index)}/>
          </Fragment>
        })}
      </div>
      <div className='flex mt-2 flex-col'>
        <button className='button bg-blue-600 w-full' onClick={onAddQuestion}>Add question</button>
        <button className='button bg-blue-300 w-full mt-2 hidden mobile:block' onClick={() => setIsSideClose(true)}>Close</button>
      </div>
    </div>
    <div className='relative z-0 flex-1 mx-2 pt-5 pb-2 h-full select-none'>
      {currQuestion !== null
        ? <EditingQuestion
          {...currQuestion}
          onSave={onQuestionSave}
          isSideClose={isSideClose}
          onShowList={() => setIsSideClose(false)}/>
        : <div className='bg-green-200 rounded flex-center flex-col w-full h-full'>
          <div className='text-lg font-thin'>Click the <span className='text-blue-600' onClick={() => setIsSideClose(false)}>question list item</span> to edit</div>
          <div className='my-2 font-thin'>Or</div>
          <button className='button bg-green-600' onClick={onAddQuestion}>Create New Question</button>
        </div>}
    </div>
    <div className={`fixed bg-black z-10 opacity-50 top-0 left-0 w-screen h-screen hidden ${isSideClose ? 'mobile:hidden' : 'mobile:block'}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsSideClose(true);
      }}></div>
    {showThumbnail && <Modal
        title='Set Thumbnail'
        onCancel={() => setShowThumbnail(false)}
        onConfirm={async () => {
          const val = thumbnailInput.current.value || null;
          setShowThumbnail(false);
          await _updateQuiz({ thumbnail: val });
          setQuizData({
            ...quizData,
            thumbnail: val,
          });
        }}>
        <input className='input' ref={thumbnailInput}></input>
      </Modal>}
  </div>
}

/**
 * type: multi, single
 * questions description
 * time limit
 * point
 * url (ytb video or photo)
 * aswers (2 - 6)
 */
function QuestionItem (props) {
  const {
    description = ''
  } = props
  return <div
    className={`group flex relative items-center hover:bg-green-400 text-white p-2 rounded m-1 cursor-pointer transform transition-all ${props.active ? 'bg-green-700 translate-x-1' : 'bg-green-600'}`}
    style={{ minWidth: '200px' }}
    onClick={props.onClick}>
    <div>{props.index + 1}. {description}</div>
    <button className='absolute right-1 bg-green-500 hover:bg-red-700 rounded-full p-2 hidden group-hover:block ml-auto' onClick={(e) => {
      e.stopPropagation();
      props.onDelete();
    }}>
      <SvgIcon.Trash strokeColor='white'/>
    </button>
  </div>
}

QuestionItem.propTypes = {
  description: PropTypes.string,
  index: PropTypes.number,
  onClick: PropTypes.func,
  active: PropTypes.bool,
  onDelete: PropTypes.func,
}

function EditingQuestion (props) {
  const [isEditDesc, setIsEditDesc] = useState(false);
  const [isSetUrl, setIsSetUrl] = useState(false);
  const descInput = useRef();
  const urlInput = useRef();

  const [description, setDescription] = useState(props.description);
  const [type, setType] = useState(props.type);
  const [timeLimit, setTimeLimit] = useState(props.timeLimit);
  const [point, setPoint] = useState(props.point);
  const [url, setUrl] = useState(props.url);
  const [rightAnswer, setRightAnswer] = useState(props.rightAnswer);
  const [answers, setAnswers] = useState(props.answers);

  useEffect(() => {
    setDescription(props.description);
    setType(props.type);
    setTimeLimit(props.timeLimit);
    setPoint(props.point);
    setUrl(props.url);
    setRightAnswer(props.rightAnswer);
    setAnswers(props.answers || []);
  }, [props.id])

  const onAnswerChanged = (index, checked) => {
    if (type === CONSTANT.QUESTION_TYPE.SINGLE) {
      setRightAnswer(checked ? [index] : []);
    } else {
      setRightAnswer(list => {
        if (checked) {
          list.push(index);
        } else {
          const removeIndex = list.indexOf(index);
          if (removeIndex !== -1) {
            list.splice(removeIndex, 1);
          }
        }
        return [...new Set(list)];
      })
    }
  }

  const onAddAnswer = () => {
    if (answers.length >= CONSTANT.ANSWER_COUNT.MAX) {
      showToast(`answers count can not greater than ${CONSTANT.ANSWER_COUNT.MAX}`);
      return;
    }
    const nameTemplate = 'new Answer';
    let name = nameTemplate;
    let index = 1;
    while (answers.includes(name)) {
      name = nameTemplate + `(${index++})`;
    }
    setAnswers([...answers, name]);
  }

  const validateCanSave = () => {
    if (answers.length < CONSTANT.ANSWER_COUNT.MIN) {
      return `at lease ${CONSTANT.ANSWER_COUNT.MIN} answers`;
    }
    if (answers.length > CONSTANT.ANSWER_COUNT.MAX) {
      return `up to ${CONSTANT.ANSWER_COUNT.MAX} answers`;
    }
    if (type === CONSTANT.QUESTION_TYPE.MULTI && rightAnswer.length <= 1) {
      return 'in multiple choice questions, the correct answer count must be greater than 1';
    }
    if (type === CONSTANT.QUESTION_TYPE.SINGLE && rightAnswer.length !== 1) {
      return 'the number of correct answers to single choice questions must be equal to 1';
    }
    if (timeLimit <= 0) {
      return 'limit time is invalid';
    }
    if (point < 0) {
      return 'point is invalid';
    }
    if (description.length === 0) {
      return 'description can not be empty';
    }
    return null;
  }

  const onSave = () => {
    const errMsg = validateCanSave();
    if (errMsg !== null) {
      showToast(errMsg);
      return;
    }
    const data = {
      description,
      type,
      timeLimit,
      point,
      url,
      rightAnswer,
      answers,
    };
    props.onSave(data);
  }

  useEffect(() => {
    if (type === CONSTANT.QUESTION_TYPE.SINGLE && rightAnswer.length === 0 && answers.length !== 0) {
      setRightAnswer([0]);
    }
  }, [type])

  return <div className='flex flex-col bg-gray-100 px-2 rounded-md h-full'>
    <div className='px-2 overflow-scroll'>
      <div className='whitespace-nowrap leading-8'>Question Description</div>
      <div className='py-3 px-5 flex items-center rounded-md border-gray-300 bg-yellow-200'>
        {!isEditDesc
          ? <>
            <div>{description}</div>
            <button className='ml-auto' onClick={() => setIsEditDesc(true)}>
              <SvgIcon.Edit/>
            </button>
          </>
          : <>
            <input className='input rounded-md' ref={descInput} defaultValue={description} />
            <button className='ml-4' onClick={() => {
              setDescription(descInput.current.value);
              setIsEditDesc(false);
            }}>
              <SvgIcon.Check/>
            </button>
        </>}
      </div>
      <div className='flex flex-col 900:flex-row mt-2'>
        <div className=''>
          <div>
            <div className='whitespace-nowrap leading-8'>Question Type</div>
            <select
              className='form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none'
              value={type} onChange={(e) => {
                setType(CONSTANT.QUESTION_TYPE_ARR[e.target.selectedIndex]);
              }}>
                {CONSTANT.QUESTION_TYPE_ARR.map(t => (
                  <option value={t} key={t}>{CONSTANT.QUESTION_TYPE_MAP[t]}</option>
                ))}
            </select>
          </div>
          <div className='my-2'>
            <span className='mr-2'>Point</span>
            <Stepper
              min={CONSTANT.POINT.MIN}
              max={CONSTANT.POINT.MAX}
              value={point}
              onChange={setPoint}
              builder={(val) => <div
                className='flex flex-1 justify-center mx-1 bg-white shadow-sm rounded px-2 py-1 max-w-xs'
              >{val}</div>}/>
          </div>
          <div className='my-2'>
            <span className='mr-2'>Time Limit</span>
            <Stepper
              min={CONSTANT.TIME_LIMIT.MIN}
              max={CONSTANT.TIME_LIMIT.MAX}
              value={timeLimit}
              onChange={setTimeLimit}
              step={[1, 5]}
              builder={(val) => <div
                className='flex flex-1 justify-center mx-1 w-12 bg-white shadow-sm rounded px-2 py-1 max-w-xs'>
                <>{`${val}s`}</>
              </div>}/>
          </div>
          <button className='button bg-yellow-600 w-full'
            onClick={() => setIsSetUrl(true)}>
            Update Youtube Link
          </button>
        </div>
        <div className='flex-1 900:ml-5'>
          {url
            ? <iframe
              width="100%"
              height="250"
              src={url}
              title="YouTube video player"
              className={`mt-2 rounded-md ${props.isSideClose ? '' : 'mobile:pointer-events-none'}`}
              style={{ zIndex: -1 }}
              allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"/>
            : <div
                className='hidden md:flex items-center justify-center mt-2 rounded-md text-lg p-4 text-gray-500 select-none cursor-pointer bg-gray-300 w-full'
                style={{ height: '250px' }}
                onClick={() => setIsSetUrl(true)}>
                Tap to add a Youtube link
              </div>
          }
        </div>
      </div>
      <div>
        {answers.map((str, index) => (
          <Fragment key={str + index}>
            <EditingAnswer
              index={index}
              str={str}
              checked={rightAnswer.includes(index)}
              onChange={(checked) => {
                onAnswerChanged(index, checked);
              }}
              onEdited={(newStr) => {
                if (str === newStr) {
                  return;
                }
                // judge whether have same answer
                const count = answers.filter(str => str === newStr).length;
                if (count !== 0) {
                  showToast('answers duplication');
                  return;
                }
                setAnswers((list) => {
                  list[index] = newStr;
                  return [...list];
                })
              }}
              onDelete={() => {
                console.log('delete' + index);
                // remove rightAnswer if exist
                const indexInRight = rightAnswer.indexOf(index);
                if (indexInRight !== -1) {
                  setRightAnswer(list => {
                    list.splice(indexInRight, 1);
                    return [...list];
                  });
                }
                // remove answer from list
                setAnswers(list => {
                  list.splice(index, 1);
                  return [...list];
                })
              }}/>
          </Fragment>
        ))}
      </div>
    </div>
    {isSetUrl && <Modal
      title='Paste a Youtube link'
      width="400px"
      onCancel={() => setIsSetUrl(false)}
      onConfirm={() => {
        setIsSetUrl(false);
        let val = urlInput.current.value;
        val = linkParseToEmbedUrl(val);
        setUrl(val);
      }}
      >
      <div className='text-gray-400 text-sm mb-1'>Empty to remove video</div>
      <input ref={urlInput} className='input rounded' placeholder={url}/>
    </Modal>}
    <div className='flex mt-auto p-2'>
      <button className='button bg-green-500 hover:bg-green-600' onClick={onSave}>Save</button>
      {answers.length < CONSTANT.ANSWER_COUNT.MAX && <button
        className='button bg-yellow-200 text-gray-500 ml-2'
        onClick={onAddAnswer}>Add Answer</button>}
      <button className='button bg-blue-500 hover:bg-blue-600 ml-2' onClick={props.onShowList}>Question List</button>
    </div>
  </div>
}

EditingQuestion.propTypes = {
  id: PropTypes.string,
  type: PropTypes.number,
  description: PropTypes.string,
  timeLimit: PropTypes.number,
  point: PropTypes.number,
  url: PropTypes.string,
  rightAnswer: PropTypes.arrayOf(PropTypes.number),
  answers: PropTypes.arrayOf(PropTypes.string),
  onSave: PropTypes.func,
  isSideClose: PropTypes.bool,
  onShowList: PropTypes.func,
}

function EditingAnswer (props) {
  const [isEdit, setIsEdit] = useState(false);
  const inputRef = useRef();
  return <div className={`group flex items-center py-4 rounded-md px-2 mt-2 select-none ${props.checked ? 'bg-green-400 text-white hover:bg-green-500' : 'bg-white hover:bg-green-200'}`} onClick={() => {
    if (isEdit) { return; }
    props.onChange(!props.checked);
  }}>
    {!isEdit
      ? <>
      {props.checked && <SvgIcon.Check strokeColor="white"/>}
      <span className='text-lg mr-auto py-3'>{CONSTANT.LETTERS_SEQUENCE[props.index]}. {props.str}</span>
      <button className='button2 hidden group-hover:block' onClick={(e) => {
        e.stopPropagation();
        setIsEdit(true);
      }}>
        <SvgIcon.Edit/>
      </button>
      </>
      : <>
      <span className='text-lg mr-2 py-3'>{CONSTANT.LETTERS_SEQUENCE[props.index]}. </span>
      <input
        ref={inputRef}
        type={'text'}
        defaultValue={props.str}
        placeholder={props.str}
        className='input rounded-md select-none'/>
      <button
        className='button2 ml-3'
        onClick={(e) => {
          e.stopPropagation();
          const value = inputRef.current.value;
          if (value.length !== 0) {
            props.onEdited(value);
            setIsEdit(false);
          } else {
            showToast('answer description can not be empty');
          }
        }}>
        <SvgIcon.Check/>
      </button>
      </>
    }
    <button
      className={`hidden ${isEdit ? '' : 'group-hover:block'} button2 bg-red-400 hover:bg-red-500 border-transparent ml-2`}
      onClick={(e) => {
        e.stopPropagation();
        props.onDelete();
      }}>
      <SvgIcon.Trash strokeColor="#eee"/>
    </button>
  </div>
}

EditingAnswer.propTypes = {
  index: PropTypes.number,
  str: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onEdited: PropTypes.func,
  onDelete: PropTypes.func,
}

const createDefaultQuestionItem = (questionIds) => ({
  id: generateId(questionIds),
  type: CONSTANT.QUESTION_TYPE.SINGLE,
  description: 'A new Question',
  timeLimit: CONSTANT.TIME_LIMIT.DEFAULT, // second(s)
  point: CONSTANT.POINT.DEFAULT,
  url: null,
  rightAnswer: [
    0, // index
  ],
  answers: [
    'Answers A',
    'Answers B',
  ]
});

export default Edit;
