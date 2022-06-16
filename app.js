const express = require('express');
const fs = require('fs');
const filePath = `${__dirname}/dev-data/data/tours-simple.json`;
const port = 8000;

const app = express();
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(filePath));

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours },
  });
};

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(port, () => {
  console.log('App running ');
});
