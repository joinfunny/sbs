'use strict';

var React = require('react');
var FooterComponent = require('../react_components/footer.jsx');
var SmartInputComponent = require('../react_components/smart_input.jsx');
var OAuthComponent = require('../react_components/oauth.jsx');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            value: '',
            query: {}
        }
    },
    getInitialState: function() {
        return {
            username: '',
            password: ''
        }
    },
    componentDidMount: function() {
        var app = this.props.app;

        this.model = app.Models.User.singleton();
    },
    onSubmit: function(e) {
        var view = this;
        var state = this.state;
        var app = this.props.app;

        if(!state.username) {
            view.refs.btn.reset();
            return alert('请输入手机号/邮箱！');
        }
        if(!state.password) {
            view.refs.btn.reset();
            return alert('请输入密码！');
        }

        this.model.login(state.username, state.password).done(function() {
            var url = decodeURIComponent(view.props.query.jumpurl || '/');
            var a = document.createElement('a');
            a.href = url;
            // 域名相同，站内跳转
            if(a.hostname == location.host) { 
                app.navigate(a.pathname + a.search, {replace: true});
            } else { // 外站跳转
                location.href = url;
            }
        }).fail(function() {
            view.refs.btn.reset();
        });
    },
    setUsername: function(username) {
        this.setState({
            username: username
        });
    },
    setPassword: function(password) {
        this.setState({
            password: password
        });
    },
    render: function() {
        var props = this.props;

        return (
<div className="p_login p_full hasfixednavigation hasauth">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">登录</div>
                </div>
                <a href="/register" className="right ps">
                    注册
                </a>
            </div>
        </div>
    </div>
    <form>
        <div>
            <div className="logo"></div>
            <div className="subtitle">
                欢迎来到课栈网<br/>
                一个账号让您轻松找到理想学校
            </div>
            <div className="w_uc_form login_form">
                <SmartInputComponent placeholder="手机号/邮箱" className="row" onChange={this.setUsername} />
                <SmartInputComponent placeholder="密码" className="row" type="password" onChange={this.setPassword} />
                <div className="row">
                    <ToggleBtnComponent ref="btn" className="btn btn_login" onClick={this.onSubmit} text="登录" />
                </div>
            </div>

            <div className="tx_c mt60">
                <a href="/forget" className="link ps">忘记密码?</a>
            </div>
        </div>
    </form>
    <OAuthComponent userAgent={this.props.userAgent} jumpurl={this.props.query.jumpurl} />
</div>
        )
    }
});

module.exports = Page;