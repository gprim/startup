const defaultHeaders = {
  "Content-Type": "application/json",
};

const defaultFetchOptions = {
  mode: "cors",
  cache: "no-cache",
  credentials: "same-origin",
  redirect: "follow",
  referrerPolicy: "no-referrer",
};

const apiCall = async (
  method,
  url,
  data,
  headers = undefined,
  fetchOptions = undefined,
) => {
  if (!headers) headers = defaultHeaders;
  else headers = { ...defaultHeaders, ...headers };
  if (!fetchOptions) fetchOptions = defaultFetchOptions;
  else fetchOptions = { ...defaultFetchOptions, fetchOptions };

  switch (headers["Content-Type"]) {
    case "application/json":
      if (typeof data !== "string") data = JSON.stringify(data);
      break;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    method,
    body: data,
  });

  return response;
};

export const post = async (url, data, headers = undefined) => {
  return apiCall("POST", url, data, headers);
};

export const get = async (url, headers = undefined) => {
  return apiCall("GET", url, undefined, headers);
};

export const put = async (url, data, headers = undefined) => {
  return apiCall("PUT", url, data, headers);
};

export const deleteCall = async (url, data, headers = undefined) => {
  return apiCall("DELETE", url, data, headers);
};
