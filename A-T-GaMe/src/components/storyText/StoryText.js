import {useEffect, useState, Component} from 'react';
import './style.css'

function StoryText(props) {
    let textArr = props.textArr;
    // console.log('[DEBUG] props---->', props);

    return (
        <div className={'textContainer'}>
            {textArr.map(item => <p>{item.slice(1)}</p>)}
        </div>
    );
}

export default StoryText;
