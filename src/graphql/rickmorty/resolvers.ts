import axios from 'axios';

const rickMortyResolvers = {
    Query: {

        charactersByName: async (_: any, args: { name: string }, context: any) => {
            const cache = context.cache;
            if (context.cacheControl) {
                context.cacheControl.setCacheHint({maxAge: 360, scope: 'PRIVATE'});
            }

            const cacheKey = `charactersByName:${args.name}`;
            const cachedData = await cache.get(cacheKey);

            if (cachedData) {
                // Deserialize the data when retrieving it from the cache
                return JSON.parse(cachedData);
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
                    name
                }
            }
        }
    }`;

            try {
                const response = await axios.post('https://rickandmortyapi.com/graphql', {query});

                let responseData = response.data.data.characters.results;
                // Serialize the data before storing it in the cache
                await cache.set(cacheKey, JSON.stringify(responseData), {ttl: 5});

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
            const ricks = await rickMortyResolvers.Query.charactersByName(_, {name: "Rick"}, context);
            const morties = await rickMortyResolvers.Query.charactersByName(_, {name: "Morty"}, context);
            console.log('|-o-| Ricks:',ricks, '|-o-| Morties:', morties);
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

export default rickMortyResolvers
