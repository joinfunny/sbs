var AppPage = require('../AppPage');

var BusinessData = {
  getAppId: function (req) {
    return req.query.appId;
  },
  AnalysisTypes: {
    "1": "Event",
    "2": "Funnel",
    "3": "Retained",
    "4": "Revisit",
    "5": "Worth",
    "6": "Spread"
  },
  GetAnalysisTypeKey: function (type) {
    var key;
    for (var prop in this.AnalysisTypes) {
      if (AppPage.BusinessData.AnalysisTypes.hasOwnProperty(prop)) {
        if (AppPage.BusinessData.AnalysisTypes[prop] === type) {
          key = prop;
          break;
        }
      }
    }
    return key;
  },
  /**
   * @param success 是否成功
   * @param msg 回调返回的消息
   * @param dataObject 回调最终返回的默认数据
   */
  GetCallBackObject: function (success, msg, dataObject) {
    return {
      success: success || false,
      msg: msg || '',
      dataObject: dataObject || null
    };
  }
};

AppPage.ns('AppPage.BusinessData', BusinessData);

module.exports = AppPage.BusinessData;