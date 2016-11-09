'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            className: '',
            onChange: () => {}
        }
    },
    getOffset: function() {
        var el = ReactDOM.findDOMNode(this);
        var offset = [];
        var scrollTop = $(window).scrollTop();

        $(el).find('[data-index]').each((key, dom) => {
            var height = $(dom).offset().height;
            var top = $(dom).offset().top;

            offset.push({
                top: top - scrollTop,
                bottom: top - scrollTop + height,
                index: $(dom).data('index')
            });
        });

        this.offset = offset;
    },
    componentDidMount: function() {
        this.getOffset();
        var el = ReactDOM.findDOMNode(this);

        $(el).delegate('[data-index]', 'touchmove touchend', (e) => {        
            var offset = this.offset;
            var clientY = e.changedTouches[0].clientY;
            var index;

            for(var i in offset) {
                if(clientY > offset[i].top && clientY <= offset[i].bottom) {
                    index = offset[i].index;
                    break;
                }
            }

            // 上下越界
            if(!index) {
                if(clientY < offset[0].top) {
                    index = offset[0].index;
                } else {
                    index = offset[offset.length - 1].index;
                }
            }

            this.props.onChange(index);
            return false;
        });
    },
    render: function() {
        var props = this.props;

        return (
<div className={props.className} >
{props.children}
</div>
        )
    }
});

module.exports = Component;