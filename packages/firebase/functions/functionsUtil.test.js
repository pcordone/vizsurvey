import { strict as assert } from "assert";
import { assertSucceeds } from "@firebase/rules-unit-testing";
import { group } from "d3";
import {
  calcTreatmentIds,
  filterQuestions,
  parseQuestions,
  orderQuestions,
  orderQuestionsRandom,
  signupParticipant,
} from "./functionsUtil.js";
import {
  initFirestore,
  fetchExperiment,
} from "@the-discounters/firebase-shared";
import { SURVEY_QUESTIONS_JSON } from "@the-discounters/test-shared";
import { deleteCollection } from "@the-discounters/firebase-test-shared";
import ADMIN_CREDS from "../../../admin-credentials-dev.json" assert { type: "json" };

// this needs to match the value that is passed to firebase emulators:start --project=
const PROJECT_ID = "vizsurvey-test";

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

describe("functionsUtil test ", () => {
  let app, db;

  before(async () => {
    const result = initFirestore(
      PROJECT_ID,
      "https://vizsurvey-test.firebaseio.com/",
      ADMIN_CREDS
    );
    app = result.app;
    db = result.db;
    await deleteCollection(db, "functionsUtil-writeQuestions-test");
  });

  after(async () => {
    await deleteCollection(db, "functionsUtil-writeQuestions-test");
  });

  it("Test for calcTreatmentIds .", async () => {
    const latinSquare = JSON.parse(
      "[[1, 2, 3], [1, 3, 2], [3, 1, 2], [3, 2, 1], [2, 3, 1], [2, 1, 3]]"
    );
    const result = calcTreatmentIds(latinSquare, 0);
    assert.equal(
      arraysEqual([1, 2, 3], result),
      true,
      `[${result}] wasn't expected value.`
    );
  });

  it("Test for calcTreatmentIds.", async () => {
    const latinSquare = JSON.parse(
      "[[1, 2, 3], [1, 3, 2], [3, 1, 2], [3, 2, 1], [2, 3, 1], [2, 1, 3]]"
    );
    const result = calcTreatmentIds(latinSquare, 5);
    assert.equal(
      arraysEqual([2, 1, 3], result),
      true,
      `[${result}] wasn't expected value.`
    );
  });

  it("Test for calcTreatmentIds.", async () => {
    const latinSquare = JSON.parse(
      "[[1, 2, 3], [1, 3, 2], [3, 1, 2], [3, 2, 1], [2, 3, 1], [2, 1, 3]]"
    );
    const result = calcTreatmentIds(latinSquare, 6);
    assert.equal(
      arraysEqual([1, 2, 3], result),
      true,
      `[${result}] wasn't expected value.`
    );
  });

  it("Test for filterQuestions between subject study (treatmentIds array like [1]).", async () => {
    const result = filterQuestions([1], SURVEY_QUESTIONS_JSON);
    assert.equal(result.length, 9, "Returned array was not expected size.");
  });

  it("Test for filterQuestions for within subject study (treatmentIds array like [1,2,3]).", async () => {
    const result = filterQuestions([1, 2, 3], SURVEY_QUESTIONS_JSON);
    assert.equal(result.length, 27, "Returned array was not expected size.");
  });

  it("Test for parseQuestions.", async () => {
    const { instruction, survey } = parseQuestions(SURVEY_QUESTIONS_JSON);
    assert.equal(
      instruction.length,
      3,
      "Returned instruction array was not expected size."
    );
    assert.equal(
      survey.length,
      24,
      "Returned survey array was not expected size."
    );
  });

  const assertCorrectOrder = (result) => {
    for (let i = 1; i < result.length; i++) {
      if (result[i - 1].treatment_id === result[i].treatment_id) {
        assert.equal(
          result[i - 1].sequence_id < result[i].sequence_id,
          true,
          `Question number ${i} was out of order.`
        );
      } else if (result[i - 1].treatment_id < result[i].treatment_id) {
        assert.equal(
          result[i].sequence_id,
          1,
          "First question in a treatment should be sequence number 1."
        );
      } else {
        fail(
          `Treatment id ${result[i - 1].treatment_id} was larger than ${
            result[i].treatment_id
          }`
        );
      }
    }
  };

  it("Test for orderQuestions for within subject study (latin square 1, 2, 3]).", async () => {
    const grouped = group(SURVEY_QUESTIONS_JSON, (d) => d.instruction_question);
    const q = grouped.get(false);
    const result = orderQuestions(q, [1, 2, 3]);
    assertCorrectOrder(result);
  });

  it("Test for orderQuestionsRandom for within subject study (latin square 1, 2, 3]).", async () => {
    const grouped = group(SURVEY_QUESTIONS_JSON, (d) => d.instruction_question);
    const q = grouped.get(false);
    let result = orderQuestionsRandom(q, [1, 2, 3]);
    assert.notEqual(
      result,
      q,
      "Array instance returned should not be the same as parameter value."
    );
    assertCorrectOrder(result);
    const first = result.map((v) => v.treatment_question_id);
    result = orderQuestionsRandom(q, [1, 2, 3]);
    assertCorrectOrder(result);
    const second = result.map((v) => v.treatment_question_id);
    assert.notDeepEqual(
      first,
      second,
      "Order of entries returned by orderQuestionsRandom was the same which is higly unlikely but possible."
    );
  });

  it("Test for signupParticipant for within subject study (latin square entries [1, 2, 3]).", async () => {
    const exp = await fetchExperiment(db, "next");
    const result = signupParticipant(db, "1", "2", "3", exp, (isError, msg) => {
      assert.equal(
        isError,
        false,
        `Expected there not to be an error in callback with message: ${msg}.`
      );
    });
    assert.equal(
      result.questions.length,
      24,
      "Wrong number of questions returned."
    );
    assertCorrectOrder(result);
    assert.equal(
      result.instruction.length,
      3,
      "Wrong number of instruction questions returned."
    );
  });

  it("Test for signupParticipant for between subject study (latin square entries [1[], [2], [3]).", async () => {
    const exp = await fetchExperiment(db, "test");
    const result = signupParticipant(db, "1", "2", "3", exp, (isError, msg) => {
      assert.equal(
        isError,
        false,
        `Expected there not to be an error in callback with message: ${msg}.`
      );
    });
    assert.equal(
      result.questions.length,
      8,
      "Wrong number of questions returned."
    );
    assertCorrectOrder(result);
    assert.equal(
      result.instruction.length,
      1,
      "Wrong number of instruction questions returned."
    );
  });
});
