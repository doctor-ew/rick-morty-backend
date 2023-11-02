import express, {Express} from 'express';
import {ApolloServer} from 'apollo-server-express';
import {readFileSync} from 'fs';
import path from 'path';
import resolvers from './graphql/resolvers';
import {RedisCache} from 'apollo-server-cache-redis';

const app: Express = express();
const PORT = 4000;

// Load the schema from the schema.graphql file
const typeDefs = readFileSync(path.join(__dirname, 'graphql/schema.graphql'), 'utf-8');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    cache: new RedisCache({
        host: 'localhost',
        port: 6379
    }),
    context: ({req, res}) => ({
        req,
        res,
        cache: new RedisCache({
            host: 'localhost',
            port: 6379
        })
    })
});


// Create an asynchronous function to start the server and apply middleware
async function startServer() {
    await server.start();
    server.applyMiddleware({app: app as any});

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

// Call the asynchronous function
startServer().catch(error => {
    console.error(error);
    process.exit(1);
});
