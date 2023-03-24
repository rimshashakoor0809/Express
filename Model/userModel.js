const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
  },
  email: {
    type: String,
    required: [true, ' Please provide valid email.'],
    unique: [true, 'Email must be unique.'],
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide Valid Email Address'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    maxlength: 255,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm Password is required'],
    validate: {
      // This only works on SAVE and CREATE !!!
      validator: function (ele) {
        return ele.match(this.password);
      },
      message: 'Both Password and Confirm Password must be same.',
    },
  },
  passwordChangeAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: {
    type: String,
  }, 
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});


userSchema.pre('save', async function (next) {
  // Only run this function if password is modified
  if (!this.isModified('password')) return next();
  //hashing password with cost of 12, the more the cost, the more time-consuming and strong encryption will be
  this.password = await bcrypt.hash(this.password, 12);

  //delete the confirm password field
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: {$ne: false} });
  next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {
  console.log(this.passwordChangeAt);
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
    console.log('JWT Timestamp: ' + changedTimestamp);
    console.log(JWTTimestamp < changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  console.log({resetToken}, 'Token Generated: '+ this.passwordResetToken);   
  this.passwordResetExpires= Date.now() + 10 * 60 * 1000;
  return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;
