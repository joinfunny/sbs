'use strict';

var React = require('react');
var SmartInputComponent = require('../react_components/smart_input.jsx');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {}
        }
    },
    getInitialState: function() {
        return {
            password: '',
            newpassword: '',
            renewpassword: ''
        }
    },
    componentDidMount: function() {
        var app = this.props.app;
        this.model = app.Models.User.singleton();
    },
    modify: function() {
        var state = this.state;
        var view = this;
        var app = this.props.app;

        if(!state.password || !state.newpassword || !state.renewpassword) {
            this.refs.btn.reset();
            return app.tips('请输入完整表单！');
        }

        if(state.newpassword != state.renewpassword) {
            this.refs.btn.reset();
            return app.tips('两次输入密码不一致！');
        }

        if(state.password == state.newpassword) {
            this.refs.btn.reset();
            return app.tips('原密码和新密码不能一样！');
        }

        if(/^\s*$/.test(state.newpassword)) {
            this.refs.btn.reset();
            return app.tips('新密码格式错误！');
        }

        this.model.changePwd(state.password, state.newpassword, state.renewpassword).then(function() {
            return view.props.app.tips('修改成功！请重新登录！');
        }).then(function() {
            return view.model.logout();
        }).then(function() {
            window.location.href='/usercenter/info';
        }).fail(function() {
            view.refs.btn.reset();
        });
    },
    render: function() {
        var user = this.state.user;

        return (
<div className="p_login p_full hasfixednavigation">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">修改密码</div>
                </div>
                <div className="right"></div>
            </div>
        </div>
    </div>

    <div className="p_forget">
        <div className="w_uc_form">
            <SmartInputComponent type="password" placeholder="请输入旧密码" className="row" onChange={(value) => {this.setState({password: value})}} />
            <SmartInputComponent type="password" placeholder="请输入新密码" className="row" onChange={(value) => {this.setState({newpassword: value})}} />
            <SmartInputComponent type="password" placeholder="请确认新密码" className="row" onChange={(value) => {this.setState({renewpassword: value})}} />        
            <div className="row">
                <ToggleBtnComponent ref="btn" className="btn btn_login" onClick={this.modify} text="修改" />
            </div>
        </div>
    </div>
</div>
        )
    }
});


module.exports = Page;