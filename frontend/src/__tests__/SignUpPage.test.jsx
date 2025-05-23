import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUpPage from '../Pages/SignUpPage'
import { Provider } from 'react-redux'
import { store } from '../Redux/store'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HelmetProvider } from 'react-helmet-async'
import { vi } from 'vitest'

vi.mock('axios')
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

const renderWithProviders = (ui) => {
  return render(
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    </HelmetProvider>
  )
}

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register successfully and navigate to login', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        ok: true,
        msg: 'Registration successful',
      },
    })

    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByPlaceholderText(/name/i), 'Jane Doe')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'jane@example.com')
    await userEvent.type(screen.getByPlaceholderText(/phone/i), '1234567890')
    await userEvent.type(screen.getByPlaceholderText(/secret key/i), 'secret')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password123')

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/register'),
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '1234567890',
          secret: 'secret',
          password: 'password123',
          confirmPassword: 'password123',
        })
      )
      expect(toast.success).toHaveBeenCalledWith('Registration successful')
      expect(mockedNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should show error if secret keyword is missing', async () => {
    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByPlaceholderText(/name/i), 'John')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'john@example.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password123')

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    // Expect to see red error message in DOM
    await waitFor(() => {
      expect(screen.getByText(/Secret Keyword required/i)).toBeInTheDocument()
    })
  })

  it('should show error if passwords do not match', async () => {
    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'differentpass')

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith('Passwords do not match.')
    })
  })

  it('should show error toast if server fails', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          msg: 'Email already in use',
        },
      },
    })

    renderWithProviders(<SignUpPage />)

    await userEvent.type(screen.getByPlaceholderText(/name/i), 'Jane Doe')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'used@example.com')
    await userEvent.type(screen.getByPlaceholderText(/phone/i), '1234567890')
    await userEvent.type(screen.getByPlaceholderText(/secret key/i), 'secret')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password123')

    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already in use')
    })
  })
})
