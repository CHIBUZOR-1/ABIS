import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Homepage from '../Pages/Homepage'
import { Provider } from 'react-redux'
//import { store } from '../Redux/store'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Redux/UserSlice'
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
global.URL.createObjectURL = vi.fn(() => 'mock-url');

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: {
    user: {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        photo: '',
      },
    },
  },
});


const renderWithProviders = (ui) => {
  return render(
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    </HelmetProvider>
  )
}

describe('Homepage', () => {
  it('renders user info correctly', async () => {
    renderWithProviders(<Homepage />);
    expect(await screen.findByDisplayValue(/john doe/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/john@example\.com/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/1234567890/)).toBeInTheDocument();
  });

  it('lets user update inputs', async () => {
    renderWithProviders(<Homepage />);
    const nameInput = screen.getByLabelText(/fullname/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');
    expect(nameInput.value).toBe('Jane Doe');
  });

  it('handles image file selection', async () => {
    renderWithProviders(<Homepage />);
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    const fileInput = screen.getByLabelText(/camera/i, { selector: 'input[type="file"]' });
    await userEvent.upload(fileInput, file);
    
    //userEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files).toHaveLength(1);
  });
  it('submits profile update and dispatches updateProfilez', async () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const updatedUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '9876543210',
      image: 'https://new-image.com/avatar.png',
    };

    axios.post
    .mockResolvedValueOnce({
      data: {
        secure_url: 'https://new-image.com/avatar.png',
        public_id: 'img123',
      },
    })
    .mockResolvedValueOnce({
      data: {
        ok: true,
        msg: 'Updated successfully',
        updatedUser,
      },
    });

    renderWithProviders(<Homepage />);
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/camera/i, { selector: 'input[type="file"]' });
    await userEvent.upload(fileInput, file);

    const nameInput = screen.getByLabelText(/fullname/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, updatedUser.name);

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, updatedUser.email);

    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, updatedUser.phone);

    const updateBtn = screen.getByRole('button', { name: /update/i });
    await userEvent.click(updateBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'users/updateProfilez',
        payload: updatedUser,
      });
    });
  });
  it('logs out and dispatches logout', async () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    axios.get.mockResolvedValueOnce({
      data: {
        ok: true,
        msg: 'Logout successful',
      },
    });

    renderWithProviders(<Homepage />);

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    await userEvent.click(logoutBtn);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'users/logout',
      });
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
})