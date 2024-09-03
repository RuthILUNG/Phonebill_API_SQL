import request from 'supertest';
import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 4011;

const db = await sqlite.open({
  filename: './data_plan.db',
  driver: sqlite3.Database
});

app.use(express.static('public'));
app.use(express.json());

// Get all price plans
app.get('/api/price_plans/', async (req, res) => {
  const plans = await db.all('SELECT * FROM price_plan');
  res.json(plans);
});

// Create a new price plan
app.post('/api/price_plan/create', async (req, res) => {
  const { name, sms_cost, call_cost } = req.body;
  await db.run('INSERT INTO price_plan (plan_name, sms_price, call_price) VALUES (?, ?, ?)', [name, sms_cost, call_cost]);
  res.status(201).send('Price plan created');
});

// Update a price plan
app.post('/api/price_plan/update', async (req, res) => {
  const { name, sms_cost, call_cost } = req.body;
  await db.run('UPDATE price_plan SET sms_price = ?, call_price = ? WHERE plan_name = ?', [sms_cost, call_cost, name]);
  res.send('Price plan updated');
});

// Delete a price plan
app.post('/api/price_plan/delete', async (req, res) => {
  const { id } = req.body;
  await db.run('DELETE FROM price_plan WHERE id = ?', [id]);
  res.send('Price plan deleted');
});

// Calculate phone bill
app.post('/api/phonebill/', async (req, res) => {
    const { price_plan, actions } = req.body;
    console.log('Requested price plan:', price_plan); // Log the price plan
    const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', [price_plan]);
  
    console.log('Fetched plan:', plan); // Log the fetched plan
  
    if (!plan) {
      return res.status(404).json({ error: 'Price plan not found' });
    }
  
    const { sms_price, call_price } = plan;
    const actionList = actions.split(', ');
    let totalCost = 0;
  
    actionList.forEach(action => {
      if (action === 'call') {
        totalCost += call_price;
      } else if (action === 'sms') {
        totalCost += sms_price;
      }
    });
  
    res.json({ total: totalCost.toFixed(2) });
  });
  
const plan = await db.get('SELECT * FROM price_plan WHERE plan_name = ?', ['sms 102']);
console.log(plan);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
