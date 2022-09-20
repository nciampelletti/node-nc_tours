class APIFeatures {
  //query - mongoose query, queryString - query that comes from route
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /* FILTERING */
  filter() {
    const queryObj = { ...this.queryString }; //query that comes from route
    // console.log(this.queryString === queryObj);
    const excludeField = ['page', 'sort', 'limit', 'fields'];

    excludeField.forEach((el) => delete queryObj[el]);

    //1b. Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //http://localhost:8000/api/v1/tours?sort=-price,ratingAverage
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      //default sort
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    //http://localhost:8000/api/v1/tours?fields=name,duration,price,ratingAverage
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      //default
      this.query = this.query.select('-__v'); //exclude last field
    }

    return this;
  }

  paginate() {
    //http://localhost:8000/api/v1/tours?page=2&limit=10
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipValue = (page - 1) * limit;

    this.query = this.query.skip(skipValue).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
