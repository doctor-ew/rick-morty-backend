// rickmorty.test.js
const request = require('supertest');
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const fs = require('fs');
const path = require('path');

// Import your typeDefs and resolvers for the rickmorty module
const rickMortyTypeDefs = gql(fs.readFileSync(path.join(__dirname, './src/graphql/rickmorty/schema.graphql'), 'utf8'));
const rickMortyResolvers = require('./src/graphql/rickmorty/resolvers');

// Set up Apollo Server for rickmorty
const rickMortyServer = new ApolloServer({ typeDefs: rickMortyTypeDefs, resolvers: rickMortyResolvers });
const rickMortyApp = express();
rickMortyServer.applyMiddleware({ app: rickMortyApp });

describe('RickMorty GraphQL Integration Tests', () => {
    test('Fetches characters', async () => {
        const query = `
      query {
        characters {
          id
          name
          // ... other fields
        }
      }
    `;

        const response = await request(rickMortyApp)
            .post('/graphql')
            .send({ query });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data.characters');
        // Add more assertions based on the expected shape of your data
    });

    // Add more tests for different queries and mutations specific to rickmorty
});
