const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');



router.get('/' , userController.home);

router.get('/signup' , userController.signup)
router.post('/signup' , userController.adduser)

router.get('/login' , userController.login)
router.post('/login' , userController.myProfile)

router.get('/Dashboard' , userController.view)
router.post('/Dashboard', userController.find);

router.get('/adduser', userController.form);
router.post('/adduser', userController.create);

router.get('/edituser/:id', userController.edit);
router.post('/edituser/:id', userController.update);

router.get('/viewuser/:id', userController.viewall);

router.get('/Dashboard/:id',userController.delete);


//export the router
module.exports = router;