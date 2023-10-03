export const graphFetcher = async (client, query) => {
    if(!client) return {}
    return await client.query({query, fetchPolicy: 'no-cache'});
}
