import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useNavigate,
  useSearchParams,
  BrowserRouter,
  Route,
  Routes,
  Link,
} from "react-router-dom";
import { Typography } from "@mui/material";
import { Container } from "@material-ui/core";
import chalk from "chalk";
import "./App.css";
import { navigateFromStatus } from "./components/Navigate.js";
import MCLInstructions from "./components/MCLInstructions.jsx";
import Demographic from "./components/Demographic.jsx";
import Instructions from "./components/Instructions.jsx";
import Survey from "./components/Survey.jsx";
import PostSurveyExperience from "./components/PostSurveyExperience.jsx";
import PostSurveyFinancialLit from "./components/PostSurveyFinancialLit.jsx";
import PostSurveySenseOfPurpose from "./components/PostSurveySenseOfPurpose.jsx";
import Debrief from "./components/Debrief.jsx";
import InvalidSurveyLink from "./components/InvalidSurveyLink.jsx";
import {
  loadAllTreatments,
  fetchAllTreatments,
  getStatus,
  clearState,
  initializeSurvey,
} from "./features/questionSlice.js";
import { StatusType } from "./features/StatusType.js";
import { Consent } from "./components/Consent.jsx";
import {
  POST_SURVEY_AWARE_CONTENT,
  POST_SURVEY_WORTH_CONTENT,
} from "./features/postsurveyquestionssenseofpurpose.js";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return <InvalidSurveyLink />;
    }
    // Normally, just render children
    return this.props.children;
  }
}

const App = () => {
  console.log(chalk.yellow(`Running for ${process.env.REACT_APP_ENV}`));
  return (
    <div>
      <ErrorBoundary>
        <BrowserRouter>
          <Container>
            <Routes>
              {process.env.REACT_APP_ENV !== "production" ? (
                <Route path="dev" element={<DevHome />} />
              ) : (
                ""
              )}
              <Route path="start" element={<GenTreatmentId />} />
              <Route path={"consent"} element={<Consent />} />
              <Route path={"demographic"} element={<Demographic />} />
              <Route path={"mclinstructions"} element={<MCLInstructions />} />
              <Route path={"instruction"} element={<Instructions />} />
              <Route path={"survey"} element={<Survey />} />
              <Route
                path={"experiencequestionaire"}
                element={<PostSurveyExperience />}
              />
              <Route
                path={"financialquestionaire"}
                element={<PostSurveyFinancialLit />}
              />
              <Route
                path={"purposeawarequestionaire"}
                element={
                  <PostSurveySenseOfPurpose
                    content={POST_SURVEY_AWARE_CONTENT}
                  />
                }
              />
              <Route
                path={"purposeworthquestionaire"}
                element={
                  <PostSurveySenseOfPurpose
                    content={POST_SURVEY_WORTH_CONTENT}
                  />
                }
              />
              <Route path={"debrief"} element={<Debrief />} />
              <Route path={"invalidlink"} element={<InvalidSurveyLink />} />
              <Route path="*" element={<InvalidSurveyLink />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
};

const GenTreatmentId = () => {
  const status = useSelector(getStatus);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      initializeSurvey({
        treatmentId: searchParams.get("treatment_id"),
        sessionId: searchParams.get("session_id"),
        participantId: searchParams.get("participant_id"),
        studyId: searchParams.get("study_id"),
        userAgent: navigator.userAgent,
      })
    );
  }, []);

  useEffect(() => {
    if (status !== StatusType.Unitialized && status !== StatusType.Fetching) {
      const path = navigateFromStatus(status);
      navigate(path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <React.Fragment>
      <Typography paragraph>The application is initializing.</Typography>
    </React.Fragment>
  );
};

const DevHome = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadAllTreatments());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = useSelector(getStatus);
  const allTreatments = useSelector(fetchAllTreatments);

  function testLinks() {
    return (
      <div key="testlinks-parent">
        <p>
          This page will not be available when deployed in production since the
          participants will be provided a link with the treatment id in the URL.
        </p>
        {status === StatusType.Unitialized ? (
          <p>Please wait while all treatments are loaded...</p>
        ) : (
          <div key="testlinks-list">
            <a href="https://github.com/The-Discounters/vizsurvey">
              Github README.md
            </a>
            <br></br>
            <a href="https://github.com/The-Discounters">public website</a>
            <br></br>
            <a href="https://release.d2ptxb5fbsc082.amplifyapp.com/">
              Dev URL Treatment List
            </a>
            <p>
              The prolific url is:
              https://release.d2ptxb5fbsc082.amplifyapp.com/start?participant_id=&#123;&#123;%PROLIFIC_PID%&#125;&#125;&study_id=&#123;&#123;%STUDY_ID%&#125;&#125;&session_id=&#123;&#123;%session_id%&#125;&#125;
            </p>
            <p>
              An example is
              https://release.d2ptxb5fbsc082.amplifyapp.com/start?participant_id=1&study_id=2&session_id=3
            </p>
            <p>
              And for localhost with the treatment id being randomly determined
              http://localhost:3000/start?participant_id=1&study_id=2&session_id=3
            </p>
            <p>
              Click a link below to launch one of the experiments. The
              experimental parameters are not setup yet and are configurable
              through a file. Right now these links give a feel for what each
              type of stimulus is like.
            </p>
            <p>
              <b>
                Teest treatments are listed below for the different
                configuraiton scenarios.
              </b>
            </p>
            <p>
              <Link
                id="1"
                to="/start?participant_id=1&treatment_id=1&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 1)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="2"
                to="/start?participant_id=1&treatment_id=2&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 2)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="3"
                to="/start?participant_id=1&treatment_id=3&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 3)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="4"
                to="/start?participant_id=1&treatment_id=4&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 4)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="5"
                to="/start?participant_id=1&treatment_id=5&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 5)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="6"
                to="/start?participant_id=1&treatment_id=6&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 6)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="7"
                to="/start?participant_id=1&treatment_id=7&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 7)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="8"
                to="/start?participant_id=1&treatment_id=8&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 8)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="9"
                to="/start?participant_id=1&treatment_id=9&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 9)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="10"
                to="/start?participant_id=1&treatment_id=10&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 10)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="11"
                to="/start?participant_id=1&treatment_id=11&study_id=2&session_id=3"
                onClick={() => {
                  dispatch(clearState());
                }}
              >
                {allTreatments.filter((d) => d.treatmentId === 11)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="12"
                to="/start?participant_id=1&treatment_id=12&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 12)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="13"
                to="/start?participant_id=1&treatment_id=13&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 13)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="14"
                to="/start?participant_id=1&treatment_id=14&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 14)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="15"
                to="/start?participant_id=1&treatment_id=15&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 15)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="16"
                to="/start?participant_id=1&treatment_id=16&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 16)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="17"
                to="/start?participant_id=1&treatment_id=17&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 17)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="18"
                to="/start?participant_id=1&treatment_id=18&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 18)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="19"
                to="/start?participant_id=1&treatment_id=19&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 19)[0].comment}
              </Link>
            </p>
            <p>
              <b>Production between subjects treatments are listed below.</b>
            </p>
            <p>
              <Link
                id="20"
                to="/start?participant_id=1&treatment_id=20&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 20)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="21"
                to="/start?participant_id=1&treatment_id=21&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 21)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="22"
                to="/start?participant_id=1&treatment_id=22&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 22)[0].comment}
              </Link>
            </p>
            <p>
              <b>Production assigned randomly by the server.</b>
            </p>
            <p>
              <Link
                id="23"
                to="/start?participant_id=1&treatment_id=23&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 23)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="24"
                to="/start?participant_id=1&treatment_id=24&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 24)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="25"
                to="/start?participant_id=1&treatment_id=25&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 25)[0].comment}
              </Link>
            </p>
            <p>
              <b>Production calendar treatments.</b>
            </p>
            <p>
              <Link
                id="26"
                to="/start?participant_id=1&treatment_id=26&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 26)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="27"
                to="/start?participant_id=1&treatment_id=27&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 27)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="28"
                to="/start?participant_id=1&treatment_id=28&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 28)[0].comment}
              </Link>
            </p>
            <p>
              <Link
                id="29"
                to="/start?participant_id=1&treatment_id=29&study_id=2&session_id=3"
              >
                {allTreatments.filter((d) => d.treatmentId === 29)[0].comment}
              </Link>
            </p>
          </div>
        )}
      </div>
    );
  }

  return <div id="home-text">{testLinks()}</div>;
};

export default App;