import axios from 'axios'

// 创建一个 Axios 实例，我们可以对它进行自定义配置
const instance = axios.create({
  // 你的后端 API 的基础路径
  // 这样设置后，我们请求时只需要写相对路径，比如 /user/login
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 请求超时时间
  timeout: 10000,
});

// 定义请求拦截器 (Request Interceptor)
// 客户端发送请求 -> [请求拦截器] -> 服务器
instance.interceptors.request.use(
  config => {
    // 1. 从 localStorage 中获取 token
    const token = localStorage.getItem('Authorization');

    // 2. 如果 token 存在，则为请求头添加 Authorization 字段
    if (token) {
      config.headers['Authorization'] = token;
    }

    return config; // 必须返回 config 对象
  },

  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 定义响应拦截器 (Response Interceptor)
// 服务器返回响应 -> [响应拦截器] -> 客户端代码的 .then() 或 .catch()
instance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    // 我们只关心后端返回的 data 字段中的内容
    // 你的后端统一响应格式是 { code, message, data }
    // 我们可以直接返回 response.data，这样在组件中就不用再写 response.data.data 了
    if (response.data.code === 0) {
      // code为0，操作成功，直接返回 data 载荷
      return response.data;
    } else {
      // code不为0，操作失败，可以统一在这里处理错误，比如弹窗提示
      // 为了灵活，我们还是把整个响应体都抛出去，让业务组件自己处理
      console.warn('API逻辑错误:', response.data.message);
      return Promise.reject(response.data);
    }
  },
  error => {
    // 超出 2xx 范围的http状态码都会进入这里
    // 比如 401 (未授权), 404 (未找到), 500 (服务器内部错误)
    console.error('HTTP请求错误:', error.response?.data?.message || error.message);

    // 可以在这里做一些全局的错误处理，比如提示用户网络错误
    // alert('网络错误，请稍后再试');

    return Promise.reject(error);
  }
);


// 导出我们配置好的实例
export default instance;


