import Axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosHeaders,
} from "axios";

export class HttpClient {
  private static instance: AxiosInstance;

  private static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = Axios.create({
        baseURL: "/api",
        timeout: 60000,
      });
    }

    // redirect the user to the login page if their session expires
    this.instance.interceptors.response.use(null, (error: AxiosError) => {
      if (error.response.status === 403) {
        // fix
      }
      return Promise.reject(error);
    });

    return this.instance;
  }

  static async get<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: AxiosHeaders,
  ): Promise<T> {
    const response = await this.getInstance().get<T>(url, { params, headers });
    return response.data;
  }

  static async post<T>(
    url: string,
    data: Record<string, unknown>,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.getInstance().post<T>(url, data, requestConfig);
    return response.data;
  }

  static async delete<T>(
    url: string,
    data?: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.getInstance().delete(url, data);
    return response.data;
  }

  static async put<T>(
    url: string,
    data: Record<string, unknown>,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.getInstance().put(url, data, requestConfig);
    return response.data;
  }
}
