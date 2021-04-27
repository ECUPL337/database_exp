$().ready(() => {
    let searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('dm')) {
        mdui.alert('该操作需要您先登录', '需要登录', function () {
        }, {
            confirmText: '好的',
            modal: true,
            history: false
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

    const login = function (type) {
        if (form[0].checkValidity()) {
            let info = form.serializeArray();
            info.push({name: "type", value: type});
            console.log(info);
            $.post('/api/login', info, function (data) {
                if (data.res) {
                    mdui.dialog({
                        history: false,
                        title: '登录成功',
                        closeOnEsc: false,
                        modal: true,
                        content: '欢迎您，' + data.username,
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
                        history: false,
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
                        history: false,
                        title: '网络错误',
                        content: '请检查网络连接',
                        buttons: [
                            {text: '好的'}
                        ]
                    })
                })
        } else repVal();
    }

    $('#loginBtn').click(function () {
        login(1);
    })

    $('#AdminLoginBtn').click(function () {
        login(0);
    })
})