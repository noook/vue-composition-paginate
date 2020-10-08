import { ref, watch, computed, isRef, } from 'vue';
function usePaginate({ instance, url, pageField = 'page', currentPage: page = 1, onUpdate = () => { }, params = ref({}), dataTransformer = (results) => results, totalPageTransformer, totalTransformer, resultsPerPage = ref(25), limitField = 'limit', range = 5, includeLimits = true, }) {
    const lastPage = ref(1);
    const total = ref(0);
    const loading = ref(false);
    const limit = isRef(resultsPerPage) ? resultsPerPage : ref(resultsPerPage);
    const currentPage = ref(page);
    // Update URL or trigger actions when page changes
    watch(currentPage, (newValue) => onUpdate(newValue));
    const pages = computed(() => {
        const totalPages = lastPage.value;
        const paging = [];
        let start;
        if (currentPage.value >= (totalPages - (range / 2))) {
            start = Math.max(totalPages - range, 1);
        }
        else {
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
    const data = ref([]);
    function call() {
        loading.value = true;
        return instance.get(url, {
            // Query parameters are merged with the default ones provided in the URL option
            params: Object.assign({ [limitField]: limit.value, [pageField]: currentPage.value }, params.value),
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
    function goToPage(pageNumber) {
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
        data,
        total: totalTransformer ? total : undefined,
        resultsPerPage: limit,
    };
    if (!totalTransformer) {
        delete paginate.total;
    }
    return paginate;
}
export default usePaginate;
