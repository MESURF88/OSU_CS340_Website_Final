const moment = require("moment");

const DATE_PICKER_FORMAT = "YYYY-MM-DD";

const helpers = {
  contains: (item, array) => {
    return array ? array.indexOf(item) > -1 : false;
  },
  eq: (left, right) => {
    return left == right;
  },
  formDate: date => {
    if (!date) {
      return "";
    }
    return moment(date).format(DATE_PICKER_FORMAT);
  }
};

module.exports = helpers;
