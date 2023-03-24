const User = require('../Model/userModel');
const catchAsync = require('./../Utils/catchAsync');
const errorHandler = require('./../Utils/ErrorHandler');

const filterObject = (body, ...fields) => {
  const newObj = {};
  Object.keys(body).forEach(ele => {
    if (fields.includes(ele)) {
      newObj[ele] = body[ele];
    }
  })
  return newObj;
}
exports.getAllUser = catchAsync (async(req, res,next) => {
  const getUser = await User.find();
  res.status(200).json({
    status: 'success',
    result: getUser.length,
    data: {
      user: getUser,
    },
  });
  console.log(getUser);
});
exports.getUserWithID = (req, res) => {
};
exports.deleteUser = catchAsync(async(req, res, next) => {
  const delUser = await User.findByIdAndDelete(req.params.id);
  if (!delUser) {
    return next(new ErrorHandler('No User Found with that ID 😞', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user: delUser,
    },
  });

});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const userAccount = User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    message: 'User deactivated.👌',
    data: {
      user: null,
    },
  })
})

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  // 1. throw error if user tries to update password
  if (req.body.password || req.body.confirmPassword) {
    return next(new errorHandler('Password cannot be updated here. Please use /updatePassword route🙂'));
  }
  // 2. if not, update the user personal info
  const filteredBody = filterObject(req.body, 'email', 'name');
  console.log(filteredBody);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  })
  res.status(201).json({
    status: 'success',
    message: 'Profile updated.👌',
    data: {
      user: updatedUser,
    },
  });

});


