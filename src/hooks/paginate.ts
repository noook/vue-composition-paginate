import {
  ref, watch, computed, Ref,
} from '@vue/composition-api';
import axios from 'axios';

type PaginateOptions<T, Payload = T[]> = {
  url: string;
  totalPageTransformer: (payload: Payload) => number;
  totalTransformer: (payload: Payload) => number;
  dataTransformer?: (payload: Payload) => T[];
  currentPage?: number;
  resultsPerPage?: number;
  range?: number;
  updateFn?: (page?: number) => void;
  params?: Ref<Record<string | number, string | number | boolean>>;
}

export default function usePaginate<T, Payload = T[]>({
  url,
  currentPage: page = 1,
  updateFn = () => {},
  params = ref({}),
  dataTransformer = (results) => results as unknown as T[],
  totalPageTransformer,
  totalTransformer,
  resultsPerPage = 25,
  range = 5,
}: PaginateOptions<T, Payload>) {
  // Null at first, updated after the first call, according to the response pagination context
  const lastPage = ref<null | number>(null);
  const total = ref<number>(0);
  const loading = ref<boolean>(false);

  const currentPage = ref<number>(page);
  // Possibility to update the URL after changing the page for example
  watch(currentPage, (newValue) => updateFn(newValue));

  const pages = computed<number[]>(() => {
    const totalPages = (lastPage.value || 1) - 1;
    const paging = [];
    let start;

    if (!lastPage.value) {
      return [];
    } if (currentPage.value < (range / 2) + 1) {
      start = 2;
      // Don't go beyond the last page
    } else if (currentPage.value >= (totalPages - (range / 2))) {
      start = Math.floor(totalPages - range + 1);
    } else {
      start = (currentPage.value - Math.floor(range / 2));
    }

    for (let i = start; i <= Math.min(lastPage.value, ((start + range) - 1)); i += 1) {
      paging.push(i);
    }

    return paging;
  });

  const data = ref<T[]>([]);

  function call(): Promise<Payload> {
    loading.value = true;
    return axios.get<Payload>(url, {
      // Query parameters are merged with the default ones provided in the URL option
      params: {
        limit: resultsPerPage,
        page: currentPage.value,
        ...params.value,
      },
    }).then(({ data: results }) => {
      data.value = dataTransformer(results);
      lastPage.value = Math.max(totalPageTransformer(results), 1);
      total.value = totalTransformer(results);

      // Recursively call this function if the page is out of range,
      // according to the response pagination context
      if (currentPage.value > lastPage.value && lastPage.value !== 0) {
        currentPage.value = lastPage.value;
        return call();
      }
      return results;
    })
      .finally(() => loading.value = false);
  }

  function goToPage(pageNumber: number) {
    if (lastPage.value !== null) {
      currentPage.value = Math.min(Math.max(1, pageNumber), lastPage.value);
    }
    return call();
  }

  function previous() {
    currentPage.value = Math.max(1, currentPage.value - 1);
    return call();
  }

  function next() {
    currentPage.value = Math.min(lastPage.value || 1, currentPage.value + 1);
    return call();
  }


  return {
    currentPage,
    lastPage,
    loading,
    next,
    pages,
    goToPage,
    previous,
    data,
    total,
  };
}
