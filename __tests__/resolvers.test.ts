// __tests__/resolvers.test.ts

import { ApolloServer } from 'apollo-server-express';
import { RedisCache } from 'apollo-server-cache-redis';
import resolvers from '../src/graphql/rickmorty/resolvers';
import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import gql from 'graphql-tag';
import schemaString from '../src/graphql/rickmorty/schema.graphql';

const typeDefs = gql`${schemaString}`;

jest.mock('axios');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    cache: new RedisCache({
        host: 'localhost',
        port: 6379
    }),
    context: ({ req, res }) => ({
        req,
        res,
        cache: new RedisCache({
            host: 'localhost',
            port: 6379
        })
    })
});

describe('Resolvers', () => {
    it('fetches characters by name', async () => {
        mocked(axios.post).mockResolvedValueOnce({
            data: {
                data: {
                    characters: {
                        results: [{ name: "Rick" }]
                    }
                }
            }
        });

        const result = await server.executeOperation({
            query: `
        query GetCharactersByName($name: String!) {
          charactersByName(name: $name) {
            name
          }
        }
      `,
            variables: { name: "Rick" }
        });

        expect(result.errors).toBeUndefined();
        expect(result.data?.charactersByName).toBeDefined();
        expect(result.data?.charactersByName[0].name).toBe("Rick");
    });

});
