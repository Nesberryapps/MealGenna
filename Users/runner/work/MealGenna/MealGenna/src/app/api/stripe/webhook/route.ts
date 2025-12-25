
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { admin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const relevantEvents = new Set([
  'checkout.session.completed',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const { userId, priceId } = session.metadata || {};

          if (!userId || !priceId) {
            console.error('Webhook Error: Missing userId or priceId in metadata');
            break;
          }
          
          const db = getFirestore(admin.app());
          const userCreditsRef = db.collection('user_credits').doc(userId);

          await db.runTransaction(async (transaction) => {
            const userCreditsSnap = await transaction.get(userCreditsRef);
            let credits = { single: 0, '7-day-plan': 0 };

            if (userCreditsSnap.exists) {
                const data = userCreditsSnap.data();
                if (data) {
                    credits = {
                        single: data.single || 0,
                        '7-day-plan': data['7-day-plan'] || 0,
                    };
                }
            }

            if (priceId === process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID) { 
              credits.single += 5;
            } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID) {
              credits['7-day-plan'] += 1;
            } else {
              console.warn(`Webhook received for unhandled priceId: ${priceId}`);
              return;
            }
            
            transaction.set(userCreditsRef, credits, { merge: true });
          });
          
          console.log(`✅ Credits added for user ${userId} for purchase of ${priceId}`);
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.error(error);
      return new NextResponse('Webhook handler failed. View logs.', { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}
