import React from 'react'
import Select from 'react-select'

const options = [
  { value: 'dragonraja.yaml', label: 'Dragon Raja - en' },
  { value: 'harrypotter.yaml', label: 'Harry Potter - zh' },
]

const Myselect = () => (
  <Select style={{float:'left',background: 'LightGrey'}} 
  options={options} defaultInputValue={'Dragon Raja - en'} onChange={()=>{console.log("aaaa")}} />
)

function Scriptselect(script="") {
  return (
    <div className="App">
      <p style={{color: '#C47278',fontSize:'17px', fontWeight: 'bold',}}>Change Script:</p>
      <Myselect style={{float:'left'}} value={'dragonraja.yaml'}/>
    </div>
  );
}

export default Scriptselect