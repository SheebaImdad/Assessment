const logger = require("loglevel");
const { readCSVFile } = require("./readCSVfile.helper");
const crypto = require("crypto");
const { DbHelper } = require("./dbHelper");
const constant = require("../config/constant");
const dbInstance = new DbHelper();
const mongoose = require("mongoose");
const message = require("../config/message");
const fs = require("fs");
const { CategoryModel } = require("../schema/category.schema");

let formatCSVdata = async (input) => {
  try {
    let res = [];
    input = input.map((item) => {
      for (const key in item) {
        item[key] = item[key].replace(/(\r\n|\n|\r)/gm, "");
        item[key] = item[key].replace(/�/g, "");
        item[key] = item[key].replace(/\./g, "");
      }
      return item;
    });

    input = input.map((item) => {
      for (const key in item) {
        item[key] = item[key].trim();
      }
      return item;
    });

    for (const key in input[0]) {
      if (input[0][key] === "option" || input[0][key] === "answer") {
        input[0][key] = input[0][key].toLowerCase();
      }
    }
    //remove empty rows
    input = input.filter((item) => {
      for (const key in item) {
        if (item[key] !== "") {
          return true;
        }
      }
      return false;
    });

    // remove duplicate rows
    input = input.filter((item, index, self) => {
      for (let i = index + 1; i < self.length; i++) {
        let check = true;
        for (const key in item) {
          if (item[key] !== self[i][key]) {
            check = false;
          }
        }
        if (check) {
          return false;
        }
      }
      return true;
    });
    input.slice(1).map((item) => {
      const question = item._0;
      let optionArray = [];
      let answerArray = [];
      for (const key in input[0]) {
        if (input[0][key] === "option") {
          if (item[key] !== "") {
            optionArray.push({ option: item[key], option_id: key });
          }
        }
        if (input[0][key] === "answer") {
          if (item[key] !== "" && typeof item[key] !== "undefined") {
            answerArray.push(item[key]);
          }
        }
        if (
          input[0][key] !== "option" &&
          input[0][key] !== "answer" &&
          input[0][key] !== "question" &&
          item[key] !== ""
        ) {
          throw new Error(`Invalid column name ${input[0][key]} in the file!`);
        }
      }
      const optionsArr = optionArray;
      const answerArr = answerArray;
      //check ansswerArray is empty or not
      if (answerArr.length === 0) {
        throw new Error(`Answer is not present in question ${question}`);
      }
      answerArr.forEach((element) => {
        let check = false;
        optionsArr.forEach((item) => {
          if (item.option === element) {
            check = true;
          }
        });
        if (!check) {
          throw new Error(
            `Answer ${element} is not present in option of question ${question}`
          );
        }
      });
      const answerOptionPairs = [];

      answerArr.forEach((answer) => {
        optionsArr.forEach((option) => {
          if (option.option === answer) {
            answerOptionPairs.push({ answer, option_id: option.option_id });
          }
        });
      });

      res.push({ question, option: optionsArr, answer: answerOptionPairs });
    });

    res.forEach((item) => {
      // hasString is combination of question and all option
      let hashStringValue = item.question;
      item.option.forEach((element) => {
        hashStringValue += element.option;
      });
      let jsonString = JSON.stringify(hashStringValue);
      let hash = crypto.createHash("md5").update(jsonString).digest("hex");
      item.hash = hash;
    });

    // remove duplicate object where hash value is same
    res = res.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.hash === item.hash && t.hash !== "")
    );

    return res;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

const readQuesCSVFile = async (path) => {
  try {
    const data = await readCSVFile(path);
    const formattedData = await formatCSVdata(data);
    fs.unlinkSync(path);
    return formattedData;
  } catch (e) {
    logger.error("questionHelper::::readQuesCSVFile", e);
    throw e;
  }
};

let createQuestion = async (options) => {
  try {
    const fileData = await readQuesCSVFile(options.path);
    // insert question one by one in question collection
    for (const data of fileData) {
      let questionObj = {
        question: data.question,
        options: data.option,
        answer: data.answer,
        test_id: testData._id,
        hash: data.hash,
      };
      await dbInstance.insertDocument(
        constant.COLLECTIONS.QUESTION_COLLECTION_NAME,
        questionObj
      );
    }
  } catch (e) {
    logger.error("dbHelperTest:::::::createQuestion", e);
    throw e;
  }
};


const retrieveQuestionByCategoryId = async (options) => {
  try {
    let questionData = await CategoryModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(options.category_id),
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "category_id",
          foreignField: "_id",
          as: "data",
        },
      },
      { $unwind: { path: "$data" } },
      { $project: { questionData: "$data" } },
    ]);

    if (questionData.length === 0) {
      throw message.error.COURSE_NOT_FOUND;
    }
    return questionData;
  } catch (e) {
    logger.error("dbHelperTest:::::::retrieveQuestionByCategoryId", e);
    throw e;
  }
};

const fetchQuestionData = async (testId) => {
  const questionData = await dbInstance.getDocumentsByQuery(
    constant.COLLECTIONS.QUESTION_COLLECTION_NAME,
    { test_id: new mongoose.Types.ObjectId(testId) }
  );

  if (questionData.length === 0) {
    throw message.error.TEST_NOT_FOUND;
  }

  return questionData;
};

const calculateScore = (questionData, answers) => {
  const questionId = answers.map((item) => item.questionId);
  const checkQuestionId = questionId.every((item) =>
    questionData.some((question) => question._id.toString() === item)
  );

  if (!checkQuestionId) {
    throw message.error.QUESTION_NOT_FOUND;
  }

  const answersList = questionData.map((question) => {
    const matchingAnswer = answers.find(
      (answer) => answer.questionId === question._id.toString()
    );

    const questionAnswers = matchingAnswer
      ? question.answer.map((item) => item.option_id)
      : [];

    const isCorrect = matchingAnswer
      ? matchingAnswer.option_id.every((item) => questionAnswers.includes(item))
      : false;

    return {
      questionId: new mongoose.Types.ObjectId(question._id),
      question: question.question,
      isCorrect,
      answer: matchingAnswer ? matchingAnswer.option_id : [],
    };
  });

  return answersList;
};

const generatePdfAndSaveResult = async (
  options,
  findCourseName,
  result,
  checkUser
) => {
  let certificateData;

  if (checkUser.length > 0) {
    if (checkUser[0].qualified) {
      throw message.error.TEST_ALREADY_ATTEMPTED;
    }
   
    result.certificate_id = certificateData[0].certificateId;
    result.certificate_url = certificateData[0].certificateUrl;
    let score_card = checkUser[0].score_card;
    score_card[result.attempted_count] = result.score_percentage_obtained;
    result.score_card = score_card;
    let duration = checkUser[0].duration;
    duration[result.attempted_count] = result.duration;
    result.duration = duration;
    await dbInstance.updateDocument(
      constant.COLLECTIONS.RESULT_TEST_COLLECTION_NAME,
      checkUser[0]._id,
      result
    );
  } else {
    certificateData = await createPdfFile(
      `${options.firstName} ${options.lastName}`,
      `${findCourseName.course_name}`,
      options.email,
      options.organization
    );

    result.certificate_id = certificateData[0].certificateId;
    result.certificate_url = certificateData[0].certificateUrl;
    let score_card = {};
    score_card[result.attempted_count] = result.score_percentage_obtained;
    result.score_card = score_card;
    let duration = {};
    duration[result.attempted_count] = result.duration;
    result.duration = duration;
    await dbInstance.insertDocument(
      constant.COLLECTIONS.RESULT_TEST_COLLECTION_NAME,
      result
    );
  }

  return certificateData;
};

const takeTest = async (options) => {
  try {
    const questionData = await fetchQuestionData(options.test_id);

    const answersList = calculateScore(questionData, options.answers);

    const findPassingPercentage = await dbInstance.getDocumentsByQuery(
      constant.COLLECTIONS.TEST_COLLECTION_NAME,
      { _id: new mongoose.Types.ObjectId(options.test_id) }
    );
    findPassingPercentage.length === 0
      ? (() => {
          throw message.error.TEST_NOT_FOUND;
        })()
      : null;
  

    const passingPercentage = findPassingPercentage[0].passing_percentage;
    const score = answersList.filter((item) => item.isCorrect === true).length;
    const totalScore = answersList.length;
    const scorePercentage = (score / totalScore) * 100;
    const qualified = scorePercentage >= passingPercentage;

    let findCourseName = await dbInstance.getDocumentByQuery(
      constant.COLLECTIONS.COURSE_COLLECTION_NAME,
      { test_id: new mongoose.Types.ObjectId(options.test_id) }
    );
    !findCourseName
      ? (() => {
          throw message.error.TEST_MAP_WITH_COURSE;
        })()
      : null;

    let result = {
      score_obtained: score,
      totalScore,
      score_percentage_obtained: scorePercentage,
      qualified,
      passing_percentage: passingPercentage,
      answers: answersList,
      test_id: options.test_id,
      user_id: new mongoose.Types.ObjectId(options.user_id),
      created_By: new mongoose.Types.ObjectId(options.user_id),
      updated_By: new mongoose.Types.ObjectId(options.user_id),
      course_id: new mongoose.Types.ObjectId(findCourseName._id),
      duration: options.duration,
      user_email: options.email,
    };

    const checkUser = await dbInstance.getDocumentsByQuery(
      constant.COLLECTIONS.RESULT_TEST_COLLECTION_NAME,
      {
        test_id: new mongoose.Types.ObjectId(options.test_id),
        user_id: new mongoose.Types.ObjectId(options.user_id),
      }
    );
    result.attempted_count =
      checkUser.length > 0 ? checkUser[0].attempted_count + 1 : 1;
    return qualified
      ? await generatePdfAndSaveResult(
          options,
          findCourseName,
          result,
          checkUser
        )
      : await ifUserFailed(result, checkUser);
  } catch (e) {
    logger.error("dbHelperTest:::::::takeTest", e);
    throw e;
  }
};

const ifUserFailed = async (result, checkUser) => {
  try {
    if (checkUser.length > 0) {
      if (checkUser[0].qualified) {
        throw message.error.TEST_ALREADY_ATTEMPTED;
      }
      let score_card = checkUser[0].score_card;
      score_card[result.attempted_count] = result.score_percentage_obtained;
      result.score_card = score_card;
      let duration = checkUser[0].duration;
      duration[result.attempted_count] = result.duration;
      result.duration = duration;
      await dbInstance.updateDocument(
        constant.COLLECTIONS.RESULT_TEST_COLLECTION_NAME,
        checkUser[0]._id,
        result
      ); 

      await dbInstance.updateDocumentByQuery(
        constant.COLLECTIONS.COURSE_TRACKING,
        { test_id: result.test_id, user_email: result.user_email },
        { course_status: "PENDING", course_started_time: null }
      );
      return [message.success.TEST_FAILED];
    } else {
      let score_card = {};
      score_card[result.attempted_count] = result.score_percentage_obtained;
      result.score_card = score_card;
      let duration = {};
      duration[result.attempted_count] = result.duration;
      result.duration = duration;
      await dbInstance.insertDocument(
        constant.COLLECTIONS.RESULT_TEST_COLLECTION_NAME,
        result
      );
      await dbInstance.updateDocumentByQuery(
        constant.COLLECTIONS.COURSE_TRACKING,
        { test_id: result.test_id, user_email: result.user_email },
        { course_status: "PENDING", course_started_time: null }
      );
      return [message.success.TEST_FAILED];
    }
  } catch (e) {
    logger.error("dbHelperTest:::::::ifUserFailed", e);
    throw e;
  }
};

const updateQuestionById = async (options) => {
  try {
    const findData = await dbInstance.getDocumentsByQuery(
      constant.COLLECTIONS.QUESTION_COLLECTION_NAME,
      { _id: new mongoose.Types.ObjectId(options.question_id) }
    );

    if (findData.length === 0) {
      throw message.error.QUESTION_NOT_FOUND;
    }

    // Update options and answer by option_id
    if (options.options) {
      for (const option of findData[0].options) {
        for (const opt of options.options) {
          if (option.option_id === opt.option_id) {
            option.option = opt.option;
          }
          // If option_id is present in answer, update answer as well
          if (
            findData[0].answer.some((ans) => ans.option_id === opt.option_id)
          ) {
            findData[0].answer.find(
              (ans) => ans.option_id === opt.option_id
            ).answer = opt.option;
          }
        }
      }
    }

    // Update answer
    if (options.answer) {
      options.answer = [...new Set(options.answer)];
      findData[0].answer = options.answer.map((ans) => {
        //find all options where option_id is present in answer
        const option = findData[0].options.find((opt) => opt.option_id === ans);
        //if option is not present then throw error
        if (!option) {
          throw message.error.INVALID_OPTION;
        }
        return {
          answer: option.option,
          option_id: option.option_id,
          _id: option._id,
        };
      });
    }

    // Update question
    findData[0].question = options.question;

    // Update hash
    let hashStringValue = findData[0].question;
    findData[0].options.forEach((element) => {
      hashStringValue += element.option;
    });
    let jsonString = JSON.stringify(hashStringValue);
    options.hash = crypto.createHash("md5").update(jsonString).digest("hex");
    findData[0].hash = options.hash;

    // Update the document in the database
    const updateData = await dbInstance.updateDocument(
      constant.COLLECTIONS.QUESTION_COLLECTION_NAME,
      options.question_id,
      findData[0]
    );

    return updateData;
  } catch (e) {
    logger.error("dbHelperTest:::::::updateQuestionById", e);
    throw e;
  }
};

module.exports = {
  readQuesCSVFile,
  createQuestion,
  retrieveQuestionByCategoryId,
  takeTest,
  updateQuestionById,
};
