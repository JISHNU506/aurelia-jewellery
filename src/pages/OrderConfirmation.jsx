import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, MapPin, PackageSearch, Truck } from 'lucide-react';
import { EASE, EmptyState } from '../components/ui/Primitives.jsx';
import { deliveryDate, formatDate, formatINR } from '../utils/format.js';
import { getOrder } from '../utils/orders.js';

function AnimatedCheck() {
  return (
    <motion.svg viewBox="0 0 80 80" className="h-20 w-20" initial="hidden" animate="visible">
      <motion.circle
        cx="40"
        cy="40"
        r="37"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.5"
        variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <motion.path
        d="M25 41 l10 10 l20 -22"
        fill="none"
        stroke="var(--color-gold-dark)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
        transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
      />
    </motion.svg>
  );
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const order = getOrder(orderId);

  if (!order) {
    return (
      <div className="container-luxe">
        <EmptyState
          icon={PackageSearch}
          title="Order not found"
          text={`We couldn't find an order with the number ${orderId}. Orders are stored on this device only.`}
          action={
            <Link to="/shop" className="btn-primary">
              Continue shopping
            </Link>
          }
        />
      </div>
    );
  }

  const { totals, address } = order;
  const express = order.delivery === 'express';
  const fade = (delay) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE } });

  return (
    <div className="bg-cream/50">
      <div className="container-luxe max-w-4xl py-14 sm:py-20">
        <div className="flex flex-col items-center text-center">
          <AnimatedCheck />
          <motion.p {...fade(0.4)} className="eyebrow mt-8">
            Order confirmed
          </motion.p>
          <motion.h1 {...fade(0.5)} className="mt-3 text-5xl font-light sm:text-6xl">
            Thank you, {address.name.split(' ')[0]}
          </motion.h1>
          <motion.p {...fade(0.6)} className="mt-4 max-w-md text-[14.5px] leading-relaxed text-stone">
            Your pieces are being prepared by our atelier. A confirmation has been sent to <span className="text-ink">{address.email}</span>.
          </motion.p>
        </div>

        <motion.div {...fade(0.75)} className="mt-12 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
          <div className="bg-ivory p-5 text-center">
            <p className="label-luxe">Order number</p>
            <p className="font-display text-2xl">{order.id}</p>
          </div>
          <div className="bg-ivory p-5 text-center">
            <p className="label-luxe">Placed on</p>
            <p className="font-display text-2xl">{formatDate(order.date)}</p>
          </div>
          <div className="bg-ivory p-5 text-center">
            <p className="label-luxe">Estimated delivery</p>
            <p className="font-display text-2xl text-gold-dark">{deliveryDate(express ? 1 : 4)}</p>
          </div>
        </motion.div>

        <motion.div {...fade(0.9)} className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="card-surface p-6">
            <h2 className="text-2xl font-light">Your pieces</h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((i) => (
                <li key={`${i.id}-${i.size}`} className="flex items-center gap-4 py-3">
                  <Link to={`/product/${i.id}`} className="h-16 w-16 shrink-0 bg-cream">
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${i.id}`} className="block truncate font-display text-lg leading-tight hover:text-gold-dark">
                      {i.name}
                    </Link>
                    <p className="text-[12px] text-stone">
                      {i.size && `Size ${i.size} · `}Qty {i.qty}
                    </p>
                  </div>
                  <p className="text-[13.5px] font-semibold">{formatINR(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-stone">Subtotal</dt>
                <dd>{formatINR(totals.subtotal)}</dd>
              </div>
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald">
                  <dt>Coupon {totals.coupon && `(${totals.coupon})`}</dt>
                  <dd>− {formatINR(totals.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Shipping</dt>
                <dd>{totals.shipping ? formatINR(totals.shipping) : 'Free'}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="text-[12px] font-semibold tracking-[0.18em] uppercase">Total paid</dt>
                <dd className="text-xl font-semibold">{formatINR(totals.total)}</dd>
              </div>
              <p className="text-right text-[11.5px] text-mist">Includes GST of {formatINR(totals.gst)}</p>
            </dl>
          </div>

          <div className="space-y-4">
            <div className="card-surface p-6 text-[13.5px]">
              <p className="label-luxe flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Delivering to
              </p>
              <p className="font-semibold">{address.name}</p>
              <p className="mt-1 leading-relaxed text-stone">
                {address.address}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                +91 {address.phone}
              </p>
            </div>
            <div className="card-surface p-6 text-[13.5px]">
              <p className="label-luxe flex items-center gap-2">
                <Truck className="h-3.5 w-3.5" /> Delivery
              </p>
              <p>{express ? 'Express next-day delivery' : 'Standard insured delivery (3–5 days)'}</p>
              <p className="label-luxe mt-4 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" /> Payment
              </p>
              <p>{order.paymentMethod}</p>
            </div>
          </div>
        </motion.div>

        <motion.div {...fade(1)} className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/shop" className="btn-primary w-full sm:w-auto">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="btn-outline w-full sm:w-auto">
            Contact client care
          </Link>
        </motion.div>
        <p className="mt-6 text-center text-[11.5px] text-mist">This is a demo order — no payment was taken and nothing will be shipped.</p>
      </div>
    </div>
  );
}
