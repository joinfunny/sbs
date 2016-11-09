'use strict';

var React = require('react');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    onSubmit: function() {
        if($(this.refs.name).val().length < 1) {
            return this.props.app.tips("姓名不能为空");
            return false;
        }
        if($(this.refs.phone).val().length < 1) {
            return this.props.app.tips("手机号不能为空");
            return false;
        }
        if(!/^\d{11}$/.test($(this.refs.phone).val())) {
            return this.props.app.tips("手机号格式不正确");
            return false;
        }
        if($(this.refs.des).val().length < 6) {
            return this.props.app.tips("意见不能少于5个字");
            return false;
        }
        var view = this;
        view.user.getFeedback({
            name: $(view.refs.name).val(),
            phone: $(view.refs.phone).val(),
            msg: $(view.refs.des).val()
        }).done(function() {
            return (function() {
                view.props.app.tips('感谢您的参与！');
                setTimeout(function() {
                   view.props.app.navigate('/')
                }, 500)
            })();
        }).fail(function() {
            return (function() {
                view.props.app.tips('感谢您的参与！');
                setTimeout(function() {
                   view.props.app.navigate('/')
                }, 500)
            })();
        })
    },
    componentDidMount: function() {
        var app = this.props.app;
        this.user = app.Models.User.singleton();
    },
    render: function() {
        return (
            <div className="p_feedback p_full hasfixednavigation hasauth">
                 <div className="w_top_fixed">
                    <div className="centered">
                        <div className="w_navigation">
                            <a href="javascript:void(0)" className="left" onClick={this.goBack}>
                                <b className="back"></b>
                            </a>
                            <div className="center">
                                <div className="title">意见反馈</div>
                            </div>
                            <div className="right" onClick={this.onSubmit}>
                            提交
                            </div>
                        </div>
                    </div>
                </div>
                <div className="form_list">
                    <div className="content">
                       <h3>您的宝贵意见将是我们前进的动力！</h3>
                       <ul>
                           <li>
                               <input type="text" ref="name" placeholder="请输入你的姓名"/>
                           </li>
                           <li>
                               <input type="tel" ref="phone"  placeholder="请输入你的手机号"/>
                           </li>
                           <li className="nobor">
                               <textarea name="" id="" cols="30" rows="10" ref="des" placeholder="请输入您的宝贵意见"></textarea>
                           </li>
                       </ul>
                    </div>
                    
                </div>
            </div>
        );
    }
});

module.exports = Page;