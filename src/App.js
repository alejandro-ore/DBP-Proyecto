import React,{useEffect,useState} from 'react';
import {BrowserRouter as Router,Routes,Route,Link,useLocation} from 'react-router-dom';
import {ReactComponent as Gato} from './Catlogo.svg';
import {ReactComponent as Delf} from './DeleteFrame.svg';
import {ReactComponent as Newf} from './NewFrame.svg';
import {ReactComponent as Brush} from './Brush.svg';
import {ReactComponent as Bucket} from './Bucket.svg';
import {ReactComponent as Erraser} from './Erraser.svg';
import {ReactComponent as Save} from './save.svg';
import {ReactComponent as Load} from './load.svg';
import {ReactComponent as Flipdraw} from './flipdraw.svg';
import {ReactComponent as Prev} from './prev.svg';
import {ReactComponent as Next} from './next.svg';
import Cookies from 'js-cookie';
import importing from './users';
import './App.css';

const url=importing.url

//matriz de imagen
const n=60;const m=80;
var matrices=[Array.from(
  {length: n},
  ()=>new Array(m).fill([255,255,255])
)];

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

var project_id;
var frame_ids=[];
var deleted_frames=[];

async function start_project(){
  var data={'email_user':importing.decode.email,'name':'unnamed'};
  var response=await fetch(url+'animations',{
    method:'POST',
    body:JSON.stringify(data),
    headers:{
      'Content-Type':'application/json'
    }
  });
  var text=await response.text();
  project_id=parseInt(text);
  console.log(text);
  saveFrame(0);
}

function get_by_id(){
  fetch(url+'frames')
  .then(response=>response.json())
  .then(frame=>{
    return frame.data;
  })
}

async function saveFrame(frame_n){
  var str="";
  for(let i=0;i<n;i++){
    for(let j=0;j<m;j++){
      str+=`${rgb2_to_ids[matrices[frame_n][i][j][2]]}`;
    }
  }
  var method='POST';
  var data={'data':str,'id_anim':project_id,'frame_n':frame_n};
  if(frame_n>=0&&frame_n<frame_ids.length&&frame_ids[frame_n]!==-1){
    data['id']=frame_ids[frame_n];
    method='PUT';
  }
  var response=await fetch(url+'frames',{
    method:method,
    body:JSON.stringify(data),
    headers:{
      'Content-Type':'application/json'
    }
  })
  frame_ids[frame_n]=await response.text();
  console.log(frame_ids);
}

async function saveProject(){
  var ids=1;
  for(let i=0;i<n;i++){
    for(let j=0;j<m;j++){
      var pixel=document.getElementById(ids);
      matrices[currentFrame][i][j]=rgb(pixel.style.getPropertyValue("background-color"));
      ids++;
    }
  }
  for(let i=0;i<matrices.length;i++){
    await saveFrame(i);
  }
}

function loadFrame(frame_n){
  fetch(url+`frames/${frame_ids[frame_n]}`)
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

var R=20;var G=20;var B=20; //color primario
var R2=255;var G2=255;var B2=255; //color secundario

if(localStorage.getItem('R')!==null){
  R=localStorage.getItem('R');
  G=localStorage.getItem('G');
  B=localStorage.getItem('B');
}


var mouseNum=0;
var isMouseDown;var setIsMouseDown;
var interactingItemIds=[];var setInteractingItemIds;
var interactingCoords=[];var setInteractingCoords;
var inCanvas;var setInCanvas;//variables para manejar el mouse
var pixelSize=10;var setPixelSize;
var Xsize=400; var setXsize;
var Ysize=300; var setYsize;


var history_queue=[];var undo_queue=[]; //ctrl+z


var color=5;

function changeColor(){
  if(color===5) color=1;
  else color++;
  var arr=rgb(colors[`${color}`]);
  R=arr[0];G=arr[1];B=arr[2];
}

function colorSwitch(id){
    var pixel=document.getElementById(id);
    if(pixel.className==="grid-container") return;
    if(mouseNum===1){
      pixel.style.setProperty("background",`rgb(${R},${G},${B})`);
      localStorage.setItem('R',R);
      localStorage.setItem('G',G);
      localStorage.setItem('B',B);
    }
    if(mouseNum===2){
      pixel.style.setProperty("background",`rgb(${R2},${G2},${B2})`);
    }
    console.log(mouseNum);
}

function clearCanvas(){
    for(let i=1;i<=m*n;i++){
        document.getElementById(`${i}`).style.setProperty("background","rgb(255,255,255)");
    }
}

function FrameCount({}){
  return(
    <div style={{fontSize:25}} id='frameCount'>{currentFrame+1}/{matrices.length}</div>
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
    width:pixelSize,
    height:pixelSize,
    userSelect:'none',
    textAlign:'center',
    border:'0.01px solid rgba(136, 255, 233,25)',
  };

  return(
    <div className="grid-item"
      style={grid_item}
      id={item_id}
      onMouseEnter={()=>handleMouseEnter(item_id)}
    ></div>
  );
}

function Component({}){
  var location=useLocation();
  useEffect(()=>{
    if(window.location.pathname==='/draw'){
      project_id=-1;
      frame_ids=[-1];
      start_project();
    }
  },[location]);
  return(<div></div>);
}

var newFrameEnabled=true;

function handleNewFrame(){
  if(!newFrameEnabled) return;
  newFrame();
  newFrameEnabled=false;
  setTimeout(()=>{
    newFrameEnabled=true;
  },200);
}

function Rectangle({_R,_G,_B,w,h}){
  return(
    <svg width={w} height={h}>
      <rect
        width={300}
        height={100}
        style={{
          fill: `rgb(${_R},${_G},${_B})`,
          strokeWidth: 3,
          stroke: "rgb(0,0,0)",
          borderRadius: "50%",
          border: "None"
        }}
      />
    </svg>
  );
}

function MainDraw() {
  const [pixelSize, setPixelSize] = useState(10); // Default pixel size
  const [Xsize, setXsize] = useState(300); // Default pixel size
  const [Ysize, setYsize] = useState(400); // Default pixel size

  [isMouseDown,setIsMouseDown]=useState(false);
  [interactingItemIds,setInteractingItemIds]=useState([]);
  [interactingCoords,setInteractingCoords]=useState([]);
  [inCanvas,setInCanvas]=useState(false);
  useEffect(() => {
    const updatePixelSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const newX = screenWidth/2
      const newY = newX/4*3
      const newSize = (newX)/m;
      setPixelSize(newSize);
      setXsize(newX);
      setYsize(newY);
    };

    updatePixelSize();

    window.addEventListener('resize', updatePixelSize);

    return () => {
      window.removeEventListener('resize', updatePixelSize);
    };
  }, []);

  if(importing.decode.email==='FAILURE'){
      return(
        <div>
          You need to log in before you draw!<br/>
          <Link>
            <button>Main Menu</button>
          </Link>
        </div>
      );
    }

  const grid_container = {
    border: '10px solid rgba(248, 216, 129, 255)',
    display: 'grid',
    justifyContent: 'center',
    userSelect: 'none',
    alignItems: 'center',
    columnGap: '0px',
    rowGap: '0px',
    gridTemplateRows: `repeat(${n}, ${pixelSize}px)`,    // Use pixelSize variable
    gridTemplateColumns: `repeat(${m}, ${pixelSize}px)`, // Use pixelSize variable
    width: `${Xsize}px`,  // Use pixelSize variable
    height: `${Ysize}px`, // Use pixelSize variable
    padding: '0px',
    borderRadius: '5px',
    margin: '0 auto',
    position: 'relative',
  };
  

  const handleMouseDown = (event) => {
    if(event.button===0){
      mouseNum=1;
    }
    else if(event.button===2){
      mouseNum=2;
    }
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    mouseNum=0;
    setIsMouseDown(false);
    interactingItemIds.forEach(id=>{
      const x=parseInt((id[0]-1)/m);
      const y=(id[0]-1)%m;
      interactingCoords.push([x,y,rgb2_to_ids[B],rgb2_to_ids[id[1]]]);
    });
    history_queue.push(interactingCoords); //acabar el historial para ctrl+z y ctrl+y
    setInteractingItemIds([]);
    setInteractingCoords([]);
  };

  const isIncanvas = (bool) => {
    setInCanvas(bool);
  };

  const handleKeyDown=(event)=>{
    if(event.key==='Enter'){
      handleNewFrame();
    }
    else if(event.key==='ArrowRight'){ //nextframe
      changeFrame(currentFrame+1);
    }
    else if(event.key==='ArrowLeft'){ //prevframe
      changeFrame(currentFrame-1);
    }
  };

  const handleContextMenu=(event)=>{
    event.preventDefault();
  };

  const renderItems=()=>{
    var items=Array.from({length:n*m});
    var item_id=0;
    for(let i=0;i<n;i++){
      for(let j=0;j<m;j++){
        items[item_id]=(
          <Item item_id={item_id+1} key={item_id+1}/>);

        item_id++;
      }
    }
    return items;
  };

  var result=(
    <>
      <title>paint test</title>
      <title>paint test</title>
      <div className='ui_container'
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        tabIndex={0}
      >
        <div>
          <div className='tool_container'>
            <Gato className='gato'></Gato>
            <div className='toolbox'>
              <Delf className='delf' onClick={clearCanvas}></Delf>
              <Newf className='newf' onClick={handleNewFrame}></Newf>
              <div className= 'drawtools'>
                <Erraser className='painttool'></Erraser>
                <Brush className='painttool' onClick={changeColor}></Brush>
                <Rectangle _R={R} _G={G} _B={B} h={50} w={50}/>
              </div>
            </div>
          </div>
          <div className='grid-container' style={grid_container}
              onMouseEnter={function(){isIncanvas(true)}}
              onMouseLeave={function(){isIncanvas(false)}}
            >
              {renderItems().map((item)=>item)}
          </div>
          <div className= 'container2'>
            <div className= 'container1'>
              <Save onClick={saveProject} className='savetool'></Save>
              <Load onClick={loadProject} className='savetool'></Load>
              <FrameCount/>
            </div>
          <Flipdraw className= 'flipdraw'></Flipdraw>
          </div>
        </div>
      </div>
    </>
  );
  
  return result;
}

function Menu(){
  var result;
  if(importing.decode.email==='FAILURE'){
    result=(
      <div>
        <Link to='/login'>
          <button>log in</button>
        </Link><br/>
        <Link to='/register'>
          <button>register</button>
        </Link>
      </div>
    );
  }
  else{
    result=(
      <div>
        Logged in as {importing.decode.email}<br/>
        <Link to='/draw'>
          <button>draw</button>
        </Link><br/>
        <button onClick={function(){Cookies.remove('sessionToken');window.location.reload()}}>log out</button>
      </div>
    );
  }
  return result;
}

function App(){
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Menu/>}/>
        <Route path="/draw" element={<MainDraw/>}/>
        <Route path="/register" element={<importing.Register/>}/>
        <Route path="/login" element={<importing.Login/>}/>
      </Routes>
      <Component/>
    </Router>
  );
}

export default App;
