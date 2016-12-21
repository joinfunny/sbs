'use stricts';
import React from "react";
import {render} from "react-dom";

class Navigation extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selected : false
        };
    }
    

    onHandleClick(target,e){
        
        var state = this.state;

        if(this.props.navigation.children) return;

        this.setState({ selected:!state.selected });

        this.props.onChildSelected && this.props.onChildSelected(this);
    }

    /**
    componentWillMount(){
        console.log('componentWillMount...');
    }

    componentDidMount(){
        console.log('componentDidMount...');
    }

    componentWillReceiveProps(nextProps){
        console.log('componentWillReceiveProps...');
    }
    
    shouldComponentUpdate(nextProps, nextState){
        console.log('shouldComponentUpdate...');
        return true;
    }

    componentWillUpdate(nextProps, nextState){
        console.log('componentWillUpdate...');
    }

    componentDidUpdate(){
        console.log('componentDidUpdate...');
    }    

    componentWillUnmount(){
        console.log('componentWillUnmount...');
    }
    */

    unSelectTreeNode(node){
        node.setState({selected:false});
        for(var i in node.refs){
            this.unSelectTreeNode(node.refs[i]);            
        }
    }
    
    onChildSelected(child){
        
        this.setState({selected: !child.state.selected});
        
        for(var i in this.refs){
            var item = this.refs[i];
            item!=child && this.unSelectTreeNode(item);
        }

        this.props.onChildSelected && this.props.onChildSelected(this);
        
    }

    render(){
        var children;
        var navigationState = this.state||{};
        var navigation = this.props.navigation; 
        
        if(navigation.children && navigation.children.length > 0){
            children = (<ul>
            {
                navigation.children.map(function(child,index){
                        return <Navigation ref={child.id} navigation={child} key={child.id} onChildSelected = {(e)=>this.onChildSelected(e)} /> 
                    },this)
            }
            </ul>);
        }
         
        return (<li key={navigation.id} className={navigationState.selected?"branch-actived":""}>
                    <a id={navigation.id} className="tree-a" href={navigation.href} title={navigation.title} onClick={(e)=>this.onHandleClick(e)} >
                        <i className={navigation.icon} aria-hidden="true"></i>
                        <span>{navigation.title}</span>
                    </a>
                    {children}
                </li>);
    }
}

export default class LeftNavigations extends Navigation {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div className="left">
                    <h1 className="left-logo"></h1>
                    <ul className="left-menu">
                        {
                            this.props.navigations.map(function(child,index){
                                return <Navigation ref={child.id} navigation={child} key={child.id} onChildSelected={(e)=>this.onChildSelected(e)} /> 
                            },this)
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
                    href:"#main/data-access/custom-events"
                },
                {
                    id:"data_custom_object",
                    title:"事件对象",
                    icon:"icon fa fa-book",
                    href:"#main/data-access/event-object"
                }
            ]
        }
    ] 
};
 