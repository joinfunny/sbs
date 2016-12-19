'use stricts';
import React from "react";
import {render} from "react-dom";

class Navigation extends React.Component{
    render(){
        var navigation = this.props.navigation; 
        var hasChildren = navigation.children && navigation.children.length > 0;
        var childrenElement;
        var children = navigation.children||[];
        if(hasChildren){
            childrenElement = (<ul>
            {
                children.map(function(child,index){
                        return <Navigation navigation={child} key={child.id} /> 
                    })
            }
            </ul>);
        }
         
        return (<li key={navigation.id}>
                    <a id={navigation.id} className="tree-a" href={navigation.href} title={navigation.title}>
                        <i className={navigation.icon} aria-hidden="true"></i>
                        <span>{navigation.title}</span>
                    </a>
                    {childrenElement}
                </li>);
    }
}

export default class LeftNavigations extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (<div className="left">
                    <h1 className="left-logo"></h1>
                    <ul className="left-menu">
                        {
                            this.props.navigations.map(function(child,index){
                                return <Navigation navigation={child} key={child.id} /> 
                            })
                        }
                    </ul>
                </div>);
    }
};

LeftNavigations.defaultProps = {
     navigations:[
        {
            id: "data_overview",
            title: "我的数据概览",
            icon: "icon fa fa-tachometer",
            selected:true
        }, {
            id: "user_analysis",
            title: "用户行为分析",
            icon: "icon fa fa-user",
            children:[
                {
                    id:"analysis_event",
                    title:"行为分析",
                    icon:"icon fa icon-Event"
                },
                {
                    id:"analysis_funnel",
                    title:"漏斗分析",
                    icon:"icon fa icon-Funnel"
                }
            ]
        },
        {
            id: "user_data",
            title: "数据接入",
            icon: "icon fa fa-database",
            children:[
                {
                    id:"data_custom_event",
                    title:"自定义事件",
                    icon:"icon fa fa-pencil",
                    href:"main/data-access/custom-events"
                },
                {
                    id:"data_custom_object",
                    title:"事件对象",
                    icon:"icon fa fa-book",
                    href:"main/data-access/event-object"
                }
            ]
        }
    ] 
};
 