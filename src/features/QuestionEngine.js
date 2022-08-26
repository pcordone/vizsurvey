import { StatusType } from "./StatusType";
import { AmountType } from "./AmountType";
import { InteractionType } from "./InteractionType";
import { Answer } from "./Answer";

export const TIMESTAMP_FORMAT = "MM/dd/yyyy H:mm:ss:SSS ZZZZ";

// TODO Need to capture errors in processing by settings state.status = StatusType.Error
export class QuestionEngine {
  constructor() {}

  currentTreatment(state) {
    return state.treatments[state.currentQuestionIdx];
  }

  currentTreatmentAndLatestAnswer(state) {
    const treatment = this.currentTreatment(state);
    const latestAnswer = this.latestAnswer(state);

    return { treatment, latestAnswer };
  }

  latestAnswer(state) {
    return state.answers.length === 0
      ? null
      : state.answers[state.answers.length - 1];
  }

  createNextAnswer(
    treatment,
    answers,
    amountEarlier,
    amountLater,
    highup,
    lowdown
  ) {
    const answer = Answer({
      treatmentId: treatment.treatmentId,
      position: treatment.position,
      viewType: treatment.viewType,
      interaction: treatment.interaction,
      variableAmount: treatment.variableAmount,
      amountEarlier: amountEarlier,
      timeEarlier: treatment.timeEarlier,
      dateEarlier: treatment.dateEarlier,
      amountLater: amountLater,
      timeLater: treatment.timeLater,
      dateLater: treatment.dateLater,
      maxAmount: treatment.maxAmount,
      maxTime: treatment.maxTime,
      verticalPixels: treatment.verticalPixels,
      horizontalPixels: treatment.horizontalPixels,
      leftMarginWidthIn: treatment.leftMarginWidthIn,
      bottomMarginHeightIn: treatment.bottomMarginHeightIn,
      graphWidthIn: treatment.graphWidthIn,
      graphHeightIn: treatment.graphHeightIn,
      widthIn: treatment.widthIn,
      heightIn: treatment.heightIn,
      choice: AmountType.unitialized,
      highup: highup,
      lowdown: lowdown,
    });
    answers.push(answer);
  }

  allQuestions(state) {
    return state.answers;
  }

  startSurvey(state) {
    state.currentQuestionIdx = 0;
    const treatment = this.currentTreatment(state);
    state.highup =
      treatment.variableAmount === AmountType.laterAmount
        ? treatment.amountEarlier
        : treatment.amountLater;
    state.lowdown = undefined;
    this.createNextAnswer(
      treatment,
      state.answers,
      treatment.amountEarlier,
      treatment.amountLater,
      state.highup,
      state.lowdown
    );
    state.status = StatusType.Instructions;
  }

  setLatestAnswerShown(state, action) {
    if (this.latestAnswer(state).shownTimestamp === null) {
      this.latestAnswer(state).shownTimestamp = action.payload;
    }
  }

  isLastTreatment(state) {
    return state.currentQuestionIdx === state.treatments.length - 1;
  }

  isMiddleTreatment(state) {
    return Math.round(
      state.currentQuestionIdx === (state.treatments.length - 1) / 2
    );
  }

  incNextQuestion(state) {
    if (this.isLastTreatment(state)) {
      state.status = StatusType.Questionaire;
    } else {
      state.currentQuestionIdx += 1;
      const treatment = this.currentTreatment(state);
      this.createNextAnswer(
        treatment,
        state.answers,
        treatment.amountEarlier,
        treatment.amountLater
      );
    }
  }

  updateHighupOrLowdown(state) {
    const { treatment, latestAnswer } =
      this.currentTreatmentAndLatestAnswer(state);
    switch (latestAnswer.choice) {
      case AmountType.earlierAmount:
        var possibleHighup =
          treatment.variableAmount === AmountType.laterAmount
            ? latestAnswer.amountLater
            : latestAnswer.amountEarlier;
        if (!state.highup || possibleHighup > state.highup)
          state.highup = possibleHighup;
        break;
      case AmountType.laterAmount:
        var possibleLowdown =
          treatment.variableAmount === AmountType.laterAmount
            ? latestAnswer.amountLater
            : latestAnswer.amountEarlier;
        if (!state.lowdown || possibleLowdown < state.lowdown)
          state.lowdown = possibleLowdown;
        break;
      default:
        console.assert(
          true,
          "Invalid value for current answer in setAnswerCurrentQuestion"
        );
        break;
    }
  }

  calcTitrationAmount(titratingAmount, highup, override) {
    return (override ? override : titratingAmount - highup) / 2;
  }

  calcNewAmount(state, titrationAmount) {
    const { treatment, latestAnswer } =
      this.currentTreatmentAndLatestAnswer(state);
    var adjustmentAmount;
    switch (treatment.variableAmount) {
      case AmountType.laterAmount:
        console.assert(
          latestAnswer.choice && latestAnswer.choice !== AmountType.none
        );
        adjustmentAmount =
          latestAnswer.choice === AmountType.earlierAmount
            ? titrationAmount
            : -1 * titrationAmount;
        return (
          parseInt((latestAnswer.amountLater + adjustmentAmount) / 10) * 10
        );
      case AmountType.earlierAmount:
        adjustmentAmount =
          latestAnswer.choice === AmountType.earlierAmount
            ? -1 * titrationAmount
            : titrationAmount;
        return (
          parseInt((latestAnswer.amountEarlier + adjustmentAmount) / 10) * 10
        );
      default:
        console.assert(
          true,
          "Invalid value for question titration type in calcEarlierAndLaterAmounts"
        );
        break;
    }
  }

  answerCurrentQuestion(state, action) {
    const { treatment, latestAnswer } =
      this.currentTreatmentAndLatestAnswer(state);
    latestAnswer.choice = action.payload.choice;
    latestAnswer.choiceTimestamp = action.payload.choiceTimestamp;
    latestAnswer.dragAmount = action.payload.dragAmount;
    if (
      treatment.interaction === InteractionType.none ||
      treatment.interaction === InteractionType.drag
    ) {
      this.incNextQuestion(state);
    } else if (treatment.interaction === InteractionType.titration) {
      const titrationAmount = this.calcTitrationAmount(
        treatment.variableAmount === AmountType.laterAmount
          ? latestAnswer.amountLater
          : latestAnswer.amountEarlier,
        state.highup,
        latestAnswer.length === 1 ? state.highup : null
      );
      this.updateHighupOrLowdown(state);
      // TODO we need a termination condition for runaway titration
      if (state.lowdown - state.highup <= 10) {
        this.incNextQuestion(state);
      } else {
        const newAmount = this.calcNewAmount(state, titrationAmount);
        if (treatment.variableAmount === AmountType.laterAmount) {
          this.createNextAnswer(
            treatment,
            state.answers,
            treatment.amountEarlier,
            newAmount
          );
        } else if (treatment.variableAmount === AmountType.earlierAmount) {
          this.createNextAnswer(
            treatment,
            state.answers,
            newAmount,
            treatment.amountLater
          );
        } else {
          console.assert(
            true,
            "Titration not set to amountEarlier or amountLater before calling answerCurrentQuestion"
          );
        }
      }
    }
  }
}
