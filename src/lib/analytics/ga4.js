import 'server-only';

import { unstable_cache } from 'next/cache';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

async function fetchPostViews() {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is missing');
  }

  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,

    dateRanges: [
      {
        startDate: '2020-01-01',
        endDate: 'today',
      },
    ],

    dimensions: [
      { name: 'pagePath' },
    ],

    metrics: [
      { name: 'screenPageViews' },
    ],

    limit: 10000,
  });

  return (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? '',
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}

export const getPostViews = unstable_cache(fetchPostViews, ['ga4-post-views'], {
  revalidate: 60 * 60 * 24,
});
