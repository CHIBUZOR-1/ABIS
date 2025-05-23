import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../Pages/LoginPage'
import { Provider } from 'react-redux'
import { store } from '../Redux/store'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HelmetProvider } from 'react-helmet-async'
import { vi } from 'vitest'

// Mocks
vi.mock('axios')
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(), // mock useNavigate
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

describe('LoginPage', () => {
  it('should fill form and submit successfully', async () => {
    const mockedResponse = {
      data: {
        ok: true,
        msg: 'Login successful',
        details: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    }

    axios.post.mockResolvedValueOnce(mockedResponse)
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    // Fill inputs
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')

    // Click login
    await userEvent.click(loginButton)

    // Wait for mock axios and toast
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/login'),
        {
          email: 'test@example.com',
          password: 'password123',
        }
      )
      expect(toast.success).toHaveBeenCalledWith('Login successful')
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'users/setUser',
        payload: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    })
  })

  it('should show error toast on failed login', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          msg: 'Invalid credentials',
        },
      },
    })

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.type(passwordInput, 'wrongpass')
    await userEvent.click(loginButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})
