'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var SmartInputComponent = require('./smart_input.jsx');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var SmsBtnComponent = require('../react_components/sms_btn.jsx');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            hide: () => {}
        }
    },
    getInitialState: function() {
        return {
            name: '',
            phone: '',
            vcode: ''
        }
    },
    submit: function() {
        var state = this.state;

        if(!state.name || !state.phone || !state.vcode) {
            kzApp.tips('请输入完整表单！').then(() => {
                this.refs.btn.reset();
            });
            return false;
        }

        var course = new kzApp.Models.Course(this.props.data);

        course.listenApply(state.name, state.phone, state.vcode).then(() => {
            kzApp.tips('报名成功！').then(() => {
                this.props.hide();    
            });
        }, () => {
            this.refs.btn.reset();
        });
    },
    componentDidMount: function() {
        $(window).on('resize.course_listen', () => {
            this.fixedToCenter();
        });
        $(window).on('touchmove.course_listen', function() {
            return false;
        });
        this.fixedToCenter();
    },
    componentWillUnmount: function() {
        $(window).off('resize.course_listen');
        $(window).off('touchmove.course_listen');
    },
    fixedToCenter: function() {
        var el = $(ReactDOM.findDOMNode(this));

        el = $(el);
        var box = el.find('.baoming_normal');

        box.css('top', $(window).scrollTop() + $(window).height()/2 + 'px');
    },
    render: function() {
        var state = this.state;
        var props = this.props;

        return (
<div className="st_wrapper">
    <div className="mask" onClick={()=>{props.hide()}}>
    </div>
    <div className="baoming_normal">
        <div className="title">
            预约试听
        </div>
        <div className="inner">
            <div className="input_area">
                <SmartInputComponent className="line dis_b" placeholder="输入姓名" onChange={(value) => {this.setState({name: value})}} />
                <SmartInputComponent className="line dis_b" placeholder="输入手机号" onChange={(value) => {this.setState({phone: value})}} />
                <div className="line dis_box">
                    <SmartInputComponent className="pos_rel dis_b" placeholder="输入验证码" onChange={(value) => {this.setState({vcode: value})}} />
                    <SmsBtnComponent phone={state.phone} className="retry" />
                </div>
            </div>
            <ToggleBtnComponent ref="btn" className="submit" onClick={this.submit}>我要提交</ToggleBtnComponent>
        </div>
    </div>
</div>
        )
    }
});

module.exports = Component;