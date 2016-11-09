var ReactDOM = require('react-dom');

module.exports = {
    componentDidMount: function() {
        var el = $(ReactDOM.findDOMNode(this));
        var mask = $(el).find('.mask');
        var point = {
            pageX: 0,
            pageY: 0
        };
        mask.on('touchstart.filterStopScroll', function(e) {
            point.pageX = e.changedTouches[0].pageX;
            point.pageY = e.changedTouches[0].pageY;
        });
        mask.on('touchmove.filterStopScroll', function() {
            return false;
        });
        mask.on('touchend.filterStopScroll touchcancel.filterStopScroll', function(e) {
            if(point.pageX != e.changedTouches[0].pageX) {
                return false;
            }
            if(point.pageY != e.changedTouches[0].pageY) {
                return false;
            }
        });
    },
    componentWillUnmount: function() {
        var el = $(ReactDOM.findDOMNode(this));
        var mask = el.find('.mask');

        mask.off('touchstart.filterStopScroll');
        mask.off('touchmove.filterStopScroll');
        mask.off('touchend.filterStopScroll');
        mask.off('touchcancel.filterStopScroll');

        el.off('touchstart.filterStopScroll');
        el.off('touchmove.filterStopScroll');
        el.off('touchend.filterStopScroll');
        el.off('touchcancel.filterStopScroll');
    },
    stopListScroll: function() {
        var el = $(ReactDOM.findDOMNode(this));
        var point = {
            pageX: 0,
            pageY: 0
        };
        el.on('touchstart.filterStopScroll', function(e) {
            point.pageX = e.changedTouches[0].pageX;
            point.pageY = e.changedTouches[0].pageY;
        });
        el.on('touchmove.filterStopScroll', function() {
            return false;
        });
        el.on('touchend.filterStopScroll touchcancel.filterStopScroll', function(e) {
            if(point.pageX != e.changedTouches[0].pageX) {
                return false;
            }
            if(point.pageY != e.changedTouches[0].pageY) {
                return false;
            }
        });
    }
};