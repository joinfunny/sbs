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
            codeColor: '',
            btnColor: '',
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
        var app = this.props.app;
        var el = $(ReactDOM.findDOMNode(this));
        this.state.phone = el.find('.phone input').val();
        this.state.imgcode = el.find('.imgcode').val();
        this.state.code = el.find('.code').val();
        if(!this.state.phone) {
            this.refs.btn.reset();
            return app.tips('手机号不能为空');
        }
        if(!/^\d{11}$/.test(this.state.phone)) {
            this.refs.btn.reset();
            return app.tips('手机号输入有误');
        }
        if(!this.state.imgcode) {
            this.refs.btn.reset();
            return app.tips('图形验证码输入有误');
        }
        if(!this.state.code) {
            this.refs.btn.reset();
            return app.tips('验证码输入有误');
        }
        this.model.resetPhone(this.state.phone, this.state.code).then(function() {
            return view.props.app.tips('绑定手机号成功！');
        }).then(function() {
            app.navigate('/usercenter/info');
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
        var el = $(ReactDOM.findDOMNode(this));
        var phone = this.state.phone = el.find('.phone input').val();
        if(!phone || !$(this.refs.imgcode).val()) {
            this.setState({
                codeColor: ""
            });
        } else {
            if(/^\d{11}$/.test(phone)) {
                this.setState({
                    codeColor: "show_color"
                });
            }else{
                this.setState({
                    codeColor: ""
                });
            }
        }
        this.clickTrue();
    },
    clickTrue: function() {
        var el = $(ReactDOM.findDOMNode(this));
        var phone = this.state.phone = el.find('.phone input').val();
        if(!this.state.phone || !$(this.refs.imgcode).val() || !$(this.refs.code).val()) {
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
        this.model.getCode(this.state.phone, $(this.refs.imgcode).val()).then(function() {})
    },
    render: function() {
        var user = this.state.user;
        return (
<div className="p_regphone p_full hasfixednavigation">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="title">绑定手机号</div>
                </div>
                <div className="right"></div>
            </div>
        </div>
    </div>

    <div className="p_forget">
        <div className="w_uc_form">
            <SmartInputComponent type="tel" placeholder="手机号" onChange={this.showColor} className="row phone" />
            <div className="parentpr" >
                <input type="text" ref="imgcode" className="imgcode" placeholder="图形验证码" onChange={this.showColor}/>
                <div>
                    <img ref="showcode" onClick={this.changeImgCode} src={'http://www.kezhanwang.cn/page/vcode'}/>
                </div>
            </div>
            <div className="parentpr">
                <input type="tel" ref="code" className="code" placeholder="验证码" onChange={this.clickTrue}/>
                <div onClick={this.state.codeColor ? this.getCode : ""} className={this.state.codeColor }>
                    {this.state.html}
                </div>
            </div>
            {this.state.btnColor? <ToggleBtnComponent ref="btn" className="nextbtn btn_color" onClick={this.modify} /> : <ToggleBtnComponent ref="btn" className="nextbtn" onClick={this.hide}/> }
            
        </div>
    </div>
</div>
        )
    }
});


module.exports = Page;