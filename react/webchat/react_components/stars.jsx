'use strict';

var React = require('react');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            number: 0,
            hasWord: false
        }
    },
    render: function() {
        var props = this.props;
        var number = Number(props.number);
        var stars = [];
        for(var i = 1; i <= 5; i++) {
            if(i <= number) {
                stars.push(<b key={i} className="icon icon_star"></b>);
            } else if(i > number && (i - 1) < number) {
                stars.push(<b key={i} className="icon icon_star_h"></b>);
            } else {
                stars.push(<b key={i} className="icon icon_star_e"></b>);
            }
        }

        return (
            <span className="score">
                {stars}
                {props.hasWord? (
                    <span>{number.toFixed(1)}分</span>
                ): ''}
            </span>
        )
    }
});

module.exports = Component;