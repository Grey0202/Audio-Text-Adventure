import {useEffect, useState, Component, useMemo} from 'react';
import './style.css'
// import {useMemo} from "@types/react";

function OptionText(props) {
    let textArr = props.textArr;
    const processed = useMemo(() => {
        let title = textArr[0];
        console.log('title...', textArr);
        let options = textArr.filter(val => /^-/.test(val))
        // options.map(val=>val.replace(/\*\*/,''))
        let choosen = 1 + options.length < textArr.length ? textArr[textArr.length - 1] : null;
        return {
            title,
            options,
            choosen
        }

    }, [textArr])

    return (
        <div className={'optionContainer'}>
            {/*<p className={'question'}><b>{textArr[0]}</b></p>*/}
            <p className={'question'}><b>{processed.title}</b></p>
            {textArr.length > 1 &&
                <div className={'options'}>
                    {/*{textArr.slice(1, textArr.length - 1).map((item, index) => <p>*/}
                    {/*    <span>{index + 1}</span>*/}
                    {/*    {item.slice(4, item.length - 2)}*/}
                    {/*</p>)}*/}
                    {processed.options.map((item, index) => <p>
                        <span>{index + 1}</span>
                        {item.slice(4).replace(/\*\*/,'')}
                    </p>)}
                    {/*<p>{textArr[textArr.length - 1]}</p>*/}
                    {processed.choosen&&<p>{processed.choosen}</p>}
                </div>
            }

        </div>
    );
}

export default OptionText;
