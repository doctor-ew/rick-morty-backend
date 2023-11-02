import axios from 'axios';

const resolvers = {
    Query: {

        charactersByName: async (_: any, args: { name: string }, context: any) => {
            context.cacheControl.setCacheHint({maxAge: 360, scope: 'PRIVATE'});
            const cache = context.cache;
            const cacheKey = `charactersByName:${args.name}`;
            const cachedData = await cache.get(cacheKey);

            if (cachedData) {
                return cachedData;
            }


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
                const response = await axios.post('https://rickandmortyapi.com/graphql', {query});

                let responseData = response.data.data.characters.results;
                await cache.set(cacheKey, responseData, {ttl: 5});


                return responseData;
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
        },

        rickAndMortyAssociations: async (_: any, _args: any, context: any) => {
            const ricks = await resolvers.Query.charactersByName(_, {name: "Rick"}, context);
            const morties = await resolvers.Query.charactersByName(_, {name: "Morty"}, context);

            return ricks.map((rick: any) => {
                const associatedMorties = morties.filter((morty: any) => {
                    const commonEpisodes = morty.episode.filter((mortyEpisode: any) =>
                        rick.episode.some((rickEpisode: any) => rickEpisode.id === mortyEpisode.id)
                    );
                    // This is a simple heuristic. You can adjust the logic as needed.
                    return commonEpisodes.length > 2;
                });

                return {
                    rick,
                    morties: associatedMorties
                };
            });
        }

    }
};

export default resolvers
