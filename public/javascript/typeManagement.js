const $TNameEditDialogInput = $("#TNameEditDialogInput");
const $typeName = $("#typeName");
const $rowPerPage = $("#rowPerPage");
const $pageNumberInput = $("#pageNumberInput");

function resErrorHandler(res) {
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

function tableRowWrapper(TID, TName) {
    return `<tr><td>${TID}</td><td>${TName}</td><td><button id="${TID}EditBtn" class="mdui-btn mdui-btn-icon mdui-ripple" mdui-tooltip="{content:'编辑名称'}" onclick="editType(this)"><i class="mdui-icon material-icons">&#xe3c9;</i></button><button id="${TID}DelBtn" class="mdui-btn mdui-btn-icon mdui-ripple" mdui-tooltip="{content:'删除'}" onclick="delType(this)"><i class="mdui-icon material-icons">&#xe872;</i></button></td></tr>`
}

async function renderTypeList(RowPerPage = "10", PageNumber = "1") {
    if (!localStorage.getItem("rowPerPage")) {
        localStorage.setItem("rowPerPage", RowPerPage);
    }
    if (!localStorage.getItem("PageNumber")) {
        localStorage.setItem("pageNumber", PageNumber)
    }
    let int_rowPerPage = parseInt(RowPerPage);
    let int_pageNumber = parseInt(PageNumber);
    $rowPerPage.val(int_rowPerPage);
    $pageNumberInput.val(int_pageNumber);
    $("#tableDataRender").empty();
    $(".bottomLoadingIndicator").show();
    $(".noData, .tableArea, .bottomLoadingRetry").hide();

    await fetchWithTimeout("/api/queryType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            PageNumber: int_pageNumber,
            NumberPerPage: int_rowPerPage
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
                        .append(tableRowWrapper(json.TID, json.TName))
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

async function initializePage() {
    let init_rowPerPage = parseInt(localStorage.getItem("rowPerPage"), 10);
    let init_pageNumber = parseInt(localStorage.getItem("page"), 10);
    await renderTypeList(init_rowPerPage, init_pageNumber);
}

async function queryTypeCount() {
    let typeCount = 0;
    fetchWithTimeout("/api/queryTypeCount", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        cache: "no-cache"
    }, 3000)
        .then(res => resErrorHandler(res))
        .then(json => {
            $("#typeCount").text(json.dbRes.TypeCount)
            typeCount = parseInt(json.dbRes.TypeCount, 10);
        })
    return typeCount;
}

function appendType() {
    let typeName = $typeName.val();
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
            $typeName.val("");
            $("#retryBtn").click();
            mdui.snackbar(`\"${typeName}\"添加成功`, {
                timeout: 1500,
                position: "top"
            })
        })
        .catch(e => reqErrorHandler(e))
        .finally(() => {
            $(".bottomLoadingIndicator").hide();
        })
}

$TNameEditDialogInput.on("input change", e => {
    let newTName = $TNameEditDialogInput[0].value;
    let oldTName = $TNameEditDialogInput[0].placeholder;
    if (newTName !== oldTName && newTName.length > 0) {
        $("#editDialogConfirmBtn").prop("disabled", false);
    } else {
        $("#editDialogConfirmBtn").prop("disabled", true);
    }
})


function editType(e) {
    let TID = String(e.id).slice(0, -7);
    let TName = "";
    $("#TNameEditDialogLabel").text("种类序号：" + TID).hide();
    $TNameEditDialogInput.val("").hide();
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
            $TNameEditDialogInput.prop("placeholder", TName).prop("disabled", false).show();
            $("#editDialog>.mdui-dialog-actions button:first-child").prop("disabled", false);
            $("#TNameEditDialogLabel").show();
            $("#TNameEditDialogIndicator").hide();
            initEditDialog.handleUpdate();
        })
}

function delType(e) {
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
            if (json.res) {
                mdui.snackbar("删除成功", {
                    position: "top",
                    timeout: 1500,
                    onOpen: () => {
                        renderTypeList(numberPerPage, pageNum);
                        queryTypeCount();
                    }
                })
            } else {
                throw new Error("内部错误")
            }
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

$("#resetBtn").click(() => $typeName.val(""))

$("#addBtn").click(() => appendType()
)

document.getElementById("editDialog").addEventListener("confirm.mdui.dialog",
    () => {
        let newTName = $TNameEditDialogInput[0].value;
        let oldTName = $TNameEditDialogInput[0].placeholder;
        let TID = $("#TNameEditDialogLabel").text().slice(5);
        if (!$TNameEditDialogInput[0].checkValidity()) {
            mdui.snackbar("不能为空", {
                position: "top",
                timeout: 1500
            })
        } else if (newTName === oldTName) {
            mdui.snackbar("名称与原来相同", {
                position: "top",
                timeout: 1500
            })

        } else {
            fetchWithTimeout("/api/editType", {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    TID: TID,
                    TName: newTName
                }),
                cache: "no-cache"
            }, 3000)
                .then(res => resErrorHandler(res))
                .then(json => {
                    if (json.res) {
                        mdui.snackbar("名称修改成功", {
                            timeout: 1500,
                            position: "top"
                        });
                        initEditDialog.close();
                    } else {
                        alert(json.res)
                    }
                })
        }
    })


$(async () => {
    await initializePage();
    await queryTypeCount();
})
