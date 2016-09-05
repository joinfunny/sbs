var _ = require('./utils');

var HTML = document.documentElement,
    rLinkButton = /^(A|BUTTON)$/;
module.exports = {
    // 元素注册事件
    // elem {DOMElement}
    // eventType {String}
    // fn {Function}
    // return {undefined}
    addEvent: window.addEventListener ? function (elem, eventType, fn) {
        elem.addEventListener(eventType, fn, false);
    } : function (elem, eventType, fn) {
        elem.attachEvent('on' + eventType, fn);
    },

    innerText: 'innerText' in HTML ? function (elem) {
        return elem.innerText
    } : function (elem) {
        return elem.textContent
    },

    // 从一个元素自身开始，向上查找一个匹配指定标签的元素
    // elem {DOMElement}
    // tagName {String}
    // root {DOMElement} 可指定的根元素
    // return {DOMElement|undefined}
    iAncestorTag: function (elem, tagName, root) {
        tagName.test || (tagName = tagName.toUpperCase());
        root || (root = document);
        do {
            if (tagName.test ? tagName.test(elem.tagName) : elem.tagName === tagName) return elem;
        }
        while (elem !== root && (elem = elem.parentNode));
    },

    // 按钮类型Boolean表
    BUTTON_TYPE: {
        button: !0,
        image: !0, // 图像按钮
        submit: !0,
        reset: !0,
    },

    // 获取点击事件的预置信息
    // elem {DOMEvent}
    // return {Object|undefined}
    getClickPreset: function (e) {
        e || (e = window.event);
        var target = e.target || e.srcElement,
            tagName = target.tagName,
            aTarget, preset, type, text, href;
        switch (tagName) {
            case 'INPUT':
                type = target.type;
                if (dom.BUTTON_TYPE[type]) {
                    preset = {
                        event: 'e_click_btn',
                        properties: {
                            b_btn_type: type,//类型
                            b_btn_text: target.value,//按钮文字
                            b_btn_name: target.getAttribute('name') || '',//按钮nane
                            b_btn_value: target.getAttribute('value') || ''//按钮value
                        }
                    }
                }
                break;
            default:
                var aTarget = dom.iAncestorTag(target, rLinkButton);
                if (aTarget) {
                    switch (aTarget.tagName) {
                        case 'BUTTON':
                            text = _.trim(dom.innerText(aTarget));
                            preset = {
                                event: 'e_click_btn',
                                properties: {
                                    b_btn_type: aTarget.type,//类型
                                    b_btn_text: text,//按钮文字
                                    b_btn_name: aTarget.getAttribute('name') || '',//按钮name
                                    b_btn_value: aTarget.getAttribute('value') || ''//按钮value
                                }
                            }
                            break;
                        case 'A':
                            text = _.trim(dom.innerText(aTarget));
                            href = aTarget.href;
                            preset = {
                                event: 'e_click_link',
                                properties: {
                                    b_link_url: href,//链接地址
                                    b_link_text: text//链接文字
                                }
                            }
                            break;
                    }
                }

        }
        // 鼠标坐标
        if (preset) {
            preset.properties.b_clientX = e.clientX;
            preset.properties.b_clientY = e.clientY;
        }
        return preset;
    },

    //页面位置及窗口大小  
    getPageSize: function () {
        var scrW, scrH;
        if (window.innerHeight && window.scrollMaxY) { // Mozilla
            scrW =
                window.innerWidth + window.scrollMaxX;
            scrH = window.innerHeight +
                window.scrollMaxY;
        } else if (document.body.scrollHeight >
            document.body.offsetHeight) { // all but IE Mac      
            scrW =
                document.body.scrollWidth;
            scrH = document.body.scrollHeight;
        } else
            if (document.body) { // IE Mac      
                scrW = document.body.offsetWidth;

                scrH = document.body.offsetHeight;
            }
        var winW, winH;

        if (window.innerHeight) { // all except IE      
            winW =
                window.innerWidth;
            winH = window.innerHeight;
        } else if (document.documentElement &&
            document.documentElement.clientHeight) { // IE 6 Strict Mode      
            winW =
                document.documentElement.clientWidth;
            winH =
                document.documentElement.clientHeight;
        } else if (document.body) { //   
            other
            winW = document.body.clientWidth;
            winH =
                document.body.clientHeight;
        }
        // for small pages with total size less   
        //then the viewport
        var pageW = (scrW < winW) ? winW : scrW;
        var pageH =
            (scrH < winH) ? winH : scrH;
        return {
            PageWidth: pageW,
            PageHeight: pageH,
            WinWidth: winW,
            WinHeight: winH
        };
    },

    //滚动条位置  
    getPageScroll: function () {
        var x, y;
        if (window.pageYOffset) { // all except IE      
            y = window.pageYOffset;
            x = window.pageXOffset;
        } else
            if (document.documentElement && document.documentElement.scrollTop) {
                // IE 6 Strict      
                x = document.documentElement.scrollLeft;
                y = document.documentElement.scrollTop;
            } else if (document.body) { // all   
                //other IE
                x = document.body.scrollLeft;
                y = document.body.scrollTop;
            }

        return {
            b_scrollX: x,
            b_scrollY: y
        };
    }
}

