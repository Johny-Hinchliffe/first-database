const express = require('express');
const uc = require('./../controllers/userController.js');
const router = express.Router() 

router.route('/').get(uc.getAllUsers).post(uc.createUser);

router
  .route('/:id')
  .get(uc.getUser)
  .patch(uc.updateUser)
  .delete(uc.deleteUser);

  module.exports = router;