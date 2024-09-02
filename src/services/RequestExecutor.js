import { useLayoutStore } from '@/store2/layout';


class RequestExecutor {
    baseUrl;
    loadingMask;
    #abortCtrls;

    constructor() {
        this.baseUrl = '';
        this.loadingMask = true;
        this.#abortCtrls = {};
        console.info('%cRequest executor init!', 'color: lightGreen;');
    }


    #generateHeaders() {
        let headers = {
            'accept': '*/*',
            'Content-Type': 'application/json;charset=UTF-8',
        };

        // Check for user and accessToken in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            headers['Authorization'] = 'Bearer ' + user.accessToken;
        }

        return headers;
    }

    get(url, code, needAbort) {
        return this.execute(
            code ? url + '/' + code : url,
            false,
            { method: 'GET', headers: this.#generateHeaders() },
            null,
            needAbort
        );
    }

    post(url, data, needAbort) {
        return this.execute(
            url,
            false,
            { method: 'POST', headers: this.#generateHeaders() },
            data,
            needAbort
        );
    }

    put(url, code, data) {
        return this.execute(
            url + '/',
            false,
            { method: 'PUT', headers: this.#generateHeaders() },
            data
        );
    }

    delete(url, data) {
        return this.execute(
            url + '/',
            false,
            { method: 'DELETE', headers: this.#generateHeaders() },
            data
        );
    }

    async execute(url, exact, init, data, needAbort) {
        const layoutStore = useLayoutStore();
        if (this.loadingMask) layoutStore.setIsLoading(true);

        const abortCtrlKey = init?.method + url;

        try {
            if (this.#abortCtrls[abortCtrlKey]?.signal)
                this.#abortCtrls[abortCtrlKey].abort();

            if (needAbort) {
                this.#abortCtrls[abortCtrlKey] = new AbortController();
                init = {
                    ...init,
                    signal: this.#abortCtrls[abortCtrlKey]?.signal,
                };
            }

            if (data) init = { ...init, body: JSON.stringify(data) };

            const location = exact ? url : this.baseUrl + url;
            const response = await fetch(location, init);

            if (response.status === 404) throw new Error('Not found!');
            if (response.status === 500) throw new Error(await response.text());

            return await response.json();
        } catch (error) {
            console.error(error);
            throw new Error(error);
        } finally {
            if (this.loadingMask) layoutStore.setIsLoading(false);
        }
    }
}

export default new RequestExecutor();
