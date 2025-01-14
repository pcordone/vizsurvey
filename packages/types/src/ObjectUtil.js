import _ from "lodash";
import { SurveyQuestion } from "./SurveyQuestion.js";

export const convertKeysCamelCaseToUnderscore = (obj) => {
  return _.mapKeys(obj, function (value, key) {
    return [...key].reduce((accu, x) => {
      const result =
        x >= "A" && x <= "Z" ? accu + "_" + x.toLowerCase() : accu + x;
      return result;
    }, "");
  });
};

export const convertKeysUnderscoreToCamelCase = (obj) => {
  return _.mapKeys(obj, function (value, key) {
    return _.camelCase(_.replace(key, "_", " "));
  });
};

export const setAllPropertiesEmpty = (obj) => {
  return _.mapValues(obj, function () {
    return "";
  });
};

export const setUndefinedPropertiesNull = (obj) => {
  return _.mapValues(obj, (value) => (value == undefined ? null : value));
};

export const renameKeys = (obj, keyFunc, valueFunc) => {
  let result = _.mapValues(obj, (value, key, object) => {
    return valueFunc(key, value, object);
  });
  // eslint-disable-next-line no-undef
  result = _.mapKeys(obj, (value, key, object) => {
    return keyFunc(key, value, object);
  });
  return result;
};

export const flattenArrayToObject = (array, keyFunc, valueFunc) => {
  const result = array.reduce((acc, current) => {
    let obj = _.mapValues(current, (value, key, object) => {
      return valueFunc(key, value, object);
    });
    // eslint-disable-next-line no-undef
    obj = _.mapKeys(current, (value, key, object) => {
      return keyFunc(key, value, object);
    });
    const mappedObj = {
      ...acc,
      ...obj,
    };
    return mappedObj;
  }, {});
  return result;
};

export const clientSurveyQuestionFields = (questions) => {
  const result = questions.map((v) => SurveyQuestion({ ...v }));
  return result;
};

export const removeUndefinedOrNullProperties = (obj) => {
  return _.omitBy(obj, (value) => value === null || value === undefined);
};

export const convertFields = (obj, convertFunc) => {
  return _.mapValues(obj, (value, key) => {
    if (Array.isArray(value)) {
      return value.map((cv) => convertFields(cv, convertFunc));
    } else if (value !== null && typeof value === "object") {
      const { converted, result } = convertFunc(key, value);
      if (converted) {
        return result;
      } else {
        return convertFields(value, convertFunc);
      }
    } else {
      return convertFunc(key, value).result;
    }
  });
};
