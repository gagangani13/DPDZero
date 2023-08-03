const { Data } = require("../model/Data");

const storeData = async (req, res, next) => {
  const { key, value } = req.body;
  try {
    if (!key || key.length === 0) {
      const error = new Error("The provided key is not valid or missing.");
      error.code = "INVALID_KEY";
      throw error;
    }
    if (!value || value.length === 0) {
      const error = new Error("The provided value is not valid or missing.");
      error.code = "INVALID_VALUE";
      throw error;
    }
    const store = await Data.create({
      key,
      value,
      UserId: req.userId,
    });
    res.send({ status: "success", message: "Data stored successfully." });
  } catch (error) {
    if (error.errors && error.errors[0].message === "PRIMARY must be unique") {
      error.code = "KEY_EXISTS";
      error.message =
        "The provided key already exists in the database. To update an existing key, use the update API.";
    }
    res.send({ status: "error", code: error.code, message: error.message });
  }
};

const retrieveData = async (req, res, next) => {
  try {
    const key = req.params.key;
    const getKeyData = await Data.findOne({
      where: { UserId: req.userId, key },
    });
    res.send({
      status: "success",
      data: { key: getKeyData.key, value: getKeyData.value },
    });
  } catch (error) {
    res.send({
      status: "error",
      code: "KEY_NOT_FOUND",
      message: "The provided key does not exist in the database.",
    });
  }
};

const updateData = async (req, res, next) => {
  try {
    const key = req.params.key;
    const value = req.body.value;
    if (!key || key.length === 0) {
      const error = new Error(
        "The provided key does not exist in the database."
      );
      error.code = "KEY_NOT_FOUND";
      throw error;
    }

    if (!value || value.length === 0) {
      const error = new Error("The provided value is not valid or missing.");
      error.code = "INVALID_VALUE";
      throw error;
    }
    const getKeyData = await Data.findOne({
      where: { UserId: req.userId, key },
    });
    const update = await getKeyData.update({ value });
    res.send({
      status: "success",
      message: "Data updated successfully.",
    });
  } catch (error) {
    if (!error.code) {
      error.code = "KEY_NOT_FOUND";
      error.message = "The provided key does not exist in the database.";
    }
    res.send({ status: "error", code: error.code, message: error.message });
  }
};

const deleteData = async (req, res, next) => {
  try {
    const key = req.params.key;
    const getKeyData = await Data.findOne({
      where: { UserId: req.userId, key },
    });
    const deletion = await getKeyData.destroy();
    res.send({ status: "success", message: "Data deleted successfully." });
  } catch (error) {
    res.send({
      status: "error",
      code: "KEY_NOT_FOUND",
      message: "The provided key does not exist in the database.",
    });
  }
};

module.exports = { retrieveData, storeData, updateData, deleteData };
