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
                const response = await axios.post('https://rickandmortyapi.com/graphql', {query});
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
        },

        rickAndMortyAssociations: async () => {
            const ricks = await resolvers.Query.charactersByName(null, {name: "Rick"});
            const morties = await resolvers.Query.charactersByName(null, {name: "Morty"});

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
