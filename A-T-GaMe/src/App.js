import './App.css';
import axios from 'axios';
import qs from 'qs';
import { Input, Button } from 'antd';
import { useEffect, useState, Component } from 'react';
import AudioAnalyser from "react-audio-analyser";
import Background from '../src/background.jpg';

function App() {
  const [context, setContext] = useState(['']);
  const [allContext, setAllContext] = useState(['']);
  const [nowInput, setNowInput] = useState('');
  const [title, setTitle] = useState('');

  const gameUrl = 'http://127.0.0.1:1890/game';
  const aduioPostUrl = "http://127.0.0.1:1890/audio";

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
    let str=allContext;
    if(input === '重置') {
      str=[''];
    }
    return axios
      .post(gameUrl, {
        "input": input,
      })
      .then((res) => {
        console.log(res.data,typeof res.data)
        let data = res;
        let content = data.data.content;
        console.log('data', typeof data,data);
        content = content.split("\n");

        let titleTmp = res.data.title;
        console.log('title', titleTmp);
        setTitle(titleTmp);
        // console.log(str);
        setAllContext(['*'+input, ...content]);
      }).finally(()=>{
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
      let str=allContext;

      console.log("BLOB", e.size, e.type, e);
      setAudioSrc(window.URL.createObjectURL(e))

      axios
        .post(aduioPostUrl, e)
        .then((res) => {
          let content = res.data.content;
          let input = res.data.input;
          console.log('data', typeof res.data);
          content = content.split("\n");

          let titleTmp = res.data.title;
          console.log('title', titleTmp);
          setTitle(titleTmp);
          // console.log(str);
          setAllContext(['*'+input, ...content]);
          
          if(titleTmp[0] === '#') titleTmp = titleTmp.slice(5);
          // data.shift();
          setTitle(titleTmp);
          
          str=str.concat(['*'+res.data.input_text, ...content]);
          // console.log(str);
          setAllContext(str);
        }).finally(()=>{
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

  const componentDidMount = () => {}

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
      style={{
        height: '100%',
        position: 'absolute',
        overflowX:'hidden',
        backgroundImage: `url(${Background})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed',
      }}
      >
      {/* <header className="App-header"> */}
      <b>{title}</b><br></br>
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
        }
        {
          // <p style={{ textAlign: 'right' }}>{inputValue}</p>
        }
        <Input 
          id="input" 
          style={{ margin: '5px' }} 
          value={inputValue} 
          onChange={onChange}
          onPressEnter={() => { getData(inputValue) }}
          >
        </Input>
        <Button 
          type="primary" 
          style={{ margin: '5px' }} 
          onClick={() => { getData(inputValue) }}
        >
          Send
        </Button>
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
  );
}

export default App;
