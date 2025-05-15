import { useLayoutStore } from '@/store2/layout';
import { useAuthStore } from "../store2/auth";
import ToastService from './ToastService';


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


        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            headers['Authorization'] = 'Bearer ' + user.accessToken;
        }

        return headers;
    }
    #generateHeadersFile() {
        let headers = {
            'accept': '*/*',
            // Do not include 'Content-Type' header when using FormData
        };

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
    postFile(url, formData, needAbort) {
        return this.execute(
            url,
            false,
            { method: 'POST', headers: this.#generateHeadersFile() }, // Headers without 'Content-Type'
            formData,  // Pass the formData directly
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

            if (data instanceof FormData) {
                const json = JSON.stringify(data);
                init = { ...init, body: data };
            } else if (data) {

                init = { ...init, body: JSON.stringify(data) };
            }

            const location = exact ? url : this.baseUrl + url;
            const response = await fetch(location, init);

            if (response.status === 401) {
                const authStore = useAuthStore();
                authStore.logout();
                window.location.href = "/login";
                return;
            }
            
            if (response.status === 403) {
                const errorMsg = 'Нет доступа. У вас недостаточно прав для выполнения этой операции.';
                ToastService.showError(errorMsg);
                throw new Error(errorMsg);
            }
            
            if (response.status === 404) {
                const errorMsg = 'Ресурс не найден (404)';
                ToastService.showError(errorMsg);
                throw new Error(errorMsg);
            }
            if (response.status === 500) {
                const errorText = await response.text();
                ToastService.showError(errorText || 'Внутренняя ошибка сервера (500)');
                throw new Error(errorText);
            }
            if (!response.ok) {
                const errorText = await response.text();
                ToastService.showError(errorText || `Ошибка запроса (${response.status})`);
                throw new Error(errorText || `HTTP error! Status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка запроса:', url, error);
            
            // Не показываем уведомление для ошибок прерывания запроса
            if (error.name !== 'AbortError') {
                // Формируем понятное сообщение об ошибке
                const errorMessage = this.#formatErrorMessage(error, url);
                ToastService.showError(errorMessage);
            }
            
            throw error;
        } finally {
            if (this.loadingMask) layoutStore.setIsLoading(false);
        }
    }

    #formatErrorMessage(error, url) {
        // Если ошибка связана с сетью
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            return 'Ошибка соединения с сервером. Проверьте подключение к интернету.';
        }
        
        // Если это таймаут
        if (error.name === 'TimeoutError') {
            return 'Превышено время ожидания ответа от сервера.';
        }
        
        // Если это ошибка CORS
        if (error.message.includes('CORS')) {
            return 'Ошибка доступа к ресурсу. Пожалуйста, обратитесь к администратору.';
        }
        
        // Для других ошибок используем сообщение ошибки или общее сообщение
        return error.message || 'Произошла ошибка при выполнении запроса';
    }
}

export default new RequestExecutor();

