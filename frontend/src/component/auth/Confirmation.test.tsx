import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Auth } from 'aws-amplify'
import { useNavigate } from 'react-router-dom'
import { Confirmation } from './Confirmation'

jest.mock('aws-amplify')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

describe('Confirmation', () => {
  let navigateMock: jest.MockedFunction<() => void>

  beforeEach(() => {
    navigateMock = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(navigateMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Confirmation />)

    expect(screen.getByLabelText('Username:')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmation Code:')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {name: 'Confirm Registration'})
    ).toBeInTheDocument()
    expect(screen.getByTestId('form')).toBeInTheDocument()
  })

  it('calls Auth.confirmSignUp and navigate when form is submitted', async () => {
    ;(Auth.confirmSignUp as jest.Mock).mockResolvedValueOnce(true)

    render(<Confirmation />)
    const usernameInput = screen.getByLabelText('Username:')
    const confirmationCodeInput = screen.getByLabelText('Confirmation Code:')

    userEvent.type(usernameInput, 'user')
    userEvent.type(confirmationCodeInput, '123')
    userEvent.click(screen.getByRole('button', {name: 'Confirm Registration'}))

    await waitFor(() => {
      expect(Auth.confirmSignUp).toHaveBeenCalledWith('user', '123')
    })
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled()
    })
  })
})
