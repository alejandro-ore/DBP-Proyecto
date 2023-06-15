import React, {useEffect,useState} from 'react';
import './App.css';

const colors={
  '0':'rgb(255,255,255)', //blanco
  '1':'rgb(255,23,23)', //rojo
  '2':'rgb(255,230,0)', //amarillo
  '3':'rgb(0,130,50)', //verde
  '4':'rgb(0,60,200)', //azul
  '5':'rgb(20,20,20)' //negro
};

const color_ids={
  'rgb(255, 255, 255)':'0', //blanco
  'rgb(255, 23, 23)':'1', //rojo
  'rgb(255, 230, 0)':'2', //amarillo
  'rgb(0, 130, 50)':'3', //verde
  'rgb(0, 60, 200)':'4', //azul
  'rgb(20, 20, 20)':'5' //negro
};

var project_id;
var frame_ids=[];

function start_project(){
  var data={'name':'unnamed'};
  fetch('http://localhost:5000/animations',{
    method:'POST',
    body:JSON.stringify(data),
    headers:{
      'Content-Type':'application/json'
    }
  }).then(response=>response.text())
  .then(text=>{
    project_id=parseInt(text);
    console.log(project_id);
  })
}

start_project();

function get_by_id(){
  fetch('http://localhost:5000/frames')
  .then(response=>response.json())
  .then(frame=>{
    return frame.data;
  })
}

function save(){ //mensaje para jano: si por algun motivo deja de funcionar es porque background en verdad se llama background-color???
  var str="";
  for(let i=1;i<=m*n;i++){
    var pixel=document.getElementById(`${i}`);
    str+=color_ids[pixel.style.getPropertyValue("background-color")];
  }
  var data={'data':str,'id_anim':project_id};
  fetch('http://localhost:5000/frames',{
    method:'POST',
    body:JSON.stringify(data),
    headers:{
      'Content-Type':'application/json'
    }
  }).then(response=>response.text())
  .then(text=>{
    if(text!=='SUCCESS'){
      alert("failure");
    }
  })
}

function load(){
  fetch('http://localhost:5000/frames')
  .then(response=>response.json())
  .then(frame=>{
    return frame.data;
  })
}

//matriz de imagen
const n=90;const m=160;
var matrices=[Array.from(
  {length: m},
  ()=>new Array(n).fill([255,255,255])
)];
console.log(matrices);
const size=10; //tamaño de los pixeles individuales

var currentFrame=0; //frame actual

function rgb(s){
  var new_s=(s.replace('rgb(','').replace(')','')).split(',');
  return new_s;
}

function changeFrame(frame_n){
  if(frame_n>=matrices.length) return;
  var id=1;
  for(let i=0;i<m;i++){
    for(let j=0;j<n;j++){
      var pixel=document.getElementById(id);
      matrices[currentFrame][i][j]=rgb(pixel.style.getPropertyValue("background-color"));
      pixel.style.setProperty("background-color",`rgb(
        ${matrices[frame_n][i][j][0]},
        ${matrices[frame_n][i][j][1]},
        ${matrices[frame_n][i][j][2]}
      )`);
      id++;
    }
  }
  currentFrame=frame_n;
}

function newFrame(){ //para añadir nuevos frames
  matrices.push(Array.from(
    {length: m},
    ()=>new Array(n).fill([255,255,255])
  ));
  changeFrame(currentFrame+1);
}

var R=20;var G=20;var B=20; //colores actuales del 'pincel'

var isMouseDown;var setIsMouseDown;
var interactingItemIds=[];var setInteractingItemIds;
var inCanvas;var setInCanvas;//variables para manejar el mouse

var history_queue=[];var undo_queue=[]; //ctrl+z

function changeColor(){
  var color=document.getElementById('color_pick').value;
  var arr=rgb(colors[`${color}`]);
  R=arr[0];G=arr[1];B=arr[2];
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
    if(isMouseDown&&inCanvas){
      colorSwitch(itemId);
      setInteractingItemIds((prevItemIds) => [...prevItemIds, itemId]);
    }
  };

  const x=(item_id-1)%m;
  const y=parseInt((item_id-1)/m);

  var grid_item={
    backgroundColor:`rgb(
      ${matrices[currentFrame][x][y][0]},
      ${matrices[currentFrame][x][y][1]},
      ${matrices[currentFrame][x][y][2]}
    )`,
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
  const grid_container={
    display: 'grid',
    justifyContent: 'center',
    userSelect: 'none',
    alignItems: 'center',
    columnGap: '0px',
    rowGap: '0px',
    gridTemplateRows:`repeat(${n},${size}px)`,
    gridTemplateColumns:`repeat(${m},${size}px)`,
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
          color picker <input type="number" defaultValue={0} min={0} max={5} id="color_pick" />
          <br/>
          <button onClick={changeColor}>change color</button>
          <br/>
          <button onClick={clearCanvas}>clear canvas</button>
          <br/>
          <button onClick={save}>save</button>
          <br/>
          <button onClick={function(){}}>load</button>
          <br/>
          <button onClick={newFrame}>new frame</button>
          <br/>
          <button onClick={function(){changeFrame(currentFrame-1)}}>previous frame</button>
          <br/>
        </div>
      </div>
    </>
  );

  return result;
}

export default App;
