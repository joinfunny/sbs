'use strict';

var React = require('react');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {},
            query: {},
            cookie: ''
        }
    },
    getInitialState: function() {
        var cookies = this.props.cookie.split(/\s*;\s*/);
        var isWxLogin = false;

        for(var i in cookies) {
            if(cookies[i].indexOf('atoken=') != -1) {
                isWxLogin = true;
            } 
        }

        return {
            user: this.props.user || this.props.app.Models.User.singleton().toJSON(),
            isWxLogin: isWxLogin
        }
    },
    changename: function() {
        var app = this.props.app;
        app.navigate('/usercenter/resetname');
    },
    showsex: function() {
        $(this.refs.bg).eq(0).show();
        $(this.refs.digole).eq(0).show();
    },
    chooseMan: function() {
        var view = this;
        this.user.resetInfo(this.state.user.username, 1).then(function() {
            $(view.refs.sex).eq(0).html("男");
            view.close();
        });
    },
    chooseWomen: function() {
        var view = this;
        this.user.resetInfo(this.state.user.username, 2).then(function() {
            $(view.refs.sex).eq(0).html("女");
            view.close();
        });
    },
    setPhone: function() {
        var app = this.props.app;
        app.navigate('/usercenter/resetphone');
    },
    regPhone: function() {
        var app = this.props.app;
        app.navigate('/usercenter/resetphone/step1');
    },
    close: function() {
        $(this.refs.bg).eq(0).hide();
        $(this.refs.digole).eq(0).hide();
    },
    componentDidMount: function() {
        var app = this.props.app;
        this.user = app.Models.User.singleton();
    },
    render: function() {
        var user = this.state.user;
        var isWxLogin = this.state.isWxLogin;
        var gender;
        var registtime = new Date(parseInt(user.registtime)).toLocaleString().split(' ')[0]
        if(user.gender == 1) {
            gender = "男";
        }else if(user.gender == 2){
            gender = "女";
        }else {
            gender = "保密";
        }
        return (

<div className="p_uc hasfixednavigation p_full p_userinfo">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center">
                    <div className="title">个人资料</div>
                </div>
                <div className="right">
                    
                </div>
            </div>
        </div>
    </div>
    <ul className="w_cell_list">
        <li className="w_cell_field">
            <div className="line">
                <dt>头像</dt>
                <dd>
                    <img className="avatar" src={user.header_pic} />
                </dd>
            </div>
            <div className="line" onClick={this.changename}>
                
                <dt>昵称</dt>
                <dd>
                    <span>{user.username}</span>
                    <b className="icon icon_arr_right"></b>
                </dd>
                
            </div>
            <div className="line" onClick={this.showsex}>
                <dt>性别</dt>
                <dd>
                    <span ref="sex">{gender}</span>
                    <b className="icon icon_arr_right"></b>
                </dd>
            </div>
            <div className="line">
                <dt>注册时间</dt>
                <dd>
                    <span>{registtime || ''}</span>
                </dd>
            </div>
        </li>
    </ul>

    <div className="cell_name">
        账号绑定
    </div>
    <ul className="w_cell_list">
        <li className="w_cell_field">
        
            {user.mobile ? <div className="line" onClick={this.regPhone}>
                <dt>手机号</dt>
                <dd>
                    <span>{user.mobile}</span>
                    <b className="icon icon_arr_right"></b>
                </dd>
            </div> : <div className="line" onClick={this.setPhone}>
                <dt>手机号</dt>
                <dd>
                    <span>未绑定</span>
                    <b className="icon icon_arr_right"></b>
                    
                </dd>
            </div>}


            <div className="line">
                <dt>微信</dt>
                <dd>
                    <span>{user.bindWX ? '已绑定' : '未绑定'}</span>
                </dd>
            </div>
            {user.mail ? (<div className="line">
                <dt>邮箱</dt>
                <dd>
                    <span>{user.mail ? user.mail : '未绑定'}</span>
                    
                </dd>
            </div>) : ''}
        </li>
    </ul>
    {!isWxLogin ? (
    <div className="cell_name">
        安全设置
    </div>
    ):''}

    {!isWxLogin ? (
    <ul className="w_cell_list">
        <li className="w_cell_field">
            <a href="/usercenter/modifypassword" className="ps">
            <div className="line">
                <dt>登录密码</dt>
                <dd>
                    <span>修改</span>
                    <b className="icon icon_arr_right"></b>
                </dd>
            </div>
            </a>
        </li>
    </ul>
    ): ''}
    <div className="warp_bg" ref="bg" onClick={this.close}></div>
    <div className="digole" ref="digole">
        <ul>
            <li className="man" ref="man" onClick={this.chooseMan}>男</li>
            <li className="women" ref="women" onClick={this.chooseWomen}>女</li>
        </ul>
        <div onClick={this.close}>取消</div>
    </div>
</div>
        )
    }
});


module.exports = Page;