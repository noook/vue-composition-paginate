<template>
  <div id="app">

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import usePaginate from '@/hooks/paginate';

interface User {
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
  name: 'App',
  setup() {
    const filters = ref({
      test: true,
      order: 'ASC',
    });

    const paginate = usePaginate<User, Payload>({
      url: 'http://localhost:3333/users',
      currentPage: 1,
      resultsPerPage: 20,
      params: filters,
      totalPageTransformer: (response) => response.pagination.totalPage,
      totalTransformer: (response) => response.pagination.total,
      dataTransformer: (response) => response.data,
    });

    paginate.goToPage(1);

    return {
      ...paginate,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
