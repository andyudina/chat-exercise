"use strict";

module.exports.processErrors = (error) => {
  // Translate model validation errors to customer visible errors
  const errorsArr = Object.keys(error.errors)
    .map(field => [field, error.errors[field].message]);
  return Object.assign(...errorsArr.map( ([k, v]) => ({[k]: v}) ));
};