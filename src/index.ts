import {
  ref, watch, computed, Ref, isRef,
} from 'vue';
import { AxiosInstance } from 'axios';

type PaginateOptions<T, Payload = T[]> = {
  instance: AxiosInstance;
  url: string;
  pageField?: string;
  limitField?: string;
  totalPageTransformer: (payload: Payload) => number;
  totalTransformer?: (payload: Payload) => number;
  dataTransformer: (payload: Payload) => T[];
  currentPage?: number;
  resultsPerPage?: Ref<number> | number;
  range?: number;
  includeLimits?: boolean;
  onUpdate?: (page?: number) => void;
  params?: Ref<Record<string, number | boolean | string>>;
}

interface PaginationData<T, Payload> {
  data: Ref<T[]>;
  pages: Ref<Readonly<number[]>>;
  currentPage: Ref<number>;
  goToPage: (page: number) => Promise<Payload>;
  previous: () => Promise<Payload>;
  next: () => Promise<Payload>;
  resultsPerPage: Ref<number>;
  total?: Ref<number>;
  lastPage: Ref<number>;
  loading: Ref<boolean>;
}

function usePaginate<T, Payload = T[]>(
  options: Omit<PaginateOptions<T, Payload>, 'totalTransformer'> & { totalTransformer: (payload: Payload) => number }
): PaginationData<T, Payload>

function usePaginate<T, Payload = T[]>(
  options: Omit<PaginateOptions<T, Payload>, 'totalTransformer'> & { totalTransformer?: undefined }
): Omit<PaginationData<T, Payload>, 'total'>

function usePaginate<T, Payload = T[]>({
  instance,
  url,
  pageField = 'page',
  currentPage: page = 1,
  onUpdate = () => {},
  params = ref({}),
  dataTransformer = (results) => results as unknown as T[],
  totalPageTransformer,
  totalTransformer,
  resultsPerPage = ref<number>(25),
  limitField = 'limit',
  range = 5,
  includeLimits = true,
}: PaginateOptions<T, Payload>): PaginationData<T, Payload> {
  const lastPage = ref<number>(1);
  const total = ref<number>(0);
  const loading = ref<boolean>(false);
  const limit = isRef(resultsPerPage) ? resultsPerPage : ref<number>(resultsPerPage);

  const currentPage = ref<number>(page);

  // Update URL or trigger actions when page changes
  watch(currentPage, (newValue) => onUpdate(newValue));

  const pages = computed<number[]>(() => {
    const totalPages = lastPage.value;
    const paging = [];
    let start: number;

    if (currentPage.value >= (totalPages - (range / 2))) {
      start = Math.max(totalPages - range, 1);
    } else {
      start = Math.max(currentPage.value - Math.floor(range / 2), 1);
    }

    for (let i = start; i <= Math.min(lastPage.value, ((start + range) - 1)); i += 1) {
      paging.push(i);
    }

    if (includeLimits) {
      paging.push(1, totalPages);
    }

    return paging
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .sort((a, b) => a - b);
  });


  const data = ref<T[]>([]);

  function call(): Promise<Payload> {
    loading.value = true;
    return instance.get<Payload>(url, {
      // Query parameters are merged with the default ones provided in the URL option
      params: {
        [limitField]: limit.value,
        [pageField]: currentPage.value,
        ...params.value,
      },
    }).then(({ data: results }) => {
      data.value = dataTransformer(results);
      lastPage.value = Math.max(totalPageTransformer(results), 1);

      if (totalTransformer) {
        total.value = totalTransformer(results);
      }

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
    currentPage.value = Math.min(Math.max(1, pageNumber), lastPage.value);
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

  const paginate = {
    currentPage,
    lastPage,
    loading,
    next,
    pages,
    goToPage,
    previous,
    total,
    data,
    resultsPerPage: limit,
  };

  if (!totalTransformer) {
    delete paginate.total;
  }

  return paginate;
}

export default usePaginate;
