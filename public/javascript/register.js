$().ready(() => {
    const form = $('#regForm');
    const itemName = {
        'username': '用户名',
        'password': '密码',
        'phone': '手机号',
        'workplace': '单位',
        'name': '姓名',
        'birthday': '生日'
    }

    const errType = {
        "UNIQUE": "已被注册",
        "NOTNULL":"为空"
    }

    const reportValid = function () {
        form.find('input').each(function () {
            console.log(this.validity)
            if (this.validity.valueMissing) {
                this.setCustomValidity(
                    itemName[`${$(this).attr('name')}`] + '不能为空'
                )
            } else if (this.validity.patternMismatch) {
                this.setCustomValidity((itemName[`${$(this).attr('name')}`]) + '只能为英文数字');
            } else
                this.setCustomValidity('');
        })
        form[0].reportValidity();
    }

    $('#regBtn').click(function (){
        if (form[0].checkValidity()) {
            let info = form.serializeArray();
            let p = $.post('/api/register', info, function (data) {
                if (data.res) {
                    mdui.dialog({
                        title: '注册成功!',
                        closeOnEsc: false,
                        modal: true,
                        content: '欢迎您，' + data.CName,
                        history: false,
                        buttons: [
                            {
                                text: '现在登录',
                                close: false,
                                onClick: () => {
                                    window.location.href = "/login";
                                }
                            },
                            {
                                text: '返回首页',
                                close:false,
                                onClick: () => {
                                    window.location.href = '/';
                                }
                            }
                        ]
                    })
                } else {
                    mdui.dialog({
                        modal: true,
                        title: '注册失败',
                        history: false,
                        content: itemName[data.errItem] + errType[data.errType],
                        buttons: [
                            {
                                text: '好的',
                                close: true
                            }
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
        } else reportValid();
    })

    $('#resetBtn').click(()=>{
        mdui.dialog({
            history: false,
            title: "操作确认",
            content: '确认要重置已填写的信息吗？',
            modal: false,
            buttons: [{
                text: '取消',
                close: true
            },
                {
                    text: '确认',
                    close: true,
                    onClick: () => {
                        form[0].reset();
                    }
                }]
        })
    })
})

