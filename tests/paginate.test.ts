import { app } from './server';
import { AddressInfo } from 'net';
import axios from 'axios';
import usePaginate from '../src';

const server = app.listen();
const port = (server.address() as AddressInfo).port;

const baseURL = `http://localhost:${port}`;
const api = axios.create({
  baseURL,
});

interface User {
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  id: {
    name: string;
    value: string;
  };
}

interface ServerResponse {
  data: User[];
  pagination: {
    page: number;
    total: number;
    resultsPerPage: number;
    totalPage: number;
  }
}

beforeAll(async (done) => {
  const { data } = await api.get('/users');
  expect(data).toHaveProperty('data');
  expect(data).toHaveProperty('pagination');
  expect(data.data.length).toBe(data.pagination.resultsPerPage);
  done();
});

test('', async (done) => {
  const pagination = usePaginate<User, ServerResponse>({
    instance: api,
    dataTransformer: response => response.data,
    totalPageTransformer: response => response.pagination.totalPage,
    url: '/users',
  });
});

afterAll(() => {
  server.close();
});
