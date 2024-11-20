const mongoose = require("mongoose");
const logger = require("loglevel");
const constant = require("../config/constant");
const { COLLECTIONS } = require("../config/constant");
const { UsersModel } = require("../schema/user.schema");
const { QuestionModel } = require("../schema/question.schema");
const message = require("../config/message");
require("dotenv").config();

class DbHelper {
  async connect() {
    if (!this.db) {
      try {
        mongoose.set("strictQuery", true);
        await mongoose.connect(`${constant.MONGO_DB_URL}`, {});
        this.db = mongoose.connection;
        return;
      } catch (e) {
        logger.error("DbHelper Error while connect mongodb ::: ", e);
        throw Error(e);
      }
    }
  }

  async insertDocument(collection, docObj) {
    try {
      if (Object.keys(docObj).length === 0 && docObj.constructor === Object) {
        throw message.error.INSERT_MONGODB;
      }

      let modelInstance;

      switch (collection) {
        case COLLECTIONS.USER_COLLECTION:
          modelInstance = new UsersModel(docObj);
          break;
          case COLLECTIONS.QUESTION_COLLECTION_NAME:
            modelInstance = new QuestionModel(docObj);
          break;
        default:
          throw message.error.INVALID_COLLECTION_NAME;
      }

      await this.connect();
      return await modelInstance.save();
    } catch (e) {
      throw e;
    }
  }

  async updateDocument(collection, _id, docObj) {
    try {
      let Model;
      switch (collection) {
        case COLLECTIONS.USER_COLLECTION:
          Model = UsersModel;
          break;
          case COLLECTIONS.QUESTION_COLLECTION_NAME:
            Model = QuestionModel;
          break;
        default:
          throw message.error.INVALID_COLLECTION_NAME;
      }
      await this.connect();
      return await Model.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(_id) },
        docObj,
        { new: true, returnNewDocument: true, omitUndefined: true }
      );
    } catch (e) {
      logger.error("DbHelper Error while updateDocument ::: ", e);
      throw e;
    }
  }

  async updateDocumentByQuery(collection, query, data) {
    try {
      let Model;
      switch (collection) {
        case COLLECTIONS.USER_COLLECTION:
          Model = UsersModel;
          break;
          case COLLECTIONS.QUESTION_COLLECTION_NAME:
            Model = QuestionModel;
          break;
        default:
          throw message.error.INVALID_COLLECTION_NAME;
      }
      await this.connect();
      if (query._id && !query._id.$in)
        query._id = new mongoose.Types.ObjectId(query._id);
      if (query["user._id"])
        query["user._id"] = new mongoose.Types.ObjectId(query["user._id"]);
      return await Model.updateMany(query, data, {
        new: true,
        returnNewDocument: true,
        omitUndefined: true,
      });
    } catch (e) {
      logger.error("DbHelper Error while updateDocument ::: ", e);
      throw e;
    }
  }

  async getDocumentByQuery(collection, query) {
    try {
      let Model;
      switch (collection) {
        case COLLECTIONS.USER_COLLECTION:
          Model = UsersModel;
          case COLLECTIONS.QUESTION_COLLECTION_NAME:
            Model = QuestionModel;
          break;
        default:
          throw message.error.INVALID_COLLECTION_NAME;
      }

      await this.connect();
      const response = await Model.findOne(query);
      return response;
    } catch (e) {
      logger.error("DbHelper Error while getDocument ::: ", e);
      throw e;
    }
  }
  async getDocuments(collection, query) {
    try {
      let Model;
      switch (collection) {
        case COLLECTIONS.USER_COLLECTION:
          Model = UsersModel;
          break;
          case COLLECTIONS.QUESTION_COLLECTION_NAME:
            Model = QuestionModel;
          break;
        default:
          throw message.error.INVALID_COLLECTION_NAME;
      }

      await this.connect();
      const response = await Model.find(query);
      return response;
    } catch (e) {
      logger.error("DbHelper Error while getDocument ::: ", e);
      throw e;
    }
  }

}

module.exports = {
  DbHelper,
};
