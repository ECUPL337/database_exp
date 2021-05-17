let toolTip1 = new mdui.Tooltip("#refreshBtn",{
    content:"重置"
});
let toolTip2 = new mdui.Tooltip("#addBtn", {
    content:"添加"
});

const fetchTimeout = (url, options, timeout = 5000) => {
    return Promise.race([fetch(url, options), new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("Request Timeout"));
        }, timeout);
    })])
}

const fetchTypeData = offset => {
    return fetchTimeout("/api/queryType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            offset: offset
        }),
        cache: "no-cache"
    },3000)
}

let offset = 0;

fetchTypeData(offset)
    .then(res => {
    if(!res.ok) throw new Error("NOT OK");
    return res.json();
})
    .then(json => {
        console.log(json);
        if(json.dbRes.length < 1) {
            $(".noData").show();
            $(".bottomLoadingIndicator, .typeTableArea").hide();
        }
        else {
            let dbRes = json.dbRes;
            for(let element of dbRes) {
                console.log(element);
                $("#dataRender").append(`<tr><th>${element.TID}</th><th>${element.TName}</th></tr>`)
            }
            $(".noData, .bottomLoadingIndicator").hide();
            $(".typeTableArea").show();
        }
    })
    .catch(e => {
        console.log(e);
    });