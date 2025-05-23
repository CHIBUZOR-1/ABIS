const supabase = require('../db');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { setCookiesWithToken } = require('../Utilities/verifyToken');

const createUser = async (req, res) => {
    try {
        const { email, name, phone, password, secret } = req.body;
        if(!name || !phone || !password || !email || !secret) {
            return res.status(400).json({ ok: false, msg: "All fields required"});
        }

        if (typeof email !== 'string' || !validator.isEmail(email)) {
            return res.status(400).json({ ok: false, msg: "Enter a valid Email Address" });
        }
        if(password.length < 6) {
            return res.status(400).json({
                ok: false,
                msg: "Please enter a strong password"
            })
        }
        
        // Check if user exists
        const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ ok: false, msg: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into Supabase
        const { data, error: insertError } = await supabase
            .from('users')
            .insert([{
                email,
                name,
                phone,
                secret,
                password: hashedPassword,
                verified: true
            }]);

        if (insertError) {
            return res.status(400).json({ ok: false, msg: "User registration failed", error: insertError.message });
        }

        res.status(201).json({ ok: true, msg: "Registration successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const logIn = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ ok: false, msg: "Email and password are required" });
        }
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password, name, verified, phone, image')
            .eq('email', email)
            .single();
        if (error || !user) {
            return res.status(400).json({ ok: false, msg: "Invalid credentials" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ ok: false, msg: "Invalid credentials" });
        }
        setCookiesWithToken(user.id, res);
        const details = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            photo: user.image,
            isVerified: user.verified
        };
        res.status(200).json({
            ok: true,
            msg: "Login successful",
            details
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error: true,
            msg: "An error occurred!"
        })
    }
}
const updateUser = async (req, res) => {
    try { 
      const userId = req.user.userId;
      const { name, email, phone, image, image_id } = req.body;

  
      if (!userId) {
        return res.status(400).json({ ok: false, msg: "User ID is required" });
      }
  
      const fieldsToUpdate = {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(image && { image }),
        ...(image_id && { image_id }),
      };
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ ok: false, msg: "No valid fields to update" });
      }

  
      const { error } = await supabase
        .from('users')
        .update(fieldsToUpdate)
        .eq('id', userId)
        .single();
      if (error) {
        return res.status(500).json({ ok: false, msg: "Failed to update user" });
      }
      // Fetch the updated user
    const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('id, name, email, phone, image')
        .eq('id', userId)
        .single();
    if (fetchError || !updatedUser) {
        console.log('fetcherror:', fetchError)
        return res.status(500).json({ ok: false, msg: "Failed to fetch updated user" });
    }
  
    return res.status(200).json({ ok: true, msg: "User updated successfully", updatedUser });
  
    } catch (err) {
        console.log('update error:', err)
      res.status(500).json({ ok: false, msg: "Server error" });
    }
  };
  const forgotPassword = async(req, res) => {
    try {
        const { email, secret, newPassword } = req.body;
        if(!email || !secret || !newPassword) {
            return res.status(400).json({ok: false, msg: "All fields required"});
        }
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, secret')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ ok:false, msg: "User not found" });
        }

        // 2. Verify secret
        if (user.secret !== secret) {
            return res.status(403).json({ ok: false, msg: "Invalid secret answer" });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, `${salt}`);

        // 4. Update password
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ ok: false, msg: "Failed to update password" });
        }
        res.status(200).json({ ok: true, msg: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({
            ok:false,
            error: true,
            msg: "Something went wrong!"
        })
    }
}
const logout = async(req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0});
        res.status(200).json({
            ok: true,
            msg: "Logged Out successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            ok: false,
            msg: "An error occured!"
        })
    }
}

module.exports = { createUser, logIn, updateUser, forgotPassword, logout}