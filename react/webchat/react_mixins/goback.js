// 返回上一页逻辑，避免第一次进入goback失效
module.exports = {
    componentDidMount: function() {
        $(window).on('onpopstate.goback', () => { 
            clearTimeout(this.goBackTimer);
        });
    },
    goBack: function() {
        var props = this.props;
        
        if(history.state && history.state.href) {
            history.go(-1);
        } else {
            kzApp.navigate('/');
        }
    },
    componentWillUnmount: function() {
        clearTimeout(this.goBackTimer);
        $(window).off('onpopstate.goback');
    }
};