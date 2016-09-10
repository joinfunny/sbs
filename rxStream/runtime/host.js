module.exports = {
    // dev 开发环境
    // test 测试环境
    // release 上线环境
    dev: {
        rootUrl: 'http://localhost',
        appPort: '9090',
        dbAddress: '172.16.13.219',
        dbPort: 6379,
        //客户端请求地址
        apiHost: '',
        //matric服务请求地址
        metricHost: 'http://10.200.32.25:8080',
        //node调用请求地址
        remoteHost: 'http://10.200.32.25:8080',
        //客户端分析服务请求地址
        analysisRemoteHost: 'http://10.200.32.35:9051',
        //SDK发布地址
        sdkUrl: 'http://stream-sass.cssrv.dataengine.com/sdk/rxStream.js',
        //sdk授权服务地址
        sdkServerUrl: 'http://streamcollector.cssrv.dataengine.com',
        //Stream系统接入的AppId。
        appId: 49
    },
    test: {
        rootUrl: 'http://localhost',
        appPort: '9091',
        dbAddress: '172.16.13.219',
        dbPort: 6379,
        //客户端请求地址
        apiHost: '',
        //matric服务请求地址
        metricHost: 'http://10.200.32.25:8080',
        //node调用请求地址
        remoteHost: 'http://10.200.32.25:8080',
        //客户端分析服务请求地址
        analysisRemoteHost: 'http://10.200.32.35:9051',
        //SDK发布地址
        sdkUrl: 'https://basweb.rc.dataengine.com/sdk/rxStream.js',
        //sdk授权服务地址
        sdkServerUrl: 'https://basauthorize.rc.dataengine.com/bassass/app/{{appid}}/authorize/',
        //Stream系统接入的AppId。
        appId: 'b208341bb36ac690007de153f484a5ea20160721180050973'
    },
    release: {
        rootUrl: 'http://stream.ruixuesoft.com',
        appPort: '9090',
        dbAddress: '127.0.0.1',
        apiHost: 'https://stream.basconfig.rc.dataengine.com',
        metricHost: 'https://stream.basmetric.rc.dataengine.com',
        remoteHost: 'https://stream.basconfig.rc.dataengine.com',
        analysisRemoteHost: 'https://stream.basapi.rc.dataengine.com',
        sdkUrl: 'https://stream.ruixuesoft.com/sdk/rxStream.js',
        sdkServerUrl: 'https://stream.basauthorize.rc.dataengine.com/bassass/app/{{appid}}/authorize/',
        appId: 'b208341bb36ac690007de153f484a5ea20160721124931895'
    }
};