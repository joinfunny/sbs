'use strict';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexLink} from 'react-router';

//var tpl = require('./header.html');



export default class MainPage extends React.Component {
    render() {
        return (
            <div className="header">
                <div className="header-left">
                    <div className="app-dropdown">
                    </div>
                </div>
                <div className="header-data-count">数据总数：<span>---</span></div>
                <div className="header-right">
                    <ul>
                        <li><a href="javascript:void(0);"><img src="css/main/img/name.png"><span className="wel-come"><b className="user-name">欢迎您</b></span></a></li>
                        <li className="separator"></li>
                        <li>
                            <a href="introduce">
                                <img src="css/main/img/house.png">
                                <span>首页</span>
                            </a>
                        </li>
                        <li className="separator"></li>
                        <li><a href="doc"><img className="imgages_icon" src="css/main/img/help.png"><span>帮助</span></a></li>
                        <li className="separator"></li>
                        <li><a href="javascript:;"><img className="imgages_icon" src="css/main/img/tool.png"><span role="connectData">接入网站数据</span></a></li>
                        <li className="separator"></li>
                        <li role="logOut"><a href="javascript:void(0);"><img className="imgages_icon" src="css/main/img/back_.png"><span>退出</span></a></li>
                    </ul>
                </div>
            </div>
        )
    }
};