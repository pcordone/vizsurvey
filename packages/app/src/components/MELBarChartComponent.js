import React from "react";
import { FormControl, FormHelperText } from "@mui/material";
import { VegaLite } from "react-vega";
import { useTranslation } from "react-i18next";
import { AmountType } from "@the-discounters/types";

export const MELBarChartComponent = (props) => {
  const { t } = useTranslation();

  const data = Array.from(
    Array(props.showMinorTicks ? props.maxTime * 4 : props.maxTime + 1).keys()
  ).map((d) => {
    const isMajor = props.showMinorTicks ? d % 4 === 0 : true;
    const delay = props.showMinorTicks ? d / 4 : d;
    if (isMajor && delay === props.timeEarlier) {
      return {
        time: delay,
        amount: props.amountEarlier,
        title: t("leftArrowTooltip"),
        image: "/leftarrow.svg",
      };
    } else if (isMajor && delay === props.timeLater) {
      return {
        time: delay,
        amount: props.amountLater,
        title: t("rightArrowTooltip"),
        image: "/rightarrow.svg",
      };
    } else {
      return {
        time: delay,
        amount: 0,
      };
    }
  });

  const spec = {
    data: { values: data },
    width: props.horizontalPixels,
    height: props.verticalPixels,
    encoding: {
      x: {
        field: "time",
        type: "ordinal",
        axis: {
          title: "Months",
          labelAngle: 0,
          titleFontSize: 18,
          labelFontSize: 15,
        },
      },
      y: {
        field: "amount",
        type: "quantitative",
        scale: { domain: [0, props.maxAmount] },
        axis: {
          title: "Amount USD",
          format: "$,.0f",
          titleFontSize: 18,
          labelFontSize: 15,
          minExtent: 50,
        },
      },
    },
    layer: [
      {
        mark: {
          type: "bar",
        },
        encoding: {
          fill: { value: "white" },
          stroke: { value: "black" },
          strokeWidth: {
            condition: { test: "datum['amount'] > 0", value: 1 },
            value: 0,
          },
          tooltip: [
            { field: "title", type: "nominal" },
            { field: "image", type: "nominal" },
          ],
        },
      },
      {
        mark: {
          type: "text",
          align: "center",
          baseline: "bottom",
          dx: 0,
          dy: -10,
          fontSize: 15,
        },
        encoding: {
          text: {
            condition: {
              test: "datum.amount > 0",
              value: { expr: "'$' + datum.amount" },
            },
            value: "",
          },
        },
      },
    ],
  };

  return (
    <FormControl variant="standard" required={false} error={props.error}>
      <FormHelperText>{props.helperText}</FormHelperText>
      <VegaLite spec={spec} actions={false} />,
    </FormControl>
  );
};
