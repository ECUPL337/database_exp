const router = require('express').Router();

const redirectHome = (req, res, next) => {
    if (req.session.adminUserID) {
        return res.redirect('/dashboard');
    } else if (req.session.userID) {
        return res.redirect('/')
    } else {
        next();
    }
}

const redirectLogin = (req, res, next) => {
    if (!req.session.adminUserID && !req.session.userID) {
        res.redirect('/login?dm=1');
    } else next();
}

const redirectIfNotAdmin = (req, res, next) => {
    if (!!req.session.adminUserID || req.app.get('env') === 'dev') {
        next();
    } else {
        if (!!req.session.userID) {
            let err = new Error('权限不足');
            err.status = 401;
            err.name = "Unauthorized";
            next(err);
        } else {
            res.redirect('/login?dm=1');
        }
    }
}

let cardFaces = [
    {
        title:"商品种类管理",
        desc: "管理所有商品种类",
        path:"/dashboard/goodsTypes",
        iconPath: "/statics/img/types.svg"
    },
    {
        iconPath: "/statics/img/goods.svg",
        title:"商品管理",
        desc:"管理所有商品",
        path:"/dashboard/goods"
    },
    {
        title:"会员列表",
        desc:"管理所有注册会员",
        path: "/dashboard/members",
        iconPath: "/statics/img/member.svg"
    },
    {
        title:"积分兑换管理",
        desc:"管理所有积分可兑换商品",
        path: "/dashboard/redeem",
        iconPath: "/statics/img/redeem.svg"
    },
    {
        title:"报表查看",
        desc:"查看消费报表、会员排名等",
        path: "/dashboard/statistics",
        iconPath: "/statics/img/statistics.svg"
    },
    {
        title:"折扣设置",
        path: "/dashboard/discount",
        iconPath: "/statics/img/discount.svg",
        desc:"管理商品和会员折扣"
    }
]
/*
 A middleware to render title and some variables.
*/
router.use((req, res, next) => {
    res.locals = {
        isLogin: !!req.session.userID,
        isAdminLogin: !!req.session.adminUserID,
        adminLevel: (!!req.session.adminLevel) ? req.session.adminLevel : 0,
        username: (!!req.session.username) ? req.session.username : '',
        isDev:(req.app.get('env') === 'dev')
    };
    next();
});


router.get('/', (req, res) => {
    res.render('index', {title: '首页'});
});

router.get('/login', redirectHome, (req, res) => {
    res.render('login', {title: '登录'});
})

router.get('/register', redirectHome, (req, res) => {
    res.render('register', {title: '注册'});
})

router.get('/about', (req, res) => {
    res.render('about', {title: '关于'});
})

router.get('/dashboard', redirectIfNotAdmin, ((req, res) => {
    res.render('dashboard', {title: 'Dashboard', cardFaces: cardFaces});
}))

router.get('/dashboard/goods', redirectIfNotAdmin, ((req, res) => {
    res.render('goodsManagement', {title: '商品管理'});
}))

router.get('/dashboard/members', redirectIfNotAdmin, ((req, res) => {
    res.render('memberManagement', {title: '会员列表'});
}))

router.get('/dashboard/redeem', redirectIfNotAdmin, ((req, res) => {
    res.render('redeemManagement', {title: '积分兑换管理'});
}))

router.get('/dashboard/statistics', redirectIfNotAdmin, ((req, res) => {
    res.render('statistics', {title: '报表查看'});
}))

router.get('/dashboard/discount', redirectIfNotAdmin, ((req, res) => {
    res.render('discountManagement', {title: '商品折扣设置'});
}))

router.get('/dashboard/goodsTypes', redirectIfNotAdmin, ((req, res) => {
    res.render('typeManagement', {title: '商品种类管理'});
}))

router.get('/cashier', redirectIfNotAdmin, (req, res) => {
    res.render('cashier', {title: '收银台'});
})

module.exports = router;
