import React from 'react'
import Select from 'react-select'

const options = [
  { value: 'dragonraja.yaml', label: 'Dragon Raja - en' },
//   { value: 'harrypotter.yaml', label: 'Harry Potter - zh' },
]

const Myselect = () => (
  <Select options={options} onChange={()=>{console.log("aaaa")}} />
)

function Scriptselect(script="") {
  return (
    <div className="App">
      <p style={{color: '#C47278', fontWeight: 'bold', background: 'LightGrey',}}>Change Script:</p>
      <Myselect value={'dragonraja.yaml'}/>
    </div>
  );
}

export default Scriptselect