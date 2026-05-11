import { Hono } from 'hono';
import { appointmentController } from '../controllers/appointmentController';
import { verifyJWT, isAdmin } from '../middlewares/authMiddleware';

const appointments = new Hono();

appointments.post('/', verifyJWT, isAdmin, appointmentController.create);
appointments.get('/', verifyJWT, isAdmin, appointmentController.getAppointments);
appointments.patch('/:id/resolve', verifyJWT, isAdmin, appointmentController.resolve);

export default appointments;