"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Observable_1 = require("rxjs/Observable");
const ts_md5_1 = require("ts-md5");
class rxios {
    constructor(options = {}) {
        this.options = options;
        this._tokens = {};
        this._httpClient = axios_1.default.create(options);
    }
    _makeRequest(method, url, queryParams, body, fullResponse = false) {
        let request;
        const hashStr = `${url}${JSON.stringify(queryParams)}${JSON.stringify(body)}`;
        const hash = ts_md5_1.Md5.hashStr(hashStr);
        if (this._tokens[hash]) {
            this._tokens[hash].cancel();
        }
        this._tokens[hash] = axios_1.default.CancelToken.source();
        switch (method) {
            case 'GET':
                request = this._httpClient.get(url, { params: queryParams, cancelToken: this._tokens[hash].token });
                break;
            case 'POST':
                request = this._httpClient.post(url, body, { params: queryParams, cancelToken: this._tokens[hash].token });
                break;
            case 'PUT':
                request = this._httpClient.put(url, body, { params: queryParams, cancelToken: this._tokens[hash].token });
                break;
            case 'PATCH':
                request = this._httpClient.patch(url, body, { params: queryParams, cancelToken: this._tokens[hash].token });
                break;
            case 'DELETE':
                request = this._httpClient.delete(url, { params: queryParams, cancelToken: this._tokens[hash].token });
                break;
            default:
                throw new Error('Method not supported');
        }
        return new Observable_1.Observable(subscriber => {
            request.then(response => {
                subscriber.next(fullResponse ? response : response.data);
                subscriber.complete();
            }).catch((err) => {
                if (axios_1.default.isCancel(err)) {
                    err.message = `Previous ${method} cancelled.`;
                }
                subscriber.error(err);
                subscriber.complete();
            });
        });
    }
    request(config) {
        return new Observable_1.Observable(subscriber => {
            this._httpClient.request(config).then(response => {
                subscriber.next(response);
                subscriber.complete();
            }).catch((err) => {
                subscriber.error(err);
                subscriber.complete();
            });
        });
    }
    get(url, queryParams, fullResponse) {
        return this._makeRequest('GET', url, queryParams, undefined, fullResponse);
    }
    post(url, body, queryParams, fullResponse) {
        return this._makeRequest('POST', url, queryParams, body, fullResponse);
    }
    put(url, body, queryParams, fullResponse) {
        return this._makeRequest('PUT', url, queryParams, body, fullResponse);
    }
    patch(url, body, queryParams, fullResponse) {
        return this._makeRequest('PATCH', url, queryParams, body, fullResponse);
    }
    delete(url, queryParams, fullResponse) {
        return this._makeRequest('DELETE', url, queryParams, undefined, fullResponse);
    }
}
exports.rxios = rxios;
exports.Rxios = rxios;
//# sourceMappingURL=index.js.map