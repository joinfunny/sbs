'use strict';

var React = require('react');
var domian = require('../server/config').domain;
var GoTopComponent = require('../react_components/go_top.jsx');
var GoBackMixins = require('../react_mixins/goback.js');
var LoadingImg = require('../react_components/img_loading.jsx');

var Page = React.createClass({
    mixins: [GoBackMixins],
    componentDidMount: function() {

    },
    render: function() {
        var data = this.props.data;
        var data = data.loanDetail.table.repay;
        var list = [];
        for(var i in data) {
            list.push(data[i]);
        }
        return (
<div className="p_uc p_full hasfixednavigation p_uc_staging_table">
    <div className="w_top_fixed">
        <div className="centered">
            <div className="w_navigation">
                <a className="left" onClick={this.goBack}>
                    <b className=" back"></b>
                </a>
                <div className="center">
                    <div className="title">我的分期</div>
                </div>
                <div className="right">
                    
                </div>
            </div>
        </div>
    </div>
    <table className="w_cell_list" cellspacing="0" cellpadding="0">
        <thead>
            <th>日期</th>
            <th>状态</th>
            <th>应还<br />本金</th>
            <th>应还<br />利息</th>
            <th>应还<br />总额</th>
        </thead>
        <tbody>
            {list.map(function(data, key) {
                if(data.status == 0) {
                    return (
                        <tr key={key}>
                            <td>{data.repay}</td>
                            <td className="paid">已经偿还</td>
                            <td>{data.principal == 0 ? "0.00": data.principal}</td>
                            <td>{data.interest}</td>
                            <td>{data.total}</td>
                        </tr>
                    )
                }else if(data.status == 1) {
                    return (
                        <tr key={key}>
                            <td>{data.repay}</td>
                            <td  className="notpaid">代还款</td>
                            <td>{data.principal == 0 ? "0.00": data.principal}</td>
                            <td>{data.interest}</td>
                            <td>{data.total}</td>
                        </tr>
                    )
                }else{
                    return (
                        <tr key={key}>
                            <td>{data.repay}</td>
                            <td className="paid">逾期</td>
                            <td>{data.principal == 0 ? "0.00": data.principal}</td>
                            <td>{data.interest}</td>
                            <td>{data.total}</td>
                        </tr>
                    )
                }
                    /*return (
                        <tr key={key}>
                            <td>{data.repay}</td>
                            {data.status == 0 ? <td className="paid">已经偿还</td>: ""}
                            {data.status == 1 ? <td  className="notpaid">代还款</td>: ""}
                            {data.status == 2 ? <td className="paid">逾期</td>: ""}
                            <td>{data.principal == 0 ? "0.00": data.principal}</td>
                            <td>{data.interest}</td>
                            <td>{data.total}</td>
                        </tr>
                    )*/
            })}
        </tbody>
    </table>
    <GoTopComponent />
</div>
        );
    }
});

module.exports = Page;