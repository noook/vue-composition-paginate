/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const users = require('./users.json');

const router = express.Router();

const defaultQuery = {
  limit: 25,
  page: 1,
};

router.get('/', (req, res) => {
  const { page, limit } = {
    ...defaultQuery,
    ...req.query,
  };
  console.log(req.query);

  const result = {
    data: users.slice(page * limit, page * limit + limit),
    pagination: {
      page,
      total: users.length,
      resultsPerPage: limit,
      totalPage: Math.ceil(users.length / limit),
    },
  };

  res.send(result);
});

module.exports = router;
