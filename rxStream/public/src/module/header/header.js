/**
 * Created by jiangfeng on 2016-4-11.
 * 头部（）
 */
'use strict';
import './header.css';
class header extends React.Component{
    getInitialState() {
        return { userName: '蒋峰' };
    }
    render() {
        var userName = this.state.userName;
        return (
            <div className="header">
                <div className="header-left">
                </div>
                <div className="header-data-count">数据总数：<span /></div>
                <div className="header-right">
                    <ul>
                        <li>
                            <a href="javascript:void(0);">
                                <img src="css/main/img/name.png" />
                                <span className="wel-come">
                                    <b className="user-name">{userName}</b>
                                </span>
                            </a>
                        </li>
                        <li className="separator" />
                        <li>
                            <a href="introduce">
                                <img src="css/main/img/house.png" />
                                <span>首页</span>
                            </a>
                        </li>
                        <li className="separator" />
                        <li>
                            <a href="doc">
                                <img className="imgages_icon" src="css/main/img/help.png" />
                                <span>帮助</span>
                            </a>
                        </li>
                        <li className="separator" />
                        <li>
                            <a href="javascript:;">
                                <img className="imgages_icon" src="css/main/img/tool.png" />
                                <span role="connectData">接入网站数据</span>
                            </a>
                        </li>
                        <li className="separator" />
                        <li role="logOut">
                            <a href="javascript:void(0);">
                                <img className="imgages_icon" src="css/main/img/back_.png" />
                                <span>退出</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
};
module.exports = Header;