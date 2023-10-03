export const graphFetcher = async (client, query) => {   
    return await client.query({
      query, fetchPolicy: 'no-cache'
    })?.data
}