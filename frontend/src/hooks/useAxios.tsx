import {useState, useEffect} from 'react'
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'

const useAxios = (axiosParams: AxiosRequestConfig) => {
  const [response, setResponse] = useState<AxiosResponse>()
  const [error, setError] = useState<AxiosError>()
  const [loading, setLoading] = useState(true)

  const fetchData = async (params: AxiosRequestConfig) => {
    try {
      const result = await axios.request(params)
      setResponse(result)
    } catch (err) {
      setError(err as AxiosError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(axiosParams)
  }, [])

  return {response, error, loading, fetchData}
}

export {useAxios}
