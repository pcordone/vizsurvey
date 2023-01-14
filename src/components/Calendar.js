import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { DateTime } from "luxon";
import {
  getCurrentQuestion,
  getCurrentChoice,
  getStatus,
  setQuestionShownTimestamp,
  nextQuestion,
  answer,
} from "../features/questionSlice";
import { useD3 } from "../hooks/useD3";
import { AmountType } from "../features/AmountType";
import { StatusType } from "../features/StatusType";
import { InteractionType } from "../features/InteractionType";
import { drawCalendar } from "./CalendarHelper";
//import { dateToState, stateToDate } from "../features/ConversionUtil";
import { dateToState } from "../features/ConversionUtil";
import Grid from "@mui/material/Unstable_Grid2";
import { styles } from "./ScreenHelper";
import { Button, Box } from "@mui/material";

export function Calendar() {
  const dispatch = useDispatch();
  const q = useSelector(getCurrentQuestion);
  const choice = useSelector(getCurrentChoice);
  const status = useSelector(getStatus);
  const navigate = useNavigate();

  var dragAmount = null;

  /*
  function generateRow(startNum) {
    let arr = [];
    for (let i = startNum; i < startNum + 7; i++) {
      arr.push(i);
    }
    return arr;
  }

  function generate4Rows() {
    let rows = [];
    for (let i = 0; i < 4; i++) {
      rows.push(generateRow(i * 7 + 1));
    }
    return rows;
  }
  let rows = generate4Rows();
  let headers = ["S", "M", "T", "W", "T", "F", "S"];

  function dayClick(day) {
    return () => {
      console.log("day: " + day);
    };
  }
  */
  const [disableSubmit, setDisableSubmit] = React.useState(true);

  useEffect(() => {
    switch (choice) {
      case AmountType.earlierAmount:
        setDisableSubmit(false);
        break;
      case AmountType.laterAmount:
        setDisableSubmit(false);
        break;
      default:
        setDisableSubmit(true);
    }
  }, [choice]);

  const onClickCallback = (value) => {
    dispatch(
      answer({
        choice: value,
        choiceTimestamp: dateToState(DateTime.now()),
      })
    );
  };

  const result = (
    <div>
      <Grid container style={styles.root} justifyContent="center">
        {/* February
      <table>
        <tr>
          {headers.map((header, index) => {
            return <th key={index}>{header}</th>;
          })}
        </tr>
        {rows.map((row, index1) => {
          return (
            <tr key={index1}>
              {row.map((day, index) => {
                return (
                  <td key={index} onClick={dayClick(day)}>
                    {day}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </table>
      hello world 1 */}
        <table
          id="calendar"
          style={{ borderCollapse: "collapse", tableLayout: "fixed" }}
          ref={useD3(
            (table) => {
              drawCalendar({
                table: table,
                setDisableSubmit: setDisableSubmit,
                maxTime: q.maxTime,
                maxAmount: q.maxAmount,
                interaction: q.interaction,
                variableAmount: q.variableAmount,
                amountEarlier: q.amountEarlier,
                timeEarlier: q.timeEarlier,
                amountLater: q.amountLater,
                timeLater: q.timeLater,
                onClickCallback: onClickCallback,
                // choice: choice,
                horizontalPixels: q.horizontalPixels,
                verticalPixels: q.verticalPixels,
                leftMarginWidthIn: q.leftMarginWidthIn,
                graphWidthIn: q.graphWidthIn,
                bottomMarginHeightIn: q.bottomMarginHeightIn,
                graphHeightIn: q.graphHeightIn,
                showMinorTicks: q.showMinorTicks,
              });
            },
            [q]
          )}
        ></table>
      </Grid>
      <Grid item xs={12} style={{ margin: 0 }}>
        <Box display="flex" justifyContent="center">
          <Button
            id="buttonNext"
            variant="contained"
            color="secondary"
            disableRipple
            disableFocusRipple
            style={styles.button}
            onClick={() => {
              /*
              if (
                choice !== AmountType.earlierAmount &&
                choice !== AmountType.laterAmount
              ) {
                setError(true);
                setHelperText("Please choose one of the options below.");
              } else {
                setError(false);
                setHelperText("");
                dispatch(nextQuestion());
              }*/
              dispatch(nextQuestion());
            }}
            disabled={disableSubmit}
          >
            {" "}
            Next{" "}
          </Button>
        </Box>
      </Grid>
      {q.interaction === InteractionType.drag ? (
        <Formik
          initialValues={{ choice: AmountType.none }}
          validate={() => {
            let errors = {};
            return errors;
          }}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setTimeout(() => {
              dispatch(
                answer({
                  choice: q.variableAmount,
                  choiceTimestamp: dateToState(DateTime.now()),
                  dragAmount: dragAmount.amount,
                })
              );
              setSubmitting(false);
              resetForm();
            }, 400);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      ) : (
        ""
      )}
    </div>
  );

  if (status === StatusType.FinancialQuestionaire) {
    navigate("/questionaire");
  } else {
    dispatch(setQuestionShownTimestamp(dateToState(DateTime.now())));
  }
  return result;
}

export default Calendar;
