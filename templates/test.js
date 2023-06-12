var matrix; //matriz de imagen
const n=90;const m=160; //dimensiones de la matriz
const size=10; //tamaño de los pixeles individuales

var R=0;var G=0;var B=0; //colores actuales del 'pincel'

var down=false; //para poder pintar arrastrando el mouse

function startup(){
    matrix=Array.from(
        {length: m},
        ()=>new Array(n).fill([255,255,255])
    );
    
    var args1=``;var args2=``;
    for(let i=0;i<n;i++){
        args1+=` ${size}px`;
    }
    for(let i=0;i<m;i++){
        args2+=` ${size}px`;
    }

    document.styleSheets[0].cssRules[0].style.setProperty('grid-template-rows',args1);
    document.styleSheets[0].cssRules[0].style.setProperty('grid-template-columns',args2);
    document.styleSheets[0].cssRules[1].style.setProperty('width',`${size}px`);
    document.styleSheets[0].cssRules[1].style.setProperty('height',`${size}px`);
}

function renderMatrix(){
    const canvas=document.getElementById("canvas");
    canvas.innerHTML=``;

    var content=``;

    var id=1;
    var i=0;
    matrix.forEach(rows=>{
        
        var j=0;
        rows.forEach(cols=>{
            content+=`
                <div class="grid-item" style="background:
                    rgb(${matrix[i][j][0]},${matrix[i][j][1]},${matrix[i][j][2]});
                    height:${size}px;width:${size}px;"
                    id="${id}"
                ></div>
            `;
            id++;
            j++;
        });
    
        i++;
    });
    canvas.innerHTML=content;

    for(let i=1;i<id;i++){
        document.getElementById(`${i}`).addEventListener("mousedown",function(){mouseDown(i)});
        document.getElementById(`${i}`).addEventListener("mouseover",function(){mouseOver(i)});
    }
}

function mouseDown(id){
    down=true;
    colorSwitch(id);
}

function mouseOver(id){
    if(down){
        colorSwitch(id);
    }
}

document.addEventListener("mouseup",function(){
    down=false;
})

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

startup();
renderMatrix();