import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KV_KEY = 'push_subscriptions';

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    await kv.sadd(KV_KEY, JSON.stringify(subscription.toJSON ? subscription.toJSON() : subscription));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[push/subscribe] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const subscription = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    await kv.srem(KV_KEY, JSON.stringify(subscription.toJSON ? subscription.toJSON() : subscription));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push/subscribe] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
