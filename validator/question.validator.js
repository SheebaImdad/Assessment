const { Validator } = require("node-input-validator");
const message = require("../config/message");

module.exports = {
  validateCategoryId: async function (dataObj) {
    const { category_id } = dataObj;
    let v = new Validator(dataObj, {
        category_id: "string|required",
    });
    v.addPostRule((provider) => {
      if (provider.validationRules.category_id.value) {
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        //check invalid startDate format
        if (!objectIdRegex.test(provider.validationRules.category_id.value)) {
          let e = message.error.BadRequestValidation;
          e.message = "Invalid category_id";
          throw e;
        }
      }
    });
    let matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }
    return {
        category_id: category_id,
    };
  },

  validateTakeTest: async function (dataObj) {
    const { test_id, answers, duration } = dataObj;
    let v = new Validator(dataObj, {
      test_id: "string|required",
      answers: "required|array",
      duration: "required|numeric|min:1|max:60",
    });
    v.addPostRule((provider) => {
      if (provider.validationRules.answers.value) {
        const answerSchema = {
          questionId: "string|required",
          option_id: "required|array",
        };

        provider.validationRules.answers.value.forEach((answer) => {
          const answerValidation = new Validator(answer, answerSchema);
          if (!answerValidation.check()) {
            let e = message.error.BadRequestValidation;
            e.message = "Invalid answer format";
            throw e;
          }
          const objectIdRegex = /^[0-9a-fA-F]{24}$/;
          if (!objectIdRegex.test(answer.questionId)) {
            let e = message.error.BadRequestValidation;
            e.message = "Invalid questionId";
            throw e;
          }
        });
      }
    });

    let matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }

    return {
      test_id: test_id,
      answers: answers,
      duration: duration,
    };
  },

  validateQuestionId: async function (dataObj) {
    const { question_id } = dataObj;
    let v = new Validator(dataObj, {
      question_id: "string|required",
    });
    v.addPostRule((provider) => {
      if (provider.validationRules.question_id.value) {
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;

        //check invalid startDate format
        if (!objectIdRegex.test(provider.validationRules.question_id.value)) {
          let e = message.error.BadRequestValidation;
          e.message = "Invalid QuestionId";
          throw e;
        }
      }
    });
    let matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }
    return {
      question_id: question_id,
    };
  },
  updateQuestionValidator: async function (dataObj) {
    let { question, options, answer } = dataObj;
    let v = new Validator(dataObj, {
      question: "string",
      options: "array",
      answer: "array",
    });

    v.addPostRule((provider) => {
      if (provider.validationRules.question.value) {
        if (provider.validationRules.question.value.trim() === "") {
          let e = message.error.BadRequestValidation;
          e.message = "Invalid question, question should not be empty";
          throw e;
        }
      }
    });
    let matched = await v.check();
    if (!matched) {
      throw Object.values(v.errors)[0].message;
    }
    return {
      question: question,
      options: options,
      answer: answer,
    };
  },
};
