$().ready(function () {
    const inst = new mdui.Drawer('#drawerContainer');
    $('#drawerBtn').click(function () {
        inst.toggle();
    })

    const drawerItem = $('#drawer').children().filter('.mdui-list-item')
    const render = {
        home: '/',
        login: '/login',
        register: '/register',
        about: '/about',
        dashboard: '/dashboard',
        cashier: '/cashier',
        redeem: '/redeem',
        history: '/history'
    }

    drawerItem.each(function () {
        if (!!render[this.id]) {
            $(this).click(() => {
                window.location.replace(render[this.id]);
            })
        }
    })

    const logOutBtn = $('#logout')
    if (logOutBtn.length) {
        logOutBtn.click(function () {
            // inst.close();
            $.post('/api/logout', function (data) {
                if (data.res) {
                    mdui.dialog({
                        title: '退出成功',
                        content: '您已经成功退出登录',
                        history: false,
                        buttons: [
                            {
                                text: '返回首页',
                                close: false,
                                onClick: () => {
                                    window.location.href = "./";
                                }
                            }]
                    })
                } else {
                    mdui.dialog({
                        history: false,
                        title: '错误',
                        content: data.errMsg,
                        buttons: [{
                            text: '前往登录',
                            close: false,
                            onClick: () => {
                                window.location.href = '/login?dm=1'
                            }
                        }]
                    })
                }
            })
        })
    }
})