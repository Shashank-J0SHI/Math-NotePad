import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {
  const [gridState, setGridState] = useState(true);
  const [scale, setScale] = useState("1x");
  const grid = useRef(0);
  const scaleRange = useRef(0);
  const gridButton = useRef(0);
  const rangeBox = useRef(0);
  const range = useRef(0);
  const scaleInfo = useRef(0);

  useEffect(() => {
    const context = grid.current.getContext("2d");

    function drawGrid(){
      context.lineWidth = 0.03;
      
      for (var x = 50; x <= 2000; x += 50) {
          context.moveTo(x, 0);
          context.lineTo(x, 2000);
      }

      for (var x = 50; x <= 2000; x += 50) {
          context.moveTo(0, x);
          context.lineTo(2000, x);
      }
      
      context.strokeStyle = "white";
      context.stroke();
    }

    drawGrid();
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
      gridButton.current.style.backgroundColor = "rgba(0, 173, 0, 0.847)"
    }
  }, [gridState])

  function gridToggle()
  {
    setGridState(!gridState);
  }

  function scaleToggle()
  {
    rangeBox.current.classList.toggle("active")
    if (rangeBox.current.className === "active")
    {
      scaleRange.current.style.backgroundColor = "rgb(186, 0, 0)"
    }
    else
    {
      scaleRange.current.style.backgroundColor = "transparent"
    }
  }

  function rangeUpdate()
  {
    let temp = 0.5 + (range.current.value / 100)
    setScale(`${temp.toFixed(1)}x`)
    grid.current.style.transform = `scale(${temp})`
  }

  return (
    <div className="App">
      <header>
        <h1>Math <span>NotePad</span></h1>
        <div id="tools">
          <div className="Button" id="gridButton" ref={gridButton} onClick={gridToggle}></div>
          <div className="Button" id="scaleRange" ref={scaleRange} onClick={scaleToggle}>
            <div id="sRange" ref={rangeBox}>
              <input type={"range"} orient="vertical" ref={range} onInput={rangeUpdate}></input>
              <p ref={scaleInfo}>{scale}</p>
            </div>
          </div>
        </div>
        
      </header>

      <div className="Sidebar">

      </div>

      <div className='workSpace'>
        <canvas ref={grid} width="2000" height="2000"></canvas>
      </div>
    </div>
  );
}

export default App;