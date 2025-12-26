require('dotenv').config();
const express = require('express');
const { connectDB, getDb } = require('./services/mongoService');
const { ObjectId, ReturnDocument } = require('mongodb');
const axios = require('axios');

const collectionName = process.env.COLLECTION_NAME || 'users';
const route = express();
const port = process.env.PORT || 3000;

async function syncData() {
    try {
        console.log("Calling API...");
        const response = await axios.get('https://dummyjson.com/users');
        const users = response.data.users;

        const db = getDb();

        const opperations = users.map(user => ({
            updateOne: {
                filter: { id: user.id },
                update: { $set: user },
                upsert: true
            }
        }));

        if (opperations.length > 0) {
            const result = await db.collection(collectionName).bulkWrite(opperations);
            console.log(`API data synced. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

route.use((req, res, next) => {
    try {
        req.db = getDb();
        next();
    } catch (error) {
        res.status(500).json({ message: "Database connection error" });
        console.error("Database connection error:", error);
    }
});

route.use(express.json());

route.get('/', async (req, res) => {
    try {
        const result = await req.db.collection(collectionName).find({}).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Get all users error:", error);
    }
});

route.get('/userById/:userId', async (req, res) => {
    try {
        const users = await req.db.collection(collectionName).findOne({ id: parseInt(req.params.userId) });
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Get user by ID error:", error);
    }
});

route.post('/getUserByState/:stateCode', async (req, res) => {
    try {
        const stateCode = req.params.stateCode;
        const usersInState = await req.db.collection(collectionName).find({ 'address.stateCode': stateCode }).toArray();
        if (usersInState) {
            res.status(200).json(usersInState);
        } else {
            return res.status(404).json({ message: "No users found in the specified state" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Get users by state error:", error);
    }
});

route.post('/countByState', async (req, res) => {
    try {
        const countByState = [
            {
                $group: {
                    _id: "$address.state",
                    count: { $sum: 1 }
                }
            }
        ];
        const result = await req.db.collection(collectionName).aggregate(countByState).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Count by state error:", error);
    }
});

route.post('/userGroupByState', async (req, res) => {
    try {
        const groupByState = [
            {
                $group: {
                    _id: "$address.state",
                    users: { $push: "$$ROOT" }
                }
            }
        ];
        const result = await req.db.collection(collectionName).aggregate(groupByState).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Group by state error:", error);
    }
});

route.post('/searchUsers', async (req, res) => {
    try {
        const query = req.body.query;
        const users = await req.db.collection(collectionName)
            .find({ $text: { $search: query } })
            .toArray();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Search users error:", error);
    }
});

route.post('/updateUser', async (req, res) => {
    try {
        const { id, update } = req.body;

        const updatedUser = await req.db.collection(collectionName).findOneAndUpdate(
            { id: id },
            { $set: update },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Update user error:", error);
    }
});

async function startApp() {
    try {
        await connectDB();

        await syncData();

        route.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        setInterval(syncData, 60 * 1000); // Call API every minute
    } catch (error) {
        console.error("Failed to start application:", error);
    }
}

startApp();

