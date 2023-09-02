import {renderHook, act} from '@testing-library/react'
import {useDragAndDrop} from './useDragAndDrop'

const createMockDragEvent = (type: string): React.DragEvent<HTMLDivElement> => {
  return {
    type,
    preventDefault: jest.fn(),
  } as unknown as React.DragEvent<HTMLDivElement>
}

const createMockDropEvent = (file: File): React.DragEvent<HTMLDivElement> => {
  const mockDataTransfer = {
    items: [{getAsFile: jest.fn().mockReturnValue(file)}],
  }
  return {
    preventDefault: jest.fn(),
    dataTransfer: mockDataTransfer,
  } as unknown as React.DragEvent<HTMLDivElement>
}

describe('useDragAndDrop', () => {
  const renderUseDragAndDrop = () =>
    renderHook(() => useDragAndDrop())

  it('should handle drag over and set dragOver to true', () => {
    const {result} = renderUseDragAndDrop()

    act(() => {
      const event = createMockDragEvent('dragover')
      result.current.handleDragOver(event)
    })

    expect(result.current.dragOver).toBe(true)
  })

  it('should handle drag leave and set dragOver to false', () => {
    const {result} = renderUseDragAndDrop()

    act(() => {
      const dragOverEvent = createMockDragEvent('dragover')
      result.current.handleDragOver(dragOverEvent)
    })

    act(() => {
      const dragLeaveEvent = createMockDragEvent('dragleave')
      result.current.handleDragLeave(dragLeaveEvent)
    })

    expect(result.current.dragOver).toBe(false)
  })

  it('should handle drop and set dragOver to false', () => {
    const {result} = renderUseDragAndDrop()

    const testFile = new File([''], 'filename.txt', {type: 'text/plain'})
    act(() => {
      const dropEvent = createMockDropEvent(testFile)
      result.current.handleDrop(dropEvent)
    })

    expect(result.current.dragOver).toBe(false)
  })
})
