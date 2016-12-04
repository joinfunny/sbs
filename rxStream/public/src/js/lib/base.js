// 页面基础配置，通常作为首个加载的js文件，必须置于页首，不依赖于第三方js库，
// 页面所有的请求都依赖于JQuery AJAX操作，需要统一控制。
(function(window) {

    var document = window.document,
        HTML = document.documentElement;
    HTML.className += ' js';

    window.__path = window.__path || '';
    if (window.__path === '') {
        window.__path = "https:" == document.location.protocol ? ('https://' + document.location.host) : ('http://' + document.location.host);
    }
    window.__apiPath = window.__apiPath || '';
    //window.__echarts = __path + '/node_modules/echarts/dist/echarts';

    document.include = function include(url, method, data) {
        var xhr = new XMLHttpRequest();
        //xhr.onreadystatechange = 
        function onload() {
            if (xhr.readyState < 4) {
                return
            }
            var status = (xhr.status === 1223) ? 204 : xhr.status;
            if (status !== 0 && status < 100 || status > 599) {
                new TypeError('Network request failed');
                return;
            }
            var body = 'response' in xhr ? xhr.response : xhr.responseText;
            document.write(body);
        }

        //xhr.onerror = 
        function onerror() {
            new TypeError('Network request failed');
        }

        xhr.open(method || 'GET', url, false);
        xhr.send(data || null);
        onload();
    }

    document.polyfill = function polyfill(url, conditional) {
        if (typeof url !== 'string') new TypeError('argument 0 is not a url string!');;
        switch (typeof conditional) {
            case 'boolean':
                conditional && script(url);
                break;
            case 'string':
                conditional in window || script(url);
                break;
            case 'object':
                conditional || script(url);
                break;
            case 'function':
                conditional() && script(url);
                break;
            default:
                script(url);
        }

        function script(url) {
            document.write('<script src="' + url + '"></scr' + 'ipt>');
        }
    }

    Image.fetch = function fetch(url, resolve, reject) {
        var img = new Image();
        img.onload = resolve;
        img.onerror = reject || resolve;
        img.src = url;
        img = null;
    }

    requirejs.config({
        baseUrl: window.__path + '/js',
        paths: {
            "AppPage": 'AppPage',
            "dot": 'plugins/doT/doT',
            "jQcss3": 'plugins/jQcss3/jQcss3',
            "bootstrap": "ui/bootstrap/bootstrap-amd",
            "materialize": "ui/materialize/materialize",
            "threeJS": 'plugins/threeJS/three.min',
            "zeroClipboard": 'plugins/ZeroClipboard/ZeroClipboard',
            "fullPage": 'plugins/jquery.fullPage.min',
            "mousewheel": "plugins/jquery.mousewheel",
            "velocity": "plugins/velocity.min",
            "echarts": "../node_modules/echarts/dist/echarts"
        }
    });
})(this);