'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            userAgent: '',
            jumpurl: ''
        }
    },
    getInitialState: function() {
        var inWx = false;
        var ua = this.props.userAgent;

        if((/MicroMessenger/i).test(ua)) {
            inWx = true
        }

        return {
            wx: inWx,
            jumpbackUrl: 'http://m.kezhanwang.cn/'
        }
    },
    componentDidMount: function() {
        var prefix = 'http://www.kezhanwang.cn/m/wechat/logincookiebridge?jumpurl=';

        this.setState({
            jumpbackUrl: prefix+encodeURIComponent(this.props.jumpurl)
        });
    },
    render: function() {

        return (
<div className="oauth" style={{display: this.state.wx ? '' : 'none'}}>
    <div className="tips">
        <div className="title">使用第三方账号快速登录</div>
    </div>
    <div className="oauth_provider">
        <a href={this.state.jumpbackUrl} className="wx">
            <div className="brand"></div>
            <span>微信登陆</span>
        </a>
    </div>
</div>
        )
    }
});


module.exports = Component;