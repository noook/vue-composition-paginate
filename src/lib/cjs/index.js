"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = require("vue");
function usePaginate({ instance, url, pageField = 'page', currentPage: page = 1, onUpdate = () => { }, params = vue_1.ref({}), dataTransformer = (results) => results, totalPageTransformer, totalTransformer, resultsPerPage = vue_1.ref(25), limitField = 'limit', range = 5, includeLimits = true, }) {
    const lastPage = vue_1.ref(1);
    const total = vue_1.ref(0);
    const loading = vue_1.ref(false);
    const limit = vue_1.isRef(resultsPerPage) ? resultsPerPage : vue_1.ref(resultsPerPage);
    const currentPage = vue_1.ref(page);
    // Update URL or trigger actions when page changes
    vue_1.watch(currentPage, (newValue) => onUpdate(newValue));
    const pages = vue_1.computed(() => {
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
    const data = vue_1.ref([]);
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
exports.default = usePaginate;
