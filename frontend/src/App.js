import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {
  const [gridState, setGridState] = useState(true);
  const [drawState, setDrawState] = useState(true);
  const [scale, setScale] = useState(1);
  const [isClear, setClear] = useState(true);
  const grid = useRef(0);
  const scaleRange = useRef(0);
  const gridButton = useRef(0);
  const drawButton = useRef(0);
  const rangeBox = useRef(0);
  const range = useRef(0);
  const scaleInfo = useRef(0);
  const pad = useRef(0);
  const workSpace = useRef(0);
  const clearButton = useRef(0);

  var pen_color = "white";
  var isGrid = false;

  useEffect(() => {
    const context = grid.current.getContext("2d");
    const padContext = pad.current.getContext("2d");

    var pointArray = [];
    var interval = null;
    var isWriting = false;

    pad.current.addEventListener('mousedown', writeStart);
    pad.current.addEventListener('mousemove', writing);
    pad.current.addEventListener('mouseup', writeEnd);
    pad.current.addEventListener('mouseout', writeEnd);

    pad.current.addEventListener('touchstart', writeStart);
    pad.current.addEventListener('touchmove', writing);
    pad.current.addEventListener('touchend', writeEnd);

    function writeStart(event)
    {
      event.preventDefault()
      isWriting = true

      padContext.lineWidth = 10;
      padContext.strokeStyle = "white";
      padContext.shadowColor = "white";
      padContext.shadowBlur = 2;
      padContext.lineJoin = "round";
      padContext.lineCap = "round";
    
      padContext.beginPath()
      pointArray.push(getWriteCoordinates(event))
      padContext.moveTo(pointArray[0].x, pointArray[0].y)

      interval = setInterval(render, 16)
    }

    function writing(event)
    {
      event.preventDefault()
      if (isWriting)
      {
        setClear(false);
        pointArray.push(getWriteCoordinates(event))
      }
    }

    function writeEnd(event)
    {
      event.preventDefault()
      isWriting = false;
      setTimeout(() => {
        clearInterval(interval)
      }, 17)
    }

    function render()
    {
        while (pointArray.length > 0)
        {
          padContext.lineTo(pointArray[0].x, pointArray[0].y)
          pointArray = pointArray.slice(1)
        }
  
        padContext.stroke()
    }

    function drawGrid(){
      context.lineWidth = 1;
      
      for (var x = 50; x <= 2000; x += 50) {
          context.moveTo(x, 0);
          context.lineTo(x, 2000);
      }

      for (var x = 50; x <= 2000; x += 50) {
          context.moveTo(0, x);
          context.lineTo(2000, x);
      }

      context.strokeStyle = "rgb(255, 255, 255, 0.05)";
      context.stroke();
    }

    if (!isGrid)
    {
      drawGrid();
    }
  }, [])

  useEffect(() => {
    if (!gridState)
    {
      grid.current.style.opacity = 0;
      gridButton.current.style.backgroundColor = "transparent";
    }
    else
    {
      grid.current.style.opacity = 1;
      gridButton.current.style.backgroundColor = "white"
    }
  }, [gridState])

  useEffect(() => {
    if (!isClear)
    {
      clearButton.current.classList.add("active")
    }
    else
    {
      clearButton.current.classList.remove("active")
    }
  }, [isClear])

  useEffect(() => {
    if (!drawState)
    {
      pad.current.style.pointerEvents = "none";
      workSpace.current.style.cursor = "grab";
      drawButton.current.style.backgroundColor = "transparent";
    }
    else
    {
      pad.current.style.pointerEvents = "all";
      workSpace.current.style.cursor = "crosshair"
      drawButton.current.style.backgroundColor = "white"
    }
  }, [drawState])

  function gridToggle()
  {
    setGridState(!gridState);
  }

  function drawToggle()
  {
    setDrawState(!drawState);
  }

  function scaleToggle()
  {
    rangeBox.current.classList.toggle("active")
    if (rangeBox.current.className === "active")
    {
      scaleRange.current.style.backgroundColor = "white"
    }
    else
    {
      scaleRange.current.style.backgroundColor = "transparent"
    }
  }

  function clear()
  {
    const ctx = pad.current.getContext("2d");
    ctx.clearRect(0, 0, 2000, 2000)
    setClear(true)
  }

  function rangeUpdate()
  {
    let temp = 0.5 + (range.current.value / 100)
    setScale(temp)
    grid.current.style.transform = `scale(${temp})`
    pad.current.style.transform = `scale(${temp})`
  }

  function getWriteCoordinates(event) {
    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;
    const ws = workSpace.current
    const s = 0.5 + (range.current.value / 100)
    const canvasX = ((clientX - ws.offsetLeft + ws.scrollLeft) / s);
    const canvasY = ((clientY - ws.offsetTop + ws.scrollTop) / s);
    console.log(s)
    return { x: canvasX, y: canvasY };
  }

  return (
    <div className="App">
      <header>
        <h1>Math <span>NotePad</span></h1>
        <div id="tools">
          <div className="Button" id="clearButton" ref={clearButton} onClick={clear}></div>
          <div className="Button" id="undoButton"></div>
          <div className="Button" id="redoButton"></div>
          <div className="Button" id="drawButton" ref={drawButton} onClick={drawToggle}></div>
          <div className="Button" id="gridButton" ref={gridButton} onClick={gridToggle}></div>
          <div className="Button" id="scaleRange" ref={scaleRange} onClick={scaleToggle}>
            <div id="sRange" ref={rangeBox}>
              <input type={"range"} orient="vertical" ref={range} onInput={rangeUpdate}></input>
              <p ref={scaleInfo}>{`${scale.toFixed(1)}x`}</p>
            </div>
          </div>
        </div>
        
      </header>

      <div className="Sidebar">

      </div>

      <div className='workSpace' ref={workSpace}>
        <canvas ref={pad} id="pad" width="2000" height="2000"></canvas>
        <canvas ref={grid} width="2000" height="2000"></canvas>
      </div>
    </div>
  );
}

export default App;