const express = require('express');
const tourController = require("./../Controllers/tourController.js");
const authController = require('./../Controllers/authController.js');
const router = express.Router();

// router.param("id", tourController.checkID);

router.route('/top-5-best').get(tourController.aliasTopTour, tourController.getAllTours);
router.route('/tour-stats').get(tourController.tourStatistics);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
//Mount route
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createNewTour);
router
  .route("/:id")
  .get(tourController.getTourWithID)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour);


module.exports = router;

