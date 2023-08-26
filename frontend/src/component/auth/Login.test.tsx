import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Auth} from 'aws-amplify'
import {BrowserRouter} from 'react-router-dom'
import {Login} from './Login'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('aws-amplify', () => ({
  Auth: {
    signIn: jest.fn(),
  },
}))

describe('<Login />', () => {
  test('renders Login component without crashing', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(
      screen.getByRole('heading', {level: 2, name: /Login/i})
    ).toBeInTheDocument()
  })

  test('can enter username', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    const inputNode = screen.getByLabelText('Username:') as HTMLInputElement
    fireEvent.change(inputNode, {target: {value: 'testuser'}})
    expect(inputNode.value).toBe('testuser')
  })

  test('can enter password', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
    const inputNode = screen.getByLabelText('Password:') as HTMLInputElement
    fireEvent.change(inputNode, {target: {value: 'testpass'}})
    expect(inputNode.value).toBe('testpass')
  })

  test('shows error messages when submitting with empty fields', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', {name: /Login/i}))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter your username.')
      ).toBeInTheDocument()
    })
  })

  test('calls Auth.signIn on form submit', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText('Username:'), {
      target: {value: 'testuser'},
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: {value: 'testpass'},
    })
    fireEvent.click(screen.getByRole('button', {name: /Login/i}))

    await waitFor(() => {
      expect(Auth.signIn).toHaveBeenCalledWith('testuser', 'testpass')
    })
  })
})
