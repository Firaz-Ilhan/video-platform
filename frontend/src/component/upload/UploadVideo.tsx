import {
  faSpinner,
  faTriangleExclamation,
  faX,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import React, {useRef, useState} from 'react'
import {useAuthCheck} from '../../hooks/useAuthCheck'
import './UploadVideo.css'
import {uploadToS3} from './uploadService'
import {useDragAndDrop} from './useDragAndDrop'
import {useFileValidation} from './useFileValidation'


const UploadVideo = () => {
  const [progress, setProgress] = useState(0)
  const [uploadState, setUploadState] = useState('')
  const [uploading, setUploading] = useState(false)
  const [videoTitle, setVideoTitle] = useState<string>('')

  const {selectedFile, error, validateFile, setSelectedFile, setError} =
    useFileValidation()

  const {dragOver, handleDrop, handleDragOver, handleDragLeave} =
    useDragAndDrop(validateFile)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useAuthCheck()

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateFile(e.target.files[0])
    }
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
    if (selectedFile && videoTitle.trim() !== '') {
      setUploading(true)
      try {
        await uploadToS3(selectedFile, videoTitle, setProgress)
        setUploadState('File uploaded successfully')
      } catch (err) {
        console.error('Error uploading file: ', err)
        setError(`Failed to upload the file. Reason: ${err}`)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="upload-container">
      <div>
        <h2>Upload a Video</h2>
      </div>

      <div className="input-group">
        <div className="video-title-input-group">
          <label htmlFor="videoTitle">Video Title:</label>
          <input
            type="text"
            id="videoTitle"
            className="video-title-input"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Enter video title"
          />
        </div>

        <div
          id="dropZone"
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
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
            aria-label="Upload a video"
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
          disabled={
            !selectedFile || !!error || uploading || videoTitle.trim() === ''
          }>
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
