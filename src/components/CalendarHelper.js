import { select } from "d3";
import { AmountType } from "../features/AmountType.js";

export const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

export const drawCalendar = ({
  table: table,
  onClickCallback: onClickCallback,
  choice: choice,
  qDateEarlier: qDateEarlier,
  qDateLater: qDateLater,
  qAmountEarlier: qAmountEarlier,
  qAmountLater: qAmountLater,
  minimalStyle: minimalStyle = false,
  boxLengthOverride: boxLengthOverride = 1.0,
  monthNumber: monthNumber = "same",
}) => {
  let selection = { d: -1, a: -1 };
  console.log("qDateEarlier: " + qDateEarlier);
  console.log("qDateLater: " + qDateLater);
  const firstOfMonth = new Date(qDateEarlier);
  const lastOfMonth = new Date(qDateEarlier);
  if (monthNumber !== "same") {
    firstOfMonth.setMonth(monthNumber);
    lastOfMonth.setMonth(monthNumber + 1);
  }
  firstOfMonth.setDate(1);
  lastOfMonth.setDate(0);
  console.log("lastOfMonth: " + lastOfMonth);
  const date = new Date(qDateEarlier);
  const dateLater = new Date(qDateLater);
  console.log("date: " + date);
  console.log("date.getDate(): " + date.getDate());
  console.log("date.getDay(): " + date.getDay());
  console.log("firstOfMonth.getDay(): " + firstOfMonth.getDay());
  console.log("monthNumber: " + monthNumber);
  const month = [];
  let counter = -1 * firstOfMonth.getDay() + 1;
  let change = 1;
  for (let i = 0; i < 6 /* max num of weeks */; i++) {
    if (counter > lastOfMonth.getDate() || counter < -5) continue;
    let week = [];
    for (let j = 0; j < 7 /* length of week */; j++) {
      if (counter > lastOfMonth.getDate()) {
        change = -1;
        counter *= -1;
      }
      let day = counter;
      if (
        day === date.getDate() &&
        (isNaN(monthNumber) || date.getMonth() === monthNumber)
      ) {
        day = { d: day, a: qAmountEarlier, k: "earlierAmount" };
      } else if (
        day === dateLater.getDate() &&
        (isNaN(monthNumber) || dateLater.getMonth() === monthNumber)
      ) {
        day = { d: day, a: qAmountLater, k: "laterAmount" };
      }
      week.push(day);
      counter += change;
    }
    month.push(week);
  }
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //const monthNum = date.getMonth();

  table.selectAll("table > *").remove();

  table.style("margin", "10px");
  const header = table.append("thead");
  const body = table.append("tbody");

  header
    .append("tr")
    .append("td")
    .attr("colspan", 7)
    .append("h2")
    .text(monthNames[monthNumber])
    .style("text-align", "center")
    .style("font-size", (boxLengthOverride < 0.2 ? 20 : 40) + "px");
  // .style("font-size", 40 * boxLengthOverride + "px");

  if (!minimalStyle) {
    header
      .append("tr")
      .selectAll("td")
      .data(dayNames)
      .enter()
      .append("td")
      .text(function (d) {
        return d;
      })
      .style("text-align", "center")
      .style("font-size", 20 * boxLengthOverride + "px");
  }

  let boxLength = 100 * boxLengthOverride;
  month.forEach(function (week) {
    body
      .append("tr")
      .selectAll("td")
      .data(week)
      .enter()
      .append("td")
      .attr("class", function (d) {
        return d > 0 ? "" : "empty";
      })
      .style("width", boxLength + "px")
      .style("height", boxLength + "px")
      .on("click", (d) => {
        console.log("click: target: " + JSON.stringify(d.target.__data__));
        if (isNaN(d.target.__data__)) {
          console.log("click: setselection");
          console.log("click: target: selection: " + JSON.stringify(selection));
          if (
            d.target.__data__.k === "earlierAmount" &&
            choice !== AmountType.earlierAmount
          ) {
            body
              .selectAll("#laterAmount")
              .style("background-color", "steelblue");
          } else if (
            d.target.__data__.k !== "earlierAmount" &&
            choice !== AmountType.laterAmount
          ) {
            body
              .selectAll("#earlierAmount")
              .style("background-color", "steelblue");
          }
          console.log("click: selection: " + JSON.stringify(selection));
          select(this).style("background-color", "lightblue");
          if (d.target.__data__.k === "earlierAmount") {
            console.log("click: target: onClickCallback: earlierAmount");
            onClickCallback(AmountType.earlierAmount);
          } else {
            console.log("click: target: onClickCallback: laterAmount");
            onClickCallback(AmountType.laterAmount);
          }
        }
      })
      .on("mouseover", function (d) {
        console.log("mouseover: target: " + JSON.stringify(d.target.__data__));
        if (isNaN(d.target.__data__)) {
          select(this).style("background-color", "lightblue");
        }
      })
      .on("mouseout", function (d) {
        console.log("mouseout: target: " + JSON.stringify(d.target.__data__));
        console.log("mouseout: selection: " + selection.d);
        if (
          isNaN(d.target.__data__) &&
          ((d.target.__data__.k === "earlierAmount" &&
            choice !== AmountType.earlierAmount) ||
            (d.target.__data__.k !== "earlierAmount" &&
              choice !== AmountType.laterAmount))
        ) {
          select(this).style("background-color", "steelblue");
        }
      })
      .each(function (d) {
        function drawDay(td, d) {
          if (isNaN(d)) td.style("background-color", "steelblue");
          let borderWidth = 3 * boxLengthOverride + "px";
          let borderBottom = borderWidth;
          let borderLeft = borderWidth;
          let borderRight = borderWidth;
          let borderTop = borderWidth;
          let borderBottomColor = "rgb(200,200,200)";
          let borderLeftColor = "rgb(200,200,200)";
          let borderRightColor = "rgb(200,200,200)";
          let borderTopColor = "rgb(200,200,200)";
          let posTop = "0px";
          let posLeft = "0px";
          console.log(d);
          let dayNum = isNaN(d) ? d.d : d;
          if (!isNaN(d) && d < 1) {
            //borderWidth = "0px";
            borderBottom = "0px";
            borderLeft = "0px";
            borderRight = "0px";
            borderTop = "0px";
          }
          const date01 = new Date(qDateEarlier);
          if (monthNumber !== "same") {
            date01.setMonth(monthNumber);
          }
          date01.setDate(dayNum);
          if (dayNum <= 7) {
            borderTopColor = "rgb(0,0,0)";
          }
          let posLeftAdd = 0;
          if (dayNum <= 7) {
            posTop = "5px";
          } else if (dayNum > lastOfMonth.getDate() - 7) {
            posTop = "-30px";
          } else {
            posTop = "-15px";
            posLeftAdd = 5;
          }
          if (date01.getDay() < 3) {
            posLeft = 20 + posLeftAdd + "px";
          } else if (date01.getDay() > 3) {
            posLeft = -50 - posLeftAdd + "px";
          } else {
            posLeft = -20 - posLeftAdd + "px";
          }
          if (dayNum > lastOfMonth.getDate() - 7) {
            borderBottomColor = "rgb(0,0,0)";
          }
          if (date01.getDay() === 0 || dayNum === 1) {
            borderLeftColor = "rgb(0,0,0)";
          }
          if (date01.getDay() === 6 || dayNum === lastOfMonth.getDate()) {
            borderRightColor = "rgb(0,0,0)";
          }
          td.style("border-style", "solid")
            //.style("border-width", borderWidth)
            .style("border-bottom-width", borderBottom)
            .style("border-left-width", borderLeft)
            .style("border-right-width", borderRight)
            .style("border-top-width", borderTop)
            .style("border-bottom-color", borderBottomColor)
            .style("border-left-color", borderLeftColor)
            .style("border-right-color", borderRightColor)
            .style("border-top-color", borderTopColor);
          let tdDiv = td.append("div");
          tdDiv
            .style("width", boxLength + "px")
            .style("height", 10 * boxLengthOverride + "px")
            .style("top", -33 * boxLengthOverride + "px")
            .style("position", "relative")
            .on("click", () => {})
            .on("mouseover", function () {})
            .on("mouseout", function () {});
          if (!minimalStyle) {
            tdDiv.text(function (d) {
              if (isNaN(d)) return d.d;
              else if (d > 0) return d;
              else return "";
            });
            if (!isNaN(d)) {
              tdDiv.style("top", "-45px");
            }
          }
          if (!minimalStyle) {
            tdDiv = td.append("div");
            tdDiv
              .text(function (d) {
                return isNaN(d) ? "$" + d.a : "";
              })
              .style("position", "relative")
              .style("font-size", 20 + "px")
              .style("top", "-5px");
            if (d.a < 100) tdDiv.style("left", "30px");
            if (d.a >= 100 && d.a < 1000) tdDiv.style("left", "25px");
            if (d.a >= 1000) tdDiv.style("left", "20px");
          } else {
            tdDiv
              .text(function (d) {
                return isNaN(d) ? "$" + d.a : "";
              })
              .style("position", "relative")
              //.style("position", "absolute")
              .style("top", posTop)
              .style("left", posLeft)
              .style("font-size", 20 + "px");
          }
          if (d.k === "earlierAmount") td.attr("id", "earlierAmount");
          else if (d.k) td.attr("id", "laterAmount");
        }
        const td = select(this);
        console.log(d);
        drawDay(td, d);
      });
  });
};
