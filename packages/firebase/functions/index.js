/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
// The Firebase Admin SDK to access Firestore.
import admin from "firebase-admin";
// import {getFirestore} from "firebase-admin/firestore";
// import {calcTreatmentIds, fetchExperiment} from "./functionsUtil.js";
import SERVICE_ACCOUNT from "../../../admin-credentials-dev.json" assert { type: "json" };

const useEmulator = false;

if (useEmulator) {
  process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
  // I think this will work when I enable auth on emulator
  // process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
}

admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
  databaseURL: "https://vizsurvey-test.firebaseio.com/",
});

// const db = admin.firestore();

export const fetchExpConfig = onRequest(async (request, response) => {
  // logger.info(
  //     `fetchExpConfig prolific_pid=${request.query.prolific_pid},
  //     study_id=${request.query.study_id},
  //     session_id=${request.query.session_id}`);
  try {
    // const prolificPid = request.query.prolific_pid;
    // const studyId = request.query.study_id;
    // const sessionId = request.query.session_id;

    // if (!prolificPid || !studyId) {
    //   logger.error(`fetchExpConfig Error with request parameters.
    //   prolific_pid or study_id not in request`, request);
    //   throw Error("Error with survey URL.");
    // }

    // const expDoc = await fetchExperiment(db, studyId);

    // if (
    //   expDoc.data().num_participants_completed ===
    //   expDoc.data().num_participants
    // ) {
    //   logger.error(`fetchExpConfig participant tried starting survey
    //     after the
    //     number of participants (${expDoc.data().num_participants})
    //     has been fulfilled.`, request, expDoc);
    //   throw Error("Error retrieving experiment configuration");
    // }

    // expDoc.data().num_participants_completed++;

    // const treatmentIds = calcTreatmentIds(
    //     expDoc.data().latin_square,
    //     expDoc.data().num_participants_completed,
    // );

    // logger.info(`assigned treatment order ${treatmentIds} to
    //   participant id ${prolificPid}, for study id ${studyId}
    //   for session id ${sessionId}`);

    // // TODO

    // const writeResult = await getFirestore().collection(
    // "participantsAnswers")
    //     .add({exp_id: expDoc.ref,
    //       participant_id: prolificPid,
    //       session_id: sessionId,
    //       study_id: studyId,
    //       treatment_id: treatmentIds});

    // Send back a message that we've successfully written the message
    // response.json({result: `Message with ID: ${writeResult.id} added.`});
    response.json({ result: "hello world" });
  } catch (err) {
    logger.error(err);
    response.json({ error: "There was an error with the server." });
  }
});
