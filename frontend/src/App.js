import './App.css';
import { useEffect, useRef, useState } from 'react';

var undoList = [];
var redoList = [];
var parr = [];

function App() {
  const [gridState, setGridState] = useState(true);
  const [drawState, setDrawState] = useState(true);
  const [scale, setScale] = useState(1);
  const [isClear, setClear] = useState(true);
  const [penSize, setPenSize] = useState(8)
  const [Undos, setUndos] = useState(false)
  const [Redos, setRedos] = useState(false)

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
  const undoButton = useRef(0);
  const redoButton = useRef(0);
  const hiddenCanvas = useRef(0);

  var pen_color = "white";
  var isGrid = false;

  useEffect(() => {
    const context = grid.current.getContext("2d");
    const padContext = pad.current.getContext("2d");

    var pointArray = [];
    var interval = null;
    var isWriting = false;
    var maxX = 0;
    var maxY = 0;
    var minX = 0;
    var minY = 0;

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

      padContext.lineWidth = penSize;
      padContext.strokeStyle = pen_color;
      padContext.shadowColor = pen_color;
      padContext.shadowBlur = 2;
      padContext.lineJoin = "round";
      padContext.lineCap = "round";
    
      padContext.beginPath()

      let temp = getWriteCoordinates(event)
      maxX = minX = temp.x;
      maxY = minY = temp.y
      pointArray.push(temp)
      parr.push(temp)
      padContext.moveTo(pointArray[0].x, pointArray[0].y)

      interval = setInterval(render, 16)
      event.stopImmediatePropagation();
    }

    function writing(event)
    {
      event.preventDefault()
      if (isWriting)
      {
        let temp = getWriteCoordinates(event)

        if (temp.x > maxX)
        {
          maxX = temp.x
        }

        if (temp.x < minX)
        {
          minX = temp.x
        }

        if (temp.y > maxY)
        {
          maxY = temp.y
        }

        if (temp.y < minY)
        {
          minY = temp.y
        }

        pointArray.push(temp)
        parr.push(temp)
      }
      event.stopImmediatePropagation();
    }

    function writeEnd(event)
    {
      if (isWriting)
      {
        event.preventDefault()
        isWriting = false;
        setTimeout(() => {
          clearInterval(interval)
        }, 17)
        
        undoList.push(parr)
        redoList.length = 0
        ask(parr, maxX, minX, maxY, minY)
        parr = []
        setClear(false);
        setUndos(true);
      }
      event.stopImmediatePropagation();
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
      
      for (let x = 50; x <= 2000; x += 50) {
          context.moveTo(x, 0);
          context.lineTo(x, 2000);
      }

      for (let x = 50; x <= 2000; x += 50) {
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

  useEffect(() => {
    (Undos) ? undoButton.current.classList.add("active") : undoButton.current.classList.remove("active")
  }, [Undos])

  useEffect(() => {
    (Redos) ? redoButton.current.classList.add("active") : redoButton.current.classList.remove("active")
  }, [Redos])

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
    setClear(true)
    ctx.clearRect(0, 0, 2000, 2000)
    undoList.push(0)
    redoList.length = 0
    setRedos(false)
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
    return { x: canvasX, y: canvasY };
  }

  function undo()
  {
    jumpState(undoList, redoList)
    setRedos(true)

    if (!undoList.length)
    {
      setUndos(false)
    }
  }

  function redo()
  {
    jumpState(redoList, undoList)
    setUndos(true)

    if (!redoList.length)
    {
      setRedos(false)
    }
  }

  function jumpState(from, to)
  {
    if (from.length > 0)
    {
      let data = from.pop()

      to.push(data)
      Redraw()
    }
  }

  function Redraw()
  {
    let ctx = pad.current.getContext("2d")
    ctx.clearRect(0, 0, 2000, 2000)

    ctx.lineWidth = penSize + 2;
    ctx.strokeStyle = pen_color;
    ctx.shadowColor = pen_color;
    ctx.shadowBlur = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (undoList.length)
    {
      let empty = true;

      for (let x = undoList.length - 1; x >= 0; x--)
      {
        let temp = undoList[x]

        if (temp)
        {
          empty = false
          setClear(false)

          ctx.beginPath()
          ctx.moveTo(temp[0].x, temp[0].y)
    
          while (temp.length > 0)
          {
            ctx.lineTo(temp[0].x, temp[0].y)
            temp = temp.slice(1)
          }
    
          ctx.stroke()
        }
        else
        {
          break;
        }
      }

      if (empty)
      {
        setClear(true)
      }

    }
    else
    {
      setClear(true)
    }
  }

  function ask(points, maxX, minX, maxY, minY)
  {
    const temp = penSize * 2

    const ctx = hiddenCanvas.current.getContext("2d")
    hiddenCanvas.current.height = maxY - minY + temp
    hiddenCanvas.current.width = maxX - minX + temp

    ctx.lineWidth = penSize + 2;
    ctx.strokeStyle = pen_color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    
    ctx.beginPath()
    ctx.moveTo(points[0].x - minX + penSize, points[0].y - minY + penSize)
    
    while (points.length > 0)
    {
      ctx.lineTo(points[0].x - minX + penSize, points[0].y - minY + penSize)
      points = points.slice(1)
    }

    ctx.stroke()

    let body = {
      "content" : hiddenCanvas.current.toDataURL("image/jpeg")
    }

    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    fetch("http://127.0.0.1:5000/recognise", options).then((response) => response.json()).then((data) => {console.log(data)})
  }

  return (
    <div className="App">
      <header>
        <h1>Math <span>NotePad</span></h1>
        <div id="tools">
          <div className="Button" id="clearButton" ref={clearButton} onClick={clear}></div>
          <div className="Button" id="undoButton" ref={undoButton} onClick={undo}></div>
          <div className="Button" id="redoButton" ref={redoButton} onClick={redo}></div>
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
        <canvas ref={hiddenCanvas} id="hidden"></canvas>
      </div>
    </div>
  );
}

export default App;