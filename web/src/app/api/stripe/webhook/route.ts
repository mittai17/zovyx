import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = (customer as Stripe.Customer).metadata?.appwrite_user_id;

        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const userId = session.metadata?.appwrite_user_id;
          
          if (userId) {
            // Just link the customer ID to the user if it's the first time
            // The actual subscription upsert will happen in customer.subscription.created
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              status: 'active', // temp status until sub.created fires
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
