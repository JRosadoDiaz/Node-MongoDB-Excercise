/*
Users Model

Project was initially going to be used to run with Mongoose but later changed to use the native MongoDB driver.
This file is kept for reference purposes.

Information is based on the dummy data from https://dummyjson.com/users
*/

const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema(
    {
        id: Number,
        firstName: String,
        lastName: String,
        maidenName: String,
        age: Number,
        gender: String,
        email: String,
        phone: String,
        username: String,
        password: String,
        birthDate: String,
        image: String,
        bloodGroup: String,
        height: Number,
        weight: Number,
        eyeColor: String,
        hair: {
            color: String,
            type: String
        },
        ip: String,
        address: {
            address: String,
            city: String,
            state: String,
            stateCode: String,
            postalCode: String,
            coordinates: {
                lat: Number,
                lng: Number
            },
            country: String
        },
        macAddress: String,
        university: String,
        bank: {
            cardExpire: String,
            cardNumber: String,
            cardType: String,
            currency: String,
            iban: String
        },
        company: {
            department: String,
            name: String,
            title: String,
            address: {
                address: String,
                city: String,
                state: String,
                stateCode: String,
                postalCode: String,
                coordinates: {
                    lat: Number,
                    lng: Number
                },
                country: String
            }
        },
        ein: String,
        ssn: String,
        userAgent: String,
        crypto: {
            coin: String,
            wallet: String,
            network: String
        },
        role: String
    }
);

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;