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