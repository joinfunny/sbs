define([
    'AppPage'
], function (AppPage) {
    var commonObj = {
        configData: null,
        /**
         * 应用设置
         * @return promise
         */
        submitSchema: function () {
            var that = this,
                appId = localStorage['bas_appId'];
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/schema/resubmit',
                method: 'post',
                data: {
                    appId: appId
                }
            });
        },
        /**
         * 加载所有事件类型的所有属性（包含维度属性和指标属性）
         * @return promise
         */
        loadEventTypeProperties: function () {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/getAllFields',
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    data.dataObject = data.dataObject || [];
                    return data.dataObject;
                } else {
                    Materialize.toast('事件属性集加载失败.', 3000, 'warning');
                }
            });
        },
        /**
         * 加载所有事件对像的所有属性
         * @return promise
         */
        loadObjectProperties: function () {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/getAllFields',
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    data.dataObject = data.dataObject || [];
                    return data.dataObject;
                } else {
                    Materialize.toast('事件属性集加载失败.', 3000, 'warning');
                }
            });
        },
        /**
         * 获取所有的事件类型
         * @return promise
         */
        loadEventTypes: function () {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/getAllEventType',
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data.dataObject || [];
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 新增事件类型
         * @return promise 返回值中需要返回操作完毕的事件信息，以方便做客户端同步处理
         */
        addEventType: function (data) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/addEvent',
                method: 'post',
                data: {data: JSON.stringify(data)}
            }).then(function (res) {
                if (res.success) {
                    return res;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                }
            });
        },
        /**
         * 更新事件
         * @return promise 返回值中需要返回操作完毕的事件信息，以方便做客户端同步处理
         */
        updateEventType: function (data) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/updateEvent',
                method: 'post',
                data: {data: JSON.stringify(data)}
            }).then(function (res) {
                if (res.success) {
                    return res;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                }
            });
        },
        /**
         * 保存事件类型
         * @return promise 返回值中需要返回操作完毕的事件信息，以方便做客户端同步处理
         */
        saveEventType: function (eventType) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/saveSingleEvent',
                method: 'post',
                data: eventType
            });
        },

        /**
         * 保存事件类型
         * eventType中存在id则为更新，不存在则为新增。
         * @return promise 返回值中需要返回操作完毕的事件信息，以方便做客户端同步处理
         */
        changeEventTypeVisible: function (eventType) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/saveEventBase',
                method: 'post',
                data: eventType
            });
        },
        /**
         * 获取所有的事件对像列表
         * @return promise
         */
        loadEventObjectList: function () {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/list',
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data.dataObject || [];
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 获取单个事件对像
         * @return promise
         */
        getObjectById: function (id) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/getObject?objectId=' + id,
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 新增事件对像
         * @return promise
         */
        addEventObjectAjax: function (reqData) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/addObject',
                method: 'post',
                data: {data: JSON.stringify(reqData)}
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },

        /**
         * 更新事件对像
         * @return promise
         */
        updateEventObjectAjax: function (reqData) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/updateObject',
                method: 'post',
                data: {data: JSON.stringify(reqData)}
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 获取事件的默认属性
         * @return promise
         */
        getEventDefaultProperty: function () {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/getDefaultProperty',
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 获取默认对像
         * @return promise
         */
        getObjectDefault: function () {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/defaultObject',
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data.data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 获取事件的属性
         * @param id
         * @return promise
         */
        getEventProperty: function (id) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/getPropertyById?eventId=' + id,
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 获取单个事件的信息
         * @param id
         * @return promise
         */
        getEventInfoById: function (id) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/getEventInfoById?eventId=' + id,
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 更新单个事件的属性
         * @param id
         * @param reqData
         * @return promise
         */
        updateEventProperty: function (id, reqData) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventObject/updateEventProperty?eventId=' + id,
                method: 'post',
                data: {data: JSON.stringify(reqData)}
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 删除事件
         * @param id
         * @return promise
         */
        deleteEventById: function (id) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/deleteEventById?eventId=' + id,
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 删除事件属性
         * @param eventId
         * @param propId
         * @return promise
         */
        deleteEventProp: function (eventId, propId) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/customEvent/deleteProperty?eventId=' + eventId + '&propId=' + propId,
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        /**
         * 删除对象属性
         * @param objectId
         * @param propId
         * @return promise
         */
        deleteObjectProp: function (objectId, propId) {
            var that = this;
            return AppPage.loadApi({
                url: __api_path + '/services/eventobjects/deleteProperty?objectId=' + objectId + '&propId=' + propId,
                method: 'get'
            }).then(function (data) {
                if (data.success) {
                    return data;
                } else {
                    Materialize.toast('数据请求失败', 3000, 'warning');
                    return null;
                }
            });
        },
        defaultUserRows: [{
            name: 'u_dollar_name',
            alias: '用户名',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'u_dollar_signup_time',
            alias: '注册时间',
            unit: '',
            size: 30,
            dataType: 'DATE',
            filterMode: 'input',
            visible: true
        }, {
            name: 'u_dollar_province',
            alias: '省份',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'u_dollar_city',
            alias: '城市',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }],
        defaultEventRows: [{
            name: 'event',
            alias: '事件类型',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_os_version',
            alias: '操作系统版本',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_city',
            alias: '城市',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_model',
            alias: '设备型号',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_os',
            alias: '操作系统',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_screen_width',
            alias: '屏幕宽度',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_wifi',
            alias: '是否wifi',
            unit: '',
            size: 5,
            dataType: 'BOOLEAN',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_screen_height',
            alias: '屏幕高度',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_app_version',
            alias: '应用版本',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_manufacturer',
            alias: '设备制造商',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_country',
            alias: '国家',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_ip',
            alias: 'ip地址',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }, {
            name: 'b_dollar_province',
            alias: '省份',
            unit: '',
            size: 100,
            dataType: 'STRING',
            filterMode: 'input',
            visible: true
        }],
        unitData: [{
            "text": "元",
            "value": "元"
        }, {
            "text": "个",
            "value": "个"
        }, {
            "text": "人",
            "value": "人"
        }, {
            "text": "次",
            "value": "次"
        }],
        dataTypeData: [{
            value: 'STRING',
            text: '文本'
        }, {
            value: 'DATE',
            text: '时间'
        }, {
            value: 'BOOLEAN',
            text: '布尔值'
        }],
        dataTypeIndexData: [{
            value: 'DOUBLE',
            text: '数值'
        }],
        dataTypeMaxLen: {
            STRING: 10000,
            INTEGER: 20,
            LONG: 20,
            BOOLEAN: 5,
            DOUBLE: 30,
            DATE: 30
        },
        filterModeData: [{
            "text": "输入",
            "value": 1
        }, {
            "text": "单选",
            "value": 2
        }, {
            "text": "多选",
            "value": 3
        }, {
            "text": "可输入单选",
            "value": 4
        }, {
            "text": "可输入多选",
            "value": 5
        }],
        /*filterModeData: [{
         "text": "输入",
         "value": "input"
         }, {
         "text": "单选",
         "value": "select-one"
         }, {
         "text": "多选",
         "value": "select-multiple"
         }, {
         "text": "可输入单选",
         "value": "input-select-one"
         }, {
         "text": "可输入多选",
         "value": "input-select-multiple"
         }],*/
        unitFormatter: function (value, row, index) {
            var commonObj = TabController.CommonObj;
            var unitItem = _.find(commonObj.unitData, function (unit) {
                return unit.value == value;
            });
            return unitItem ? unitItem.text : '';
        },
        dataTypeFormatter: function (value, row, index) {
            var commonObj = TabController.CommonObj;
            var datatypeItem = _.find(commonObj.dataTypeData, function (dataType) {
                return dataType.value == value;
            });
            return datatypeItem ? datatypeItem.text : '';
        },
        filterModeFormatter: function (value, row, index) {
            var commonObj = TabController.CommonObj;
            var filterModeItem = _.find(commonObj.filterModeData, function (filterMode) {
                return filterMode.value == value;
            });
            return filterModeItem ? filterModeItem.text : '';
        }
    };
    commonObj.getEventDefaultProperty().then(function (data) {
        if (data) {
            commonObj.defaultEventProperty = data.data;
        }
    });
    commonObj.getObjectDefault().then(function (data) {
        if (data) {
            commonObj.defaultObject = data;
        }
    });
    return commonObj;
});