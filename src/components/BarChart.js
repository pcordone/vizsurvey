/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Grid, Button, ThemeProvider } from "@mui/material";
import {
  axisBottom,
  axisLeft,
  scaleLinear,
  range,
  format,
  drag,
  select,
} from "d3";
import { DateTime } from "luxon";
import { useD3 } from "../hooks/useD3";
import { InteractionType } from "../features/InteractionType";
import { AmountType } from "../features/AmountType";
import {
  selectCurrentQuestion,
  setQuestionShownTimestamp,
  isLastTreatment,
  isMiddleTreatment,
  answer,
} from "../features/questionSlice";
import { dateToState } from "../features/ConversionUtil";
import { calcScreenValues } from "./ScreenHelper";
import { styles, theme } from "./ScreenHelper";

function BarChart() {
  const dispatch = useDispatch();
  const q = useSelector(selectCurrentQuestion);
  const [choice, setChoice] = useState(AmountType.none);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const isLastTreatmentQ = useSelector(isLastTreatment);
  const isMiddleTreatmentQ = useSelector(isMiddleTreatment);
  const t = d3.transition().duration(500);
  const navigate = useNavigate();
  const stateRef = useRef();

  useEffect(() => {
    dispatch(setQuestionShownTimestamp(dateToState(DateTime.utc())));
  }, []);

  useEffect(() => {
    switch (choice) {
      case AmountType.earlierAmount:
        d3.select("#laterAmount").transition(t).attr("stroke", "none");
        d3.select("#earlierAmount").transition(t).attr("stroke", "black");
        d3.select("#earlierAmount").transition(t).attr("stroke-width", "3");
        setDisableSubmit(false);
        break;
      case AmountType.laterAmount:
        d3.select("#earlierAmount").transition(t).attr("stroke", "none");
        d3.select("#laterAmount").transition(t).attr("stroke", "black");
        d3.select("#laterAmount").transition(t).attr("stroke-width", "3");
        setDisableSubmit(false);
        break;
      default:
        setDisableSubmit(true);
        d3.select("#laterAmount").transition(t).attr("stroke", "none");
        d3.select("#earlierAmount").transition(t).attr("stroke", "none");
    }
  }, [choice]);

  const {
    totalUCWidth,
    totalUCHeight,
    totalSVGWidth,
    totalSVGHeight,
    leftOffSetUC,
    bottomOffSetUC,
    barAreaWidthUC,
    barAreaHeightUC,
    barWidth,
  } = calcScreenValues(q);

  const TickType = {
    major: "major",
    minor: "minor",
  };

  const data = Array.from(Array(q.maxTime * 4 + 1).keys()).map((d) => {
    const isMajor = d % 4 === 0;
    const delay = d / 4;
    if (isMajor && delay === q.timeEarlier) {
      return {
        type: TickType.major,
        time: delay,
        amount: q.amountEarlier,
        barType: AmountType.earlierAmount,
      };
    } else if (isMajor && delay === q.timeLater) {
      return {
        type: TickType.major,
        time: delay,
        amount: q.amountLater,
        barType: AmountType.laterAmount,
      };
    } else {
      return {
        type: isMajor ? TickType.major : TickType.minor,
        time: delay,
        amount: 0,
        barType: AmountType.none,
      };
    }
  });

  const xTickValues = data.map((d) => d.time);

  return (
    <ThemeProvider theme={theme}>
      <Grid container style={styles.root} justifyContent="center">
        <Grid item xs={12}>
          <svg
            width={totalSVGWidth}
            height={totalSVGHeight}
            viewBox={`0 0 ${totalUCWidth} ${totalUCHeight}`}
            ref={useD3(
              (svg) => {
                var chart = svg
                  .selectAll(".plot-area")
                  .data([null])
                  .join("g")
                  .attr("class", "plot-area");

                const x = scaleLinear()
                  .domain([0, q.maxTime])
                  .range([0, barAreaWidthUC]);
                const yRange = [0, q.maxAmount];
                const y = scaleLinear()
                  .domain(yRange)
                  .range([barAreaHeightUC, 0]);

                const majorTicks = xTickValues.filter((v, i) => {
                  const entry = data[i];
                  return entry.type === TickType.major;
                });

                const majorTicksOdd = majorTicks.filter((v, i) => {
                  return i % 2 === 1;
                });

                const majorTicksEven = majorTicks.filter((v, i) => {
                  return i % 2 === 0;
                });

                console.log(majorTicks);
                console.log(majorTicksOdd);

                const minorTicks = xTickValues.filter((v, i) => {
                  const entry = data[i];
                  return entry.type === TickType.minor;
                });

                const xAxisEven = chart
                  .selectAll(".x-axis-major-even")
                  .data([null])
                  .join("g")
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${
                      barAreaHeightUC + bottomOffSetUC / 2
                    })`
                  )
                  .attr("class", "x-axis-major-even")
                  .call(
                    axisBottom(x)
                      .tickValues(majorTicksEven)
                      .tickSize(10)
                      .tickFormat(format(""))
                  );

                const xAxisOdd = chart
                  .selectAll(".x-axis-major-odd")
                  .data([null])
                  .join("g")
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${
                      barAreaHeightUC + bottomOffSetUC / 2
                    })`
                  )
                  .attr("class", "x-axis-major-even")
                  .call(
                    axisBottom(x)
                      .tickValues(majorTicksOdd)
                      .tickSize(15)
                      .tickFormat(format(""))
                  );

                // Add the class 'minor' to all minor ticks
                xAxisEven
                  .selectAll("g")
                  .filter(function (d, i) {
                    return majorTicks[i].type === TickType.major;
                  })
                  .style("stroke-width", "3px")
                  .attr("y2", "12");
                xAxisOdd
                  .selectAll("g")
                  .filter(function (d, i) {
                    return majorTicks[i].type === TickType.major;
                  })
                  .style("stroke-width", "3px")
                  .attr("y2", "12");

                chart
                  .selectAll(".x-axis-minor")
                  .data([null])
                  .join("g")
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${
                      barAreaHeightUC + bottomOffSetUC / 2
                    })`
                  )
                  .attr("class", "x-axis-minor")
                  .call(
                    axisBottom(x)
                      .tickValues(minorTicks)
                      .tickFormat(function () {
                        return "";
                      })
                      .tickSize(6)
                  );

                chart
                  .selectAll(".x-axis-label")
                  .data([null])
                  .join("g")
                  .attr("class", "x-axis-label")
                  .selectAll(".x-axis-text")
                  .data([null])
                  .join("text")
                  .attr("class", "x-axis-text")
                  .attr("dominant-baseline", "auto")
                  .attr("x", totalUCWidth / 2)
                  .attr("y", totalUCHeight - 4) // TODO how do I fix the -5 so that the bottom of the y doesn't get clipped
                  .attr("text-anchor", "middle")
                  .text("Delay in Months")
                  .attr("font-size", "1.2em");

                const yTickValues = range(yRange[0], yRange[1], yRange[1] / 5);
                yTickValues.push(yRange[1]);

                chart
                  .selectAll(".y-axis")
                  .data([null])
                  .join("g")
                  .attr("class", "y-axis")
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${bottomOffSetUC / 2})`
                  )
                  .call(
                    axisLeft(y)
                      .tickValues(yTickValues)
                      .tickFormat(format("$,.0f"))
                  );

                chart
                  .selectAll(".y-axis-label")
                  .data([null])
                  .join("g")
                  .attr("transform", "rotate(-90)")
                  .attr("class", "y-axis-label")
                  .style("font-size", "1.2em")
                  .selectAll(".y-axis-text")
                  .data([null])
                  .join("text")
                  .attr("class", "y-axis-text")
                  .attr("dominant-baseline", "hanging")
                  .attr("text-anchor", "middle")
                  .attr("x", -(barAreaHeightUC + bottomOffSetUC) / 2)
                  .attr("y", 0)
                  .text("US Dollars");

                chart
                  .selectAll(".bar")
                  .data(data)
                  .join("rect")
                  .attr("id", (d) => {
                    return d.barType;
                  })
                  .attr("fill", "steelblue")
                  .attr("class", "bar")
                  .attr("x", (d) => x(d.time) - barWidth / 2)
                  .attr("y", (d) => y(d.amount))
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${bottomOffSetUC / 2})`
                  )
                  .attr("width", barWidth)
                  .attr("height", (d) => y(0) - y(d.amount))
                  .on("mouseover", function () {
                    d3.select(this).attr("fill", "lightblue");
                    //d3.select(this).attr("stroke", "black");
                    //d3.select(this).attr("stroke-width", "3");
                  })
                  .on("mouseout", function () {
                    d3.select(this).attr("fill", "steelblue");
                    // if (d.target.__data__.barType !== stateRef.choice) {
                    //   d3.select(this).transition().duration(250);
                    //   d3.select(this).attr("stroke", "none");
                    // }
                  })
                  .on("click", function (d) {
                    if (
                      q.interaction === InteractionType.titration ||
                      q.interaction === InteractionType.none
                    ) {
                      if (
                        d.target.__data__.barType === AmountType.earlierAmount
                      ) {
                        if (stateRef.choice === AmountType.earlierAmount) {
                          setChoice(AmountType.none);
                        } else {
                          setChoice(AmountType.earlierAmount);
                        }
                      } else if (
                        d.target.__data__.barType === AmountType.laterAmount
                      ) {
                        if (stateRef.choice === AmountType.laterAmount) {
                          setChoice(AmountType.none);
                        } else {
                          setChoice(AmountType.laterAmount);
                        }
                      }
                    }
                  });

                const earlierEntry = data.find(
                  (v) => v.barType === AmountType.earlierAmount
                );
                const laterEntry = data.find(
                  (v) => v.barType === AmountType.laterAmount
                );

                chart
                  .selectAll(".earlier-amount-label")
                  .data([null])
                  .join("g")
                  .attr("class", "earlier-amount-label")
                  .selectAll(".earlier-amount-text")
                  .data([earlierEntry])
                  .join("text")
                  .attr("class", "earlier-amount-text")
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${bottomOffSetUC / 2 - 6})`
                  )
                  .attr("x", (d) => x(d.time))
                  .attr("y", (d) => y(d.amount))
                  .attr("text-anchor", "middle")
                  .text((d) => format("$,.0f")(d.amount))
                  .attr("font-size", "1.2em");

                chart
                  .selectAll(".later-amount-label")
                  .data([null])
                  .join("g")
                  .attr("class", "later-amount-label")
                  .selectAll(".later-amount-text")
                  .data([laterEntry])
                  .join("text")
                  .attr("class", "later-amount-text")
                  .attr(
                    "transform",
                    `translate(${leftOffSetUC / 2},${bottomOffSetUC / 2 - 6})`
                  )
                  .attr("x", (d) => x(d.time))
                  .attr("y", (d) => y(d.amount))
                  .attr("text-anchor", "middle")
                  .text((d) => format("$,.0f")(d.amount))
                  .attr("font-size", "1.2em");

                var dragHandler = drag().on("drag", function (d) {
                  if (
                    q.interaction === InteractionType.drag &&
                    d.subject.barType === q.variableAmount
                  ) {
                    select(this)
                      .attr("y", d.y)
                      .attr("height", y(0) - d.y);
                  }
                });
                dragHandler(chart.selectAll(".bar"));
              },
              [q]
            )}
          ></svg>
        </Grid>
        <Grid item xs={12} style={{ margin: 0 }}>
          <Button
            variant="contained"
            color="secondary"
            disableRipple
            disableFocusRipple
            style={styles.button}
            onClick={() => {
              dispatch(
                answer({
                  choice: choice,
                  choiceTimestamp: dateToState(DateTime.utc()),
                })
              );
              if (isLastTreatmentQ) {
                navigate("/postsurvey1");
              } else if (isMiddleTreatmentQ) {
                navigate("/attentioncheck");
              } else {
                setChoice(AmountType.none);
              }
            }}
            disabled={disableSubmit}
          >
            {" "}
            Next{" "}
          </Button>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default BarChart;
