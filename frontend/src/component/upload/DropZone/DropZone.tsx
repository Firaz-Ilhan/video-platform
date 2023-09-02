import {useEffect, useRef} from 'react'
import {useDragAndDrop} from './useDragAndDrop'

interface DropZoneProps {
  onFileDropped: (file: File) => void
  uploading: boolean
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileDropped,
  uploading,
  onFileSelected,
}) => {
  const {dragOver, droppedFile, handleDrop, handleDragOver, handleDragLeave} =
    useDragAndDrop();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (droppedFile) {
      onFileDropped(droppedFile);
    }
  }, [droppedFile]);

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <>
    <div
      id="dropZone"
      className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
      onDrop={uploading ? undefined : handleDrop}
      onDragOver={uploading ? undefined : handleDragOver}
      onDragLeave={uploading ? undefined : handleDragLeave}
      onClick={uploading ? undefined : handleZoneClick}
    >
      Drag and drop a video file here or click to select
      <input
        ref={fileInputRef}
        id="fileUpload"
        type="file"
        accept="video/*"
        onChange={onFileSelected}
        aria-label="Upload a video"
        aria-describedby="fileUploadError"
        hidden
        disabled={uploading}
      />
    </div>
    </>
  );
}
