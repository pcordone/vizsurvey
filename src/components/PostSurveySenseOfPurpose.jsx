import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DateTime } from "luxon";
import {
  Grid,
  Box,
  Button,
  Typography,
  FormLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  ThemeProvider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  getStatus,
  purposeSurveyQuestionsShown,
  purposeSurveyQuestionsCompleted,
  nextQuestion,
  initPurposeSurveyQuestion,
  setPurposeSurveyQuestion,
  getPurposeSurveyQuestion,
} from "../features/questionSlice";
import { dateToState } from "../features/ConversionUtil";
import { POST_SURVEY_QUESTIONS } from "../features/postsurveyquestionssenseofpurpose";
import { styles, theme } from "./ScreenHelper";
import { navigateFromStatus } from "./Navigate";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  formLabel: {
    fontWeight: "bold",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export function PostSurvey() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useStyles();
  let surveys = POST_SURVEY_QUESTIONS;
  const status = useSelector(getStatus);

  const [disableSubmit, setDisableSubmit] = React.useState(true);
  surveys.questions = surveys.questions.filter(({ question }) => {
    if (question.disabled === true) {
      return false;
    } else {
      return true;
    }
  });

  let qList = [];
  surveys.questions.forEach((q) => {
    dispatch(initPurposeSurveyQuestion(q.question.textShort));
    const value = useSelector(getPurposeSurveyQuestion(q.question.textShort));
    qList.push(value);
  });

  useEffect(() => {
    dispatch(purposeSurveyQuestionsShown(dateToState(DateTime.now())));
  }, []);

  useEffect(() => {
    const path = navigateFromStatus(status);
    navigate(path);
  }, [status]);

  useEffect(() => {
    checkEnableSubmit();
  }, qList);

  const checkEnableSubmit = () => {
    let result = false;
    qList.forEach((q) => {
      if (q.length <= 0) {
        result = true;
      }
    });
    setDisableSubmit(result);
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Grid container style={styles.root}>
          <Grid item xs={12}>
            <Typography variant="h4">Additional Questions</Typography>
            <hr
              style={{
                color: "#ea3433",
                backgroundColor: "#ea3433",
                height: 4,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography paragraph>{surveys.prompt}</Typography>
          </Grid>
          {surveys.questions.map(({ question, options }, index) => (
            <div key={`div-${index}`}>
              <Grid item xs={12} key={`grid-${index}`}>
                <FormControl
                  key={`form-control-${index}`}
                  className={classes.formControl}
                  required
                >
                  <FormLabel
                    id={question.textShort}
                    className={classes.formLabel}
                  >
                    {question.textFull}
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby={
                      question.textShort + "-row-radio-buttons-group-label"
                    }
                    name={question.textShort + "-radio-buttons-group"}
                  >
                    {surveys.questionsType === "multiple choice"
                      ? options.map((option, index1) => (
                          <FormControlLabel
                            key={`radio-${index1}`}
                            value={option.textShort}
                            checked={qList[index] === option.textShort}
                            style={{
                              width: "100%",
                            }}
                            control={<Radio />}
                            label={option.textFull}
                            onChange={(event) => {
                              dispatch(
                                setPurposeSurveyQuestion({
                                  key: surveys.questions[index].question
                                    .textShort,
                                  value: event.target.value,
                                })
                              );
                            }}
                          />
                        ))
                      : [
                          "prefer not to answer",
                          "strongly-disagree",
                          "disagree",
                          "neutral",
                          "agree",
                          "strongly-agree",
                        ].map((option, index1) => (
                          <FormControlLabel
                            key={`radio-${index1}`}
                            value={option}
                            id={question.textShort + "-" + option}
                            checked={qList[index] === option}
                            style={{
                              width: "100%",
                            }}
                            control={<Radio />}
                            label={option.replace("-", " ")}
                            onChange={(event) => {
                              dispatch(
                                setPurposeSurveyQuestion({
                                  key: surveys.questions[index].question
                                    .textShort,
                                  value: event.target.value,
                                })
                              );
                            }}
                          />
                        ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <br key={`br-${index}`}></br>
            </div>
          ))}
          <Grid item xs={12} style={{ margin: 0 }}>
            <hr
              style={{
                backgroundColor: "#aaaaaa",
                height: 4,
              }}
            />
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="secondary"
                disableRipple
                disableFocusRipple
                style={styles.button}
                onClick={() => {
                  setTimeout(() => {
                    dispatch(
                      purposeSurveyQuestionsCompleted(
                        dateToState(DateTime.now())
                      )
                    );
                    dispatch(nextQuestion());
                  }, 400);
                }}
                disabled={disableSubmit}
              >
                {" "}
                Next{" "}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default PostSurvey;
