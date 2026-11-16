import assert from 'node:assert';
import test from 'node:test';
import { protect, authorize } from '../src/middlewares/auth.middleware.js';
import User from '../src/models/User.js';
import Appointment from '../src/models/Appointment.js';
import { cancelAppointment, updateAppointmentStatus } from '../src/controllers/appointment.controller.js';
import { deleteUser, updateUserStatus } from '../src/controllers/admin.controller.js';

test('User Model Schema Validations', async (t) => {
  await t.test('Patient does not require specialization or experience', async () => {
    const patient = new User({
      name: 'John Patient',
      email: 'john@patient.com',
      password: 'password123',
      role: 'patient'
    });
    const err = await patient.validate();
    assert.strictEqual(err, undefined);
  });

  await t.test('Doctor requires specialization and experience', async () => {
    const doctor = new User({
      name: 'Dr. House',
      email: 'house@clinic.com',
      password: 'password123',
      role: 'doctor'
    });
    let err;
    try {
      await doctor.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'Doctor should require specialization and experience');
    assert.ok(err.errors.specialization, 'specialization is required');
    assert.ok(err.errors.experience, 'experience is required');
  });

  await t.test('Doctor is valid with specialization and experience', async () => {
    const doctor = new User({
      name: 'Dr. House',
      email: 'house@clinic.com',
      password: 'password123',
      role: 'doctor',
      specialization: 'Diagnostic Medicine',
      experience: 15
    });
    const err = await doctor.validate();
    assert.strictEqual(err, undefined);
  });

  await t.test('Invalid role is rejected', async () => {
    const user = new User({
      name: 'Invalid Guy',
      email: 'invalid@example.com',
      password: 'password123',
      role: 'superadmin'
    });
    let err;
    try {
      await user.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'Invalid role should trigger validation error');
    assert.ok(err.errors.role, 'role error should be present');
  });
});

test('Auth Middleware Tests', async (t) => {
  const secret = 'test_secret_12345';
  process.env.JWT_SECRET = secret;

  await t.test('protect: returns 401 when token is missing', async () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) {
        statusSent = s;
        return this;
      },
      json(j) {
        jsonSent = j;
        return this;
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await protect(req, res, next);
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(nextCalled, false);
  });

  await t.test('authorize: blocks user with wrong role', () => {
    const req = { user: { role: 'patient' } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) {
        statusSent = s;
        return this;
      },
      json(j) {
        jsonSent = j;
        return this;
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = authorize('doctor', 'admin');
    middleware(req, res, next);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(nextCalled, false);
  });

  await t.test('authorize: permits user with matching role', () => {
    const req = { user: { role: 'doctor' } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = authorize('doctor', 'admin');
    middleware(req, res, next);

    assert.strictEqual(nextCalled, true);
  });
});

test('Appointment Controller Business Rules', async (t) => {
  await t.test('Doctor cannot approve/reject an appointment assigned to another doctor (Rule 4)', async () => {
    const doctorAId = '660000000000000000000001';
    const doctorBId = '660000000000000000000002';

    const originalFindById = Appointment.findById;
    Appointment.findById = async () => ({
      _id: '660000000000000000000099',
      doctor: doctorAId,
      status: 'pending'
    });

    const req = {
      user: { _id: doctorBId, role: 'doctor' },
      params: { id: '660000000000000000000099' },
      body: { status: 'approved' }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; return this; }
    };

    await updateAppointmentStatus(req, res, () => {});
    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
    assert.match(jsonSent.message, /Forbidden.*another doctor/i);

    Appointment.findById = originalFindById;
  });

  await t.test('Patient cannot cancel appointment if not in pending status (Rule 6)', async () => {
    const patientId = '660000000000000000000005';

    const originalFindById = Appointment.findById;
    Appointment.findById = async () => ({
      _id: '660000000000000000000099',
      patient: patientId,
      status: 'approved'
    });

    const req = {
      user: { _id: patientId, role: 'patient' },
      params: { id: '660000000000000000000099' }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; return this; }
    };

    await cancelAppointment(req, res, () => {});
    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.success, false);
    assert.match(jsonSent.message, /Only appointments with 'pending' status can be cancelled/i);

    Appointment.findById = originalFindById;
  });
});

test('Admin Controller Safeguards', async (t) => {
  await t.test('Admin cannot delete their own account', async () => {
    const adminId = '660000000000000000000001';

    const originalFindById = User.findById;
    User.findById = async () => ({
      _id: adminId,
      role: 'admin'
    });

    const req = {
      user: { _id: adminId, role: 'admin' },
      params: { id: adminId }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; return this; }
    };

    await deleteUser(req, res, () => {});
    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.message, 'Admin cannot delete their own account');

    User.findById = originalFindById;
  });

  await t.test('Admin cannot deactivate their own account', async () => {
    const adminId = '660000000000000000000001';

    const originalFindById = User.findById;
    User.findById = async () => ({
      _id: adminId,
      role: 'admin'
    });

    const req = {
      user: { _id: adminId, role: 'admin' },
      params: { id: adminId },
      body: { isActive: false }
    };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; return this; }
    };

    await updateUserStatus(req, res, () => {});
    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.message, 'Admin cannot change their own account status');

    User.findById = originalFindById;
  });
});
