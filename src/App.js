import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import {
  min,
  max,
  select,
  scaleLinear,
  scaleThreshold,
  schemePurples,
  axisBottom,
  geoPath,
  range
} from "d3";
import { feature } from "topojson-client";

export default function App() {
  const usDataSet =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
  const usEduDataSet =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

  const [dataUs, setDataUs] = useState([]);
  const [dataUsEdu, setDataUsEdu] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    fetch(usDataSet)
      .then((response) => response.json())
      .then((data) => {
        setDataUs(feature(data, data.objects.counties).features);
      });
    fetch(usEduDataSet)
      .then((response) => response.json())
      .then((data) => {
        setDataUsEdu(data);
      });
  }, []);

  useEffect(() => {
    // console.log("US: ", dataUs);
    console.log("UsEdu: ", dataUsEdu);

    const width = 960;
    const height = 600;
    const padding = 60;
    const path = geoPath();

    const minEdu = min(dataUsEdu, (d) => d.bachelorsOrHigher);
    const maxEdu = max(dataUsEdu, (d) => d.bachelorsOrHigher);

    console.log(minEdu, maxEdu);
    const colorSet = schemePurples[9];

    const colorRange = range(minEdu, maxEdu, (maxEdu - minEdu) / 8);

    const color = scaleThreshold()
      .domain(
        (function (min, max, count) {
          if (min === undefined) return [];
          var array = [];
          var step = (max - min) / count;
          var base = min;
          for (var i = 1; i < count; i++) {
            let arr = parseFloat((base + i * step).toFixed(1));
            // array.push(base + i * step);
            array.push(arr);
          }
          console.log(array, min);
          return array;
        })(minEdu, maxEdu, colorSet.length)
      )
      .range(colorSet);

    const svg = select(svgRef.current)
      .attr("height", height)
      .attr("width", width);
    // .style("width", "100%")
    // .style("height", "auto");

    let tooltip = select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg
      .append("g")
      .selectAll("path")
      .data(dataUs)
      .join("path")
      .attr("data-fips", (item) => {
        return item["id"];
      })
      .attr("data-education", (item) => {
        let fips = item["id"];
        let county = dataUsEdu.find((county) => {
          return county["fips"] === fips;
        });
        let percentage = county.bachelorsOrHigher;
        return percentage;
      })
      .attr("fill", (item) => {
        let fips = item["id"];
        let county = dataUsEdu.find((county) => {
          return county["fips"] === fips;
        });
        return color(county.bachelorsOrHigher);
      })
      .attr("d", path)
      .attr("class", "county")
      .on("mouseover", function (event, value) {
        let coordinates = [event.pageX, event.pageY];
        select(this).classed("active", true);
        let fips = value.id;
        let county = dataUsEdu.find((county) => {
          return county["fips"] === fips;
        });
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip

          .attr("id", "tooltip")
          .attr("data-education", county.bachelorsOrHigher)
          .html(
            `
            <p><strong>Area Name: ${county.area_name}</strong></p>
            <p><strong>State: ${county.state}</strong></p>
            <p><strong>Percentage: ${county.bachelorsOrHigher}%</strong></p>
            `
          )
          .style("left", coordinates[0] + "px")
          .style("top", coordinates[1] + "px");
      })
      .on("mouseout", function (d) {
        select(this).classed("active", false);
        tooltip.transition().duration(100).style("opacity", 0);
      });
    // .text((d) => dataUsEdu.get(d.id).format(""));

    // svg
    //   .append("path")
    //   .datum(mesh(dataUs, dataUs.objects.states, (a, b) => a !== b))
    //   .attr("fill", "none")
    //   .attr("stroke", "white")
    //   .attr("stroke-linejoin", "round")
    //   .attr("d", path);

    // Legend

    const legend = svg.append("g").attr("id", "legend");

    const legendColor = (g) => {
      const widthLgd = 260;
      const lengthLgd = color.range().length;

      const x = scaleLinear()
        .domain([1, lengthLgd - 1])
        .rangeRound([
          widthLgd / lengthLgd,
          (widthLgd * (lengthLgd - 1)) / lengthLgd
        ]);

      g.selectAll("rect")
        .data(color.range())
        .join("rect")
        .attr("height", 8)
        .attr("x", (d, i) => x(i))
        .attr("width", (d, i) => x(i + 1) - x(i))
        .attr("fill", (d) => d);

      g.append("text")
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Percentage Education");

      g.call(
        axisBottom(x)
          .tickSize(14)
          .tickFormat((i) => color.domain()[i - 1])
          .tickValues(range(1, lengthLgd))
      )
        .select(".domain")
        .remove();
    };
    legend.attr("transform", "translate(610,25)").call(legendColor);
  }, [dataUs, dataUsEdu]);

  return (
    <div className="App">
      <h1 id="title">United States Educational Attainment</h1>
      <h4 id="description">
        Percentage of adults age 25 and older with a bachelor's degree or higher
        (2010-2014)
      </h4>
      <svg ref={svgRef}>
        <g className="x-axis" id="x-axis" />
        <g className="y-axis" id="y-axis" />
      </svg>
    </div>
  );
}
