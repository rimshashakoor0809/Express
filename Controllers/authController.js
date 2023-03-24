const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');
const catchAsync = require('./../Utils/catchAsync');
const errorHandler = require('./../Utils/ErrorHandler');
const emailHandler = require('./../Utils/email');
const { request } = require('https');
const crypto = require('crypto');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role
  });

  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // const email = { ...req.body.email };

  // checking if email/password exists
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new errorHandler('User email and password does not exist😥', 400)
    );
  }

  // checking if email/password is correct

  const user = await User.findOne({ email }).select('+password');
  console.log(`USER🙆: ${user}`);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new errorHandler('Incorrect email and password😥', 401));
  }
  // if everything is okay, token is send to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: "You've successfully logged into the system😁",
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) fetching token and checking whether it exists or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2) Verification (signature): validate token
  if (!token) {
    return next(
      new errorHandler(
        "You're not logged in. Please log in to get access👮",
        401
      )
    );
  }

  
  // 3) check User exists or not

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  console.log(`PAYLOAD💛: ${JSON.stringify(decoded)}`);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new errorHandler(
        'User belonging to token no longer exist. Please register yourself to get access👮',
        401
      )
    );
  }

  // 4) check if user changes password after token issued or not

  // if (currentUser.changePasswordAfter(decoded.iat)) {
  //   return next(new errorHandler("User recently changed the password! Please try again 👮", 401))
  // };

  // ACCESS TO THE PROTECTED ROUTES
  req.user = currentUser;
  console.log(req.user);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      console.log('deleted');
      return next(new errorHandler(
        'You do not have permission to perform this action👮', 403)
      )
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get registered user email
  const emailUser = await User.findOne({ email: req.body.email })
  if (!emailUser) {
    return next(new errorHandler('There is no user with this email address😥',404))
  }
  // 2. generate random token/code to reset password
  const resetToken = emailUser.createPasswordResetToken();
  console.log(resetToken);
  await emailUser.save({validateBeforeSave: false});
  
  // 3. send it to user email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? submit a PATCH request with your new password and confirm password to this ${resetURL}.\n If you do not want to reset your password, please ignore this email!`;
  try {
    await emailHandler({
      email: emailUser.email,
      subject: 'Password Reset Token (valid for 10 mins)',
      message
    })
    res.status(200).json({
      status: 'success',
      message: `Token Send to your Email!\n Please check your inbox.`
    })
    
  } catch (error) {
    emailUser.passwordResetToken = undefined;
    emailUser.passwordResetExpires = undefined;
    await emailUser.save({ validateBeforeSave: false });
    console.log(error);
    return next(new errorHandler('There was an error with the reset Email. Please try again😥', 500))

  }
})
exports.resetPassword = async (req, res, next) => {

    // 1. get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log('Hashed Token: '+hashedToken);
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
   
    // 2. if the token has not expired and user exist, set the new password
    if (!user) {
      return next(new errorHandler('No token was found for this user, its either invalid or has expired😥', 404))
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = signToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token,
    });
    // 3. update changePasswordAt property for user
    // 4. log the user in by sending the jwt token
}
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user from the collection
  const user = await User.findById(req.params.id).select('+password');
  // 2. Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new errorHandler('Current password is wrong😥', 401))

  }
  // 3. if so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4. login the user and send jwt token
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
});