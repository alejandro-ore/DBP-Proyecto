import React, {useEffect,useState} from 'react';
import './App.css';

//matriz de imagen
const n=90;const m=160;
var matrices=[Array.from(
  {length: n},
  ()=>new Array(m).fill([255,255,255])
)];
console.log(matrices);
const size=10; //tamaño de los pixeles individuales

var currentFrame=0; //frame actual

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

const rgb2_to_ids={
  255:'0', //blanco
  23:'1', //rojo
  0:'2', //amarillo
  50:'3', //verde
  200:'4', //azul
  20:'5' //negro
}

var project_id=-1;
var frame_ids=[-1];var deleted_frames=[];

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
    saveFrame(0);
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

function saveFrame(frame_n){ // mensaje para val: no
  var str="";
  for(let i=0;i<n;i++){
    for(let j=0;j<m;j++){
      str+=`${rgb2_to_ids[matrices[frame_n][i][j][2]]}`;
    }
  }
  var method='POST';
  var data={'data':str,'id_anim':project_id,'frame_n':frame_n};
  if(frame_n>=0&&frame_n<frame_ids.length&&frame_ids[frame_n]!=-1){
    data['id']=frame_ids[frame_n];
    method='PUT';
  }
  fetch('http://localhost:5000/frames',{
    method:method,
    body:JSON.stringify(data),
    headers:{
      'Content-Type':'application/json'
    }
  }).then(response=>response.text())
  .then(text=>{
    frame_ids[frame_n]=text;
  })
}

function saveProject(){
  var ids=1;
  for(let i=0;i<n;i++){
    for(let j=0;j<m;j++){
      var pixel=document.getElementById(ids);
      matrices[currentFrame][i][j]=rgb(pixel.style.getPropertyValue("background-color"));
      ids++;
    }
  }
  for(let i=0;i<matrices.length;i++){
    saveFrame(i);
  }
}

function loadFrame(frame_n){
  fetch(`http://localhost:5000/frames/${frame_ids[frame_n]}`)
  .then(response=>response.json())
  .then(frame=>{
    var data=frame.data;
    var x=0;
    for(let i=0;i<n;i++){
      for(let j=0;j<m;j++){
        matrices[frame_n][i][j]=rgb(colors[data[x]]);
        x++;
      }
    }
  })
}

function loadProject(){
  for(let i=0;i<matrices.length;i++){
    loadFrame(i);
  }
  var id=1;
  for(let i=0;i<n;i++){
    for(let j=0;j<m;j++){
      var pixel=document.getElementById(id);id++;
      pixel.style.setProperty('background-color',colors[rgb2_to_ids[matrices[currentFrame][i][j][2]]]);
    }
  }
}

function rgb(s){
  var new_s=(s.replace('rgb(','').replace(')','')).split(',');
  for(let i=0;i<new_s.length;i++){
    new_s[i]=parseInt(new_s[i].replace(' ',''));
  }
  return new_s;
}

function changeFrame(frame_n){
  if(frame_n>=matrices.length) return;
  if(frame_n<0) return;
  document.getElementById('frameCount').innerHTML=`${frame_n+1}/${matrices.length}`;
  var id=1;
  for(let i=0;i<n;i++){
    for(let j=0;j<m;j++){
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
  console.log(matrices[currentFrame]);
  currentFrame=frame_n;
}

function newFrame(){ //para añadir nuevos frames
  matrices.splice(currentFrame+1,0,Array.from(
    {length: n},
    ()=>new Array(m).fill([255,255,255])
  ));
  frame_ids.splice(currentFrame+1,0,-1);
  changeFrame(currentFrame+1);
  saveProject();
}

var R=20;var G=20;var B=20; //colores actuales del 'pincel'

var isMouseDown;var setIsMouseDown;
var interactingItemIds=[];var setInteractingItemIds;
var interactingCoords=[];var setInteractingCoords;
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

function FrameCount({}){
  return(
    <div id='frameCount'>{currentFrame+1}/{matrices.length}</div>
  );
}

function Item({item_id}){
  [isMouseDown,setIsMouseDown]=useState(false);
  [interactingItemIds,setInteractingItemIds]=useState([]);

  const handleMouseEnter=(itemId)=>{
    if(isMouseDown&&inCanvas){
      var got_color=document.getElementById(itemId).style.getPropertyValue('background-color');
      setInteractingItemIds((prevItemIds)=>[...prevItemIds,[itemId,rgb(got_color)[2]]]);
      colorSwitch(itemId);
    }
  };

  const x=parseInt((item_id-1)/m);
  const y=(item_id-1)%m;
  
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

  [isMouseDown,setIsMouseDown]=useState(false);
  [interactingItemIds,setInteractingItemIds]=useState([]);
  [interactingCoords,setInteractingCoords]=useState([]);
  [inCanvas,setInCanvas]=useState(false);

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    interactingItemIds.forEach(id=>{
      const x=parseInt((id[0]-1)/m);
      const y=(id[0]-1)%m;
      interactingCoords.push([x,y,rgb2_to_ids[B],rgb2_to_ids[id[1]]]);
    });
    console.log(interactingItemIds);
    console.log(interactingCoords);
    history_queue.push(interactingCoords); //acabar el historial para ctrl+z y ctrl+y
    setInteractingItemIds([]);
    setInteractingCoords([]);
  };

  const isIncanvas = (bool) => {
    setInCanvas(bool);
  };

  const handleKeyDown=(event)=>{
    if(event.key==='Enter'){
      newFrame();
    }
    else if(event.key==='ArrowRight'){ //nextframe
      changeFrame(currentFrame+1);
    }
    else if(event.key==='ArrowLeft'){ //prevframe
      changeFrame(currentFrame-1);
    }
    else if(event.ctrlKey){ //shortcut keybinds
      if(event.key==='z'){
        alert('ctrl+z');
      }
      else if(event.key==='y'){
        alert('ctrl+y');
      }
    }
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
      <div className='ui_container'
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
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
          <button onClick={saveProject}>save</button>
          <br/>
          <button onClick={loadProject}>load</button>
          <br/>
          <button onClick={newFrame}>new frame</button>
          <br/>
          <button onClick={function(){changeFrame(currentFrame+1)}}>next frame</button>
          <br/>
          <button onClick={function(){changeFrame(currentFrame-1)}}>previous frame</button>
          <br/>
          <FrameCount/>
        </div>
      </div>
    </>
  );

  return result;
}

export default App;