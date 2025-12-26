const express = require('express');
const { connectDB, getDb } = require('./services/mongoService');
const { ObjectId } = require('mongodb');
const port = 3000;

const collectionName = 'products';
const app = express();

app.use((req, res, next) => {
    try {
        req.db = getDb();
        next();
    } catch (error) {
        res.status(500).json({ message: "Database connection error" });
    }
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Fuck, its the homepage");
});

app.get('/about', (req, res) => {
    res.send("About page");
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await req.db.collection(collectionName).find({}).toArray();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await req.db.collection(collectionName).findOne({ _id: new ObjectId(id) });
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = await req.db.collection(collectionName).insertOne(req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.error("Failed to connect to the database", error);
});