'use strict';

var MController = require('../components/mcontroller.js');
var Page = require('../../react_pages/school_allcourse.jsx');
var React = require('react');
var ReactDom = require('react-dom/server');

class SchoolAllCourseController extends MController {
    getQuery() {
        this.params.id = this.params.sid;
        var promise = Promise.resolve(this.params);

        return promise;
    }

    getData() {
        var view = this;
        var promise = Promise.all([
            this.fetch(':8478/services/product/list/0-0-0-'+view.params.sid+'--0-0-0-0-0-0-0-0-0-1-200', {isJava: true}),   //学校课程
            this.fetch(':8478/services/organize/info/'+view.params.sid+'-0', {isJava: true})  // 学校详情
        ]).then(function(result) {
            var allcourses = result[0];
            var schoolInfo = result[1];
            var base = schoolInfo;
            allcourses.result.map(function(course) {
                delete course.desp;
                delete course.old_desp;
            });

            var data = {
                allcourses: allcourses.result,
                schoolInfo: {
                    name: base.organame,
                    short_desp: schoolInfo.short_desp
                }
            };
            return data;
        });

        return promise;
    }

    render(data) {
        this.component = React.createElement(Page, {data: data});

        return ReactDom.renderToString(this.component);
    }
}

module.exports = SchoolAllCourseController;

