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
            user: this.props.user || this.props.app.Models.User.singleton().toJSON(),
            username: ''
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
        if(!$('input').val()) {
            //this.refs.btn.reset();
            return app.tips('请输入昵称');
        }

        this.model.resetInfo(this.state.username, this.state.user.gender).then(function() {
            return view.props.app.tips('昵称修改成功！');
        }).then(function() {
            window.location.href='/usercenter/info';
            // location.reload();
        }).fail(function() {});
    },
    setUsername: function(username) {
        this.setState({
            username: username
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
                    <div className="title">修改昵称</div>
                </div>
                <div className="right" onClick={this.modify}>保存</div>
            </div>
        </div>
    </div>

    <div className="p_forget">
        <div className="w_uc_form">
            <SmartInputComponent ref="name" type="text" placeholder="请输入新的昵称" onChange={this.setUsername} className="row" />
        </div>
    </div>
</div>
        )
    }
});


module.exports = Page;