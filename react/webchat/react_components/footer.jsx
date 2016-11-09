'use strict';

var React = require('react');

var Component = React.createClass({
    getUserAgent: function() {
        try{
            this.url = "";
            if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
                this.url = "https://itunes.apple.com/cn/app/ke-zhan-jiao-yu-pei-xun-jin/id1026601319?mt=8";
            }
            if (/(Android)/i.test(navigator.userAgent)) {
                this.url = "http://www.kezhanwang.cn/app/appinfo/download?from=header_qr";
            }
        }catch(e) {
            this.url = "";
        }
        

    },
    render: function() {
        this.getUserAgent();
        var url = this.url;
        return (
            <div className="p_footer">
                <ul className="tabs">
                    <li>
                        <a href={url}>APP</a>
                    </li>
                    <li>
                        <a href="http://www.kezhanwang.cn">电脑版</a>
                    </li>
                    <li>
                        <a href="/feedback" className="ps">意见反馈</a>
                    </li>
                    <li>
                        <a href="/about" className="ps">关于我们</a>
                    </li>
                </ul>
                <ul className="contact">
                    <li>
                        <img src="/static/mh5/images/footer_wx.png"/>
                        <span>
                            客服电话<br/><a href="tel:400-002-9691">400-002-9691</a>
                        </span>
                    </li>
                    <li>
                        <img src="/static/mh5/images/footer_add.png"/>
                        <span>北京市朝阳区酒仙桥路<br/>14号兆维大厦6层</span>
                    </li>
                    <li>
                        <img src="/static/mh5/images/footer_tel.png"/>
                        <span>
                            公司电话<br/><a href="tel:010-81031516">010-81031516</a>
                        </span>
                    </li>
                </ul>

                <div className="copyright">
                    <span>北京弟傲思时代信息技术有限公司</span>
                    <span>课栈网  m.kezhanwang.cn</span>
                </div>
            </div>
        );
    }
});

module.exports = Component;