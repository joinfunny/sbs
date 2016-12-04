'use stricts';
import React from "react";
import { render } from "react-dom";

export default class Header extends React.Component {

    constructor(props) {
        super(props);
        var demo={id:1,name:'电商数据','type':'website'};
        var apps=[];
        apps.push(demo);
        this.state =  {
            apps:apps,
            currentApp:demo,
            userName:'测试-4'
        };
    }

    render() {
        
        return (
            <div className="header">
                <div className="header-left">
                    <div className="app-dropdown">
                    <span data-appid={this.state.currentApp?this.state.currentApp.id:''} data-apptype={this.state.currentApp?this.state.currentApp.type:''}>{this.state.currentApp?this.state.currentApp.name:''}</span> 
                    <i className="app-dropdown-arrow"></i>
                    <div className="app-dropdown-items">
                        <ul>
                            {
                                this.state.apps.map((e) => {
                                    return (
                                        <li key={e.id} data-appId={e.id} data-apptype={e.type} role="switchApp">{e.name}</li>
                                    )
                                })
                            }
                            <li data-appId="0" role="switchApp">+新建应用</li>
                        </ul>
                    </div>
                    </div>
                </div>
                <div className="header-data-count">数据总数：<span>--</span></div>
                <div className="header-right">
                    <ul>
                        <li><a href="javascript:void(0);"><img src="../css/main/img/name.png" /><span className="wel-come"><b className="user-name">{ this.state.userName ? ('欢迎' + this.state.userName) :'' }</b></span></a></li>
                        <li className="separator"></li>
                        <li><a href="introduce"><img src="../css/main/img/house.png" /><span>首页1</span></a></li>
                        <li className="separator"></li>
                        <li><a href="doc"><img className="imgages_icon" src="../css/main/img/help.png" /><span>帮助</span></a></li>
                        <li className="separator"></li>
                        <li><a href="/admin/admin/index.html" target="_self"><img className="imgages_icon" src="../css/main/img/tool.png" /><span>设置</span></a></li>
                        <li className="separator"></li>
                        <li><a href="javascript:;"><img className="imgages_icon" src="../css/main/img/tool.png" /><span role="connectData">接入网站数据</span></a></li>
                        <li className="separator"></li>
                        <li role="logOut"><a href="javascript:void(0);"><img className="imgages_icon" src="../css/main/img/back_.png" /><span>退出</span></a></li>
                    </ul>
                </div>
            </div>
        )
    }
};