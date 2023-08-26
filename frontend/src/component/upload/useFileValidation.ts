import {useState} from 'react'

const useFileValidation = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setSelectedFile(file)
      setError(null)
    } else {
      setSelectedFile(null)
      setError('Please upload a video file')
    }
  }

  return {selectedFile, error, validateFile, setSelectedFile, setError}
}

export {useFileValidation}
