'use strict';

var React = require('react');
var GoBackMixins = require('../react_mixins/goback.js');

var Page = React.createClass({
    mixins: [GoBackMixins],
    
    getDefaultProps: function() {
        return {
            data: {
                list: [],
                userArea: {}
            }
        }
    },
    search: function(e) {
        if(e.keyCode == 13) {
            this.props.app.navigate('/course?wd='+e.currentTarget.value);
        }
    },
    render: function() {
        var data = this.props.data.list;
        var userArea = this.props.data.userArea || {};
        var getLink = function(id) {
            if(userArea.py) {
                return "/"+userArea.py+"/course/"+id;
            } else {
                return "/course/"+id;
            }
        };

        return (
<div className="p_category p_full hasfixednavigation">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a className="left" onClick={this.goBack}>
                    <b className="back"></b>
                </a>
                <div className="center pl10 pr10">
                    <div className="search">
                        <div className="wrap">
                            <div className="label">
                                <b className="icon icon_magnifier"></b>
                            </div>
                            <input placeholder="输入想要搜索的课程名称" onKeyUp={this.search}/>
                        </div>
                    </div>
                </div>
                <a href="/" className="ps right">
                    <b className="icon icon_house vam"></b>
                </a>
            </div>
            
        </div>
    </div>
    {data.map((item, key) => {
        return (
            <section className="grid"  key={key}>
                <h2 className="title">{item.categname}</h2>
                <ul className="subcate clearfix">
                    {item.childList.map((v, key) => {
                        return (
                            <li key={key}>
                                <a href={getLink(v.categid)} className="ps">
                                <h3>
                                    {v.categname}
                                </h3>
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </section>
        )
    })}
</div>
        )
    }
});

module.exports = Page;