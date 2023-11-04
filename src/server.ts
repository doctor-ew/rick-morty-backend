import express, { Express, Request, Response, NextFunction } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import path from 'path';
import rickMortyResolvers from './graphql/rickmorty/resolvers';
import travelDataResolvers from './graphql/traveldata/resolvers';
import { RedisCache } from 'apollo-server-cache-redis';

const app: express.Application = express();
const PORT = 4000;

// Load type definitions for both endpoints
const rickMortyTypeDefs = readFileSync(path.join(__dirname, 'graphql/rickmorty/schema.graphql'), 'utf-8');
const travelDataTypeDefs = readFileSync(path.join(__dirname, 'graphql/traveldata/schema.graphql'), 'utf-8');


// Create ApolloServer instances for both endpoints
const rickMortyServer = new ApolloServer({
    typeDefs: rickMortyTypeDefs,
    resolvers: rickMortyResolvers,
    cache: new RedisCache({
        host: 'redis',
        port: 6379
    }),
    context: ({ req, res }) => ({
        req,
        res,
        cache: new RedisCache({
            host: 'redis',
            port: 6379
        })
    })
});

const travelDataServer = new ApolloServer({
    typeDefs: travelDataTypeDefs,
    resolvers: travelDataResolvers,
    cache: new RedisCache({
        host: 'redis',
        port: 6379
    }),
    context: ({ req, res }) => ({
        req,
        res,
        cache: new RedisCache({
            host: 'redis',
            port: 6379
        })
    })
});

// Create an asynchronous function to start the servers and apply middleware
async function startServer() {
    await rickMortyServer.start();
    rickMortyServer.applyMiddleware({ app: app as any, path: '/rickmorty' });

    await travelDataServer.start();
    travelDataServer.applyMiddleware({ app: app as any, path: '/traveldata' });

    app.listen(PORT, () => {
        console.log(`Rick and Morty GraphQL API available at http://localhost:${PORT}${rickMortyServer.graphqlPath}`);
        console.log(`Travel Data GraphQL API available at http://localhost:${PORT}${travelDataServer.graphqlPath}`);
    });

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

}

// Call the asynchronous function
startServer().catch(error => {
    console.error(error);
    process.exit(1);
});
