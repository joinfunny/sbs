var AppPage = require('../AppPage');
var MSG = {
    APPID_LOSE: 'appId参数丢失',
    ANALYSIS_TYPE_LOSE: 'analysisType参数丢失，参数名为type',
    ANALYSIS_UPDATE_FORMAT_ERROR: '保存分析模型时的FORM-DATA必须为JSON格式数据.',
    ANALYSIS_DEL_ID_LOSE: '删除分析模型时传参丢失',
    ANALYSIS_GET_ID_LOSE: '获取分析模型数据时传参丢失',
    OVERVIEW_UPDATE_FORMAT_ERROR: '保存概览数据时的FORM-DATA必须为JSON格式数据.',
    OVERVIEW_DEL_ID_LOSE: '删除概览数据时传参丢失',
    OVERVIEW_GET_ID_LOSE: '获取概览数据数据时传参丢失',
    METADATA_GET_FIELD_LOSE:'获取dimension时fieldName参数丢失',
    METADATA_GET_COUNT_LOSE:'获取dimension时shouCount参数丢失'
};
AppPage.ns('AppPage.MSG', MSG);
module.exports = AppPage.MSG;