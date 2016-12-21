'use stricts';
var React = require("react");

var UserProfile = React.createClass({
    getDefaultProps:function(){
        return {
            userName:'测试'
        };
    },
    getInitialState:function(){
        var demo={id:1,name:'电商数据','type':'website'};
        var apps=[demo];
        return {
            apps:apps,
            currentApp:demo
        };
    },
    render:function(){
        return (<ul>
                    <li><a href="javascript:void(0);"><img src="../css/main/img/name.png" /><span className="wel-come"><b className="user-name">{ this.props.userName ? ('欢迎' + this.props.userName) :'' }</b></span></a></li>
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
                </ul>);
    }
});

module.exports = UserProfile;