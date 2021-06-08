// const fetchWithTimeout = async (url, options, timeout = 5000) => {
//     const controller = new AbortController();
//     const timer = setTimeout(() => controller.abort(), timeout);
//     const res = await fetch(url, {
//         ...options,
//         signal: controller.signal
//     });
//     clearTimeout(timer);
//     return res;
// }

/*
    ES5
 */
const fetchWithTimeout = (url, options, timeout = 5000) => new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = ms => new Promise(() => setTimeout(() => controller.abort(), ms));
    const res = fetch(url, {
        ...options,
        signal: controller.signal
    });
    Promise.all([timer(timeout), res])
        .then(res => resolve(res))
        .catch(e => {
            if (e.name === "AbortError") reject(new Error('Request Timeout'));
            else reject(e);
        })
})


let offset = 0;

var renderTypeList = offset => new Promise((resolve, reject) => {
    fetchWithTimeout("/api/queryType", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            offset: offset
        }),
        cache: "no-cache"
    }, 500)
        .then(res => {
            if (!res.ok) throw new Error("NOT OK");
            return res.json();
        })
        .then(json => {
        console.log(json);
        if (json.dbRes.length < 1) {
            $(".noData").show();
            $(".bottomLoadingIndicator, .typeTableArea").hide();
        } else {
            let dbRes = json.dbRes;
            for (let element of dbRes) {
                console.log(element);
                $("#dataRender").append(`<tr><th>${element.TID}</th><th>${element.TName}</th></tr>`)
            }
            $(".noData, .bottomLoadingIndicator").hide();
            $(".typeTableArea").show();
        }
    })
        .catch(e => reject(e))
        .finally(()=>{
        resolve();
    })
})

$(()=> {
    renderTypeList(offset)
        .catch(e => {
            console.log(e);
        });

})
