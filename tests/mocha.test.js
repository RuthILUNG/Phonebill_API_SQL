import request from 'supertest';
import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import { expect } from 'chai';

// Setup an in-memory SQLite database for testing
const app = express();
app.use(express.static('public'));
app.use(express.json());

const db = await sqlite.open({
  filename: ':memory:', // Use in-memory database for testing
  driver: sqlite3.Database
});

// Create a mock table
await db.exec('CREATE TABLE price_plan (id INTEGER PRIMARY KEY, plan_name TEXT, sms_price REAL, call_price REAL)');

// Insert mock data
await db.run('INSERT INTO price_plan (plan_name, sms_price, call_price) VALUES (?, ?, ?)', ['basic', 0.1, 0.5]);

// Define routes
app.get('/api/price_plans/', async (req, res) => {
  const plans = await db.all('SELECT * FROM price_plan');
  res.json(plans);
});

app.post('/api/price_plan/create', async (req, res) => {
  const { name, sms_cost, call_cost } = req.body;
  await db.run('INSERT INTO price_plan (plan_name, sms_price, call_price) VALUES (?, ?, ?)', [name, sms_cost, call_cost]);
  res.status(201).send('Price plan created');
});

app.post('/api/price_plan/update', async (req, res) => {
  const { name, sms_cost, call_cost } = req.body;
  await db.run('UPDATE price_plan SET sms_price = ?, call_price = ? WHERE plan_name = ?', [sms_cost, call_cost, name]);
  res.send('Price plan updated');
});

app.post('/api/price_plan/delete', async (req, res) => {
  const { id } = req.body;
  await db.run('DELETE FROM price_plan WHERE id = ?', [id]);
  res.send('Price plan deleted');
});

// app.post('/api/phonebill/', async (req, res) => {
//   console.log('Request body:', req.body); // Log request body
//   const { price_plan, actions } = req.body;
//   const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', [price_plan]);
//   console.log('Plan:', plan); // Log retrieved plan
//   if (!plan) {
//     return res.status(404).json({ error: 'Price plan not found' });
//   }
//   const { sms_price, call_price } = plan;
//   const actionList = actions.split(', ');
//   let totalCost = 0;
//   actionList.forEach(action => {
//     if (action === 'call') {
//       totalCost += call_price;
//     } else if (action === 'sms') {
//       totalCost += sms_price;
//     }
//   });
//   res.json({ total: totalCost.toFixed(2) });
// });


// Unit tests
describe('API tests', () => {
  it('should get all price plans', async () => {
    const response = await request(app).get('/api/price_plans/');
    expect(response.status).to.equal(200);
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0].plan_name).to.equal('basic');
  });

  it('should create a new price plan', async () => {
    const response = await request(app)
      .post('/api/price_plan/create')
      .send({ name: 'premium', sms_cost: 0.2, call_cost: 1.0 });
    expect(response.status).to.equal(201);
    const plans = await db.all('SELECT * FROM price_plan WHERE plan_name = ?', ['premium']);
    expect(plans).to.have.lengthOf(1);
    expect(plans[0].sms_price).to.equal(0.2);
  });

  it('should update an existing price plan', async () => {
    const response = await request(app)
      .post('/api/price_plan/update')
      .send({ name: 'basic', sms_cost: 0.15, call_cost: 0.6 });
    expect(response.status).to.equal(200);
    const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', ['basic']);
    expect(plan.sms_price).to.equal(0.15);
  });

  it('should delete a price plan', async () => {
    const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', ['basic']);
    const response = await request(app)
      .post('/api/price_plan/delete')
      .send({ id: plan.id });
    expect(response.status).to.equal(200);
    const deletedPlan = await db.get('SELECT * FROM price_plan WHERE id = ?', [plan.id]);
    expect(deletedPlan).to.be.undefined;
  });

  // it('should calculate phone bill', async () => {
  //   const response = await request(app)
  //     .post('/api/phonebill/')
  //     .send({ price_plan: 'basic', actions: 'call, sms, call' });
  //   console.log('Response status:', response.status); // Log response status
  //   console.log('Response body:', response.body); // Log response body
  //   expect(response.status).to.equal(200);
  //   expect(response.body.total).to.equal('1.10'); // 2 calls at 0.5 each + 1 sms at 0.1
  // });
  

  // it('should return 404 for unknown price plan', async () => {
  //   const response = await request(app)
  //     .post('/api/phonebill/')
  //     .send({ price_plan: 'nonexistent', actions: 'call' });
  //   expect(response.status).to.equal(404);
  //   expect(response.body.error).to.equal('Price plan not found');
  // });
});
