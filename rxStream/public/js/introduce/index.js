require([
  'mousewheel', 'fullPage', 'threeJS'
], function () {
  $(function () {
    initUser();
    var waves = new wave();
    waves.init();
    waves.animate();

    //翻页
    var leave;
    var pc_html = $('.m-page-03 .pc').html();
    var fullPageStayTimes = [{}, {}, {}, {}, {}, {}, {}];
    $('#j-page').fullpage({
      anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6'],
      menu: '#j-page-menu',
      navigation: true,
      afterLoad: function (anchorLink, index) {
        if (index == 1) {
          clearline();
        }
        if (index == 2) {
          clearline();
        }
        if (index == 3) {
          pc_line();
        }
        if (index == 4) {
          clearline();
        }
        if (index == 5) {
          clearline();
        }
        if (index == 6) {
          clearline();
        }
      },
      onLeave: function (index, direction) {
        if (index == '3') {
          pc_line(0);
        }
      }
    });
    //线条
    line($('.m-page-01 .m-line'));

    //鼠标
    mouse($(".m-page-02"));

    //日期
    today();

    //产品
    products();

  });

  function initUser() {
    var userId = localStorage.getItem('bas_userId');
    var userName = localStorage.getItem('bas_userName');
    if (userId && userName) {

      $('#userInfo a').text(userName);
      $('#userInfo').show().next('li').show();
      $('#startAnalysis').show();
      $('#userLogin').hide();
      $.ajax({
        method: 'get',
        url: window.__api_path + '/services/user/status?r=' + Math.random(),
        data: "",
        success: function (data) {
          var success = data.success;
          if (success) {
            $('#userInfo a').text(userName)
            $('#userInfo').show().next('li').show();
            $('#startAnalysis').show();
            $('#userLogin').hide();
          } else {
            $('#userInfo').hide().next('li').hide();
            $('#startAnalysis').hide();
            $('#userLogin').show();
          }
        }
      });

    } else {
      $('#userInfo').hide().next('li').hide();
      $('#startAnalysis').hide();
      $('#userLogin').show();
    }
  }

  //页面01-线条
  function line(lines_obj) {
    var lines = lines_obj.find("ul");

    for (var i = 0; i < lines.length; i++) {
      lines.eq(i).html("<li></li><li></li><li></li><li></li><li></li><li></li>");
    }

    inLine(lines, 0, 9000);
    inLine(lines, 1, 6000);
    inLine(lines, 2, 12000);
    inLine(lines, 3, 3000);
    inLine(lines, 4, 3000);
  }

  function inLine(lines, num, speed) {
    var oLines = lines.eq(num);

    oLines.animate({
      left: -(1200 * 3)
    }, speed, "linear", function () {
      oLines.css("left", 0);
      inLine(lines, num, speed);
    })
  }

  //页面02-鼠标
  function mouse(mouse_obj) {

    var index_xh = setInterval(function () {
      page02bg($(".m-page-02 .page-bg-03"), -100, //X轴
        40, //Y轴
        20, //X轴移动距离
        9, //Y轴移动距离
        20, //X轴速度
        30, //Y轴速度
        -0.5 //灵活速度
      );
      page02bg($(".m-page-02 .page-bg-02"), -90, //X轴
        40, //Y轴
        20, //X轴移动距离
        20, //Y轴移动距离
        10, //X轴速度
        30, //Y轴速度
        -0.2 //灵活速度
      );
      page02bg($(".m-page-02 .page-bg-01"), -90, //X轴
        40, //Y轴
        20, //X轴移动距离
        9, //Y轴移动距离
        10, //X轴速度
        10, //Y轴速度
        -0.1 //灵活速度
      );
      page02bg($(".m-page-02 .page-line"),
        100, //X轴
        330, //Y轴
        20, //X轴移动距离
        9, //Y轴移动距离
        10, //X轴速度
        15, //Y轴速度
        -0.5 //灵活速度
      );
      page02bg($(".m-page-02 .page-line-2"),
        850, //X轴
        360, //Y轴
        20, //X轴移动距离
        9, //Y轴移动距离
        10, //X轴速度
        10, //Y轴速度
        -0.5 //灵活速度
      );
    },
      0);

    function page02bg(j_element, sx, sy, mw, mh, bx, by, rx) {
      var mousepos = getMousePos(j_element);

      if (mousepos != null) {
        var top = parseInt(j_element.css("top"));
        var right = parseInt(j_element.css("right"));

        var t = top + (sy + mh - (mousepos.y - 100) / by - top) * 0.2;
        var l = right + (sx + mw - (mousepos.x - 100) / bx * rx - right) * 0.2;

        j_element.css({
          top: t,
          right: l
        })

      }
    }

    var ePageX = null;
    var ePageY = null;

    function getMousePos(expression) {
      if (ePageX == null || ePageY == null) return null;
      var _x = $(expression).position().left;
      _x += ePageX - $(expression).parent().position().left;
      var _y = $(expression).position().top;
      _y += ePageY - $(expression).parent().position().top;
      return {
        x: _x,
        y: _y
      }
    };

    mouse_obj.mousemove(function (event) {
      event = event || window.event;
      ePageX = event.pageX;
      ePageY = event.pageY;
    });
  }

  function today() {
    var fdate = new Date();
    var year = fdate.getFullYear();
    var month = fdate.getMonth() + 1;
    var day = fdate.getDate();

    if (month < 10) {
      month = "0" + month;
    }

    $(".page-line-date .day").html(day + "/" + month);
    $(".page-line-date .year").html(year);
  }
  //页面03-线
  function pc_line(line_leave) {

    var speed = 200;

    var lines = [
      function () {
        $('.hand').animate({
          "right": "196px"
        }, 1000, pc_line_show);
      },
      function () {
        user_w($('.user'));
      },
      function () {
        $('.line-01').animate({
          "width": getNum(40, 80)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-02').animate({
          "width": getNum(50, 80)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-03').animate({
          "width": getNum(30, 105)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-04').animate({
          "width": getNum(30, 105)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-05').animate({
          "width": getNum(40, 97)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-06').animate({
          "width": getNum(40, 97)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-07').animate({
          "width": getNum(40, 97)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-08').animate({
          "width": getNum(40, 97)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-09').animate({
          "height": "27px"
        }, speed, pc_line_show);
      },
      function () {
        $('.line-10').animate({
          "width": getNum(20, 78)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-11').animate({
          "width": getNum(20, 78)
        }, speed, pc_line_show);
      },
      function () {
        $('.line-12').animate({
          "width": getNum(20, 78)
        }, speed + 500, pc_line_show);
      },
      function () {
        $('.line-13').animate({
          "width": "29px"
        }, speed, pc_line_show);
      },
      function () {
        $('.line-14').animate({
          "height": "55px",
          "top": "32px"
        }, speed, pc_line_show);
      },
      function () {
        $('.line-15').animate({
          "width": "30px"
        }, speed, pc_line_show);
      },
      function () {
        $('.point-01').animate({
          "opacity": "1"
        }, speed, pc_line_show);
      },
      function () {
        user_w($('.user02'));
      },
      function () {
        $('.line-16').animate({
          "width": "121px"
        }, speed, pc_line_show);
      },
      function () {
        $('.point-02').animate({
          "opacity": "1"
        }, speed, pc_line_show);
      },
      function () {
        user_w($('.user03'));
      },
      function () {
        $('.line-17').animate({
          "width": "29px"
        }, speed, pc_line_show);
      },
      function () {
        $('.line-18').animate({
          "height": "91px"
        }, speed, pc_line_show);
      },
      function () {
        $('.line-19').animate({
          "width": "79px"
        }, speed, pc_line_show);
      },
      function () {
        $('.point-03').animate({
          "opacity": "1"
        }, speed, pc_line_show);
      },
      function () {
        user_w($('.user04'));
      }
    ];

    var pc_line_begin = $('.m-page-03 .pc');

    pc_line_begin.queue("line", lines);

    var pc_line_show = function () {
      pc_line_begin.dequeue("line");
    }

    if (line_leave == 0) {
      pc_line_begin.stop();
      pc_line_begin.clearQueue("line");
    } else {
      pc_line_begin.dequeue("line");
    }


    function user_w(user_add) {
      var user_speed = 50;

      user_add.animate({
        "opacity": "0"
      }, user_speed);
      user_add.animate({
        "opacity": "0.4"
      }, user_speed);
      user_add.animate({
        "opacity": "0"
      }, user_speed);
      user_add.animate({
        "opacity": "0.4"
      }, user_speed);
      user_add.animate({
        "opacity": "0"
      }, user_speed);
      user_add.animate({
        "opacity": "0.4"
      }, user_speed);
      user_add.animate({
        "opacity": "0"
      }, user_speed);
      user_add.animate({
        "opacity": "0.8"
      }, user_speed);
      user_add.animate({
        "opacity": "0"
      }, user_speed);
      user_add.animate({
        "opacity": "0.8"
      }, user_speed);
      user_add.animate({
        "opacity": "0"
      }, user_speed);
      user_add.animate({
        "opacity": "1"
      }, 500, pc_line_show);
    }

    function getNum(min, max) {

      num = Math.floor(Math.random() * max + 1);
      if (num < min) {
        getNum(min, max);
      }

      return num;
    }

  }

  function clearline() {
    $('.m-page-03 .pc .hand').animate({
      "right": "146px"
    }, 300, function () {
      $('.m-page-03 .pc div').removeAttr("style");
    });
  }

  //页面05-产品
  function products() {
    var win_height = $(".m-page-05").height();
    $(".m-page-05 .list ul li").height(win_height);
    $(".m-page-05 .list ul li .pro").height(win_height);
    $(".m-page-05 .list ul li .pro div").height(win_height);
    $(".m-page-05 .list-con .list-bg").height(win_height);
    $(".m-page-05 .list-con .con").height(win_height);


    $(".m-page-05 .list ul li").mouseenter(function () {
      $(".m-page-05 .list .up-icon").fadeOut();
      $(this).find(".pro div").css("display", "block");
      $(this).find(".pro div").animate({
        'top': '0px',
        'opacity': '1'
      }, 300);

      $(this).mouseleave(function () {
        $(this).find(".pro div").stop().animate({
          'top': '20px',
          'opacity': '0'
        }, 100, function () {
          $(this).css("display", "none");
        });

      });
    });

    $(".m-page-05 .list-con .con .close").mousedown(function () {
      $(".m-page-05 .list-con .con").animate({
        'right': "-20px",
        'opacity': '0'
      }, 100, function () {
        $(".m-page-05 .list-con").css("display", "none");
      });
    });
  }

  function pro_mouse(onlist) {
    switch (onlist) {
      case "pro01":
        var now = $('.m-page-05 .pro01');
        list_show(now);
        break;
      case "pro02":
        var now = $('.m-page-05 .pro02');
        list_show(now);
        break;
      case "pro03":
        var now = $('.m-page-05 .pro03');
        list_show(now);
        break;
      case "pro04":
        var now = $('.m-page-05 .pro04');
        list_show(now);
        break;
      case "pro05":
        var now = $('.m-page-05 .pro05');
        list_show(now);
        break;
    }

    function list_show(now_list) {
      now_list.css("display", "block");
      now_list.find(".con").animate({
        'right': "0px",
        'opacity': '1'
      }, 300);
    }
  }

  //页面06-波浪
  function wave() {

    var SEPARATION = 100,
      AMOUNTX = 50,
      AMOUNTY = 50;

    var container;
    var camera, scene, renderer;

    var particles, particle, count = 0;

    var mouseX = 0,
      mouseY = -300;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;


    this.init = function () {
      container = document.getElementById("wave");

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 1000;

      scene = new THREE.Scene();

      particles = new Array();

      var PI2 = Math.PI * 2;
      var material = new THREE.ParticleCanvasMaterial({

        color: 0xFFFFFF,
        program: function (context) {

          context.beginPath();
          context.arc(0, 0, 1, 0, PI2, true);
          context.fill();

        }

      });

      var i = 0;

      for (var ix = 0; ix < AMOUNTX; ix++) {

        for (var iy = 0; iy < AMOUNTY; iy++) {

          particle = particles[i++] = new THREE.Particle(material);
          particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
          particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
          scene.add(particle);

        }

      }
      renderer = new THREE.CanvasRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      $(window).resize(function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
      })
      container.appendChild(renderer.domElement);
      document.addEventListener('mousemove', onDocumentMouseMove, false);
    }

    function onWindowResize() {

      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

    }

    //

    function onDocumentMouseMove(event) {

      mouseX = 0;
      mouseY = -300;
      //mouseX = event.clientX - windowHalfX;
      //mouseY = event.clientY - windowHalfY;

    }

    function onDocumentTouchStart(event) {

      if (event.touches.length === 1) {

        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;

      }

    }

    function onDocumentTouchMove(event) {

      if (event.touches.length === 1) {

        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;

      }

    }

    this.animate = function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {

      camera.position.x += (mouseX - camera.position.x) * .05;
      camera.position.y += (-mouseY - camera.position.y) * .05;
      camera.lookAt(scene.position);

      var i = 0;

      for (var ix = 0; ix < AMOUNTX; ix++) {

        for (var iy = 0; iy < AMOUNTY; iy++) {

          particle = particles[i++];
          particle.position.y = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
          particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;

        }

      }

      renderer.render(scene, camera);

      count += 0.1;

    }

  }
  window.pro_mouse = pro_mouse;
})