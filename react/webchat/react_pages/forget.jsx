'use strict';

var React = require('react');
var FooterComponent = require('../react_components/footer.jsx');
var SmartInputComponent = require('../react_components/smart_input.jsx');
var SmsBtnComponent = require('../react_components/sms_btn.jsx');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
        }
    },
    getInitialState: function() {
        return {
            step: 1,
            phone: '',
            vcode: '',
            password: '',
            repassword: ''
        }
    },
    componentDidMount: function() {
        var app = this.props.app;
        this.model = app.Models.User.singleton();
    },
    // 校验信息
    verify: function() {
        var view = this;
        var state = this.state;
        var app = this.props.app;

        if(!state.phone || !state.vcode) {
            this.refs.verify_btn.reset();
            return app.tips('请输入完整表单！');
        }
        view.setState({
            step: 2
        });
    },
    // 完成修改
    modify: function() {
        var view = this;
        var state = this.state;
        var app = this.props.app;

        if(!state.password || !state.repassword) {
            this.refs.done_btn.reset();
            return app.tips('请输入完整表单！');
        }

        if(state.password != state.repassword) {
            this.refs.done_btn.reset();
            return app.tips('两次输入密码不一致！');
        }
        this.model.resetPwd(state.phone, state.vcode, state.password, state.repassword).then(function() {
            return app.tips('修改成功！');
        }).then(function() {
            history.go(-1);
        }).fail(function() {
            view.refs.done_btn.reset();
        });
    },
    render: function() {
        var state = this.state;

        return (
<div className="p_login p_full hasfixednavigation">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">找回密码</div>
                </div>
                <div className="right"></div>
            </div>
        </div>
    </div>
    <div className="p_forget">
        <div className="w_uc_form" style={{display: state.step == 1 ? '': 'none'}}>
            <SmartInputComponent placeholder="请输入注册时的手机号/邮箱" className="row" onChange={(value) => {this.setState({phone: value})}} />
            <label className="row box">
                <SmartInputComponent placeholder="验证码" className="row flex" onChange={(value) => {this.setState({vcode: value})}}/>
                <SmsBtnComponent className="vcode" phone={this.state.phone} app={this.props.app} />
            </label>
            <div className="row">
                <ToggleBtnComponent ref="verify_btn" className="btn btn_login" onClick={this.verify} text="下一步" />
            </div>
        </div>
        <div className="w_uc_form" style={{display: state.step == 2 ? '': 'none'}}>
            <SmartInputComponent type="password" placeholder="请输入新密码" className="row" onChange={(value) => {this.setState({password: value})}} />
            <SmartInputComponent type="password" placeholder="请确认密码" className="row" onChange={(value) => {this.setState({repassword: value})}} />
            <div className="row">
                <ToggleBtnComponent ref="done_btn" className="btn btn_login" onClick={this.modify} text="完成" />
            </div>
        </div>
    </div>
</div>
        )
    }
});

module.exports = Page;