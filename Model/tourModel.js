const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name is required.'],
      unique: [true, 'Tour name must be unique.']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour Duration is required.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour Group Size is required.'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour Difficulty is required.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult.',
      },
    },
    price: {
      type: Number,
      required: [true, 'Tour price is required.'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      // validate: {
      //   // this only points to current doc on NEW Document creation.
      //   validator: function (value) {
      //     return value < this.priceDiscount;
      //   },
      //   message: 'Discount price ({VALUE}) should be below regular price.'

      // }
      
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour Summary is required.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour Image Cover is required.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false // to hide from the users
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// virtual properties that are executed on the client side and are not stored in the database.
// ex: calculation of area or permiters.
tourSchema.virtual('durationWeeks').get(function () {
  if (this.duration >= 7) {
    return parseFloat((this.duration / 7).toFixed(2));
  }
  else {
    return this.duration = 1;
  }
  
}) 

// PRE HOOKS: MONGOOSE DOCUMENT MIDDLEWARE : runs bedore on .save() and .create() but not on other methods like insert etc.
/*
tourSchema.pre('save', function (next) {
  console.log(`I'm Document Middleware😉`);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc,next) {
  console.log(`POST HOOK: I'm Document Middleware😉 \n DOCUMENT: ${doc}`);
  next();
});
* */

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  console.log('Hi! I am Query Middleware🖐️');
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`QUERY TOOK ${Date.now() - this.start} MILLISECONDS`);
  next();
});

// tourSchema.pre('findOne', function (next) {
//   console.log('Hi! I am Query Middleware🖐️');
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
