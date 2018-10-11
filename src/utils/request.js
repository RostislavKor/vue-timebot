import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.BASE_API,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
  },
  timeout: 20000
})
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)
service.interceptors.response.use(
  response => response,
  error => {
    console.log('err' + error)
    Message({
      message: error.response ? error.response.data.message : error.message,
      type: 'error',
      duration: 5 * 1000
    })
    if (store.getters.roles.length && error.response && error.response.status === 401) {
      setTimeout(() => { store.dispatch('LogOut').then(() => { location.reload() }) }, 3000)
    }
    return Promise.reject(error)
  }
)

export default service
