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

function getPagination() {
  return usePaginate<User, ServerResponse>({
    instance: api,
    dataTransformer: response => response.data,
    totalPageTransformer: response => response.pagination.totalPage,
    url: '/users',
  });
}

test('Page 4 is fetched', async (done) => {
  const pagination = getPagination();
  await pagination.goToPage(4);

  expect(pagination.currentPage.value).toBe(4);

  done();
});

test('Fetching a page over the limit should fetch the last page', async (done) => {
  const pagination = getPagination();

  await pagination.goToPage(1);
  const pagePlusTwo = pagination.lastPage.value + 2;
  await pagination.goToPage(pagePlusTwo);

  expect(pagination.currentPage.value).not.toBe(3);
  expect(pagination.currentPage.value).toBe(pagePlusTwo - 2);

  done();
});

test('Reponse\'s data list length can be changed', async (done) => {
  const pagination = usePaginate<User, ServerResponse>({
    instance: api,
    url: '/users',
    totalPageTransformer: response => response.pagination.totalPage,
    dataTransformer: response => response.data,
    resultsPerPage: 40,
  });

  const basicPagination = getPagination();
  await basicPagination.goToPage(1);
  expect(basicPagination.data.value.length).toBe(25);

  await pagination.goToPage(1);
  expect(pagination.data.value.length).toBe(40);

  done();
});

afterAll(() => {
  server.close();
});
