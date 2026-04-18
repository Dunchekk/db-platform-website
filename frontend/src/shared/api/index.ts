import { RequestOptions } from "../types/auth.types";

const API_URL = __API_URL__;

async function request(path: string, options: RequestOptions = {}) {
  const { isAuth = false, headers, ...restOptions } = options; // вынимаем переданные опции

  const token = localStorage.getItem("token"); // вынимаем токен из сториджа для проверки

  const finalHeaders = new Headers(headers); // доавляем переданные хедеры в заголовки

  if (
    !finalHeaders.has("Content-Type") &&
    !(restOptions.body instanceof FormData)
    // вынимаем переданные опциие: сли заголовок Content-Type еще не задан,
    // и ты отправляешь не FormData, то запрос считается JSON-запросом,
    // и ему ставят Content-Type: application/json
    // JSON body -> ставим application/json
    // FormData -> не трогаем Content-Type
  ) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (isAuth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    // делаем сам запрос, получаем ответ
    ...restOptions,
    headers: finalHeaders,
  });

  if (!response.ok) {
    // проверяем ответ
    const errorText = await response.text();
    throw new Error(
      errorText || `Request failed with status ${response.status}`
    );
  }

  const contentType = response.headers.get("content-type"); // проверяем тип ответа

  if (contentType?.includes("application/json")) {
    // если ответ жсон то возвращаем разжсоненый ответ
    return response.json();
  }

  return response.text(); // если ответ не жсон то возвращаем строку
}

// У fetch ответ можно читать по-разному:

// response.json() если сервер вернул JSON
// response.text() если сервер вернул простой текст или HTML
// response.blob() если файл
// response.arrayBuffer() если бинарные данные

export const $host = {
  get: (path: string, options?: RequestInit) => {
    return request(path, { ...options, method: "GET" });
  },

  post: (path: string, body?: unknown, options?: RequestInit) => {
    return request(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put: (path: string, body?: unknown, options?: RequestInit) => {
    return request(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: (path: string, options?: RequestInit) => {
    return request(path, { ...options, method: "DELETE" });
  },

  patch: (path: string, body?: unknown, options?: RequestInit) => {
    return request(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
};

export const $authHost = {
  get: (path: string, options?: RequestInit) => {
    return request(path, { ...options, method: "GET", isAuth: true });
  },

  post: (path: string, body?: unknown, options?: RequestInit) => {
    return request(path, {
      ...options,
      method: "POST",
      isAuth: true,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put: (path: string, body?: unknown, options?: RequestInit) => {
    return request(path, {
      ...options,
      method: "PUT",
      isAuth: true,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: (path: string, options?: RequestInit) => {
    return request(path, { ...options, method: "DELETE", isAuth: true });
  },

  patch: (path: string, body?: unknown, options?: RequestInit) => {
    return request(path, {
      ...options,
      method: "PATCH",
      isAuth: true,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
};
