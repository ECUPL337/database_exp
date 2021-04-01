$().ready(() => {
    let searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('dm')) {
        mdui.dialog({
            title: '需要登录',
            content:'该操作需要您先登录',
            buttons: [
                {text: '好的',
                close:true}]
        })
    }

    const form = $('#loginForm')

    const itemName = {
        'username': '用户名',
        'password': '密码'
    }
    const repVal = function () {
        form.find('input').each(function () {
            if (this.validity.valueMissing) {
                this.setCustomValidity((itemName[`${$(this).attr('name')}`]) + '不能为空');
            } else if (this.validity.patternMismatch) {
                this.setCustomValidity((itemName[`${$(this).attr('name')}`]) + '不能输入特殊字符');
            } else this.setCustomValidity('');
        });
        form[0].reportValidity();
    }


    $('#loginBtn').click(function () {
        if (form[0].checkValidity()) {
            let info = form.serializeArray();
            let p = $.post('/api/login', info, function (data) {
                if (data.res) {
                    mdui.dialog({
                        title: '登录成功',
                        closeOnEsc: false,
                        modal: true,
                        content: '欢迎您，' + data.CName,
                        buttons: [
                            {
                                text: '返回首页',
                                close: false,
                                onClick: () => {
                                    window.location.href = "/";
                                }
                            }
                        ]
                    })
                } else {
                    mdui.dialog({
                        title: '登录失败',
                        content: '请检查账号信息',
                        buttons: [
                            {text: '好的'}
                        ]
                    })
                }
            })
                .fail(function () {
                    mdui.dialog({
                        title: '网络错误',
                        content: '请检查网络连接',
                        buttons: [
                            {text: '好的'}
                        ]
                    })

                })
        } else repVal();
    })

    $('#AdminLoginBtn').click(function () {
        if (form[0].checkValidity()) {
            let info = form.serializeArray();
            let p = $.post('/api/adminLogin', info, function (data) {
                if (data.res) {
                    mdui.dialog({
                        title: '登录成功',
                        closeOnEsc: false,
                        modal: true,
                        content: '欢迎您，' + data.adminUsername,
                        buttons: [
                            {
                                text: '返回首页',
                                close: false,
                                onClick: () => {
                                    window.location.href = "/";
                                }
                            }
                        ]
                    })
                } else {
                    mdui.dialog({
                        title: '登录失败',
                        content: '请检查账号信息',
                        buttons: [
                            {text: '好的'}
                        ]
                    })
                }
            })
                .fail(function () {
                    mdui.dialog({
                        title: '网络错误',
                        content: '请检查网络连接',
                        buttons: [
                            {text: '好的'}
                        ]
                    })

                })
        } else repVal();

    })
})