import React, { useState, useEffect, useRef } from 'react'
import './UploadVideo.css'
import axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios'

const UploadVideo = () => {
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setSelectedFile(file)
      setError(null)
      setUploadState('')
    } else {
      setSelectedFile(null)
      setError('Please upload a video file.')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.items) {
      const file = e.dataTransfer.items[0].getAsFile()
      if (file) {
        validateFile(file)
      }
    }
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

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

  const uploadProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      setProgress(percentCompleted)
      setUploadState('Uploading...')
    }
  }

  const uploadFile = () => {
    if (selectedFile && presignedUrl) {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': selectedFile.type,
        },
        onUploadProgress: uploadProgress,
      }

      axios
        .put(presignedUrl, selectedFile, config)
        .then((res) => {
          console.log(res)
          setProgress(0)
          setSelectedFile(null)
          setUploadState('File uploaded successfully.')
        })
        .catch((err) => {
          console.error(err)
          setProgress(0)
          setUploadState('')
          setError('Failed to upload the file. Please try again.')
        })
    }
  }

  return (
    <div className="upload-container">
      <div>
        <h1>Upload a Video</h1>
        <p>Choose a video file and upload it.</p>
      </div>
      <div className="input-group">
        <div
          id="dropZone"
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleDropZoneClick}
        >
          Drag and drop a video file here or click to select
          <input
            ref={fileInputRef}
            id="fileUpload"
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            aria-describedby="fileUploadError"
            hidden
          />
        </div>

        <div className="selected-file">
          {selectedFile ? <p>{selectedFile.name}</p> : <p>No file selected</p>}
        </div>

        {error && (
          <div id="fileUploadError" role="alert" className="error-message">
            <span role="img" aria-label="error-icon">⚠️</span> {error}
          </div>
        )}
      </div>
      <div className="progress-bar">
        <label htmlFor="uploadProgress">Upload Progress:</label>
        <progress id="uploadProgress" value={progress} max="100">
          {progress}%
        </progress>
        <p>{progress}% completed</p>
      </div>
      <div className="upload-button-container">
        <button className="upload-button" onClick={uploadFile} disabled={!selectedFile || !!error}>
          Upload Selected Video
        </button>
        <p>{uploadState}</p>
      </div>
    </div>
  )
}

export { UploadVideo }