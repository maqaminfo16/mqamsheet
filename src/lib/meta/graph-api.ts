export async function fetchLeadDetails(leadgenId: string) {
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';

  if (!accessToken) {
    throw new Error('META_PAGE_ACCESS_TOKEN is not configured.');
  }

  const url = `https://graph.facebook.com/${apiVersion}/${leadgenId}?access_token=${accessToken}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Graph API Error: ${data.error?.message || 'Unknown error'}`);
    }

    return data;
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`Failed to fetch lead details: ${err.message}`);
  }
}
