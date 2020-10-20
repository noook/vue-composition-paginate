import express from 'express';
import bodyParser from 'body-parser';
import queryParser from 'express-query-int';
import boolParser from 'express-query-boolean';
import users from './users.json';

export const app = express();

app.use(bodyParser.json());
app.use(queryParser());
app.use(boolParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const defaultQuery = {
  limit: 25,
  page: 1,
};

app.get('/users', (req, res) => {
  const { page, limit } = {
    ...defaultQuery,
    ...req.query,
  };

  const result = {
    data: users.slice((page - 1) * limit, (page - 1) * limit + limit),
    pagination: {
      page,
      total: users.length,
      resultsPerPage: limit,
      totalPage: Math.ceil(users.length / limit),
    },
  };

  res.send(result);
});
