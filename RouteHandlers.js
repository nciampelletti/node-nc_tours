const fs = require('fs');

const filePath = `${__dirname}/dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(filePath));

//ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
  if (+req.params.id + 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  const tour = tours.find((el) => +req.params.id === el.id);

  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { tour: tour },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  //const newTour1 = Object.assign({ _id: newId }, req.body);
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);

  fs.writeFile(filePath, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  });
};

exports.updateTour = (req, res) => {
  if (+req.params.id + 1 > tours.length) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { tour: '<Updated our here >' },
  });
};

exports.deleteTour = (req, res) => {
  if (+req.params.id + 1 > tours.length) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
