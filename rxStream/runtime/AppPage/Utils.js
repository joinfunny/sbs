var AppPage = require('../AppPage');

var Utils = {
  log: function (message) {
    if (process.env.ENV === 'dev') {
      console.log(message);
    }
  },
  formGet: function (form, propName) {
    if (form && form.hasOwnProperty(propName)) {
      return form[propName];
    }
  }
};

AppPage.ns('AppPage.Utils', Utils);

module.exports = AppPage.Utils;