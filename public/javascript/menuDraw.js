$().ready(() => {
        const inst = new mdui.Drawer('#drawerContainer');
        $('#drawerBtn').click(function () {
            inst.toggle();
        })
    }
);