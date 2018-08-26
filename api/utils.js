"use strict";

module.exports.processErrors = (error) => {
  // Translate model validation errors to customer visible errors
  // TODO what if error occured not because of validation?
  const errorsArr = Object.keys(error.errors)
    .map(field => [field, error.errors[field].message]);
  return Object.assign(...errorsArr.map( ([k, v]) => ({[k]: v}) ));
};

module.exports.formatListResponse = (list, fields) => {
  // Clean up all fields from response except provided fields and _id
  const formatItem = (item) => {
    return Object.assign(
      ...fields.map((field) => {
        let newItem = {};
        newItem[field] = item[field];
        return newItem;
      })
    );
  }

  return list.map(
    item => Object.assign(
      formatItem(item),
      {_id: item._id.toString()},
    )
  );
}