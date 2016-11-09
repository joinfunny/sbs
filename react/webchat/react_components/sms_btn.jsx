'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            className: '',
            times: 60,
            phone: '',
            pcode: '',
            needPCode: false
        }
    },
    getInitialState: function() {
        return {
            text: '获取验证码',
            pending: false
        }
    },
    sendVerifyCode: function() {
        var view = this;
        var Sys = kzApp.Models.System;
        var props = this.props.needPCode;

        if(props.needPCode && !this.props.pcode) {
            return kzApp.tips('请输入图片验证码！');
        }
        if(!this.props.phone) {
            return kzApp.tips('请输入手机号码！');
        }

        if(!Sys.REGEXP.mobilephone.test(this.props.phone)) {
            return kzApp.tips('请输入正确的手机号码！');
        }

        if(this.state.pending) {
            return false;
        }

        this.setState({
            pending: true
        });

        var num = this.props.times;
        view.setState({
            text: '重新获取（'+num+'）'
        });
        view.interval = setInterval(function() {
            num--;
            if(num > 0) {
                view.setState({
                    text: '重新获取（'+num+'）'
                });
            } else {
                view.setState({
                    pending: false,
                    text: '获取验证码'
                });
                clearInterval(view.interval);
            }
        }, 1000);
        if(window.location.href.indexOf('forget')>0){
            Sys.singleton().smsCode(this.props.phone).fail(function() {
                view.setState({
                    pending: false,
                    text: '获取验证码'
                });
                clearInterval(view.interval);
            });
        }else if(window.location.href.indexOf('register')>0) {
            Sys.singleton().registerCode(this.props.phone).fail(function() {
                view.setState({
                    pending: false,
                    text: '获取验证码'
                });
                clearInterval(view.interval);
            });
        }   
    },
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    render: function() {
        var state = this.state;

        var className = this.props.className;

        if(state.pending) {
            className += ' pending';
        }

        return (
<a href="javascript:void(0)" className={className} onClick={this.sendVerifyCode}>{state.text}</a>
        );
    }
});

module.exports = Component;