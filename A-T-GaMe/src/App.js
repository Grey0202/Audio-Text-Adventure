import './App.css';
import axios from 'axios';
import qs from 'qs';
import { Input, Button, Select } from 'antd';
import { useEffect, useState, Component, useMemo, CSSProperties } from 'react';
import AudioAnalyser from "react-audio-analyser";
// import Select, { components, GroupHeadingProps } from 'react-select';
import Background from '../src/background.jpg';
import StoryText from "./components/storyText/StoryText";
import OptionText from "./components/optionText/optionText";
import Scriptselect from './components/scriptSelect';

const CONTENT = 0;
const OPTION = 1;

function App() {
  const [context, setContext] = useState(['']);
  const [allContext, setAllContext] = useState(['']);
  const [nowInput, setNowInput] = useState('');
  const [title, setTitle] = useState('');

  const gameUrl = 'http://localhost:1890/game';
  const changeScriptUrl = 'http://localhost:1890/changeScript';
  const aduioPostUrl = "http://localhost:1890/audio";

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
    return axios
      .post(gameUrl, {
        "input": input,
      })
      .then((res) => {
        if (input === '重置' || input === 'reset') {
          strArr = [];
          console.log('重置response', res);
        }
        let content = res.data.content;
        content = content.split("\n");

        let titleTmp = res.data.title;
        setTitle(titleTmp);
        if (strArr.length === 0) {
          strArr = strArr.concat([...content]).filter((val) => val !== '')
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
    // choseScript('harrypotter');
  }, []);

  const [status, setStatus] = useState();
  const [audioSrc, setAudioSrc] = useState();
  const [audioType, setAudioType] = useState();
  const scirptList = [
    { value: 'dragonraja.yaml', label: 'Dragon Raja - en' },
    { value: 'harrypotter-en.yaml', label: 'Harry Potter - en' },
    { value: 'harrypotter.yaml', label: 'Harry Potter - zh' },
  ]
  const [option, setOption] = useState('');


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
      // let fd = new FormData();
      let str = allContext;

      console.log("BLOB", e.size, e.type, e);
      setAudioSrc(window.URL.createObjectURL(e))

      axios
        .post(aduioPostUrl, e)
        .then((res) => {
          // console.log("BLOB:",res);
          let content = res.data.content;
          content = content.split("\n");

          let titleTmp = res.data.title;
          setTitle(titleTmp);
          str = str.concat(['* ' + res.data.input, ...content]);
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

  const choseScript = (scriptName) => {
    let strArr = allContext;
    console.log('scriptname', scriptName);
    return axios
      .post(changeScriptUrl, {
        "scriptname": scriptName,
      })
      .then((res) => {
        console.log('res---->', res);
        let content = res.data.content;
        strArr = [];
        strArr = strArr.concat([...content]).filter((val) => val !== '')
        content = content.split("\n");
        let titleTmp = res.data.title;
        setTitle(titleTmp);
        setAllContext(content);
        setInputValue('');
      })
  };


  return (
    <div>

      <div style={{padding:'0 0 0 3%', position: 'fixed', width: '100%', fontSize: 30,fontWeight:'bold', background: '#00BFFF', color: '#D3D3D3' }}> {title} </div>
      <Select 
          type="link"
          
          style={{ float:'right', position:'fixed' , margin: '3% 0 1% 78%' }}
          options={scirptList} defaultValue='Dragon Raja - en' onChange={choseScript} />
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
      // style={{float:'left',background: 'LightGrey'}} 
      >
    

        <div id="back">

        {/* <Scriptselect onChange={() => {
           choseScript(options)
          }}>
        </Scriptselect> */}
          {
            // allContext.map((cur) => (
            //     <p>{cur}</p>
            // ))
            processedContext.map((cur, idx) => {
              return cur.type === CONTENT ? <StoryText textArr={cur.content}></StoryText> :
                <OptionText textArr={cur.content} key={idx}></OptionText>
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
            <Input
              id="input"
              
              style={{ width:'300px', margin: '5px', float:'left' }}
              value={inputValue}
              onChange={onChange}
              onPressEnter={() => {
                getData(inputValue)
              }}
            >
            </Input>
            <button
              type="primary"
              style={{ margin: '5px', float: "right" }}
              onClick={() => {
                getData(inputValue)
              }}
            >
              Send
            </button>


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
      
    </div>
  );
}

export default App;
