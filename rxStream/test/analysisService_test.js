process.env.ENV = 'test';
var should = require("should");
var app = require('../app');
var request = require('supertest').agent(app);
var analysisId;

describe('test-------services/analysisService.js', function () {
  before(function (done) {
    request.post('/services/user/login')
      .send({
        userName: 'jiangfeng',
        password: 'jiangfeng'
      })
      .end(function (err, res) {
        done();
      });
  });

  it('获取所有的分析类型--返回数据格式正确', function (done) {
    request.get('/services/analysis/getAnalysisTypes')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        responseData.should.have.properties('success', 'msg', 'dataObject');
        responseData.dataObject.should.be.an.Array();
        done();
      });
  });

  it('新增行为分析数据格式测试--FORM-DATA必须包含analysisObject属性', function (done) {
    request.post('/services/analysis/saveAnalysis?appId=19')
      .send({
        "data": JSON.stringify({
          // 分析类型
          "type": 1,
          // 分析模型注解
          "comment": "本周",
          // 分析模型的名称
          "name": "任意事件的总次数；按天、按总体查看",
          // 分析模型数据对象反序列化后的字符串
          "file": "{\"requestData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"operation\":\"general\"}],\"unit\":\"day\",\"groupFields\":[]},\"requestZhData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"actionName_zh\":\"任意事件\",\"operation\":\"general\",\"operation_zh\":\"总次数\"}],\"unit\":\"day\",\"unit_zh\":\"天\",\"groupFields\":[],\"groupFields_zh\":[],\"hasEmptyValueFilterCondition\":false},\"isCompare\":false,\"analysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"autoAnalysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"currentChart\":\"bar\"}"
        })
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg', 'dataObject');
        responseData.should.have.property('success', false);
        responseData.msg.should.containEql('必须包含analysisObject属性');
        done();
      });
  });
  it('新增行为分析数据格式测试--FORM-DATA的analysisObject属性必须包含name,comment,type,file属性', function (done) {
    request.post('/services/analysis/saveAnalysis?appId=19')
      .send({
        "analysisObject": JSON.stringify({
          // 分析类型
          //"type": 1,
          // 分析模型注解
          "comment": "本周",
          // 分析模型的名称
          "name": "任意事件的总次数；按天、按总体查看",
          // 分析模型数据对象反序列化后的字符串
          "file": "{\"requestData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"operation\":\"general\"}],\"unit\":\"day\",\"groupFields\":[]},\"requestZhData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"actionName_zh\":\"任意事件\",\"operation\":\"general\",\"operation_zh\":\"总次数\"}],\"unit\":\"day\",\"unit_zh\":\"天\",\"groupFields\":[],\"groupFields_zh\":[],\"hasEmptyValueFilterCondition\":false},\"isCompare\":false,\"analysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"autoAnalysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"currentChart\":\"bar\"}"
        })
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg', 'dataObject');
        responseData.should.have.property('success', false);
        console.log(responseData.msg);
        responseData.msg.should.containEql('保存分析模型时的FORM-DATA必须为JSON格式数据');
        done();
      });
  });
  it('新增行为分析数据格式测试--添加成功后返回数据格式正确', function (done) {
    request.post('/services/analysis/saveAnalysis?appId=19')
      .send({
        "analysisObject": JSON.stringify({
          // 分析类型
          "type": 1,
          // 分析模型注解
          "comment": "本周",
          // 分析模型的名称
          "name": "任意事件的总次数；按天、按总体查看",
          // 分析模型数据对象反序列化后的字符串
          "file": "{\"requestData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"operation\":\"general\"}],\"unit\":\"day\",\"groupFields\":[]},\"requestZhData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"actionName_zh\":\"任意事件\",\"operation\":\"general\",\"operation_zh\":\"总次数\"}],\"unit\":\"day\",\"unit_zh\":\"天\",\"groupFields\":[],\"groupFields_zh\":[],\"hasEmptyValueFilterCondition\":false},\"isCompare\":false,\"analysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"autoAnalysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"currentChart\":\"bar\"}"
        })
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg', 'dataObject');
        responseData.should.have.property('success', true);
        responseData.dataObject.should.have.properties('id', 'name', 'file', 'type', 'comment');
        done();
      });
  });


  it('更新行为分析数据格式测试', function (done) {
    request.post('/services/analysis/saveAnalysis?appId=19')
      .send({
        "analysisObject": JSON.stringify({
          "id": 20,
          // 分析类型的id
          "appId": 1,
          // 分析类型
          "type": 1,
          // 分析模型注解
          "comment": "本周",
          // 分析模型的名称
          "name": "任意事件的总次数；按天、按总体查看",
          // 分析模型数据对象反序列化后的字符串
          "file": "{\"requestData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"operation\":\"general\"}],\"unit\":\"day\",\"groupFields\":[]},\"requestZhData\":{\"dateRangeType\":\"thisWeek\",\"dateRangeText\":\"本周\",\"startDate\":\"2016-07-04\",\"endDate\":\"2016-07-05\",\"actions\":[{\"actionName\":\"*\",\"actionName_zh\":\"任意事件\",\"operation\":\"general\",\"operation_zh\":\"总次数\"}],\"unit\":\"day\",\"unit_zh\":\"天\",\"groupFields\":[],\"groupFields_zh\":[],\"hasEmptyValueFilterCondition\":false},\"isCompare\":false,\"analysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"autoAnalysisTitle\":\"任意事件的总次数；按天、按总体查看\",\"currentChart\":\"bar\"}"
        })
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg', 'dataObject');
        responseData.should.have.property('success', true);
        responseData.dataObject.should.have.property('id');
        done();
      });
  });

  it('删除行为分析测试--要删除的id不能为空,', function (done) {
    request.post('/services/analysis/delete/')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg');
        responseData.msg.should.containEql('删除分析模型时传参丢失')
        done();
      });
  });
  it('删除行为分析测试--返回必须包含success属性,', function (done) {
    request.post('/services/analysis/delete?id=1&appId=19')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg');
        done();
      });
  });


  it('获取指定ID的行为分析数据--必须传id', function (done) {
    request.get('/services/analysis/get')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg');
        responseData.should.have.property('success', false);
        console.log(responseData);
        responseData.msg.should.containEql('获取分析模型数据时传参丢失');
        done();
      });
  });

  it('获取指定ID的行为分析数据--返回必须包含name,comment,type,file属性', function (done) {
    request.get('/services/analysis/get?id=1&appId=19')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg', 'dataObject');
        if (responseData.dataObject) {
          responseData.dataObject.should.have.properties('name', 'comment', 'type', 'file');
        }
        done();
      });
  });

  it('获取分析列表数据--必须传递appId', function (done) {
    request.get('/services/analysis/list')
      .query({ appId: 15 })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg');
        responseData.should.have.property('success', true);
        responseData.dataObject.should.be.Array();
        done();
      });
  });
  it('获取dimensions--需要传递三个参数：appid,fieldName,showCount', function (done) {
    request.get('/services/metadata/dimension')
      .query({ appId: 15, fieldName: 'a', showCount: 10 })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        var responseData = JSON.parse(res.text);
        console.log(responseData);
        responseData.should.have.properties('success', 'msg','dataObject');
        responseData.should.have.property('success', true);
        responseData.dataObject.should.be.Array();
        done();
      });
  });

  after(function () {
    process.exit();
  });
});