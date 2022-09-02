import './App.css';
import axios from 'axios';
import qs from 'qs';
import { Input, Button } from 'antd';
import { useEffect, useState, Component, useMemo } from 'react';
import AudioAnalyser from "react-audio-analyser";
import Background from '../src/background.jpg';
import StoryText from "./components/storyText/StoryText";
import OptionText from "./components/optionText/optionText";

const CONTENT = 0;
const OPTION = 1;

function App() {
  const [context, setContext] = useState(['']);
  const [allContext, setAllContext] = useState(['']);
  const [nowInput, setNowInput] = useState('');
  const [title, setTitle] = useState('');

  const gameUrl = 'http://127.0.0.1:1890/game';
  const aduioPostUrl = "http://127.0.0.1:1890/audio";

  const processedContext = useMemo(() => {
    let cur = {
      type: -1,
      content: []
    };
    const resetCur = (cur) => {
      cur = {};
      cur.type = -1;
      cur.content = [];
      return cur;
    }

    let processed = [];

    let len = allContext.length
    let i = 0;
    while (i < len) {
      while (i < len && allContext[i][0] === '>') {
        cur.content.push(allContext[i]);
        i++;
      }
      cur.type = CONTENT;
      processed.push(cur);
      console.log('cur---->', cur);
      cur = resetCur(cur);

      while (i < len && allContext[i][0] !== '>') {
        cur.content.push(allContext[i]);
        i++;
      }
      cur.type = OPTION;
      processed.push(cur);
      console.log('cur---->', cur);
      cur = resetCur(cur);
    }
    console.log('processed---->', processed);
    return processed;
  }
    ,
    [allContext]
  )


  // const getData = (input) => {
  //   // setAllContext(context.push(inputValue));
  //   if(input === '重置') {
  //     setAllContext(['']);
  //     allContext=[''];
  //     console.log('...', allContext);
  //   }
  //   return axios
  //     .post(gameUrl, {
  //       "input": input,
  //     })
  //     .then((res) => {
  //       let s = res.data.content;
  //       let data = s.split("\n");
  //       let titleTmp = data[0];
  //       if(titleTmp[0] === '#') titleTmp = titleTmp.slice(5);
  //       setTitle(titleTmp);
  //       data.shift();
  //       setAllContext(allContext.concat([input, ...data]));
  //       setContext(data);
  //       setInputValue('');
  //     })
  // };

  const getData = (input) => {
    let strArr = allContext;
    if (input === '重置') {
      strArr = [];
    }
    return axios
      .post(gameUrl, {
        "input": input,
      })
      .then((res) => {
        let content = res.data.content;
        content = content.split("\n");

        let titleTmp = res.data.title;
        setTitle(titleTmp);
        if (strArr.length === 0) {
          strArr = strArr.concat([...content]).filter((val) => val !== '')
          strArr.shift();
          titleTmp = strArr[0].slice(5);
          setTitle(titleTmp);
          strArr.shift();
        }
        else strArr = strArr.concat([input, ...content]).filter((val) => val !== '');
        console.log(strArr);
        setAllContext(strArr);
      }).finally(() => {
        setInputValue('');
      })
  };

  useEffect(() => {
    getData('');
  }, [])

  const [status, setStatus] = useState();
  const [audioSrc, setAudioSrc] = useState();
  const [audioType, setAudioType] = useState();
  const audioProps = {
    audioType,
    // audioOptions: {sampleRate: 30000}, // 设置输出音频采样率
    status,
    audioSrc,
    timeslice: 1000, // 时间切片（https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start#Parameters）
    startCallback: (e) => {
      console.log("succ start", e)
    },
    pauseCallback: (e) => {
      console.log("succ pause", e)
    },
    stopCallback: (e) => {
      let fd = new FormData();
      let str = allContext;

      console.log("BLOB", e.size, e.type, e);
      setAudioSrc(window.URL.createObjectURL(e))

      axios
        .post(aduioPostUrl, e)
        .then((res) => {
          let content = res.data.content;
          content = content.split("\n");

          let titleTmp = res.data.title;
          setTitle(titleTmp);
          str = str.concat(['*' + res.data.input_text, ...content]);
          // console.log(str);
          setAllContext(str);
        }).finally(() => {
          setInputValue('');
        })
      console.log("succ stop", e)
    },
    onRecordCallback: (e) => {
      console.log("recording", e)
    },
    errorCallback: (err) => {
      console.log("error", err)
    }
  };

  const componentDidMount = () => { }

  const controlAudio = (status) => {
    setStatus(status);
  };

  const changeScheme = (e) => {
    setAudioType(e.target.value);
  };

  const [inputValue, setInputValue] = useState('');
  const onChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div
      className="App"
    // style={{
    //   height: '100%',
    //   // position: 'absolute',
    //   backgroundSize: 'cover',
    //   // overflowX: 'hidden',
    //   backgroundImage: `url(${Background})`,
    //   backgroundRepeat: 'no-repeat',
    //   // backgroundSize: '100% 100%',
    //   backgroundAttachment: 'fixed',
    // }}
    >
      <div id="back">
        <b style={{ fontSize: 30 }}>{title}</b>
        {
          // allContext.map((cur) => (
          //     <p>{cur}</p>
          // ))
          processedContext.map((cur) => {
            return cur.type === CONTENT ? <StoryText textArr={cur.content}></StoryText> :
              <OptionText textArr={cur.content}></OptionText>
          })
        }
        {/* <header className="App-header"> */}
        {/* <b>{title}</b><br></br>
      {
        allContext.map((cur) => (
          (cur[0] !== '*') ? (
            <p>{cur}</p>
          ) : (
            <p
              style={{
                textAlign: 'right',
                backgroundColor: '#7DB9DE',
                padding: '0 20px 0 20px',
                margin: '5px',
              }}>
              {cur}
            </p>
          )
        ))
      } */}
        {
          // <p style={{ textAlign: 'right' }}>{inputValue}</p>
        }
        <div style={{ overflow: 'hidden' }}>
          <Button
            type="primary"
            style={{ margin: '5px', float: "right" }}
            onClick={() => {
              getData(inputValue)
            }}
          >
            Send
          </Button>
          <Input
            id="input"
            style={{ margin: '5px', float: "right" }}
            value={inputValue}
            onChange={onChange}
            onPressEnter={() => {
              getData(inputValue)
            }}
          >
          </Input>

        </div>
        <AudioAnalyser {...audioProps}>
          <div className="btn-box">
            {status !== "recording" &&
              <button style={{ margin: '5px' }} className="iconfont icon-start"
                onClick={() => controlAudio("recording")}>Voice Input</button>}
            {status === "recording" &&
              <button style={{ margin: '5px' }} className="iconfont icon-pause"
                onClick={() => controlAudio("inactive")}>Stop</button>}
            {/* <button style={{ margin: '5px' }} className="iconfont icon-stop"
              onClick={() => controlAudio("inactive")}>停止</button> */}
          </div>
        </AudioAnalyser>
        {/* <p>选择输出格式</p>
        <select name="" id="" onChange={(e) => changeScheme(e)} value={audioType}>
          <option value="audio/webm">audio/webm(default, safari does not support )</option>
          <option value="audio/wav">audio/wav</option>
          <option value="audio/mp3">audio/mp3</option>
          <option value="audio/mp4">audio/mp4</option>
        </select> */}
        {/* </header> */}
      </div>
    </div>
  );
}

export default App;
