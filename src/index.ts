import axios, { AxiosInstance, AxiosRequestConfig, AxiosPromise, AxiosResponse, CancelTokenSource } from 'axios';
import { Observable } from 'rxjs/Observable';

export interface rxiosConfig extends AxiosRequestConfig {
	localCache?: boolean;
}

class rxios {
	public _httpClient: AxiosInstance;
	private _cancelTokenSource: CancelTokenSource = null;

	constructor(private options: rxiosConfig = {}) {
		this._httpClient = axios.create(options);
	}

	private _makeRequest<T>(method: string, url: string, queryParams?: object, body?: object, fullResponse: boolean = false) {
    let request: AxiosPromise<T>;
    
    if (this._cancelTokenSource.token) {
      this._cancelTokenSource.cancel(); 
    }

    this._cancelTokenSource = axios.CancelToken.source();  

		switch (method) {
			case 'GET':
				request = this._httpClient.get<T>(url, {params: queryParams, cancelToken: this._cancelTokenSource.token });
				break;
			case 'POST':
				request = this._httpClient.post<T>(url, body, {params: queryParams, cancelToken: this._cancelTokenSource.token});
				break;
			case 'PUT':
				request = this._httpClient.put<T>(url, body, {params: queryParams, cancelToken: this._cancelTokenSource.token});
				break;
			case 'PATCH':
				request = this._httpClient.patch<T>(url, body, {params: queryParams, cancelToken: this._cancelTokenSource.token});
				break;
			case 'DELETE':
				request = this._httpClient.delete(url, {params: queryParams, cancelToken: this._cancelTokenSource.token});
				break;

			default:
				throw new Error('Method not supported');
		}
		return new Observable<any>(subscriber => {
			request.then(response => {
				subscriber.next(fullResponse ? response : response.data);
				subscriber.complete();
			}).catch((err: Error) => {
        if (axios.isCancel(err)) {
          err.message = `Previous ${method} cancelled.`;
        }
        subscriber.error(err);
        subscriber.complete();
			});
		});
	}

	public request<T>(config: object) {
		return new Observable<any>(subscriber => {
			this._httpClient.request(config).then(response => {
				subscriber.next(response);
				subscriber.complete();
			}).catch((err: Error) => {
				subscriber.error(err);
				subscriber.complete();
			});
		});
	}

	public get<T>(url: string, queryParams?: object, fullResponse?: boolean) {
		return this._makeRequest<T>('GET', url, queryParams, undefined, fullResponse);
	}

	public post<T>(url: string, body: object, queryParams?: object, fullResponse?: boolean) {
		return this._makeRequest<T>('POST', url, queryParams, body, fullResponse);
	}

	public put<T>(url: string, body: object, queryParams?: object, fullResponse?: boolean) {
		return this._makeRequest<T>('PUT', url, queryParams, body, fullResponse);
	}

	public patch<T>(url: string, body: object, queryParams?: object, fullResponse?: boolean) {
		return this._makeRequest<T>('PATCH', url, queryParams, body, fullResponse);
	}

	public delete(url: string, queryParams?: object, fullResponse?: boolean) {
		return this._makeRequest('DELETE', url, queryParams, undefined, fullResponse);
	}
}

export {rxios, rxios as Rxios};
