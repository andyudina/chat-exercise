"use strict";

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

module.exports.convertIdToString = (list, idField) => {
  // Converts all ids to string for all elements in array
  idField = idField || '_id';
  return list.map((item) => {
    let itemCopy = {...(item._doc || item)};
    itemCopy[idField] = item[idField].toString();
    return itemCopy;
  });
};

const replaceDataInArray = (ids, itemsMap) => {
  // Replace ids with elements from itemsMap
  return ids.map(id => itemsMap.get(id.toString()));
};

module.exports.flattenArray = (items) => {
  // Flatten 2 dimensional array
  return [].concat.apply([], items);
}

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

module.exports.replaceDataInDocumentArray = (documents, fieldToBeReplaced, itemsMap) => {
  // Replace fieldwith corresponding valie from itemsMap
  return documents.map(
    (doc) => {
      let docCopy = {...(doc._doc || doc)};
      docCopy[fieldToBeReplaced] = itemsMap.get(doc[fieldToBeReplaced]);
      return docCopy;
    }
  );
};

module.exports.toJSON = (objects) => {
  return JSON.parse(JSON.stringify(objects));
};