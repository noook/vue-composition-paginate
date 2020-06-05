# Vue Composition Paginate

## Introduction

`vue-composition-pagination` is a ready to use [composition-api](https://github.com/vuejs/composition-api/)
composable tool around [axios](https://github.com/axios/axios) to help you dealing with paginated APIs.

It is fully written in Typescript and supports types out of the box.

# Installation 

**npm**
```bash
npm install vue-composition-paginate
```

**yarn**

```bash
yarn add vue-composition-paginate
```

# Usage

```javascript
import myAxiosInstance from '@/utils/axios-instance';

export default defineComponent({
  name: 'ListView',
  setup() {
    const paginate = usePaginate({
      // It can also be the basic instance of axios
      instance: myAxiosInstance,
      url: 'http://api.project.local/documents', // Or '/documents' if your instance has a prefix
      // Extract data from payload
      dataTransformer: (response) => response.data,
      // Extract total of pages from the payload
      totalPageTransformer: (response) => response.pagination.totalPage,
    });

    // Initiate the first call
    paginate.goToPage(1);

    return {
      // See below for details about this object
      ...paginate,
    };
  },
});
```

If you are using Typescript, you can also indicate through [generics](https://www.typescriptlang.org/docs/handbook/generics.html)
the type of the payload:

```javascript
import myAxiosInstance from '@/utils/axios-instance';

interface User {
  id: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
}

interface Payload {
  data: User[];
  pagination: {
    total: number;
    resultsPerPage: number;
    page: number;
    totalPage: number;
  };
}

export default defineComponent({
  name: 'ListView',
  setup() {
    // You will be able to benefit from type inference on properties of the `paginate` object
    // and `usePaginate` options.
    const paginate = usePaginate<User, Payload>({
      instance: myAxiosInstance,
      url: 'http://api.project.local/documents',
      dataTransformer: (response) => response.data,
      totalPageTransformer: (response) => response.pagination.totalPage,
    });

    paginate.goToPage(1);

    return {
      // See below for details about this object
      ...paginate,
    };
  },
});
```

# Options

| Name                 | Type                                                          | Required | Default                                | Description                                                                                                                                |
| -------------------- | ------------------------------------------------------------- | :------: | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| instance             | `AxiosInstance`                                               |  `true`  | —                                      | Axios instance used to make requests                                                                                                       |
| url                  | `String`                                                      |  `true`  | —                                      | URL of the resources to fetch. If you use a custominstance with a prefix, you can just use the resource path `/documents` for example.     |
| totalPageTransformer | <nobr>`(payload: Payload) => number`</nobr>                   |  `true`  | —                                      | Function called to extract the total number of pages out of the payload                                                                    |
| dataTransformer      | <nobr>`(payload: Payload) => T[]`</nobr>                      | `false`  | <nobr>`(results) => results`</nobr>    | Function called to extract the paginated results data out of the payload                                                                   |
| totalTransformer     | <nobr>`(payload: Payload) => number`</nobr>                   | `false`  | <nobr>`() => {}`</nobr>                | Function called to extract the total number of items out of the payload                                                                    |
| pageField            | `String`                                                      | `false`  | `"page"`                               | Name of the field in the query to specify the page we want to retrieve                                                                     |
| onUpdate             | <nobr>`(payload: Payload) => number`</nobr>                   | `false`  | <nobr>`(page?: number) => void`</nobr> | Function to call everytime the current page value is edited. May be useful to update the URL query parameters or to trigger other actions. |
| currentPage          | `Number`                                                      | `false`  | `1`                                    | Defines the current page to generate a range of pages around the current one                                                               |
| resultsPerPage       | `Ref<number> | number`                                        | `false`  | `25`                                   | Sets the limit of results to fetch at once                                                                                                 |
| limitField           | `String`                                                      | `false`  | `"limit"`                              | Name of the field in the query to specify the maximum number of items we want to fetch                                                     |
| range                | `Number`                                                      | `false`  | `5`                                    | Number of pages to display around the current one                                                                                          |
| includeLimits        | `Boolean`                                                     | `false`  | `true`                                 | Whether to add first and last pages in the page list around the current one                                                                |
| params               | <nobr>`Ref<Record<string, number | boolean | string>>`</nobr> | `false`  | `{}`                                   | Additional query params to add in the request. Must be a `ref` or a `computed` value, returning an object whose depth is 1.                |

# Return values

The function will return an object that is destructurable containing the following properties:

| Name                 | Type                                                          | Description                                                                                                                                |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| data                 | `Ref<T[]>`                                                    | Array of fetched results
| pages                  | `Ref<number[]>`                                                      | Generated list of pages around the current page (ex: `[1, 4, 5, <6>, 7, 8, 20]`) |
| currentPage | `Ref<number>`                   | Reactive reference of the current page                                                                    |
| goToPage      | <nobr>`(page: number) => Promise<Payload>`</nobr>                      | Function to call to go to a specific page. can be used to refresh the current query |
| previous      | <nobr>`(page: number) => Promise<Payload>`</nobr>                      | Function to call to go to the previous page |
| next      | <nobr>`(page: number) => Promise<Payload>`</nobr>                      | Function to call to go to the next page |
| resultsPerPage      | `Ref<number>`                    | Reactive reference of the limit of results per page |
| total      | `Ref<number> | undefined`                     | Reactive reference of the total number of items. `undefined` if no function to extract the total number of items is provided |
| lastPage      | `Ref<number>`                     | Reactive reference of the number of the last page |
| loading      | `Ref<boolean>`                     | Reactive reference of HTTP request completion state |