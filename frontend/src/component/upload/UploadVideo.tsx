import React, {useState, useEffect} from 'react'
import './UploadVideo.css'
import axios, {AxiosProgressEvent, AxiosRequestConfig} from 'axios'

const UploadVideo = () => {
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0]

      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
        setError(null)
      } else {
        setSelectedFile(null)
        setError('Please upload a video file.')
      }
    }
  }

  const getPresignedUrl = async (fileName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:1337/generate-presigned-url?fileName=${encodeURIComponent(
          fileName
        )}`
      )
      setPresignedUrl(response.data.url)
    } catch (error) {
      console.error('Error while getting presigned URL', error)
      setError('Failed to upload the file. Please try again.')
    }
  }

  useEffect(() => {
    if (selectedFile) {
      getPresignedUrl(selectedFile.name)
    }
  }, [selectedFile])

  const uploadFile = () => {
    if (selectedFile && presignedUrl) {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': selectedFile.type,
        },
        onUploadProgress: function (progressEvent: AxiosProgressEvent) {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setProgress(percentCompleted)
          }
        },
      }

      axios
        .put(presignedUrl, selectedFile, config)
        .then((res) => console.log(res))
        .catch((err) => console.error(err))
    }
  }

  return (
    <div>
      <h1>Upload a Video</h1>
      <p>Choose a video file and upload it.</p>
      <label htmlFor="fileUpload">Video file:</label>
      <input
        id="fileUpload"
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        aria-describedby="fileUploadError"
      />
      {error && (
        <div id="fileUploadError" role="alert" style={{color: 'red'}}>
          {error}
        </div>
      )}
      <label htmlFor="uploadProgress">Upload Progress:</label>
      <progress id="uploadProgress" value={progress} max="100">
        {progress}%
      </progress>
      <button onClick={uploadFile} disabled={!selectedFile || !!error}>
        Upload Video
      </button>
    </div>
  )
}

export {UploadVideo}
