import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';
import tracer from 'tracer';

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, 'data', 'users.json');

const readUsers = async () => {
    try {
        const data = await fs.promises.readFile(usersFilePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.promises.writeFile(usersFilePath, JSON.stringify([]));
            return [];
        }
        throw error;
    }
};

const writeUsers = async (users) => {
    await fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

const userController = {
    getAllUsers: async () => {
        try {
            const users = await readUsers();
            return users.map(user => {
                const { password, ...userData } = user;
                return userData;
            });
        } catch (error) {
            logger.error('Error getting users:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const users = await readUsers();
            const user = users.find(user => user.id === id);

            if (!user) {
                throw new Error('User not found');
            }

            const { password, ...userData } = user;
            return userData;
        } catch (error) {
            logger.error('Error getting user by ID:', error);
            throw error;
        }
    },

    registerUser: async (userData) => {
        try {
            const { name, lastname, email, password } = userData;

            if (!name || !lastname || !email || !password) {
                throw new Error('Missing fields');
            }

            const users = await readUsers();

            if (users.some(user => user.email === email)) {
                throw new Error('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = {
                id: Date.now().toString(),
                name,
                lastname,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                profilePicture: null,
                verified: false
            };

            users.push(newUser);
            await writeUsers(users);

            const { password: _, ...userResponse } = newUser;
            return userResponse;
        } catch (error) {
            logger.error('Error registering user:', error);
            throw error;
        }
    },

    loginUser: async (credentials) => {
        try {
            const { email, password } = credentials;

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const users = await readUsers();
            const user = users.find(user => user.email === email);

            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            const token = jsonwebtoken.sign(
                { userId: user.id, email: user.email },
                process.env.SECRET_KEY,
                { expiresIn: '24h' }
            );

            const { password: _, ...userData } = user;
            return {
                user: userData,
                token
            };
        } catch (error) {
            logger.error('Error logging in user:', error);
            throw error;
        }
    },

    updateUser: async (id, updateData) => {
        try {
            const users = await readUsers();
            const userIndex = users.findIndex(user => user.id === id);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            const { id: _, password: __, ...safeUpdateData } = updateData;

            const updatedUser = { ...users[userIndex], ...safeUpdateData };
            users[userIndex] = updatedUser;

            await writeUsers(users);

            const { password: ___, ...userData } = updatedUser;
            return userData;
        } catch (error) {
            logger.error('Error updating user:', error);
            throw error;
        }
    },

    changePassword: async (id, { currentPassword, newPassword }) => {
        try {
            if (!currentPassword || !newPassword) {
                throw new Error('Current password and new password are required');
            }

            const users = await readUsers();
            const userIndex = users.findIndex(user => user.id === id);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);

            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            users[userIndex].password = hashedPassword;

            await writeUsers(users);
            return { message: 'Password updated successfully' };
        } catch (error) {
            logger.error('Error changing password:', error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const users = await readUsers();
            const updatedUsers = users.filter(user => user.id !== id);

            if (users.length === updatedUsers.length) {
                throw new Error('User not found');
            }

            await writeUsers(updatedUsers);
            return { message: 'User deleted successfully' };
        } catch (error) {
            logger.error('Error deleting user:', error);
            throw error;
        }
    },

    verifyToken: (token) => {
        try {
            if (!token) {
                throw new Error('No token provided');
            }

            const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
            return decoded;
        } catch (error) {
            logger.error('Error verifying token:', error);
            throw error;
        }
    }
};

export default userController;
