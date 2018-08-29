"use strict";

module.exports.formatListResponse = (list, fields) => {
  // Clean up all fields from response except provided fields and _id
  // Used to remove field by which collection was sorted
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

module.exports.toJSON = (objects) => {
  return JSON.parse(JSON.stringify(objects));
};