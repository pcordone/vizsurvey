import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { DateTime } from "luxon";
import {
  getCurrentQuestion,
  getCurrentChoice,
  getCurrentQuestionIndex,
  getStatus,
  setQuestionShownTimestamp,
  nextQuestion,
  answer,
} from "../features/questionSlice.js";
import { StatusType } from "../features/StatusType.js";
import { useD3 } from "../hooks/useD3.js";
import { AmountType } from "../features/AmountType.js";
import { InteractionType } from "../features/InteractionType.js";
import { drawCalendar } from "./CalendarHelper.js";
import { drawCalendarYear } from "./CalendarYearHelper.js";
import { drawCalendarYearDual } from "./CalendarYearDualHelper.js";
import { ViewType } from "../features/ViewType.js";
import { dateToState } from "../features/ConversionUtil.js";
import { Grid } from "@material-ui/core";
import { styles } from "./ScreenHelper.js";
import { Button, Box } from "@mui/material";
import { navigateFromStatus } from "./Navigate.js";

export function Calendar() {
  const dispatch = useDispatch();
  const q = useSelector(getCurrentQuestion);
  const qi = useSelector(getCurrentQuestionIndex);
  const choice = useSelector(getCurrentChoice);
  const status = useSelector(getStatus);
  const navigate = useNavigate();

  var dragAmount = null;

  const [disableSubmit, setDisableSubmit] = React.useState(true);

  useEffect(() => {
    dispatch(setQuestionShownTimestamp(dateToState(DateTime.now())));
  }, [qi]);

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

  useEffect(() => {
    const path = navigateFromStatus(status);
    if (
      status !== StatusType.Survey &&
      status !== StatusType.Attention &&
      process.env.REACT_APP_FULLSCREEN === "enabled"
    ) {
      document.exitFullscreen();
    }
    navigate(path);
  }, [status]);

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
        <table
          id="calendar"
          style={{ borderCollapse: "collapse", tableLayout: "fixed" }}
          ref={useD3(
            (table) => {
              console.log("====== q.viewType: ======= " + q.viewType);
              switch (q.viewType) {
                case ViewType.calendarWord:
                  drawCalendar({
                    table: table,
                    onClickCallback: onClickCallback,
                    choice: choice,
                    qDateEarlier: q.dateEarlier,
                    qDateLater: q.dateLater,
                    qAmountEarlier: q.amountEarlier,
                    qAmountLater: q.amountLater,
                    monthNumber: new Date(q.dateEarlier).getMonth(),
                  });
                  break;
                case ViewType.calendarWordYear:
                  drawCalendarYear({
                    table: table,
                    onClickCallback: onClickCallback,
                    choice: choice,
                    qDateEarlier: q.dateEarlier,
                    qDateLater: q.dateLater,
                    qAmountEarlier: q.amountEarlier,
                    qAmountLater: q.amountLater,
                  });
                  break;
                case ViewType.calendarWordYearDual:
                  drawCalendarYearDual({
                    table: table,
                    onClickCallback: onClickCallback,
                    choice: choice,
                    qDateEarlier: q.dateEarlier,
                    qDateLater: q.dateLater,
                    qAmountEarlier: q.amountEarlier,
                    qAmountLater: q.amountLater,
                  });
                  break;
              }
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

  return result;
}

export default Calendar;
