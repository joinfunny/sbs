var AppPage = require('../AppPage');
var __codes;
var BusinessData = {
  getAppId: function (req) {
    return req.query.appId;
  },
  responseCodes: null,
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
  },

  HttpClientResponseDataFormatter: function (response) {
    var dataObject = {};
    dataObject = Object.prototype.toString.call(response.body) === '[object Object]' ? response.body : (JSON.parse(response.body) || {});
    var code = this.responseCodes[dataObject.code];
    dataObject.success = code ? code.success : false;
    dataObject.msg = code ? code.msg : (dataObject.msg||'');
    dataObject.dataObject = dataObject.dataObject || dataObject.data;
    return dataObject;
  }
};
(function () {
  if (!BusinessData.responseCodes) {
    BusinessData.responseCodes = {};
    [
      /**
      * ==============================================
      * 系统统一错误码
      * ==============================================
      *
      */
      [-1, false, "失败"],//FAIL
      [0, true, "成功"],//SUCCESS
      [500, false, "系统异常"],//SYSTEM_ERROR
      [999, true, "当前分析模型查询无数据"],//CHECK_DUPLICATE_LABEL_EXCEPTION
      /**
       * ==============================================
       * 业务错误码
       * 错误码按业务分段
       * ==============================================
       */
      //======================事件定义开始(1000-1200)========================
      [1001, false, "新增事件失败"],//CREATE_EVENT_ERROR
      [1002, false, "删除事件失败"],//DELETE_EVENT_ERROR
      [1003, false, "更新事件失败"],//UPDATE_EVENT_ERROR
      [1004, false, "查询事件失败"],//SELECT_EVENT_ERROR
      [1005, false, "新增事件属性失败"],//CREATE_EVENT_PROPS_ERROR
      [1006, false, "新增事件属性关联关系失败"],//CREATE_EVENTPROPS_RELATION_ERROR
      [1007, false, "新增事件对象失败"],//CREATE_EVENT_OBJECT_ERROR
      [1008, false, "查询事件属性失败"],//SELECT_EVENT_PROPS_ERROR
      [1009, false, "更新事件属性失败"],//UPDATE_EVENT_PROPS_ERROR
      [1010, false, "新增对象属性关联关系失败"],//CREATE_OBJECT_PRPOS_RELATION_ERROR
      [1011, false, "删除事件属性失败"],//DELETE_EVENTPROPS_ERROR
      [1012, false, "删除事件属性关联关系失败"],//DELETE_EVENTPROPSR_ELATION_ERROR
      [1013, false, "更新事件对象失败"],//UPDATE_OBJECT_ERROR
      [1014, false, "查询事件对象失败"],//SELECT_EVENTOBJECT_ERROR
      [1015, false, "查询的事件不存在"],//SELECT_EVENT_NOTFIND
      [1016, false, "查询事件对象属性失败"],//SELECT_EVENTOBJECT_PROPS_ERROR
      [1017, false, "查询事件和对象相关信息失败"],//SELECT_EVENTS_OBJECTS_PROPS_ERROR
      [1018, true, "属性名或者别名重复"],//HAS_DUPLICATE_ATTRIBUTE
      [1019, true, "对象名或者别名重复"],//HAS_DUPLICATE_OBJECT
      [1020, false, "系统默认的属性，不允许修改"],//OS_DEFAULT
      [1021, true, "对象名或者别名重复"],//HAS_DUPLICATE_OBJECT_ATTRIBUTE
      [1022, true, "事件名或者别名重复"],//HAS_DUPLICATE_EVENT_ATTRIBUTE
      [1023, false, "获取事件默认的属性发生错误"],//SELECT_DEFAULT_EVENT_PROPS_ERROR
      [1024, false, "获取对象默认的属性发生错误"],//SELECT_DEFAULT_OJECT_PROPS_ERROR
      [1025, true, "用户名或密码错误"],//LOGIN_PARAM_ERROR
      [1026, true, "用户名已存在"],//USER_NAME_DUPLICATE_ERROR
      [1027, false, "查询默认事件对象错误"],//SELECT_DEFAULT_OJECT_ERROR
      [1028, true, "邮箱已注册"],//EMAIL_DUPLICATE_ERROR
      [1029, true, "电话号码已注册"],//TEL_DUPLICATE_ERROR
      [1030, false, "系统默认属性，不允许删除"],//DELETE_DEFAULT_OJECT_ERROR
      [1031, false, "查询sdk信息错误"],//SELECT_SDK_ERROR
      [1032, false, "修改sdk信息错误"],//UPDATE_SDK_ERROR
      [1033, true, "重复的名称"],//CHECK_DUPLICATE_NAME_ERROR
      [1034, true, "重复的别名"],//CHECK_DUPLICATE_LABEL_ERROR
      [1035, false, "检查重名异常"]//CHECK_DUPLICATE_LABEL_EXCEPTION
      //======================事件定义结束========================
    ].forEach(function (code) {
      BusinessData.responseCodes[code[0] + ''] = {
        success: code[1],
        msg: code[2]
      };
    });
  }
})();

AppPage.ns('AppPage.BusinessData', BusinessData);

module.exports = AppPage.BusinessData;