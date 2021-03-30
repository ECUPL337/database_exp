$().ready(() => {

    $('#loginBtn').click(function () {
        let form = $('#loginForm')
        if (form[0].checkValidity()) {
            let info = form.serializeArray();
            console.log(info);
            let p = $.post('/api/login', info, function () {
                alert('Success!')

            })
                .fail(function () {
                    alert('Fail!')

                })
        } else form[0].reportValidity();

    })

    $('#AdminLoginBtn').click(function () {
        console.log("test")
    })
})