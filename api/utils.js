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
  // TODO cover with tests
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
};

module.exports.convertIdToString = (list) => {
  // Converts all ids to string for all elements in array
  return list.map((item) => {
    let itemCopy = {...item._doc};
    itemCopy._id = item._id.toString();
    return itemCopy;
  });
};

const replaceDataInArray = (ids, itemsMap) => {
  // Replace ids with elements from itemsMap
  return ids.map(id => itemsMap.get(id.toString()));
};

module.exports.replaceDataInInnerArray = (documents, innerArrayField, itemsMap) => {
  // Replace ids with elements from itemsMap in inner array of each document
  return documents.map(
    (doc) => {
      // TODO: refactor this. WHy sometimes documents are returned in short
      // format and sometimes with full format with _doc?
      let docCopy = {...(doc._doc || doc)};
      docCopy[innerArrayField] = replaceDataInArray(
        doc[innerArrayField], itemsMap);
     return docCopy;
    }
  );
};