 require("should");
 var app = require('../index');

 var HttpClient = require('../runtime/httpClient');

 var httpClient;

 describe('HttpClient', function() {
   describe('new HttpClient', function() {
     it('HttpClient实例对象必须传参：res,req,urlPath', function() {
       (function() {
         httpClient = new HttpClient({

         });
       }).should.throw(/^不符合预期的传参/);
       httpClient = new HttpClient({
         req: {},
         res: {},
         urlPath: "/services/test"
       });
       httpClient.should.have.properties('res', 'req', 'urlPath');
     });
   });
   describe('#send', function() {
     it('HttpClient实例对象必须传参：res,req,urlPath', function() {
       (function() {
         httpClient = new HttpClient({

         });
       }).should.throw(/^不符合预期的传参/);
       httpClient = new HttpClient({
         req: {},
         res: {},
         urlPath: "/services/test"
       });
       httpClient.should.have.properties('res', 'req', 'urlPath');
     });
   });
 });