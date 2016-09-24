/**
 * @author jiangfeng
 * @summary SDK基础配置
 */
module.exports = {
    LIB_VERSION: '1.1.0',//SDK版本
    LIB_KEY: 'RXSTREAM201607',//与SDK安装时的Key对应
    sendLimit: 10,//发送限制，多于当前设置条数，就会发送事件
    crossSubDomain: true,//是否跨域
    loadTime: new Date(),//SDK加载时间
    apiHost: 'https://fenxi.ruixuesoft.com',
    appId: 35
};
