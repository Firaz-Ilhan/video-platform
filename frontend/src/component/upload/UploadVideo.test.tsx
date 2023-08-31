import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UploadVideo } from './UploadVideo'
import { useNavigate } from 'react-router-dom'
import { Auth } from 'aws-amplify'

jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    currentCredentials: jest.fn(),
    essentialCredentials: jest.fn()
  }
}))

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}))

describe('UploadVideo', () => {
  beforeEach(() => {
    (Auth.currentAuthenticatedUser as jest.Mock).mockResolvedValue(true);
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());
  });

  it('renders without crash', () => {
    render(<UploadVideo />)
  })

  it('displays error when non-video file is selected', async () => {
    render(<UploadVideo />)

    const fileInput = screen.getByLabelText(/upload a video/i)
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText(/please upload a video file/i)).toBeInTheDocument()
    })
  })

  it('clears selected file when clear button is clicked', async () => {
    render(<UploadVideo />)

    const fileInput = screen.getByLabelText(/upload a video/i)
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText(/test.mp4/i)).toBeInTheDocument()
    })

    const clearButton = screen.getByLabelText(/unselect file/i)
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(screen.queryByText(/test.mp4/i)).not.toBeInTheDocument()
    })
  })
})
