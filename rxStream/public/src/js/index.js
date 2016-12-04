require(
    [
        'dot',
        'AppPage',
        './createApp'
    ],
    function (doT, AppPage, createApp) {

        // 查找自身或向上的祖先元素是否匹配
        $.iAncestor = function (elem, selector) {
            do {
                if ($(elem).is(selector))
                    return elem;
            } while (elem = elem.parentNode);
            return null;
        }


        var $menu = $('.left-menu');
        var $activedLis = $menu.find('li.branch-actived');

        // 接收跨文档消息（子窗口）
        window.onmessage = function onmessage(e) {
            switch (e.data) {
                // 子窗口页面离开（跳转）
                case 'mainFrameUnload':
                    showMainFrameLoading();
                    break;
                // 子窗口页面打开
                case 'mainFrameReady':
                    hideMainFrameLoading();
                    break;
                // 折叠父窗口边栏
                case 'collapseLeft':
                    collapseLeft();
                    break;
                // 展开父窗口边栏
                case 'expandLeft':
                    expandLeft();
                    break;
                default:
                    // 根据子窗口页面地址激活相应的树形菜单项
                    activeBranchByUrl(e.data);
                    break;
            }
        }

        // 显示加载子页面
        function showMainFrameLoading(url) {
            //$('.ui-mask').addClass('ui-mask-show');
        }

        // 完成加载子页面
        function hideMainFrameLoading(url) {
            //$('.ui-mask').removeClass('ui-mask-show');
        }

        // 根据URL地址激活相应的树形菜单项
        function activeBranchByUrl(url) {
            var rFolderPath = /^([^?#]+)[\\\/]/;
            $menu.find('a').each(function () {
                var href = this.href;
                rFolderPath.test(href);
                var folderPath = RegExp.$1;
                if (folderPath && url.indexOf(folderPath) > -1) {
                    activeBranch(this);
                    return false;
                }
            })
        }

        // 激活树形菜单项
        function activeBranch(a) {
            $activedLis.removeClass('branch-actived');
            $activedLis = $(a).parents('li').addClass('branch-actived');
        }

        // 折叠父窗口边栏
        function collapseLeft() {
            $(document.body).addClass('collapse-left');
        }

        // 折叠父窗口边栏
        function expandLeft() {
            $(document.body).removeClass('collapse-left');
        }

        $(function () {
            $('.header-logo').on('click', function () {
                $(document.body).toggleClass('collapse-left');
            });

            var rProtocol = /\w+:\/\//;

            $('.left-menu').on('click', function (e) {
                var a = $.iAncestor(e.target, 'a');
                if (a && rProtocol.test(a.href)) {
                    activeBranch(a);
                }
            });

            $("li[role='logOut']").on('click', function (e) {
              AppPage.loadApi({
                url: __api_path + '/services/user/logout',
                method: 'post',
                success: function (res) {
                  localStorage.removeItem('bas-sessionId');
                  localStorage.removeItem('bas_userId');
                  localStorage.removeItem('bas_userName');
                  window.location.href = '/introduce';
                }
              });
            });
        });

        $(function () {
            //请求左侧菜单的列表
            AppPage.loadApi({
                url: __api_path + '/services/analysis/getAnalysisTypes',
                method:'get',
                data: {},
                success: function (res) {
                    var submenuListTmplFn = doT.template($("#submenuListTmpl").text());
                    $('#user-analysis-menu-warp').html(submenuListTmplFn(res.dataObject));
                    AppPage.setAnalysisTypeMenu(res.dataObject);
                }
            });

            var appId = localStorage['bas_appId'], status = localStorage['bas_appStatus'];

            //请求APP 数据数量
            //ajax统一请求接口会自动拼装appId
            AppPage.loadApi({
                url: __api_path + '/services/analysis/getEventCount',
                type: 'get',
                success: function(res) {
                    if (res.success) {
                        $('.header-data-count span').html(formatNumber(res.dataObject));
                    }
                }
            });
            var appObj = createApp.create();
            if ((!appId || status != 1) && appId != 1) {
                appObj.initMark();
            }
            //格式化数字，默认按千们分隔
            function formatNumber(number) {
                number = ('' + number).replace(/,/g, "");
                var digit = number.indexOf("."); // 取得小数点的位置
                var int = digit > -1 ? number.substr(0, digit) : number;
                var mag = [];
                var word;
                for (var i = int.length; i > 0; i -= 3) {
                    word = number.substring(i, i - 3); // 每隔3位截取一组数字
                    mag.unshift(word);
                }
                return mag.join(',') + (digit > -1 ? number.substring(digit) : '');
            }
        });
    }
)