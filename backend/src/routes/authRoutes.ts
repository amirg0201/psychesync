import { Hono } from 'hono';
import { register, login } from '../controllers/authController';
import { verifyJWT } from '../middlewares/authMiddleware';

const auth = new Hono();

auth.post('/register', register);
auth.post('/login', login);

export default auth;