import React from 'react'
import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import {Auth} from 'aws-amplify'
import {useNavigate} from 'react-router-dom'
import {Confirmation} from './Confirmation'

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

    fireEvent.change(usernameInput, {target: {value: 'user'}})
    fireEvent.change(confirmationCodeInput, {target: {value: 'code'}})
    fireEvent.click(screen.getByRole('button', {name: 'Confirm Registration'}))

    await waitFor(() => {
      expect(Auth.confirmSignUp).toHaveBeenCalledWith('user', 'code')
    })
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled()
    })
  })
})
