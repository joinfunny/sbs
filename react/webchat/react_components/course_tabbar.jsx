'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            isFocus: false,
            isListen: false,
            model: {},
            data: {},
            onChange: () => {},
            onClick: () => {}
        }
    },
    getInitialState: function() {
        return {
            isFocus: this.props.isFocus
        }
    },
    stClick: function() {
        this.props.onClick('shiting');
    },
    focus: function() {
        var state = this.state;
        var model = this.props.model;
        if(kzApp.checkLogin()) {
            if(state.isFocus) {
                model.unfocus().then(() => {
                    this.setState({isFocus: false});
                    this.props.onChange(this.state);
                });
            } else {
                model.focus().then(() => {
                    this.setState({isFocus: true});
                    this.props.onChange(this.state);
                });
            }
        }
    },
    render: function() {
        var state = this.state;
        var props = this.props;
        return (
<div className="w_bottom_fixed">
    <div className="center">
        <ul className="w_grid tabbar">
            <li className="item">
                <a href="javascript:void(0)" className={state.isFocus ? "fav actived": "fav"} onClick={this.focus}>
                <b></b>
                收藏
                </a>
            </li>
            {props.isListen && false && '暂时隐藏'? (
            <li className="item">
                <a href="javascript:void(0)" className="st" onClick={this.stClick}>
                <b></b>
                试听
                </a>
            </li>
            ) : ''}

        </ul>
    </div>
</div>
        )
    }
});

module.exports = Component;