import { csvParse } from "d3";
// import { Octokit } from "octokit";
import { TREATMENTS_CSV } from "./treatments";
import { Question } from "./Question";
import { ViewType } from "./ViewType";
import { InteractionType } from "./InteractionType";
import { AmountType } from "./AmountType";
import { stringToDate, dateToState, stateToDate } from "./ConversionUtil";

import AWS from "aws-sdk";

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET;
const REGION = process.env.REACT_APP_REGION;

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

const uploadFile = (name, data) => {
  const params = {
    ACL: "public-read",
    Body: data,
    Bucket: S3_BUCKET,
    Key: name,
  };

  myBucket
    .putObject(params)
    .on("httpUploadProgress", (evt) => {
      console.log(Math.round((evt.loaded / evt.total) * 100));
    })
    .send((err) => {
      if (err) console.log(err);
    });
};

export class FileIOAdapter {
  constructor() {}

  loadAllTreatments = () => {
    const treatments = csvParse(TREATMENTS_CSV, (e) => {
      return this.fromCSVRow(e);
    }).sort((a, b) =>
      a.position < b.position ? -1 : a.position === b.position ? 0 : 1
    );
    return treatments;
  };

  loadTreatment = (treatmentId) => {
    treatmentId = +treatmentId;
    const questions = csvParse(TREATMENTS_CSV, (e) => {
      return this.fromCSVRow(e);
    })
      .filter((d) => d.treatmentId === treatmentId)
      .sort((a, b) =>
        a.position < b.position ? -1 : a.position === b.position ? 0 : 1
      );
    return questions;
  };

  fromCSVRow(row) {
    return Question({
      treatmentId: row.treatment_id ? +row.treatment_id : undefined,
      position: row.position ? +row.position : undefined,
      viewType: row.view_type ? ViewType[row.view_type] : undefined,
      interaction: row.interaction
        ? InteractionType[row.interaction]
        : undefined,
      variableAmount: row.variable_amount
        ? AmountType[row.variable_amount]
        : undefined,
      amountEarlier: row.amount_earlier ? +row.amount_earlier : undefined,
      timeEarlier: row.time_earlier ? +row.time_earlier : undefined,
      dateEarlier: row.date_earlier
        ? dateToState(stringToDate(row.date_earlier))
        : undefined,
      amountLater: row.amount_later ? +row.amount_later : undefined,
      timeLater: row.time_later ? +row.time_later : undefined,
      dateLater: row.date_later
        ? dateToState(stringToDate(row.date_later))
        : undefined,
      maxAmount: row.max_amount ? +row.max_amount : undefined,
      maxTime: row.max_time ? +row.max_time : undefined,
      horizontalPixels: row.horizontal_pixels
        ? +row.horizontal_pixels
        : undefined,
      verticalPixels: row.vertical_pixels ? +row.vertical_pixels : undefined,
      leftMarginWidthIn: row.left_margin_width_in
        ? +row.left_margin_width_in
        : undefined,
      bottomMarginHeightIn: row.bottom_margin_height_in
        ? +row.bottom_margin_height_in
        : undefined,
      graphWidthIn: row.graph_width_in ? +row.graph_width_in : undefined,
      graphHeightIn: row.graph_height_in ? +row.graph_height_in : undefined,
      widthIn: row.width_in ? +row.width_in : undefined,
      heightIn: row.height_in ? +row.height_in : undefined,
      comment: row.comment,
    });
  }

  convertToCSV(answers) {
    const header = [
      "treatment_id,position,view_type,interaction,variable_amount,amount_earlier,time_earlier,date_earlier,amount_later,time_later,date_later,max_amount,max_time,vertical_pixels,horizontal_pixels,left_margin_width_in,bottom_margin_height_in,graph_width_in,graph_height_in,width_in,height_in,choice,shown_timestamp,choice_timestamp,highup,lowdown,participant_code",
    ];
    const rows = answers.map(
      (a) =>
        `${a.treatmentId},${a.position},${a.viewType},${a.interaction},${
          a.variableAmount
        },${a.amountEarlier},${a.timeEarlier},${
          a.dateEarlier ? stateToDate(a.dateEarlier) : ""
        },${a.amountLater},${a.timeLater},${
          a.dateLater ? stateToDate(a.dateLater) : ""
        },${a.maxAmount},${a.maxTime},${a.verticalPixels},${
          a.horizontalPixels
        },${a.leftMarginWidthIn},${a.bottomMarginHeightIn},${a.graphWidthIn},${
          a.graphHeightIn
        },${a.widthIn},${a.heightIn},${a.choice},${
          a.shownTimestamp ? stateToDate(a.shownTimestamp) : ""
        },${a.choiceTimestamp ? stateToDate(a.choiceTimestamp) : ""},${
          a.highup
        },${a.lowdown},${a.participantCode}`
    );
    return header.concat(rows).join("\n");
  }

  writeAnswers = async (data, { getState }) => {
    const state = getState();
    console.log(data.csv);
    console.log(data.uuid);
    console.log(JSON.stringify(state));
    const fileName = "answers-" + data.uuid + ".csv";
    if (process.env.REACT_APP_AWS_ENABLED) {
      uploadFile(fileName, data.csv);
    } else {
      console.log("AWS DISABLED");
      console.log(fileName);
    }
    // const octokit = new Octokit({
    //   userAgent: "thesis_answers/v1.0",
    //   // eslint-disable-next-line no-undef
    //   auth: atob(process.env.REACT_APP_AUTH_TOKEN),
    // });
    // // eslint-disable-next-line no-undef
    // const gistAnswerId = process.env.REACT_APP_GIST_ANSWER_ID;
    // const url = `PATCH /gists/${gistAnswerId}`;
    // const now = DateTime.utc().toFormat("yyyy-MM-dd-H-mm-ss-SSS-ZZZZ");
    // const files = {};
    // answersCSV = `${answersCSV}`;
    // files[`answers-subject-${state.questions.participant_id}-${now}.csv`] = {
    //   content: answersCSV,
    // };
    // const description = `Answer results for participant ${state.questions.participant_id} at ${now}`;
    // console.log("submitting answers for " + description);
    // const payloadObj = {
    //   gist_id: gistAnswerId,
    //   description: description,
    //   files: files,
    // };
    // const response = await octokit.request(url, payloadObj);

    // const status = response.status;
    // console.log("answers submitted with status of " + status);
  };
}
