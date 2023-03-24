const { query } = require('express');
const Tour = require('./../Model/tourModel');
const APIFeature = require('./../Utils/APIFeature');
const ErrorHandler = require('./../Utils/ErrorHandler');
const catchAsync = require('./../Utils/catchAsync');

exports.aliasTopTour = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price,';
  req.query.fields =
    'name,price,ratingsAverage,duration,difficulty,price,summary';
  next();
};
exports.getAllTours = catchAsync( async (req, res,next) => {
  //EXECUTING QUERY
  const features = new APIFeature(Tour.find(), req.query)
    .filter()
    .sorting()
    .projection()
    .pagination();
  const tours = await features.query;
  //SENDING RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    },
  });
});
exports.getTourWithID = catchAsync(async (req, res,next) => {
  const tourWithID = await Tour.findById(req.params.id);
  if (!tourWithID) {
    return next(new ErrorHandler('No Tour Found with that ID 😞', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tourWithID,
    },
  });
});


exports.createNewTour = catchAsync( async (req, res,next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    message: '`Tour created.👌',
    data: {
      tour: newTour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    message: 'Tour updated.👌',
    data: {
      tour: tour,
    },
  });
});
exports.deleteTour = catchAsync(async (req, res,next) => {
  const delTour = await Tour.findByIdAndDelete(req.params.id);
   if (!delTour) {
     return next(new ErrorHandler('No Tour Found with that ID 😞', 404));
   }
  res.status(204).json({
    status: 'success',
    message: 'Tour Deleted Successfully👍',
  });
});
//====================== AGGREGATION PIPELINE ============================

exports.tourStatistics = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    {
      $group: {
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        totalTours: { $sum: 1 },
        totalRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { $_id : {$ne : 'EASY'} },
    // }
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });

});
exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
  const year = req.params.year * 1;
  console.log(year);
  const plan = await Tour.aggregate([
    {
      // It deconstruct the array field  from input documents and output single document for each element of an array, we want one tour for each of the stage. we want to unwind start_dates from the tour
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01,10:00`),
          $lte: new Date(`${year}-12-31,10:00`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        noOfToursEachMonth: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { noOfToursEachMonth: -1 },
    },
  ]);
  console.log(plan);
  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: {
      plan,
    },
  });
  // try {

  // } catch(err) {
  //   console.log(`Error❤️‍🔥: ${err}`);
  //   res.status(400).json({
  //     status: 'Failed',
  //     message: 'Failed to Tour Monthly Plan😞.',
  //   });
  // }
})
