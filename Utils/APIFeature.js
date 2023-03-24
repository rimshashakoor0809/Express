class APIFeature {
  constructor(query, queryResponse) {
    this.query = query;
    this.queryResponse = queryResponse;
  }
  filter() {
    const queryObj = { ...this.queryResponse };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((Element) => delete queryObj[Element]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    this.query.find(JSON.parse(queryString));
    return this;
  }

  sorting() {
    if (this.queryResponse.sort) {
      let sortBy = this.queryResponse.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  projection() {
    if (this.queryResponse.fields) {
      const fields = this.queryResponse.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  pagination() {
    let page = this.queryResponse.page * 1;
    let limit = this.queryResponse.limit * 1;
    let skipResult = (page - 1) * limit;
    this.query = this.query.skip(skipResult).limit(limit);
    return this;
  }
}
module.exports = APIFeature;