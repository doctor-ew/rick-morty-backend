// jest.config.js
export default {
    transform: {
        '^.+\\.graphql$': 'jest-transform-graphql',
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
};
