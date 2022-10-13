import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import {
  Grid,
  Button,
  Box,
  Typography,
  ThemeProvider,
  FormControlLabel,
} from "@material-ui/core";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch } from "react-redux";
import { dateToState } from "../features/ConversionUtil";
import { consentShown, consentCompleted } from "../features/questionSlice";
import { styles, theme } from "./ScreenHelper";
import "../App.css";

export function Consent() {
  const dispatch = useDispatch();

  const [disableSubmit, setDisableSubmit] = React.useState(true);
  const [checked, setChecked] = React.useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    setDisableSubmit(!event.target.checked);
  };

  useEffect(() => {
    dispatch(consentShown(dateToState(DateTime.utc())));
  }, []);

  const navigate = useNavigate();

  const ConsentTextEn = () => {
    return (
      <React.Fragment>
        <Typography paragraph>
          <b>Investigator: </b>Peter Cordone, Yahel Nachum, Ravit Heskiau, Lane
          Harrison, Daniel Reichman
        </Typography>
        <Typography paragraph>
          <b>Contact Information: </b>
          <a href={`mailto:pncordone@wpi.edu`}>pncordone@wpi.edu</a>
        </Typography>
        <Typography paragraph>
          <b>Title of Research Study: </b>Choices About Money
        </Typography>
        <Typography paragraph>
          <b>Sponsor: </b>
          <a href={`mailto:dreichman@wpi.edu`}>
            Prof. Daniel Reichman (dreichman@wpi.edu)
          </a>
        </Typography>
        <Typography paragraph>
          <b>Introduction: </b>
          You are being asked to participate in a research study. Before you
          agree, however, you must be fully informed about the purpose of the
          study, the procedures to be followed, and any benefits, risks or
          discomfort that you may experience as a result of your participation.
          This form presents information about the study so that you may make a
          fully informed decision regarding your participation.
        </Typography>
        <Typography paragraph>
          <b>Purpose of the study: </b> To study how people make choices about
          money.
        </Typography>
        <Typography paragraph>
          <b>Procedures to be followed: </b>You will be presented with a series
          of choices about receiving money at different points in time.
          &nbsp;&nbsp;<b>You will choose</b> either the earlier or later amount.
          The study should take about 10 minutes to complete.
        </Typography>
        <Typography paragraph>
          <b>Risks to study participants:</b> To the best of the researchers
          knowledge risks to you are minimal or nonexistent.
        </Typography>
        <Typography paragraph>
          <b>Benefits to research participants and others: </b> You will learn
          more about the goal of this reasearch and how people make decisions
          about money at the end.
        </Typography>
        <Typography paragraph>
          <b>Record keeping and confidentiality: </b>
          Records of your participation in this study will be held confidential
          so far as permitted by law. However, the study investigators, the
          sponsor or it’s designee and, under certain circumstances, the
          Worcester Polytechnic Institute Institutional Review Board (WPI IRB)
          will be able to inspect and have access to confidential data that
          identify you by name. Any publication or presentation of the data will
          not identify you. Your prolific ID will be recorded in the data soley
          for the purpose of paying you and then will be deleted from the data.
        </Typography>
        <Typography paragraph>
          <b> Compensation or treatment in the event of injury:</b> There is
          minimal or no risk of injury in tis research so there is no
          compensation available for injury from the researchers. You do not
          give up any of your legal rights by signing this statement.
        </Typography>
        <Typography paragraph>
          <b>Cost/Payment:</b>
          You will be compensated $10 (United States Dollars) for your
          participation in completing this survey if you complete the survey in
          its entirety. If you choose to end the survey before completion, you
          will not be paid.
        </Typography>
        <Typography paragraph>
          <b>
            For more information about this research or about the rights of
            research participants, or in case of research-related injury,
            contact:
          </b>
        </Typography>
        {[
          {
            name: "Peter Cordone",
            phone: "617-678-5190",
            email: "pncordone@wpi.edu",
          },
          {
            name: "IRB Manager Ruth McKeogh",
            phone: "508 831-6699",
            email: "irb@wpi.edu",
          },
          {
            name: "Human Protection Administrator Gabriel Johnson",
            phone: "508-831-4989",
            email: "gjohnson@wpi.edu",
          },
        ].map(({ name, phone, email }, index) => {
          return (
            <Typography key={index} paragraph>
              <span key={index}>
                {name}
                <br />
                Tel: {phone}
                <br />
                Email: &lt;<a href={`mailto:${email}`}>{email}</a>&gt;
                <br />
              </span>
            </Typography>
          );
        })}
        <Typography paragraph>
          <b>Your participation in this research is voluntary. </b>
          Your refusal to participate will not result in any penalty to you or
          any loss of benefits to which you may otherwise be entitled. You may
          decide to stop participating in the research at any time without
          penalty or loss of other benefits; however, you will not receive the
          compensation of $10 USD unless you complete the survey in its
          entirety. The project investigators retain the right to cancel or
          postpone the experimental procedures at any time they see fit.
        </Typography>
      </React.Fragment>
    );
  };

  let qList2 = [];
  let setQList2 = [];
  [
    "strongly-disagree",
    "disagree",
    "neutral",
    "agree",
    "strongly-agree",
  ].forEach(() => {
    const [q, setQ] = React.useState("");
    qList2.push(q);
    setQList2.push(setQ);
  });

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Box height="25%" alignItems="center">
          <img
            style={{ maxHeight: "240px" }}
            src="generic-questionaire-icon.svg"
            alt="Questionaire image."
          ></img>
        </Box>{" "}
        <Grid container style={styles.root} justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="h5">
              <b>Informed Consent</b>
              <br />
            </Typography>
            <hr
              style={{
                color: "#ea3433",
                backgroundColor: "#ea3433",
                height: 4,
              }}
            />
            <Typography paragraph>
              <br />
              <i>
                {" "}
                <u>
                  Before you proceed, please read the following consent form
                  carefully:{" "}
                </u>{" "}
              </i>
            </Typography>
            <ConsentTextEn />
            <Typography paragraph>
              <b>By selecting the checkbox and clicking &ldquo;Next&ldquo;</b>,
              you acknowledge that you have been informed about and consent to
              be a participant in the study described above. Make sure that your
              questions are answered to your satisfaction before signing. You
              are entitled to retain a copy of this consent agreement.
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ margin: 0 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    name="checkConsent"
                    id="checkConsent"
                    color="primary"
                  />
                }
                label={
                  <Typography>
                    I agree that any information provided in this survey can be
                    used for the purpose(s) mentioned in the Consent Form
                  </Typography>
                }
              />
            </FormGroup>
            <hr
              style={{
                backgroundColor: "#aaaaaa",
                height: 4,
              }}
            />
          </Grid>
          <Grid item xs={6}></Grid>
          <Grid item xs={6} style={{ margin: 0 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="secondary"
                disableRipple
                disableFocusRipple
                style={styles.button}
                onClick={() => {
                  dispatch(consentCompleted(dateToState(DateTime.utc())));
                  navigate("/demographic");
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

export default Consent;
