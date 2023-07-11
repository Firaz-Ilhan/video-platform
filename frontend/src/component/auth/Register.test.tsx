import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Register } from './Register'

const mockNavigate = jest.fn()
const mockSignUp = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('aws-amplify', () => ({
  Auth: {
    signIn: jest.fn(),
    signUp: jest.fn(),
  },
}))

describe('<Register />', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSignUp.mockClear()
  })

  test('renders Register component without crashing', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )
    expect(screen.getByRole('heading', {name: /Register/i})).toBeInTheDocument()
  })

  test('can enter username, email, and password', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText('Username:'), {
      target: {value: 'user'},
    })
    fireEvent.change(screen.getByLabelText('Email:'), {
      target: {value: 'user@example.com'},
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: {value: 'password'},
    })

    expect((screen.getByLabelText('Username:') as HTMLInputElement).value).toBe(
      'user'
    )
    expect((screen.getByLabelText('Email:') as HTMLInputElement).value).toBe(
      'user@example.com'
    )
    expect((screen.getByLabelText('Password:') as HTMLInputElement).value).toBe(
      'password'
    )
  })

  test('validates form fields before submission', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', {name: /Register/i}))

    expect(
      await screen.findByText(/Username must be between 3 and 20 characters./i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/Please enter a valid email address./i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/Password must be at least 8 characters long./i)
    ).toBeInTheDocument()
  })
})
