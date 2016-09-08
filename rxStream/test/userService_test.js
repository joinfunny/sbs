process.env.ENV = 'test';
var should = require("should");
var app = require('../app');
var request = require('supertest')(app);

describe('services/userService.js', function () {
  function randomInit() {
    return (Math.random() * 10000).toFixed(0);
  }

  var createUser = function () {
    var key = new Date().getTime() + '_' + randomInit();
    var password = 'rmdTest';
    var user = {
      userName: 'rmdTest' + key,
      password: password,
      nickName: 'rmdTest' + key,
      email: 'rmdTest' + key + '@test.com',
      userAppellation: 'rmdTest' + key,
      tel: '15810929612'
    };
    return user;
  };

  describe('signup', function () {
    var user = createUser();
    it('注册必须post提交', function (done) {
      request.get('/services/user/signup')
        .send(user)
        .expect('Content-Type', /text/)
        .expect(302)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('/error');
          done();
        });
    });
    it('路由测试-非法服务地址过滤', function (done) {
      request.post('/services/user/signup/fdsaf?fdsafds')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('"success":false').and.containEql("Not authorized");
          done();
        });
    });
    it('用户名不能为空', function (done) {
      var user = createUser();
      user.userName = '';
      request.post('/services/user/signup')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('"success":false').and.containEql('用户名不能为空');
          done();
        });
    });
    it('密码不能为空', function (done) {
      var user = createUser();
      user.password = '';
      request.post('/services/user/signup')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('"success":false').and.containEql('密码不能为空');
          done();
        });
    });
    it('昵称不能为空', function (done) {
      var user = createUser();
      user.nickName = '';
      user.userAppellation = '';
      request.post('/services/user/signup')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('"success":false').and.containEql('昵称不能为空');
          done();
        });
    });
    it('邮箱不能为空', function (done) {
      var user = createUser();
      user.email = '';
      request.post('/services/user/signup')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('"success":false').and.containEql('邮箱不能为空');
          done();
        });
    });
    it('手机号码不能为空', function (done) {
      var user = createUser();
      user.tel = '';
      console.log(user);
      request.post('/services/user/signup')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('"success":false').and.containEql('手机号码不能为空');
          done();
        });
    });
    it('注册成功后返回JSON格式测试', function (done) {
      var user = createUser();
      request.post('/services/user/signup')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          var responseData = JSON.parse(res.text);
          responseData.should.have.properties('success', 'msg', 'dataObject');
          //responseData.dataObject.should.have.properties('id');
          //responseData.dataObject.appmetaList.should.be.an.Array();
          done();
        });
    });
  });
  describe('login', function () {
    var userName = '1111' + Math.random(1);
    var password = 'password';
    it('登录必须post提交', function (done) {
      request.get('/services/user/login')
        .send({
          userName: '',
          password: password
        })
        .expect('Content-Type', /text/)
        .expect(302)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.containEql('/error');
          done();
        });
    });
    it('用户名不能为空', function (done) {
      request.post('/services/user/login')
        .send({
          userName: '',
          password: password
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('"success":false').and.containEql("用户名不能为空");
          done();
        });
    });
    it('密码不能为空', function (done) {
      request.post('/services/user/login')
        .send({
          userName: '1111',
          password: ''
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('"success":false').and.containEql("密码不能为空");
          done();
        });
    });
    it('路由测试-非法服务地址过滤', function (done) {
      request.post('/services/user/login/fdsafdsa?fdsfdsa=1')
        .send({
          userName: '1111',
          password: 'fdsafsa'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('"success":false').and.containEql("Not authorized");
          done();
        });
    });
  });


});