import { Ref } from 'vue';
import { AxiosInstance } from 'axios';
declare type PaginateOptions<T, Payload = T[]> = {
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
};
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
declare function usePaginate<T, Payload = T[]>(options: Omit<PaginateOptions<T, Payload>, 'totalTransformer'> & {
    totalTransformer: (payload: Payload) => number;
}): PaginationData<T, Payload>;
declare function usePaginate<T, Payload = T[]>(options: Omit<PaginateOptions<T, Payload>, 'totalTransformer'> & {
    totalTransformer?: undefined;
}): Omit<PaginationData<T, Payload>, 'total'>;
export default usePaginate;
