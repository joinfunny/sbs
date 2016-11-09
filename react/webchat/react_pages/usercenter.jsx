'use strict';

var React = require('react');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');
var FooterComponent = require('../react_components/footer.jsx');


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
    logout: function() {
        var app = this.props.app;
        app.Models.User.singleton().logout().then(function() {
            app.navigate('/usercenter');
            location.reload();
        }).fail(() => {
            this.refs.btn.reset();
        });
    },
    render: function() {
        var user = this.state.user;
        var isWxLogin = this.state.isWxLogin;
        return (
<div className="p_uc hasfooter p_userindex p_full hasfixednavigation">
   <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center">
                    <div className="title">个人中心</div>
                </div>
                <div className="right">
                    
                </div>
            </div>
        </div>
    </div>
    <div className="header">
        <div className="avatar">
           <img src={user.header_pic} />
        </div>
        <div className="username">{user.username}</div>
        <a href="/usercenter/info" className="edit ps">
            <b></b>编辑
        </a> 
    </div>

    <ul className="w_cell_list">
        <li className="w_cell_field">
            <div className="line">
                <a href="/usercenter/favorite" className="ps">
                <dt className="tiny">
                    <b className="uc_sc"></b>我的收藏
                </dt>
                <dd>
                    <b className="icon icon_arr_right"></b>
                </dd>
                </a>
            </div>
            {false&&'暂时隐藏'?(<div className="line">
                <a href="/usercenter/signup" className="ps">
                <dt className="tiny">
                    <b className="uc_bm"></b>我的报名
                </dt>
                <dd>
                    <b className="icon icon_arr_right"></b>
                </dd>
                </a>
            </div>):''}
            <div className="line">
                <a href="/usercenter/myloan" className="ps">
                <dt className="tiny">
                    <b className="uc_dk"></b>我的分期
                </dt>
                <dd>
                    <b className="icon icon_arr_right"></b>
                </dd>
                </a>
            </div>
        </li>
    </ul>
    <div className="w_uc_form">
        <div className="pb20">
            <ToggleBtnComponent ref="btn" className="btn btn_login" onClick={this.logout} text="退出" />
        </div>
    </div>
    <FooterComponent></FooterComponent>
</div>

        )
    }
});


module.exports = Page;