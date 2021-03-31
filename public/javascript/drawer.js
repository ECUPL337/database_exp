$().ready(function () {
    const drawerItem = $('#drawer').children().filter('.mdui-list-item')
    const render = {home: '/', login: '/login', register: '/register', about: '/about'}
    drawerItem.each(function () {
        let id = this.id;
        if (render[id] !== undefined) {
            $(this).click(() => {
                console.log('yes')
                window.location.replace(render[id]);
            })
        }

    })

})