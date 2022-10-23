import React, { useState } from "react";

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Box,
} from "@mui/material";

import Grid from "@mui/material/Unstable_Grid2";
import { makeStyles } from "@material-ui/core/styles";
import { AmountType } from "../features/AmountType";
import { formControl } from "./ScreenHelper";
import { format } from "d3";

export function MELSelectionForm(props) {
  const [choice, setChoice] = useState(props.choice);

  const todayText = (sooner_time) =>
    sooner_time === 0 ? "today" : `in ${sooner_time} months`;

  function questionText(amountEarlier, timeEarlier, amountLater, timeLater) {
    return `Make a choice to receive ${question1stPartText(
      amountEarlier,
      timeEarlier
    )} or ${question2ndPartText(amountLater, timeLater)}.`;
  }

  function question1stPartText(amountEarlier, timeEarlier) {
    return `${format("$,.0f")(amountEarlier)} ${todayText(timeEarlier)}`;
  }

  function question2ndPartText(amountLater, timeLater) {
    return `${format("$,.0f")(amountLater)} in ${timeLater} months`;
  }

  let useStyles;

  function resetUseStyles() {
    let part = ["btn0", "btn0UnClicked", "btn1", "btn1UnClicked"].reduce(
      (result, key) => {
        result[key] = {
          "border-style": "solid",
          backgroundColor: "steelblue",
          "border-radius": "20px",
          "border-width": "5px",
          borderColor: "#ffffff",
          color: "black",
          paddingRight: "10px",
          "&:hover": {
            backgroundColor: "lightblue",
          },
        };
        return result;
      },
      {}
    );

    let part1 = ["btn0Clicked", "btn1Clicked"].reduce((result, key) => {
      result[key] = {
        "border-style": "solid",
        backgroundColor: "steelblue",
        "border-radius": "20px",
        "border-width": "5px",
        borderColor: "#000000",
        color: "black",
        paddingRight: "10px",
        "&:hover": {
          backgroundColor: "lightblue",
        },
      };
      return result;
    }, {});

    useStyles = makeStyles(() => ({
      btn0: part.btn0,
      btn0UnClicked: part.btn0UnClicked,
      btn1: part.btn1,
      btn1UnClicked: part.btn1UnClicked,
      btn0Clicked: part1.btn0Clicked,
      btn1Clicked: part1.btn1Clicked,
      qArea: {
        "border-style": "solid",
        "border-width": "5px",
        "border-radius": "20px",
        padding: "10px",
        borderColor: "#000000",
      },
      qTitle: {
        fontSize: "32px",
      },
    }));
    7;
  }

  resetUseStyles();

  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <form className={classes.qArea}>
        <FormControl
          sx={{ ...formControl }}
          required={false}
          error={props.error}
        >
          <p className={classes.qTitle}>
            {questionText(
              props.amountEarlier,
              props.timeEarlier,
              props.amountLater,
              props.timeLater
            )}
          </p>
          <FormHelperText>{props.helperText}</FormHelperText>
          <Box
            component="span"
            sx={{ width: 1 }}
            m={1}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            border="1"
          >
            <RadioGroup
              row
              aria-labelledby={
                props.textShort + "-row-radio-buttons-group-label"
              }
              name={"question-radio-buttons-group"}
              onChange={(event) => {
                if (event.target.value === AmountType.earlierAmount) {
                  classes.btn0 = classes.btn0Clicked;
                  classes.btn1 = classes.btn1UnClicked;
                } else if (event.target.value === AmountType.laterAmount) {
                  classes.btn0 = classes.btn0UnClicked;
                  classes.btn1 = classes.btn1Clicked;
                }
                props.onClickCallback(event.target.value);
                setChoice(event.target.value);
              }}
              value={choice}
            >
              {[
                {
                  key: AmountType.earlierAmount,
                  label: question1stPartText(
                    props.amountEarlier,
                    props.timeEarlier
                  ),
                },
                {
                  key: AmountType.laterAmount,
                  label: question2ndPartText(
                    props.amountLater,
                    props.timeLater
                  ),
                },
              ].map(({ key, label }, index) => (
                <FormControlLabel
                  sx={{ mr: "100px" }}
                  key={key}
                  id={key}
                  value={key}
                  checked={choice === key}
                  control={<Radio />}
                  label={label}
                  className={classes["btn" + index]}
                />
              ))}
            </RadioGroup>
          </Box>
        </FormControl>
      </form>
      <hr
        style={{
          backgroundColor: "#aaaaaa",
          height: 4,
        }}
      />
    </Grid>
  );
}

export default MELSelectionForm;