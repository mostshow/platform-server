/**
 * api
 */
'use strict'
const express = require('express');
const router = express.Router();

const projectController = require('../controller/project');

const userController = require('../controller/user');

const CertMiddleWare = require('../common/cert');

const roleController = require('../controller/role');

const operateRoleController = require('../controller/operate_role');

const varConfigController = require('../controller/var_config');

const pictureController= require('../controller/picture');

const piccategoryController= require('../controller/pic_category');

const projectStatusController = require('../controller/project_status');

const projectCategoryController= require('../controller/project_category');

const publishController= require('../controller/publish');



/**
 * user
 */
//管理员
router.use('/user/create',CertMiddleWare.adminRequired,userController.create);
router.use('/user/list',CertMiddleWare.adminRequired,userController.list);
router.use('/user/del',CertMiddleWare.adminRequired,userController.del);
router.use('/user/edit',CertMiddleWare.adminRequired,userController.edit);



router.use('/project/img/download',CertMiddleWare.adminRequired,CertMiddleWare.accessControl);

/**
 * role
 */
router.use('/roles/create',CertMiddleWare.adminRequired,roleController.create);
router.use('/roles/list',CertMiddleWare.adminRequired,roleController.list);
router.use('/roles/edit',CertMiddleWare.adminRequired,roleController.edit);
router.use('/roles/del',CertMiddleWare.adminRequired,roleController.del);

/**
 * operateRole
 *
 */
router.use('/operateRole/create',operateRoleController.create)
router.use('/operateRole/list',CertMiddleWare.adminRequired,operateRoleController.list)
router.use('/operateRole/edit',CertMiddleWare.adminRequired,operateRoleController.edit)
router.use('/operateRole/del',CertMiddleWare.adminRequired,operateRoleController.del)
router.use('/operateRole/view',CertMiddleWare.adminRequired,operateRoleController.view)
/**
 * variable config
 *
 */

router.use('/varconfig/create',CertMiddleWare.adminRequired,varConfigController.create)
router.use('/varconfig/list',CertMiddleWare.adminRequired,varConfigController.list)
router.use('/varconfig/edit',CertMiddleWare.adminRequired,varConfigController.edit)
router.use('/varconfig/del',CertMiddleWare.adminRequired,varConfigController.del)
router.use('/varconfig/view',CertMiddleWare.adminRequired,varConfigController.view)


/**
 * picture
 *
 */

router.use('/image/create',CertMiddleWare.userRequired,pictureController.create)
router.use('/image/list',CertMiddleWare.userRequired,pictureController.list)
router.use('/image/edit',CertMiddleWare.userRequired,pictureController.edit)
router.use('/image/del',CertMiddleWare.accessControl,pictureController.del)
router.use('/image/view',CertMiddleWare.userRequired,pictureController.view)

/**
 * pic_category
 *
 */

router.use('/imgCategory/create',CertMiddleWare.userRequired,piccategoryController.create)
router.use('/imgCategory/list',CertMiddleWare.userRequired,piccategoryController.list)
router.use('/imgCategory/edit',CertMiddleWare.userRequired,piccategoryController.edit)
router.use('/imgCategory/del',CertMiddleWare.accessControl,piccategoryController.del)
router.use('/imgCategory/view',CertMiddleWare.userRequired,piccategoryController.view)



/**
 * project_status
 *
 */

router.use('/prostatus/create',projectStatusController.create)
router.use('/prostatus/list',projectStatusController.list)
router.use('/prostatus/edit',projectStatusController.edit)
router.use('/prostatus/del',projectStatusController.del)




/**
 * project
 */
router.use('/project/create',CertMiddleWare.userRequired,projectController.create);
router.use('/project/list',projectController.list);
router.use('/project/edit',CertMiddleWare.adminRequired,projectController.edit);
router.use('/project/del',CertMiddleWare.accessControl,projectController.del);
router.use('/project/online',CertMiddleWare.userRequired,projectController.online);
router.use('/project/offline',CertMiddleWare.accessControl,projectController.offline);
router.use('/project/revert',CertMiddleWare.accessControl,projectController.revert);
router.use('/project/get',CertMiddleWare.userRequired,projectController.get);





/**
 * project_category
 *
 */

router.use('/proCategory/create',CertMiddleWare.userRequired,projectCategoryController.create)
router.use('/proCategory/list',CertMiddleWare.userRequired,projectCategoryController.list)
router.use('/proCategory/edit',CertMiddleWare.userRequired,projectCategoryController.edit)
router.use('/proCategory/del',CertMiddleWare.accessControl,projectCategoryController.del)
/**
 * publish
 *
 */

router.use('/publish/create',CertMiddleWare.adminRequired,publishController.create)
router.use('/publish/list',CertMiddleWare.userRequired,publishController.list)
router.use('/publish/edit',CertMiddleWare.adminRequired,publishController.edit)
router.use('/publish/del',CertMiddleWare.accessControl,publishController.del)



//普通用户
router.use('/user/login',userController.login);
router.use('/user/logout',userController.logout);
router.use('/user/modify',CertMiddleWare.userRequired,userController.modify);










//管理员
// router.post('/user/create',CertMiddleWare.adminRequired,userController.create);
// router.post('/user/list',CertMiddleWare.adminRequired,userController.getUserList);
// router.post('/user/del',CertMiddleWare.adminRequired,userController.del);
// router.post('/user/edit',CertMiddleWare.adminRequired,userController.edit);

//普通用户
// router.post('/user/login',userController.login);
// router.post('/user/logout',userController.logout);
// router.post('/user/modify',CertMiddleWare.userRequired,userController.modify);





module.exports = router;
