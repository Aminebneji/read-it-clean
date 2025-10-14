export async function fetchRssFeed(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('failed to fetch RSS feed data:' + response.statusText)
    }
    return response.text();
}
