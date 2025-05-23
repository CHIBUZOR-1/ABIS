import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordResetPage from '../Pages/PasswordResetPage'
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

describe('PasswordResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('sends POST request and shows success toast on success', async () => {
    axios.post.mockResolvedValue({
      data: { ok: true, msg: 'Password updated' },
    });

    renderWithProviders(<PasswordResetPage />)

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/secret/i), 'keyword');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'pass123');

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/reset-password'),
        expect.objectContaining({
          email: 'test@example.com',
          secret: 'keyword',
          newPassword: 'pass123',
          confirmNewPassword: 'pass123',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Password updated');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  })

  it('shows warning if passwords do not match', async () => {
    renderWithProviders(<PasswordResetPage />)
    
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/secret/i), 'keyword');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'different');

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith("Passwords do not match.");
    });
  });
  it('should show error if any field is missing', async () => {
    renderWithProviders(<PasswordResetPage />)

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'pass123');

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    // Expect to see red error message in DOM
    await waitFor(() => {
      expect(toast.warn).toHaveBeenCalledWith("All fields are required.")
    })
  })
})