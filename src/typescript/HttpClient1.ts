enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export class HttpClient {
  private static defaultHeaders: RequestInit["headers"] = {};
  private static async apiCall<T>(
    url: string,
    method: HttpMethod,
    requestInfo: RequestInit,
  ) {
    return (await fetch(url, {
      ...requestInfo,
      method,
    })) as T;
  }

  public static async get<T>(url: string, requestInfo: RequestInit) {
    return await this.apiCall<T>(url, HttpMethod.GET, requestInfo);
  }

  public static async put<T>(url: string, requestInfo: RequestInit) {
    return await this.apiCall<T>(url, HttpMethod.POST, requestInfo);
  }

  public static async post<T>(url: string, requestInfo: RequestInit) {
    return await this.apiCall<T>(url, HttpMethod.PUT, requestInfo);
  }

  public static async delete<T>(url: string, requestInfo: RequestInit) {
    return await this.apiCall<T>(url, HttpMethod.DELETE, requestInfo);
  }
}
