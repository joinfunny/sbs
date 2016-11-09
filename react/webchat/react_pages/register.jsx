'use strict';

var React = require('react');
var SmartInputComponent = require('../react_components/smart_input.jsx');
var SmsBtnComponent = require('../react_components/sms_btn.jsx');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
        }
    },
    getInitialState: function() {
        return {
            // 手机号
            phone: '',
            // 手机验证码
            vcode: '',
            // 密码
            password: '',
            // 重复密码
            repassword: ''
        }
    },
    componentDidMount: function() {
        var app = kzApp;

        this.model = app.Models.User.singleton();
    },
    submit: function() {
        var state = this.state;
        var app = this.props.app;
        var view = this;

        if(!state.phone || !state.vcode || !state.password || !state.repassword) {
            this.refs.btn.reset();
            return app.tips('请填写完整表单！');
        }

        if(state.password != state.repassword) {
            this.refs.btn.reset();
            return app.tips('两次输入密码不一致！');
        }

        this.model.register(state).then(function() {
            return app.tips('注册成功！');
        }).then(function() {
            app.navigate('/');
        }).fail(function() {
            view.refs.btn.reset();
        });
    },
    render: function() {
        return (
<div className="p_register p_full hasfixednavigation">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">注册</div>
                </div>
                <div className="right">
                </div>
            </div>
        </div>
    </div>
    <div className="w_uc_form">
        <SmartInputComponent placeholder="手机号" className="row" onChange={(value) => {this.setState({phone: value})}} />
        <label className="row box">
            <SmartInputComponent placeholder="验证码" className="row flex" onChange={(value) => {this.setState({vcode: value})}}/>
            <SmsBtnComponent className="vcode" phone={this.state.phone} app={this.props.app} />
        </label>
        <SmartInputComponent type="password" placeholder="输入密码" className="row" onChange={(value) => {this.setState({password: value})}}/>
        <SmartInputComponent type="password" placeholder="确认密码" className="row" onChange={(value) => {this.setState({repassword: value})}}/>
        <div className="row">
            <ToggleBtnComponent ref="btn" className="btn btn_login" onClick={this.submit} text="注册" />
        </div>
    </div>
    <div className="tips mt20">
        点击“注册”按钮，表示同意<a href="http://passport.kezhanwang.cn/html/reg_pc/reg.html">《课栈网用户注册协议》</a>
    </div>
</div>
        )
    }
});

module.exports = Page;