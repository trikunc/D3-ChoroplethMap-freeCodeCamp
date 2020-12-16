import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import {
  max,
  min,
  select,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft
} from "d3";

export default function App() {
  const [data, setData] = useState([]);
  const [dataGDP, setDataGDP] = useState([]);
  const [yearsData, setYearsDate] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
    )
      .then((response) => response.json())
      .then((data) => {
        // setData(data.data);
        // setDataGDP(data.data.map((item) => item[1]));
        // setYearsDate(data.data.map((item) => item[0]));
      });
  }, []);

  const svg = select(svgRef.current);

  return (
    <div className="App">
      <svg ref={svgRef}>
        <g className="x-axis" id="x-axis" />
        <g className="y-axis" id="y-axis" />
      </svg>
    </div>
  );
}
