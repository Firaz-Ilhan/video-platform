import React, {useState, useEffect, useRef} from 'react'
import './UploadVideo.css'
import axios, {AxiosProgressEvent, AxiosRequestConfig} from 'axios'
import {
  faX,
  faTriangleExclamation,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const UploadVideo = () => {
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState('')
  const [uploading, setUploading] = useState(false)

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
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDropZoneClick = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setProgress(0)
    setUploadState('')
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
      setError('Connection could not be established.')
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
    }
  }

  const uploadFile = () => {
    if (selectedFile && presignedUrl) {
      setUploading(true)
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
          setUploading(false)
        })
        .catch((err) => {
          console.error(err)
          setProgress(0)
          setUploadState('')
          setError('Failed to upload the file. Please try again.')
          setUploading(false)
        })
    }
  }

  return (
    <div className="upload-container">
      <div>
        <h1>Upload a Video</h1>
      </div>

      <div className="input-group">
        <div
          id="dropZone"
          className="drop-zone"
          onDrop={uploading ? undefined : handleDrop}
          onDragOver={uploading ? undefined : handleDragOver}
          onDragLeave={uploading ? undefined : handleDragLeave}
          onClick={uploading ? undefined : handleDropZoneClick}>
          Drag and drop a video file here or click to select
          <input
            ref={fileInputRef}
            id="fileUpload"
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            aria-describedby="fileUploadError"
            hidden
            disabled={uploading}
          />
        </div>

        <div className="selected-file">
          {selectedFile ? (
            <>
              <span>{selectedFile.name}</span>
              <button
                title="unselect file"
                aria-label="unselect file"
                onClick={clearSelectedFile}
                className="clear-button">
                <FontAwesomeIcon icon={faX} />
              </button>
            </>
          ) : (
            <p>No file selected</p>
          )}
        </div>

        {error && (
          <div id="fileUploadError" role="alert" className="error-message">
            <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
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
        <button
          className="upload-button"
          onClick={uploadFile}
          disabled={!selectedFile || !!error || uploading}>
          {uploading ? (
            <span>
              {' '}
              <FontAwesomeIcon icon={faSpinner} spin /> Uploading Video...
            </span>
          ) : (
            'Upload Selected Video'
          )}
        </button>
        <p>{uploadState}</p>
      </div>
    </div>
  )
}

export {UploadVideo}
