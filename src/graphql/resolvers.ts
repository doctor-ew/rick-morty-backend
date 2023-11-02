import axios from 'axios';

const resolvers = {
    Query: {
        charactersByName: async (_: any, args: { name: string }) => {
            const query = `
            {
                characters(filter: {name: "${args.name}"}) {
                    results {
                        id
                        name
                        status
                        species
                        type
                        gender
                        image
                        episode {
                            id
                        }
                    }
                }
            }`;

            try {
                const response = await axios.post('https://rickandmortyapi.com/graphql', { query });
                return response.data.data.characters.results;
            } catch (error) {
                console.error("Error fetching characters:", error);
                return [];
            }
        },
        episodesByIds: async (_: any, args: { ids: number[] }) => {
            try {
                const response = await axios.get(`https://rickandmortyapi.com/api/episode/${args.ids.join(',')}`);
                return Array.isArray(response.data) ? response.data : [response.data];
            } catch (error) {
                console.error("Error fetching episodes:", error);
                return [];
            }
        }
    }
};

export default resolvers
