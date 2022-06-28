import axios, { AxiosResponse } from 'axios';
import { getApiBaseUrl } from 'common/utils/helpers/urlHelpers';

import axiosJWTDecoratorInstance from './axiosJWTDecorator';

// import { getApiBaseUrl } from '../utils/sharedFunctions';

export const actions = <T>(apiEndpoint: string, debugging: boolean = false) => {
    let baseApiUrl = getApiBaseUrl(debugging) + apiEndpoint + '/';

    return {
        azureFn: async (): Promise<T[]> => {
            return await axiosJWTDecoratorInstance.get('http://localhost:7071/api/HttpTriggerAbe')
                .then((response: AxiosResponse<T[]>) => {
                    debugger;
                    return response.data;
                });
        },
        create: async (item: T): Promise<T> => {
            return await axiosJWTDecoratorInstance.post(baseApiUrl, item)
                .then((response: AxiosResponse<T>) => {
                    return response.data;
                });
        },
        batchCreate: async (items: T[]): Promise<T[]> => {
            let itemList: any[] = [];
            items.map(x => itemList.push(axiosJWTDecoratorInstance.post(baseApiUrl, x)));
            return await axios.all(itemList)
                .then(axios.spread((...responses) => {
                    return responses;
                }));
        },
        readAll: async (): Promise<T[]> => {
            return await axiosJWTDecoratorInstance.get(baseApiUrl)
                .then((response: AxiosResponse<T[]>) => {
                    return response.data;
                });
        },
        readDetails: async (id: string): Promise<T> => {
            return await axiosJWTDecoratorInstance.get(baseApiUrl + id)
                .then((response: AxiosResponse<T>) => {
                    return response.data;
                });
        },
        readAllByProp: async (id: string, field: string): Promise<T[]> => {
            return await axiosJWTDecoratorInstance.get(baseApiUrl + "?" + field + "=" + id)
                .then((response: AxiosResponse<T[]>) => {
                    return response.data;
                });
        },
        update: async (item: T): Promise<T> => {
            return await axiosJWTDecoratorInstance.put(baseApiUrl, item)
                .then((response: AxiosResponse<T>) => {
                    return response.data;
                });
        },
        batchUpdate: async (items: T[]): Promise<T[]> => {
            let itemList: any[] = [];
            items.map((x: any) => itemList.push(axiosJWTDecoratorInstance.put(baseApiUrl + x.id, x)));
            return await axios.all(itemList)
                .then(axios.spread((...responses) => {
                    let finalResponse = [] as T[];
                    responses.forEach(x => finalResponse.push(x.data));
                    return finalResponse;
                }));
        },
        delete: async (id: string): Promise<any> => {
            return await axiosJWTDecoratorInstance.delete(baseApiUrl + id)
                .then((response: AxiosResponse<any>) => {
                });
        },
        batchDelete: async (itemIds: string[]): Promise<any> => {
            let itemList: any[] = [];
            itemIds.map(x => itemList.push(axiosJWTDecoratorInstance.delete(baseApiUrl + itemIds)));
            return await axios.all(itemList)
                .then(axios.spread((...responses) => {
                    return responses;
                }));
        },
    }
}