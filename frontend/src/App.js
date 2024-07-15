import './App.css';
import { useEffect, useRef, useState } from 'react';

let undoList = [];
let redoList = [];
let eqns = [];
let invalidChars = [];
let parr = [];
let zeroPos= [0];
let safePos = 0;

function isOverlapped(topLeftA, bottomRightA, topLeftB, bottomRightB)
{
  let overA = null
  let overB = null
  let areaA = (bottomRightA.x - topLeftA.x) * (bottomRightA.y - topLeftA.y)
  let areaB = (bottomRightB.x - topLeftB.x) * (bottomRightB.y - topLeftB.y)

  if (bottomRightA.x <= topLeftB.x || bottomRightA.y <= topLeftB.y)
  {
    return 0;
  }

  if (topLeftA.x >= bottomRightB.x || topLeftA.y >= bottomRightB.y)
  {
    return 0;
  }

  if (bottomRightA.x <= bottomRightB.x)
  {
    overB = bottomRightA
  }
  else
  {
    overB = bottomRightB
  }

  if (topLeftA.x <= topLeftB.x)
  {
    overA = topLeftB
  }
  else
  {
    overA = topLeftA
  }

  let areaO = (overB.x - overA.x) * (overB.y - overA.y)

  if (areaO / areaA > areaO / areaB)
  {
    var result = areaO / areaA
  }
  else
  {
    result = areaO / areaB
  }

  return result;
}

function App() {
  class character 
  {
    constructor(topLeft, bottomRight, points)
    {
      this.topLeft = topLeft
      this.bottomRight = bottomRight
      
      let a = bottomRight.x - topLeft.x
      let b = bottomRight.y - topLeft.y
      this.diagonal = Math.sqrt(a*a + b*b) * 0.8
      this.center = {x: (bottomRight.x + topLeft.x) / 2, y: (bottomRight.y + topLeft.y) / 2}
      this.points = points
      this.index = null
      this.value = null
      this.next = null
      this.previous = null
      this.prefix = null
    }

    setValue(data)
    {
      this.value = data
    }

    traverse(string)
    {
      if (this.value === null)
      {
        boundBox("red", this.topLeft, this.bottomRight);
      }
      else if (this.next === null && this.previous === null)
      {
        boundBox("yellow", this.topLeft, this.bottomRight);
      }

      if (this.prefix !== null)
      {
        string += this.prefix
      }

      string = string + this.value
      
      if (this.next !== null)
      {
        this.next.traverse(string)
      }
      else
      {
        console.log(string)
      }
    }

    findRelative()
    {
      for (let i = undoList.length - 1; (i >= zeroPos[safePos]) && (undoList[i] !== 0); i--)
      {
        if (undoList[i] !== this && (!invalidChars.includes(undoList[i])))
        {
          let a = undoList[i].center.x - this.center.x  
          let b = undoList[i].center.y - this.center.y
          let distance = Math.sqrt(a**2 + b**2)
          let opercent = isOverlapped(this.topLeft, this.bottomRight, undoList[i].topLeft, undoList[i].bottomRight)

          if ((distance < this.diagonal || distance < undoList[i].diagonal) && (opercent < 0.35) && (undoList[i].next === null || undoList[i].previous === null))
          {
            let angle = Math.atan2(b, a)

            if (Math.abs(angle) > 2.82)
            {
              if (this.diagonal > 0.5 * undoList[i].diagonal && this.diagonal < 1.5 * undoList[i].diagonal)
              {
                if (undoList[i].next === null)
                {
                  this.previous = undoList[i]
                  undoList[i].next = this
                  break;
                }
              }
            }
            else if (Math.abs(angle) < 0.314)
            {
              if (this.diagonal > 0.5 * undoList[i].diagonal && this.diagonal < 1.5 * undoList[i].diagonal)
              {
                if (undoList[i].previous === null)
                {
                  this.next = undoList[i]
                  undoList[i].previous = this
                  let temp = eqns.findIndex((c) => {return c.firstChar === undoList[i]})
                  eqns[temp].firstChar = this
                  break;
                }
              }
            }
            else if (angle < 2.67 && angle > 2.04)
            {
              if (this.diagonal > 0.3 * undoList[i].diagonal && this.diagonal < undoList[i].diagonal)
              {
                if (undoList[i].next === null)
                {
                  this.previous = undoList[i]
                  undoList[i].next = this
                  this.prefix = "^("
                  break;
                }
              }
            }
          }
          else if (opercent > 0.35)
          {
            invalidChars.push(this)
            return false;
          }
        }
      }

      return true
    }
  }

  class Equation
  {
    constructor(char, topLeft, bottomRight)
    {
      this.firstChar = char
      this.topLeft = topLeft
      this.bottomRight = bottomRight
    }
  }

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
  const boundBoxCanvas = useRef(0);

  let pen_color = "white";
  let isGrid = false;

  useEffect(() => {
    const context = grid.current.getContext("2d");
    const padContext = pad.current.getContext("2d");

    let pointArray = [];
    let interval = null;
    let isWriting = false;
    let maxX = 0;
    let maxY = 0;
    let minX = 0;
    let minY = 0;

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
        
        let temp = penSize / 2
        let char = new character({x: minX - temp, y: minY - temp}, {x: maxX + temp, y: maxY + temp}, parr)
        

        if (char.findRelative() && (undoList.length === 0 || undoList[undoList.length - 1] === 0 || char.next === char.previous))
        {
          let eqn = new Equation(char, char.topLeft, char.bottomRight)
          eqns.push(eqn)
        }

        undoList.push(char)
        redoList.length = 0

        ask(char)
        parr = []

        zeroPos.slice(safePos + 1)
        setClear(false);
        setUndos(true);
        setRedos(false)
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
    redoList.length = 0
    zeroPos.slice(safePos + 1)
    setRedos(false)

    setClear(true)
    ctx.beginPath()
    ctx.clearRect(0, 0, 2000, 2000)
    ctx.stroke()

    undoList.push(0)
    zeroPos.push(undoList.length)
    safePos = zeroPos.length - 1

    processPage()
  }

  function rangeUpdate()
  {
    let temp = 0.5 + (range.current.value / 100)
    setScale(temp)
    grid.current.style.transform = `scale(${temp})`
    pad.current.style.transform = `scale(${temp})`
    boundBoxCanvas.current.style.transform = `scale(${temp})`
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

    if (redoList[redoList.length - 1] === 0)
    {
      safePos--
    }

    let temp = redoList[redoList.length - 1]
    
    if (temp !== null && temp !== 0)
    {
      if (temp.next !== null)
      {
        temp.next.previous = null
      }
  
      if (temp.previous !== null)
      {
        temp.previous.next = null
      }
      else if (!invalidChars.includes(temp))
      {
        let local = eqns.findIndex((c) => {return c.firstChar === temp})
        eqns[local].firstChar = temp.next
      }
    }

    processPage()
  }

  function redo()
  {
    jumpState(redoList, undoList)
    setUndos(true)

    if (!redoList.length)
    {
      setRedos(false)
    }

    if (undoList[undoList.length - 1] === 0)
    {
      safePos++
    }

    let temp = undoList[undoList.length - 1]

    if ((temp !== null) && (temp !== 0))
    {
      if (temp.next != null)
      {
        temp.next.previous = temp
      }
  
      if (temp.previous != null)
      {
        temp.previous.next = temp
      }
      else if (!invalidChars.includes(temp))
      {
        let local = eqns.findIndex((c) => {return c.firstChar === temp.next})
        eqns[local].firstChar = temp
      }
    }

    processPage()
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
    ctx.beginPath()
    ctx.clearRect(0, 0, 2000, 2000)
    ctx.stroke()

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
          let points = temp.points
          empty = false
          setClear(false)

          ctx.beginPath()
          ctx.moveTo(points[0].x, points[0].y)
    
          while (points.length > 0)
          {
            ctx.lineTo(points[0].x, points[0].y)
            points = points.slice(1)
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

  function ask(char)
  {
    let maxX = char.bottomRight.x
    let maxY = char.bottomRight.y
    let minX = char.topLeft.x
    let minY = char.topLeft.y
    let points = char.points

    const ctx = hiddenCanvas.current.getContext("2d")

    hiddenCanvas.current.height = maxY - minY
    hiddenCanvas.current.width = maxX - minX

    ctx.lineWidth = penSize + 2;
    ctx.strokeStyle = pen_color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    
    ctx.beginPath()
    ctx.moveTo(points[0].x - minX, points[0].y - minY)
    
    while (points.length > 0)
    {
      ctx.lineTo(points[0].x - minX, points[0].y - minY)
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

    fetch("http://127.0.0.1:5000/recognise", options)
    .then((response) => response.json())
    .then((data) => {
      char.setValue(data)
      processPage()
    })
  }

  function processPage()
  {
    let temp = boundBoxCanvas.current.getContext("2d")
    temp.beginPath()
    temp.clearRect(0, 0, 2000, 2000)
    temp.stroke()
    
    for (let i = 0; i < eqns.length; i++)
    {
      if (undoList.includes(eqns[i].firstChar) && undoList.indexOf(eqns[i].firstChar) >= zeroPos[safePos])
      {
        eqns[i].firstChar.traverse('')
      }
    }

    for (let i = 0; i < invalidChars.length; i++)
    {
      if (undoList.includes(invalidChars[i]) && (undoList.indexOf(invalidChars[i]) >= zeroPos[safePos]))
      {
        boundBox('red', invalidChars[i].topLeft, invalidChars[i].bottomRight)
      }
    }
  }

  function boundBox(color, topLeft, bottomRight)
  {
    const ctx = boundBoxCanvas.current.getContext("2d");
    ctx.lineWidth = 1
    ctx.strokeStyle = color
    ctx.beginPath();
    ctx.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    ctx.stroke();
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
        <canvas ref={boundBoxCanvas} width="2000" height="2000" id="boundBoxCanvas"></canvas>
        <canvas ref={hiddenCanvas} id="hidden"></canvas>
      </div>
    </div>
  );
}

export default App;