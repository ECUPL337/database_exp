$().ready(() => {
    const quantity = $('#quantity');
    const resetBtn = $('#resetBtn');
    const goodTable = $('#goodTable');
    const goodTableFoot = $('#goodTableFoot');
    const addForm = $('#addForm');
    const progressCircle = $("#progressCircle");
    const progressBar = $("#progressBar");
    const form = new Map();

    const preventNaNInput = e => {
        if (e.keyCode < 48 || e.keyCode > 57) e.preventDefault()
    }

    const DefaultKeyListener = e => {
        switch (e.key) {
            case "q":
                quantity.focus();
                break;
            case "a":
                e.preventDefault();
                $('#addBtn').click();
                break;
            case "Tab":
                e.preventDefault();
                $('#GID').focus();
                break;
            case "r":
                resetBtn.click();
                break;
            case "e":
                $('#member').focus();
                break;
            case "c":
                break;
            case "Enter":
                $('#checkoutBtn').click();
                break;
            case "d":
                $('#removeGood').click();
                break;
            default:
                break;
        }
    };

    const DialogKeyListener = e => {
        switch (e.key) {
            case "Enter":
                const confirmBtn = $(".checkoutConfirmDialog").find(".mdui-dialog-actions").children().eq(1);
                console.log(confirmBtn);
                confirmBtn[0].click();
                break;
            default:
                break;
        }
    }
    const fetchTimeout = (url, options, timeout = 5000) => {
        return Promise.race([fetch(url, options), new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Request Timeout"));
            }, timeout);
        })])
    }

    const renderTableFoot = function () {
        let totalItem = goodTable[0].rows.length;
        if (!totalItem) {
            goodTableFoot.hide();
        } else {
            let quanSum = 0, moneySum = 0.0;
            $('tr.item').each(function () {
                let $this = $(this);
                quanSum += Number($this.find(".GQuan").text());
                moneySum += Number($this.find(".GSum").text());
            })
            $('#totalItem').text(`共${totalItem}项`);
            $('#quanSum').text(`共${quanSum}件`);
            $('#moneySum').text(`共${moneySum.toFixed(2)}元`);
            goodTableFoot.show();
        }
    }


    const appendGoods = req => {
        if (!req.GID || !req.quantity) {
             mdui.snackbar({
                message: "不能为空",
                timeout: 800,
                position: "left-top"
            })
        } else {
            let quan = form.get(Number(req.GID));
            if (quan !== undefined) {
                let item = $(`#item${req.GID}`);
                let itemPrice = item.children(".GPrice");
                let itemQuan = item.children(".GQuan");
                let itemName = item.children().eq(1).text();
                form.set(Number(req.GID), +quan + Number(req.quantity));
                itemQuan.text(+itemQuan.text() + Number(req.quantity));
                item.children(".GSum").text((Number(itemPrice.text()) * Number(itemQuan.text())).toFixed(2));
                renderTableFoot();
                mdui.snackbar({
                    message: `${req.quantity}件${itemName}已添加`,
                    timeout: 800,
                    position: "right-top"
                })
            } else {
                progressCircle.show();
                fetchTimeout("/api/queryGood", {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(req),
                    cache: "no-cache"
                }).then(res => {
                    if (!res.ok) throw Error(res.statusText);
                    return res.json();
                }).then(resJson => {
                    if (resJson.goodExists) {
                        progressCircle.hide();
                        form.set(Number(req.GID), Number(req.quantity))
                        goodTable.append(`<tr class="item" id="item${req.GID}"> <th>${req.GID}</th> <th>${resJson.goodName}</th> <th class="GPrice">${(resJson.goodPrice).toFixed(2)}</th> <th class="GQuan">${req.quantity}</th> <th class="GSum">${(resJson.goodPrice * Number(req.quantity)).toFixed(2)}</th></tr>`);
                        renderTableFoot();
                        mdui.snackbar({
                            message: `${req.quantity}件${resJson.goodName}已添加`,
                            timeout: 800,
                            position: "right-top"
                        })
                    } else {
                        throw Error("Not Exist");
                    }
                }).catch(e => {
                    let msg;
                    switch (e.message) {
                        case "Unauthorized": {
                            msg = "无权查询，请重新登录";
                            break;
                        }
                        case "Not Exist": {
                            msg = "商品不存在";
                            break;
                        }
                        case "Not Found": {
                            msg = "API消失了！";
                            break;
                        }
                        case "Request Timeout":
                        case "Failed to fetch": {
                            msg = "网络错误";
                            break;
                        }
                        default: {
                            msg = "发生了未知错误";
                            break;
                        }
                    }
                    mdui.snackbar({
                        message: msg,
                        timeout: 800,
                        position: "right-top",
                        onClose: () => progressCircle.hide()
                    });
                })
            }
        }
    }

    const removeGood = req => {
        if (!req.GID || !req.quantity) {
            mdui.snackbar({
                message: "不能为空",
                timeout: 800,
                position: "left-top"
            })
        } else {
            let itemQuan = form.get(Number(req.GID));
            if (itemQuan !== undefined) {
                let item = $(`#item${req.GID}`);
                let itemQuan = item.children(".GQuan");
                if (Number(req.quantity) === Number(itemQuan.text())) {
                    form.delete(Number(req.GID));
                    item.remove();
                } else {
                    form.set(Number(req.GID), +itemQuan - Number(req.quantity));
                    itemQuan.text(+(itemQuan.text()) - Number(req.quantity));
                    item.children(".GSum").text(Number((item.children(".GPrice").text()) * Number(itemQuan.text())).toFixed(2));
                }
                renderTableFoot();
            } else {
                mdui.snackbar({
                    message: "所删商品不存在",
                    timeout: 800,
                    position: "left-top"
                })
            }
        }
    }

    const resetGood = () => {
        resetBtn.click();
        form.clear();
        goodTable.empty();
        goodTableFoot.empty()
    }
    const checkout = () => {
        mdui.dialog(({
            title: "确定要结账吗？",
            history: false,
            modal: true,
            cssClass: "checkoutConfirmDialog",
            onOpen: () => {
                $(document).unbind("keydown");
                $(document).keydown(e => DialogKeyListener(e));
            },
            onClose: () => {
                $(document).unbind("keydown");
                $(document).keydown(e => DefaultKeyListener(e));
            },
            buttons: [
                {
                    text: "取消 (Esc)"
                },
                {
                    text: "确定 (Enter)",
                    bold: true,
                    onClick: () => {
                        progressBar.show();
                        let memberID = $("#member").val();
                        let req = {
                            form: Array.from(form),
                            memberID: memberID
                        };
                        fetchTimeout("/api/purchase", {
                            method: "POST",
                            headers: {
                                "Content-Type": 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(req),
                            cache: "no-cache"
                        }, 5000)
                            .then(res => {
                                if (!res.ok) throw Error(res.statusText);
                                return res.json();
                            })
                            .then(json => {
                                if (json.res) {
                                    if (json.memberExists) {
                                        resetGood();
                                        progressBar.hide();
                                        let postfix = (json.credit !== undefined) ? "，当前会员积分为 " + json.credit : "";
                                        mdui.dialog({
                                            title: '结账成功',
                                            content: "消费金额为 " + json.sum + " 元" + postfix,
                                            buttons: [
                                                {
                                                    text: '继续 (ESC)',
                                                    onClose: () => {
                                                        $('#GID').focus();
                                                    }
                                                }
                                            ],
                                            history: false,
                                            overlay: true,
                                            modal: true,
                                        })
                                    }
                                }
                            })
                            .catch(e => {
                                console.log(e.message);
                                let msg;
                                switch (e.message) {
                                    case "Unauthorized":
                                        msg = "无权查询，请重新登录";
                                        break;
                                    case "Bad Request":
                                        msg = "请求有误";
                                        break;
                                    case "Internal Server Error":
                                        msg = "服务器内部错误";
                                        break;
                                    default:
                                        msg = "其他错误";
                                        break;
                                }
                                mdui.dialog({
                                    title: "错误",
                                    content: msg,
                                    history: false,
                                    buttons: [
                                        {
                                            text: "关闭 (ESC)",
                                        }
                                    ],
                                    onClose: () => {
                                        progressBar.hide();
                                    }
                                })
                            })
                    }
                }
            ],
        }))

    }

    $(document).keydown(e => DefaultKeyListener(e));

    $("#GID, #quantity, #member").on("keypress", preventNaNInput);

    $('#addBtn').click(() => {
        let test = addForm.serializeArray().reduce((m, o) => {
            m[o.name] = o.value;
            return m;
        }, {})
        appendGoods(test);
        resetBtn.click();
    });

    $('#removeGood').click(() => {
        let req = addForm.serializeArray().reduce((m, o) => {
            m[o.name] = o.value;
            return m;
        }, {});
        removeGood(req);
        resetBtn.click();
    })

    resetBtn.click(function () {
        addForm[0].reset();
        $('#GID').focus();
    });

    $('#checkoutBtn').click(() => {
        checkout();
    })

    $('#quantity, #GID, #member').on("focus", function () {
        $(this).select();
    });

    $('#plusOne, #plusTen').on('click', e => {
        let dic = {
            plusOne: 1,
            plusTen: 10
        };
        let num = +quantity.val() + dic[e.target.id];
        quantity.val(num);
    })
})