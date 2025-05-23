const httpMocks = require('node-mocks-http')
const createUser = require('../../Controller/authController').createUser;
const supabase = require('../../db');
const bcrypt = require('bcryptjs');
const { logIn, updateUser, forgotPassword, logout } = require('../../Controller/authController');
const setCookiesWithToken = require('../../Utilities/verifyToken').setCookiesWithToken;


jest.mock('../../db', ()=> ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockImplementation(() => Promise.resolve('hashedPassword')),
  compare: jest.fn(),
  genSaltSync: jest.fn(() => 'salt'),
  hashSync: jest.fn(() => 'hashedPassword'),
}));


jest.mock('../../Utilities/verifyToken', () => ({
  setCookiesWithToken: jest.fn()
}));

describe('createUser Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return 400 if any field is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: '',
        name: 'Test',
        phone: '123',
        password: '',
        secret: ''
      }
    });
    const res = httpMocks.createResponse();

    await createUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'All fields required'
    });
  });
  it('should return 400 if user already exists', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'existing@example.com',
        name: 'User',
        phone: '1234567890',
        password: 'password123',
        secret: 'secret'
      }
    });
    const res = httpMocks.createResponse();
    supabase.single.mockResolvedValueOnce({
      data: {
        id: 1,
        email: req.body.email,
        error: null
      }
    })
    await createUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'User already exists'
    });
  });
  it('should return 400 for invalid email', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'invalid-email',
        name: 'User',
        phone: '1234567890',
        password: 'password123',
        secret: 'secret'
      }
    });
    const res = httpMocks.createResponse();

    await createUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Enter a valid Email Address'
    });
  });
  it('should return 400 for weak password', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'User',
        phone: '1234567890',
        password: '123',
        secret: 'secret'
      }
    });
    const res = httpMocks.createResponse();

    await createUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Please enter a strong password'
    });
  });
  it('should create a user and return 201', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'User',
        phone: '1234567890',
        password: 'password123',
        secret: 'secret'
      }
    });
    const res = httpMocks.createResponse();
    supabase.single.mockResolvedValueOnce({
      data: null,
      error: null
    });
    supabase.insert.mockResolvedValueOnce({
      data: [{ id: 1}],
      error: null
    });

    await createUser(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: 'Registration successfully'
    });
  });
});

describe('logIn Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email or password is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: '',
        password: ''
      }
    });
    const res = httpMocks.createResponse();

    await logIn(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Email and password are required'
    });
  });

  it('should return 400 if user is not found', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'notfound@example.com',
        password: 'somepassword'
      }
    });
    const res = httpMocks.createResponse();

    supabase.single.mockResolvedValueOnce({
      data: null,
      error: null
    });

    await logIn(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Invalid credentials'
    });
  });

  it('should return 400 for incorrect password', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'wrongpassword'
      }
    });
    const res = httpMocks.createResponse();

    supabase.single.mockResolvedValueOnce({
      data: {
        id: 1,
        email: req.body.email,
        password: 'hashedPassword',
        name: 'User',
        verified: true,
        phone: '1234567890',
        image: 'user.png'
      },
      error: null
    });

    bcrypt.compare.mockResolvedValueOnce(false); // simulate invalid password

    await logIn(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Invalid credentials'
    });
  });

  it('should login successfully and return 200 with user details', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'correctpassword'
      }
    });
    const res = httpMocks.createResponse();

    const mockUser = {
      id: 'abc123',
      email: req.body.email,
      password: 'hashedPassword',
      name: 'User',
      verified: true,
      phone: '1234567890',
      image: 'profile.jpg'
    };

    supabase.single.mockResolvedValueOnce({
      data: mockUser,
      error: null
    });

    bcrypt.compare.mockResolvedValueOnce(true);

    await logIn(req, res);

    expect(res.statusCode).toBe(200);
    expect(setCookiesWithToken).toHaveBeenCalledWith(mockUser.id, res); // assuming role isn't fetched
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: 'Login successful',
      details: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        photo: mockUser.image,
        isVerified: mockUser.verified
      }
    });
  });
});

describe('updateUser Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if userId is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      user: {}, // missing userId
      body: {
        name: 'New Name'
      }
    });
    const res = httpMocks.createResponse();

    await updateUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'User ID is required'
    });
  });

  it('should return 400 if no fields to update are provided', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      user: { userId: 'abc123' },
      body: {} // no fields
    });
    const res = httpMocks.createResponse();

    await updateUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'No valid fields to update'
    });
  });

  it('should return 500 if update fails', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      user: { userId: 'abc123' },
      body: {
        name: 'Updated User'
      }
    });
    const res = httpMocks.createResponse();

    //supabase.update.mockResolvedValueOnce({ error: { message: 'Update failed' } });
    supabase.single.mockRejectedValueOnce(new Error('Supabase error'));
    await updateUser(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Server error'
    });
  });

  it('should return 500 if fetching updated user fails', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      user: { userId: 'abc123' },
      body: {
        name: 'Updated User'
      }
    });
    const res = httpMocks.createResponse();

    supabase.update.mockResolvedValueOnce({ error: null });
    supabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Fetch failed' }
    });

    await updateUser(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      ok: false,
      msg: 'Server error'
    });
  });

  it('should update user and return 200 with updated data', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      user: { userId: 'abc123' },
      body: {
        name: 'Updated User',
        phone: '1234567890'
      }
    });
    const res = httpMocks.createResponse();

    const mockUpdatedUser = {
      id: 'abc123',
      name: 'Updated User',
      email: 'user@example.com',
      phone: '1234567890',
      image: 'profile.jpg'
    };

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ error: null }) // update result
      })
    });

  // 2. Mock select response
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockUpdatedUser, error: null }) // fetch result
      })
    });

  // 3. Mock supabase.from to return correct chain depending on call
    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return {
          update: mockUpdate,
          select: mockSelect
        };
      }
      return {};
    });


    await updateUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: 'User updated successfully',
      updatedUser: mockUpdatedUser
    });
  });
});

describe('forgotPassword Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email, secret or new-password is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { secret: '', secret: '', newPassword: '' }
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ ok: false, msg: 'All fields required' });
  });

  it('should return 404 if user not found', async () => {
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'notfound@example.com', secret: 'answer', newPassword: '123456' },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ ok: false, msg: 'User not found' });
  });

  it('should return 403 if secret does not match', async () => {
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { id: 1, email: 'test@example.com', secret: 'correct' },
            error: null
          }),
        }),
      }),
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', secret: 'wrong', newPassword: '123456' },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);
    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ ok: false, msg: 'Invalid secret answer' });
  });

  it('should return 200 if password reset is successful', async () => {
      supabase.from = jest.fn((table) => {
        if (table === 'users') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { id: 1, email: 'test@example.com', secret: 'correct' },
                  error: null,
                }),
              }),
            }),
            update: () => ({
              eq: () => Promise.resolve({
                error: null,
              }),
            }),
          };
        }
      });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', secret: 'correct', newPassword: '123456' },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ ok: true, msg: 'Password reset successfully' });
  });


  it('should return 500 if password update fails', async () => {
    supabase.from = jest.fn((table) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: 1, email: 'test@example.com', secret: 'correct' },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({
              error: 'Simulated update failure',
            }),
          }),
        };
      }
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', secret: 'correct', newPassword: '123456' },
    });
    const res = httpMocks.createResponse();

    await forgotPassword(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ ok: false, msg: 'Failed to update password' });
  });

});
describe('logout Controller', () => {
  it('should clear the jwt cookie and return 200 with success message', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    res.cookie = jest.fn(); // mock the cookie setter

    await logout(req, res);

    expect(res.cookie).toHaveBeenCalledWith('jwt', '', { maxAge: 0 });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      ok: true,
      msg: 'Logged Out successfully',
    });
  });

  it('should return 500 if an error occurs', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Intentionally cause an error by removing the cookie method
    res.cookie = () => { throw new Error('mock error') };

    await logout(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      error: true,
      ok: false,
      msg: 'An error occured!',
    });
  });
});