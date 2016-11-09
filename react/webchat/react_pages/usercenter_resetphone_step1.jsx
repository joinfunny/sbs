'use strict';

var React = require('react');
var SmartInputComponent = require('../react_components/smart_input.jsx');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var GoBackMixins = require('../react_mixins/goback.js');
var ToggleBtnComponent = require('../react_components/toggle_btn.jsx');
var ReactDOM = require('react-dom');


var Page = React.createClass({
    mixins: [GoBackMixins],
    getDefaultProps: function() {
        return {
            app: {}
        }
    },
    getInitialState: function() {
        return {
            username: '',
            codeColor: 'show_color',
            btnColor: '',
            user: this.props.user || this.props.app.Models.User.singleton().toJSON(),
            html: '获取验证码'
        }

    },
    componentDidMount: function() {
        var app = this.props.app;
        this.model = app.Models.User.singleton();
    },
    modify: function() {
        var state = this.state;
        var view = this;
        var app = view.props.app;
        var el = $(ReactDOM.findDOMNode(view));
        // view.state.imgcode = el.find('.imgcode').val();
        view.state.code = el.find('.code').val();
        // if(!view.state.imgcode) {
        //     view.refs.btn.reset();
        //     return app.tips('图形验证码输入有误');
        // }
        if(!view.state.code) {
            view.refs.btn.reset();
            return app.tips('验证码输入有误');
        }
        view.model.resetOldPhone(view.state.user.mobile, view.state.code).then(function(data) {
            app.navigate('/usercenter/resetphone/step2?co=' + view.state.code + '&oldMobile=' + view.state.user.mobile);
        }).fail(function() {
            view.refs.btn.reset();
        });
    },
    hide: function() {
        this.refs.btn.reset();
    },
    changeImgCode: function() {
        $(this.refs.showcode).eq(0).attr('src', 'http://www.kezhanwang.cn/page/vcode?'+ Math.random());
    },
    showColor: function() {
        if(!$(this.refs.imgcode).val()) {
            this.setState({
                codeColor: ""
            });
        } else {
            this.setState({
                codeColor: "show_color"
            })
        }
        this.clickTrue();
    },
    clickTrue: function() {
        if(!$(this.refs.code).val()) {
            this.setState({
                btnColor: ""
            });
        }else {
            this.setState({
                btnColor: "btn_color"
            });
        }
    },
    getCode: function() {
        var number = 60;
        var timer = null;
        var view = this;
        view.setState({
            codeColor: "",
            html: "(60s)"
        });
        timer = setInterval(function() {
            if(number == 1) {
                clearInterval(timer);
                view.setState({
                    codeColor: "show_color",
                    html: "获取验证码"
                });
            }else {
                number--
                view.setState({
                    codeColor: "",
                    html: "(" + number+"s)"
                });
            }
        }, 1000)
        this.model.phoneCode(this.state.user.mobile, $(this.refs.imgcode).val()).then(function() {
            $(view.refs.showWarn).show();
        })
    },
    render: function() {
        var user = this.state.user;
        return (
<div className="p_regphone p_full hasfixednavigation w_update">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">修改手机号</div>
                </div>
                <div className="right"></div>
            </div>
        </div>
    </div>
    <div className="update">
        <div className="identity active">
            <em>1</em>
            <span>验证身份</span>
        </div>
        <div className="arrow">
            <i></i>
        </div>
        <div className="tel ">
            <em>2</em>
            <span>修改手机</span>
        </div>
    </div>
    <div className="p_forget">
        <div className="w_uc_form">
            <p className="warn">您当前的手机号是：{user.mobile.substring(0,3)}****{user.mobile.substring(7)}</p>
            <p className="warn pad_botm" ref="showWarn">我们已经给您的手机{user.mobile.substring(0,3)}****{user.mobile.substring(7)}发送了一条验证码</p>
            {false&&'暂时隐藏'?(<div className="parentpr" >
                <input type="text" ref="imgcode" className="imgcode" placeholder="图形验证码" onChange={this.showColor}/>
                <div>
                    <img ref="showcode" onClick={this.changeImgCode} src={'http://www.kezhanwang.cn/page/vcode'}/>
                </div>
            </div>):''}
            <div className="parentpr">
                <input type="tel" ref="code" className="code" placeholder="验证码" onChange={this.clickTrue}/>
                <div onClick={this.state.codeColor ? this.getCode : ""} className={this.state.codeColor }>
                    {this.state.html}
                </div>
            </div>
            {this.state.btnColor? <ToggleBtnComponent ref="btn" text="下一步" className="nextbtn btn_color" onClick={this.modify} /> : <ToggleBtnComponent ref="btn" className="nextbtn" onClick={this.hide} text="下一步" /> }
            <p className="warn">注：重新绑定后，原手机不能作为登陆凭证</p>
        </div>
    </div>
</div>
        )
    }
});


module.exports = Page;