import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import {DropZone} from './DropZone'

describe('<DropZone />', () => {
  const mockFileDropped = jest.fn()
  const mockFileSelected = jest.fn()
  const mockFile = new File(['test'], 'test.mp4', {type: 'video/mp4'})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <DropZone
        onFileDropped={mockFileDropped}
        uploading={false}
        onFileSelected={mockFileSelected}
      />
    )
    expect(
      screen.getByText('Drag and drop a video file here or click to select')
    ).toBeInTheDocument()
  })

  it('triggers file input on click', () => {
    render(
      <DropZone
        onFileDropped={mockFileDropped}
        uploading={false}
        onFileSelected={mockFileSelected}
      />
    )

    fireEvent.click(
      screen.getByText('Drag and drop a video file here or click to select')
    )
    const fileInput = screen.getByLabelText(
      'Upload a video'
    ) as HTMLInputElement
    expect(fileInput).not.toBeNull()
  })

  it('applies the drag-over class on drag over', () => {
    render(
      <DropZone
        onFileDropped={mockFileDropped}
        uploading={false}
        onFileSelected={mockFileSelected}
      />
    )
    const dropZone = screen.getByText(
      'Drag and drop a video file here or click to select'
    )

    fireEvent.dragOver(dropZone!)
    expect(dropZone).toHaveClass('drag-over')
  })

  it('calls onFileSelected when a file is selected', () => {
    render(
      <DropZone
        onFileDropped={mockFileDropped}
        uploading={false}
        onFileSelected={mockFileSelected}
      />
    )
    const fileInput = screen.getByLabelText(
      'Upload a video'
    ) as HTMLInputElement

    fireEvent.change(fileInput, {target: {files: [mockFile]}})
    expect(mockFileSelected).toHaveBeenCalled()
  })

  it('disables all events when uploading', () => {
    render(
      <DropZone
        onFileDropped={mockFileDropped}
        uploading={true}
        onFileSelected={mockFileSelected}
      />
    )
    const dropZone = screen.getByText(
      'Drag and drop a video file here or click to select'
    )

    fireEvent.click(dropZone!)
    fireEvent.dragOver(dropZone!)
    fireEvent.drop(dropZone!)
    expect(mockFileDropped).not.toHaveBeenCalled()
  })
})
