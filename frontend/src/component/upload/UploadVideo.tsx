import {
  faSpinner,
  faTriangleExclamation,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Auth } from 'aws-amplify'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UploadVideo.css'
import AWS from 'aws-sdk'

AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
})

const UploadVideo = () => {
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState('')
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()

  const validateFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setSelectedFile(file)
      setError(null)
      setUploadState('')
    } else {
      setSelectedFile(null)
      setError('Please upload a video file')
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

  const uploadFile = async () => {
    if (selectedFile) {
      setUploading(true);
      try {
        const currentCredentials = await Auth.currentCredentials()
  
        AWS.config.update({
          region: process.env.REACT_APP_AWS_REGION,
          credentials: Auth.essentialCredentials(currentCredentials),
        })
  
        const s3 = new AWS.S3()
  
        const params = {
          Bucket: process.env.REACT_APP_AWS_S3_BUCKET || "",
          Key: selectedFile.name,
          Body: selectedFile,
          ContentType: selectedFile.type,
        }
  
        s3.upload(params, (err: any, data: any) => {
          if (err) {
            console.error('Error uploading file: ', err)
            setError('Failed to upload the file')
          } else {
            setUploadState('File uploaded successfully')
          }
          setUploading(false);
        }).on('httpUploadProgress', (evt) => {
          setProgress(Math.round((evt.loaded / evt.total) * 100))
        })
      } catch (err) {
        console.error('Error getting current credentials: ', err)
        setUploading(false);
      }
    }
  }  

  const checkUser = useCallback(async () => {
    try {
      AWS.config.credentials = await Auth.currentCredentials()
    } catch (err) {
      console.error(err)
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    checkUser()
  }, [checkUser])

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

export { UploadVideo }

