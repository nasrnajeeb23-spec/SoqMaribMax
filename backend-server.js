const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const executeQuery = async (query, params) => {
    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw new Error('Database operation failed');
    }
};

const router = express.Router();

// Generic GET all
const genericGetAll = (tableName) => async (req, res) => {
    try {
        const items = await executeQuery(`SELECT * FROM ${tableName}`);
        res.json(items);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Generic POST
const genericPost = (tableName) => async (req, res) => {
    try {
        const columns = Object.keys(req.body);
        const values = Object.values(req.body);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const newItem = await executeQuery(query, values);
        res.status(201).json(newItem[0]);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Generic PATCH
const genericPatch = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);
        const setString = fields.map((field, i) => `"${field}" = $${i + 1}`).join(', ');
        const query = `UPDATE ${tableName} SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`;
        const updatedItem = await executeQuery(query, [...values, id]);
        if (updatedItem.length > 0) {
            res.json(updatedItem[0]);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Generic DELETE
const genericDelete = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        await executeQuery(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};


// Setup all CRUD routes
const setupCrud = (path, tableName) => {
    router.get(path, genericGetAll(tableName));
    router.post(path, genericPost(tableName));
    router.patch(`${path}/:id`, genericPatch(tableName));
    router.delete(`${path}/:id`, genericDelete(tableName));
};

setupCrud('/products', 'products');
setupCrud('/users', 'users');
setupCrud('/stores', 'stores');
setupCrud('/deliveries', 'deliveries');
setupCrud('/payments', 'payments');
setupCrud('/payouts', 'payouts');
setupCrud('/reviews', 'reviews');
setupCrud('/ratings', 'user_ratings');
setupCrud('/ads', 'advertisements');
setupCrud('/product-categories', 'product_categories');
setupCrud('/service-categories', 'service_categories');
setupCrud('/posts', 'community_posts');
setupCrud('/comments', 'post_comments');
setupCrud('/offers', 'offers');
setupCrud('/services', 'services');
setupCrud('/bookings', 'service_bookings');
setupCrud('/service-reviews', 'service_reviews');
setupCrud('/conversations', 'conversations');
setupCrud('/messages', 'messages');

// Special endpoints
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await executeQuery('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.use('/api', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
