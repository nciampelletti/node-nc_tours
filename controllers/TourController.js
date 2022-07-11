const Tour = require('../model/tourModel');

//ROUTE HANDLERS
exports.aliasTopTours = async (req, res, next) => {
  //localhost:8000/api/v1/tours?limit=5&sort=-ratingsAverage,price
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary, difficulty';

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    /* BUILD QUERY */
    //case 1
    //1a. Filtering
    const queryObj = { ...req.query };
    const excludeField = ['page', 'sort', 'limit', 'fields'];

    excludeField.forEach((el) => delete queryObj[el]);

    //1b. Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));

    //2. Sorting
    if (req.query.sort) {
      //http://localhost:8000/api/v1/tours?sort=-price,ratingAverage
      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy);
    } else {
      //default sort
      query = query.sort('-createdAt');
    }

    //3. Fields limiting
    //http://localhost:8000/api/v1/tours?fields=name,duration,difficulty,price
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      query = query.select(fields);
    } else {
      //default
      query = query.select('-__v'); //exclude last field
    }

    //4. Pagination
    //http://localhost:8000/api/v1/tours?page=2&limit=10
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skipValue = (page - 1) * limit;

    query = query.skip(skipValue).limit(limit);
    if (req.query.page) {
      const numTours = await Tours.countDocuments();
      if (skipValue >= numTours) throw new Error('This page doesnt exist');
    }

    /* EXECUTE QUERY */
    const tours = await query;

    ////case 2
    // const query =  Tour.find({
    //   duration: req.query.duration,
    //   difficulty: req.query.difficulty,
    // });

    ////case 3
    // const query =  Tour.find()
    //   .where('duration')
    //   .equals(req.query.duration)
    //   .where('difficulty')
    //   .equals(req.query.difficulty);

    /* SEND RESPONSE */
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({})
  // newTour.save()
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};