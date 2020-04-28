<template>
  <div id="app">
    <div class="container">
      <h1>Pagination playground</h1>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in data" :key="user.id.value">
              <td>{{ user.id.value }}</td>
              <td>{{ user.name.first }} {{ user.name.last}}</td>
              <td>{{ user.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="infos">
        <p>
          Page {{ currentPage }} — Résultats: {{ results.start }} - {{ results.end }} sur {{ total}}
        </p>
        <input
          v-model.number="resultsPerPage"
          @change="goToPage(currentPage)"
          type="number">
      </div>
      <div class="pagination">
        <button @click="previous">&lt;</button>
        <button :class="{ active: currentPage === 1 }" @click="goToPage(1)">1</button>
        <span v-if="pages[0] !== 2">...</span>
        <button
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
          v-for="page in pages"
          :key="page">
          {{ page }}
        </button>
        <span v-if="pages.slice(-1)[0] !== lastPage - 1">...</span>
        <button
          :class="{ active: currentPage === lastPage}"
          v-if="lastPage"
          @click="goToPage(lastPage)">
          {{ lastPage}}
        </button>
        <button @click="next">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api';
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
      resultsPerPage: 25,
      params: filters,
      totalPageTransformer: (response) => response.pagination.totalPage,
      totalTransformer: (response) => response.pagination.total,
      dataTransformer: (response) => response.data,
    });

    paginate.goToPage(1);

    const results = computed(() => {
      const start = (paginate.currentPage.value - 1) * paginate.resultsPerPage.value + 1;
      const end = start + paginate.data.value.length - 1;

      return { start, end };
    });

    return {
      ...paginate,
      results,
    };
  },
});
</script>

<style>
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}
body {
  line-height: 1;
}
ol, ul {
  list-style: none;
}
blockquote, q {
  quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}

</style>


<style>
h1 {
  font-size: 2em;
  font-weight: 600;
  margin: 50px 0;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.table-wrap {
  position: relative;
  height: 500px;
  overflow-y: auto;
}

table {
  border-collapse: collapse;
  overflow: auto;
  height: 500px;
}

table th, table td {
  text-align: left;
  padding: 10px 20px;
}

tr:nth-child(even), thead tr {
  background-color: #ccc;
}

.infos p {
  margin: 20px 0;
  text-align: left;
}

.infos input {
  padding: 8px;
  border-radius: 4px;
  border: solid 1px #ccc;
  font-size: 14px;
  width: 50px;
}

.pagination {
  margin: 10px 0;
  display: flex;
}

.pagination span {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination button {
  cursor: pointer;
  background: none;
  outline: none;
  font-size: 1em;
  width: 30px;
  height: 30px;
  margin: 0 5px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: solid 1px #ccc;
  border-radius: 4px;
}

.pagination button:hover {
  background-color: lightblue;
}

.pagination button.active {
  font-weight: bold;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
}
</style>
