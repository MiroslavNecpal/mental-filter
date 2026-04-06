import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { kv } from '@vercel/kv';

const KV_KEY = 'push_subscriptions';

const PAYLOAD = JSON.stringify({
  title: 'Mental Filter',
  body: 'Čo sa ti dnes podarilo? Poďme na to!',
  icon: '/icon-192x192.png',
  badge: '/icon-192x192.png',
  url: '/',
});

export async function POST(req: NextRequest) {
  // Vercel cron sets x-vercel-cron header; manual triggers use CRON_SECRET bearer token
  const isCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization');
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  try {
    const rawSubscriptions: string[] = await kv.smembers(KV_KEY);

    if (rawSubscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No subscriptions' });
    }

    const results = await Promise.allSettled(
      rawSubscriptions.map(async raw => {
        const sub = JSON.parse(raw) as webpush.PushSubscription;
        try {
          await webpush.sendNotification(sub, PAYLOAD);
        } catch (err: unknown) {
          // Remove expired/unsubscribed endpoints automatically
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await kv.srem(KV_KEY, raw);
          }
          throw err;
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[push/send] sent=${sent} failed=${failed}`);
    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error('[push/send] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
