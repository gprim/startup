import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

type APIResponse<T, D = never> = {
  response?: AxiosResponse<T, D>;
  error?: AxiosError<T, D>;
  ok: boolean;
};

export class Api {
  private static async apiWrapper<T, D = never>(
    apiCall: () => Promise<AxiosResponse<T, D>>,
  ): Promise<APIResponse<T, D>> {
    try {
      const response = await apiCall();
      return { response, ok: response.status - 200 < 100 };
    } catch (error) {
      if (error instanceof AxiosError) {
        return { error: error as AxiosError<T, D>, ok: false };
      }
      console.error(error);
    }
    return { ok: false };
  }

  static async get<T, D = never>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<APIResponse<T, D>> {
    const apiCall = async () => {
      return axios.get<T>(url, config);
    };

    return await Api.apiWrapper(apiCall);
  }

  static async post<T, D = never>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) {
    const apiCall = async () => {
      return axios.post<T>(url, data, config);
    };

    return await Api.apiWrapper(apiCall);
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig) {
    const apiCall = async () => {
      return axios.delete<T>(url, config);
    };

    return await Api.apiWrapper(apiCall);
  }

  static async put<T, D>(url: string, data: D, config?: AxiosRequestConfig) {
    const apiCall = async () => {
      return axios.put<T>(url, data, config);
    };

    return await Api.apiWrapper(apiCall);
  }
}
