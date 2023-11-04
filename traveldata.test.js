// traveldata.test.js
const request = require('supertest');
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const fs = require('fs');
const path = require('path');

// Import your typeDefs and resolvers for the traveldata module
const travelDataTypeDefs = gql(fs.readFileSync(path.join(__dirname, './src/graphql/traveldata/schema.graphql'), 'utf8'));
const travelDataResolvers = require('./src/graphql/traveldata/resolvers');

// Set up Apollo Server for traveldata
const travelDataServer = new ApolloServer({ typeDefs: travelDataTypeDefs, resolvers: travelDataResolvers });
const travelDataApp = express();
travelDataServer.applyMiddleware({ app: travelDataApp });

describe('TravelData GraphQL Integration Tests', () => {
    test('Fetches bookings', async () => {
        const query = `
      query {
        bookings {
          bookingId
          noOfAdults
          // ... other fields
        }
      }
    `;

        const response = await request(travelDataApp)
            .post('/graphql')
            .send({ query });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data.bookings');
        // Add more assertions based on the expected shape of your data
    });

    // Add more tests for different queries and mutations specific to traveldata
});
