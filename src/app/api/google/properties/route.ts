import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGoogleConnection, getValidGoogleTokens } from '@/lib/utils/tokens';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await adminAuth.verifySessionCookie(session, true);

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    if (!websiteId) return NextResponse.json({ error: 'websiteId required' }, { status: 400 });

    const connection = await getGoogleConnection(websiteId, 'analytics') as any;
    if (!connection) return NextResponse.json({ error: 'Google not connected' }, { status: 404 });

    const accessToken = await getValidGoogleTokens(connection.id);

    // List GA4 properties via Analytics Admin API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const analyticsAdmin = google.analyticsadmin({ version: 'v1alpha', auth });

    let accounts: any[] = [];
    let accountsError = '';
    try {
      const accountsResp = await analyticsAdmin.accounts.list();
      accounts = accountsResp.data.accounts || [];
    } catch (e: any) {
      accountsError = e.message;
    }

    const propertiesWithAccounts: any[] = [];
    const propErrors: string[] = [];

    for (const account of accounts) {
      try {
        const propsResp = await analyticsAdmin.properties.list({
          filter: `parent:${account.name}`,
        });
        const props = propsResp.data.properties || [];
        for (const prop of props) {
          propertiesWithAccounts.push({
            accountName: account.displayName,
            accountId: account.name?.replace('accounts/', ''),
            propertyId: prop.name?.replace('properties/', ''),
            propertyName: prop.displayName,
            websiteUrl: (prop as any).websiteUri || '',
            timezone: prop.timeZone,
          });
        }
      } catch (e: any) {
        propErrors.push(`${account.name}: ${e.message}`);
      }
    }

    return NextResponse.json({
      properties: propertiesWithAccounts,
      _debug: { accountCount: accounts.length, accountsError, propErrors },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
