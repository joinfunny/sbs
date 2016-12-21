'use stricts';
var React = require("react");

var AppItem = React.createClass({
    onHandleClick:function(){
        var app = this.props.app;
        var onSwitchApp=this.props.onSwitchApp;
        onSwitchApp && onSwitchApp(app);
    },
    render:function(){
        var app = this.props.app;
        var onSwitchApp = this.props.onSwitchApp;
        var selected = !!app.selected;
        return <li key={app.id} className={selected?"selected":""} data-appId={app.id} data-apptype={app.type} onClick={this.onHandleClick}>{app.name}</li>;
    }
});

var AppSelector = React.createClass({
    
    getDefaultProps:function(){
        var defaultApp={
            id:1,
            name:"电商数据",
            type:"website"
        };
        var createNewApp={
            id:0,
            name:"+新建应用"
        };
        var apps = [];
        apps.push(defaultApp);
        apps.push({id:2,name:"测试-1",type:"website"});
        apps.push({id:3,name:"测试-2",type:"website"});
        apps.push(createNewApp);
        return {
            apps:apps,
            defaultApp:defaultApp,
            createNewApp:createNewApp
        };
    },
    getInitialState:function(){
        return {
            currentApp:this.props.defaultApp
        }
    },
    getCurrentApp:function(){
        return this.state.currentApp;
    },
    onSwitchApp:function(app){
        this.setState({currentApp:app});
        var dropdown = this.refs["dropdown"];
        $(dropdown).addClass('selected');
        setTimeout(function(){$(dropdown).removeClass('selected')},1);
    },
    render:function(){
        var currentApp = this.state.currentApp || {};
        var apps = this.props.apps;
        apps.forEach(function(app){
            app.selected = app === currentApp ? true:false;
        });
        var currentAppElement = <span data-appid={currentApp.id||''} data-apptype={currentApp.type||''}>{currentApp.name||''}</span>; 
        return (<div className="app-dropdown" ref="dropdown">
                    {currentAppElement}
                    <i className="app-dropdown-arrow"></i>
                    <div className="app-dropdown-items">
                        <ul>
                        {
                            apps.map((app) => {
                                return <AppItem  key={app.id} app={app} onSwitchApp={this.onSwitchApp} />
                            })
                        }
                        </ul>
                    </div>
                </div>);
    }
});

module.exports = AppSelector;