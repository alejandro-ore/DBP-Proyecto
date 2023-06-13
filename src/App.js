import React, { useState } from 'react';
import './App.css';

//matriz de imagen
const n=90;const m=160;
var matrix=Array.from(
  {length: m},
  ()=>new Array(n).fill([255,255,255])
);

const size=10; //tamaño de los pixeles individuales

var R=0;var G=0;var B=0; //colores actuales del 'pincel'

var isMouseDown;var setIsMouseDown;
var interactingItemIds;var setInteractingItemIds;
var inCanvas;var setInCanvas;//variables para manejar el mouse

var history_queue=[];var undo_queue=[]; //ctrl+z

function changeColor(){
    R=document.getElementById("R").value;
    G=document.getElementById("G").value;
    B=document.getElementById("B").value;
}

function colorSwitch(id){
    var pixel=document.getElementById(id);
    if(pixel.className==="grid-container") return;
    pixel.style.setProperty("background",`rgb(${R},${G},${B})`);
}

function clearCanvas(){
    for(let i=1;i<=m*n;i++){
        document.getElementById(`${i}`).style.setProperty("background","rgb(255,255,255)");
    }
}

function Item({item_id}){
  [isMouseDown, setIsMouseDown] = useState(false);
  [interactingItemIds, setInteractingItemIds] = useState([]);

  const handleMouseEnter = (itemId) => {
    if (isMouseDown&&inCanvas) {
      colorSwitch(itemId);
      setInteractingItemIds((prevItemIds) => [...prevItemIds, itemId]);
    }
  };

  const x=(item_id-1)%m;
  const y=parseInt((item_id-1)/m);

  var grid_item={
    backgroundColor:`rgb(${matrix[x][y][0]},${matrix[x][y][1]},${matrix[x][y][2]})`,
    userSelect:'none',
    width:`${size}px`,
    height:`${size}px`,
    textAlign:'center',
    border:'0.01px solid rgba(136, 255, 233,25)'
  };

  return(
    <div className="grid-item"
      style={grid_item}
      id={item_id}
      onMouseEnter={()=>handleMouseEnter(item_id)}
    ></div>
  );
}

function App(){

  var args1=``;var args2=``;
    for(let i=0;i<n;i++){
        args1+=` ${size}px`;
    }
    for(let i=0;i<m;i++){
        args2+=` ${size}px`;
    }

  const grid_container={
    display: 'grid',
    justifyContent: 'center',
    userSelect: 'none',
    alignItems: 'center',
    columnGap: '0px',
    rowGap: '0px',
    gridTemplateRows:`${args1}`,
    gridTemplateColumns:`${args2}`,
    padding: '0px',
    border: '5px solid rgba(248, 216, 129, 255)',
    borderRadius: '5px',
    width: 'fit-content',
    height: 'fit-content',
    margin: '0 auto',
  };

  const ui_container={
    display:'grid',
    marginTop: '12px',
    gridTemplateColumns: 'auto auto auto'
  };

  [isMouseDown,setIsMouseDown]=useState(false);
  [interactingItemIds,setInteractingItemIds]=useState([]);
  [inCanvas,setInCanvas]=useState(false);

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    console.log(interactingItemIds);
    setInteractingItemIds([]);
  };

  const isIncanvas = (bool) => {
    setInCanvas(bool);
  };

  const renderItems=()=>{
    var mat=matrix;
    
    var items=Array.from({length:n*m});

    var item_id=0;
    for(let i=0;i<n;i++){
      for(let j=0;j<m;j++){
        items[item_id]=(
          <Item item_id={item_id+1} key={item_id+1}/>
        );
        item_id++;
      }
    }
    return items;
  };

  var result=(
    <>
      <title>paint test</title>
      <div className='ui_container' style={ui_container}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className='toolbox'>
          tools
        </div>
        <div className='grid-container' style={grid_container}
            onMouseEnter={function(){isIncanvas(true)}}
            onMouseLeave={function(){isIncanvas(false)}}
          >
            {renderItems().map((item)=>item)}
        </div>
        <div>
          R <input type="number" defaultValue={0} min={0} max={255} id="R" />
          <br />
          G <input type="number" defaultValue={0} min={0} max={255} id="G" />
          <br />
          B <input type="number" defaultValue={0} min={0} max={255} id="B" />
          <br />
          <button onClick={changeColor}>change color</button>
          <br />
          <button onClick={clearCanvas}>clear canvas</button>
          <br />
        </div>
      </div>
    </>
  );

  return result;
}

export default App;
