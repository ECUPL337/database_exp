const fetchWithTimeout = (url, options, timeout = 5000) => new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = ms => new Promise(() => setTimeout(() => controller.abort(), ms));
    const res = fetch(url, {
        ...options,
        signal: controller.signal
    });
    Promise.race([timer(timeout), res])
        .then(res => resolve(res))
        .catch(e => {
            if (e.name === "AbortError") reject(new Error('Request Timeout'));
            else reject(e);
        })
})

const resErrorHandler = res => {
    if (!res.ok) {
        let customError = new Error(res.statusText)
        customError.code = res.status
        throw customError
    } else return res.json();
}

const reqErrorHandler = e => {
    let errMsg;
    switch (e.code) {
        case 400:
            errMsg = "网络错误"
            break;
        case 500:
        case 404:
            errMsg = "服务器内部异常"
            break;
        case 600:
            errMsg = "该类型名已存在"
            break;
        default:
            errMsg = "未知错误"
            break;
    }
    mdui.snackbar({
        message: errMsg,
        position: "top",
        timeout: 1000
    });
}

let numberPerPage = 10;
let pageNum = 1;

const renderTypeList = (NumberPerPage, PageNumber) => {
    $("#tableDataRender").empty();
    $(".bottomLoadingIndicator").show();
    $(".noData, .tableArea, .bottomLoadingRetry").hide();
    fetchWithTimeout("/api/queryType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            PageNumber: PageNumber,
            NumberPerPage: NumberPerPage
        }),
        cache: "no-cache"
    }, 3000)
        .then(res => resErrorHandler(res))
        .then(json => {
            if (json.dbRes.length < 1) {
                $(".noData").show();
            } else {
                for (let element of json.dbRes) {
                    $("#tableDataRender")
                        .append(`<tr><td>${element.TID}</td><td>${element.TName}</td><td><button id="${element.TID}EditBtn" class="mdui-btn mdui-btn-icon mdui-ripple" onclick="editType(this)"><i class="mdui-icon material-icons">&#xe3c9;</i></button><button id="${element.TID}DelBtn" class="mdui-btn mdui-btn-icon mdui-ripple" onclick="delType(this)"><i class="mdui-icon material-icons">&#xe872;</i></button></td></tr>`)
                }
                $(".tableArea").show();
            }
        })
        .catch(e => {
            $(".bottomLoadingRetry").show();
            reject(e);
        })
        .finally(() => {
            $(".bottomLoadingIndicator").hide();
        })
}

const queryTypeCount = () => {
    fetchWithTimeout("/api/queryTypeCount", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        cache: "no-cache"
    }, 3000)
        .then(res => resErrorHandler(res))
        .then(json => {
            console.log(json);
            $("#typeCount").html(json.dbRes.TypeCount)
        })
}

const appendType = () => {
    let typeName = $("#typeName").val();
    if (typeName.length < 1) {
        mdui.snackbar({
            message: "类型名不能为空",
            position: "top",
            timeout: 1300
        });
        return;
    }
    $(".bottomLoadingIndicator").show();
    fetchWithTimeout("/api/appendType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            typeName: typeName
        }),
        cache: "no-cache"
    }, 3000)
        .then(res => resErrorHandler(res))
        .then(json => {
            if (json.res === false) {
                let customErr = new Error(json.errType)
                customErr.code = 600
                throw customErr
            }
            $("#typeName").val("");
            $("#retryBtn").click();

        })
        .catch(e => reqErrorHandler(e))
        .finally(() => {
            $(".bottomLoadingIndicator").hide();
        })
}

const editType = e => {
    let TID = String(e.id).slice(0, -7);
    let TName = "";
    $("#TNameEditDialogLabel").text("种类序号：" + TID).hide();
    $("#TNameEditDialogInput").val("").hide();
    $("#editDialog>.mdui-dialog-actions>button").prop("disabled", true);
    $("#TNameEditDialogIndicator").show();
    initEditDialog.open();
    fetchWithTimeout("/api/editType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            TID: TID
        }),
        cache: "no-cache"
    }, 3000)
        .then(res => resErrorHandler(res))
        .then(json => {
            TName = json.dbRes.TName
            $("#TNameEditDialogInput").prop("placeholder", TName).prop("disabled", false).show();
            $("#editDialog>.mdui-dialog-actions>button").prop("disabled", false);
            $("#TNameEditDialogLabel").show();
            $("#TNameEditDialogIndicator").hide();
            initEditDialog.handleUpdate();
        })
    $("#editDialogConfirmBtn").on("click", () => {
        let newTName = $("#TNameEditDialogInput").value();
        if(newTName.length < 1 && newTName === TName) {
            console.log(newTName);
        }
        fetchWithTimeout("/api/editType", {
            method: "POST",
            headers: {
                "Content-Type": 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                TID: TID,
                TName:TName
            }),
            cache: "no-cache"
        }, 3000)
    })
}

const delType = e => {
    let TID = String(e.id).slice(0, -6);
    fetchWithTimeout("/api/editType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            TID: TID
        }),
        cache: "no-cache"
    }, 3000)
        .then(res => resErrorHandler(res))
        .then(json => new Promise(resolve => {
            mdui.dialog({
                title: "确认删除？",
                content: "种类序号：" + TID + "，种类名称：" + json.dbRes.TName,
                buttons: [
                    {
                        text: "取消"
                    },
                    {
                        text: "删除",
                        bold: true,
                        onClick: () => {
                            resolve(TID)
                        }
                    }
                ],
                history: false,
                modal: true,
                closeOnEsc: false,
                cssClass: "delDialog"
            })
        }))
        .catch(e => {
            let errMsg = "未知错误，详情为：" + e.message;
            if (String(e.message).includes("Timeout")) {
                errMsg = "网络连接超时，请检查网络连接。错误信息：" + e.message;
            } else if (!isNaN(e.code)) {
                errMsg = "网络异常，请检查网络连接。错误代码：" + e.code + "，错误信息：" + e.message;
            }
            mdui.alert(errMsg, "错误", () => console.log(e), {
                confirmText: "好的",
                modal: true,
                history: false
            })
        })
        .then(TID =>
            fetchWithTimeout("/api/removeType", {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    TID: TID
                }),
                cache: "no-cache"
            }, 3000)
        )
        .then(res => resErrorHandler(res))
        .then(json => {
            console.log(json);
            mdui.alert("", "删除成功", () => {
                renderTypeList(numberPerPage, pageNum);
                queryTypeCount();
            }, {
                modal: true,
                history: false
            })
        })
        .catch(e => {
            let errMsg = "未知错误，详情为：" + e.message;
            if (String(e.message).includes("Timeout")) {
                errMsg = "网络连接超时，请检查网络连接，错误信息：" + e.message;
            } else if (!isNaN(e.code)) {
                errMsg = "网络异常，请检查网络连接。错误代码：" + e.code + "，错误信息：" + e.message;
            }
            mdui.alert(errMsg, "删除失败", () => console.log(e), {
                confirmText: "好的",
                modal: true,
                history: false
            })
        })

}


const initEditDialog = new mdui.Dialog("#editDialog", {
    modal: true,
    history: false,
    closeOnEsc: false,
    closeOnConfirm: false
})

$("#retryBtn").click(() => renderTypeList(numberPerPage, pageNum))

$("#resetBtn").click(() => $("#typeName").val(""))

$("#addBtn").click(() => appendType()
)


$(() => {
    renderTypeList(numberPerPage, pageNum);
    queryTypeCount();
})
