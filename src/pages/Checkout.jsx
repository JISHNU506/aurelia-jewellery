import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Banknote, Check, CreditCard, Landmark, LoaderCircle, Lock, ShieldCheck, ShoppingBag, Smartphone, Truck, Zap } from 'lucide-react';
import { EXPRESS_SHIPPING, useCart } from '../context/CartContext.jsx';
import { Breadcrumbs, EASE, EmptyState } from '../components/ui/Primitives.jsx';
import { DiamondMark } from '../components/ui/Icons.jsx';
import { deliveryDate, formatINR } from '../utils/format.js';
import { newOrderId, saveOrder } from '../utils/orders.js';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank', 'IndusInd Bank'];

const STEPS = ['Shipping', 'Delivery', 'Payment'];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'netbanking', label: 'Net banking', icon: Landmark },
  { id: 'cod', label: 'Cash on delivery', icon: Banknote },
];

const EMPTY_ADDRESS = { name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };

function validateAddress(a) {
  const e = {};
  if (a.name.trim().length < 2) e.name = 'Please enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(a.email)) e.email = 'Please enter a valid email address.';
  if (!/^[6-9]\d{9}$/.test(a.phone)) e.phone = 'Enter a 10-digit mobile number.';
  if (a.address.trim().length < 6) e.address = 'Please enter your street address.';
  if (a.city.trim().length < 2) e.city = 'Please enter your city.';
  if (!a.state) e.state = 'Please select a state.';
  if (!/^[1-9]\d{5}$/.test(a.pincode)) e.pincode = 'Enter a valid 6-digit pincode.';
  return e;
}

function validatePayment(method, card, upi, bank) {
  const e = {};
  if (method === 'card') {
    if (card.number.replace(/\s/g, '').length !== 16) e.number = 'Enter the 16-digit card number.';
    if (card.name.trim().length < 2) e.cardName = 'Enter the name on the card.';
    const [mm, yy] = card.expiry.split('/');
    if (!/^\d{2}\/\d{2}$/.test(card.expiry) || +mm < 1 || +mm > 12) e.expiry = 'Use MM/YY.';
    else {
      const now = new Date();
      const exp = new Date(2000 + +yy, +mm, 0);
      if (exp < now) e.expiry = 'This card has expired.';
    }
    if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = '3 or 4 digits.';
  }
  if (method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi)) e.upi = 'Enter a valid UPI ID, e.g. name@bank.';
  if (method === 'netbanking' && !bank) e.bank = 'Please choose your bank.';
  return e;
}

function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <span className="label-luxe">{label}</span>
      {children}
      {error && <p className="mt-1.5 text-[11.5px] text-ruby">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState({});
  const [delivery, setDelivery] = useState('standard');
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [bank, setBank] = useState('');
  const [payErrors, setPayErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!cart.items.length && !processing) {
    return (
      <div className="container-luxe">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out yet"
          text="Your bag is empty. Add a piece you love and come back to complete your order."
          action={
            <Link to="/shop" className="btn-primary">
              Shop the collection <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const shipping = delivery === 'express' ? EXPRESS_SHIPPING : 0;
  const grandTotal = cart.total + shipping;

  const setAddr = (k) => (e) => {
    let v = e.target.value;
    if (k === 'phone') v = v.replace(/\D/g, '').slice(0, 10);
    if (k === 'pincode') v = v.replace(/\D/g, '').slice(0, 6);
    setAddress((a) => ({ ...a, [k]: v }));
    if (addressErrors[k]) setAddressErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submitAddress = (e) => {
    e.preventDefault();
    const errs = validateAddress(address);
    setAddressErrors(errs);
    if (!Object.keys(errs).length) setStep(1);
  };

  const setCardField = (k) => (e) => {
    let v = e.target.value;
    if (k === 'number') v = v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    if (k === 'expiry') {
      const digits = v.replace(/\D/g, '').slice(0, 4);
      v = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (k === 'cvv') v = v.replace(/\D/g, '').slice(0, 4);
    if (k === 'name') v = v.toUpperCase();
    setCard((c) => ({ ...c, [k]: v }));
  };

  const paymentLabel = () => {
    if (method === 'card') return `Card ending ${card.number.replace(/\s/g, '').slice(-4)}`;
    if (method === 'upi') return `UPI · ${upi}`;
    if (method === 'netbanking') return `Net banking · ${bank}`;
    return 'Cash on delivery';
  };

  const placeOrder = (e) => {
    e.preventDefault();
    const errs = validatePayment(method, card, upi, bank);
    setPayErrors(errs);
    if (Object.keys(errs).length) return;
    setProcessing(true);
    timer.current = setTimeout(() => {
      const order = {
        id: newOrderId(),
        date: new Date().toISOString(),
        items: cart.items.map((i) => ({ id: i.id, name: i.product.name, image: i.product.images[0], size: i.size, qty: i.qty, price: i.product.price })),
        totals: {
          mrpTotal: cart.mrpTotal,
          subtotal: cart.subtotal,
          savings: cart.savings,
          coupon: cart.coupon?.code ?? null,
          couponDiscount: cart.couponDiscount,
          shipping,
          gst: Math.round(grandTotal - grandTotal / 1.03),
          total: grandTotal,
        },
        address,
        delivery,
        paymentMethod: paymentLabel(),
      };
      saveOrder(order);
      cart.clear();
      navigate(`/order/${order.id}`);
    }, 1600);
  };

  return (
    <div className="container-luxe pt-6 pb-20 sm:pt-8 lg:pb-28">
      <Breadcrumbs items={[{ label: 'Bag', to: '/cart' }, { label: 'Checkout' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <h1 className="text-4xl font-light sm:text-5xl">Checkout</h1>
        <p className="flex items-center gap-2 pb-1 text-[11px] font-semibold tracking-[0.16em] text-stone uppercase">
          <Lock className="h-3.5 w-3.5" /> Secure & encrypted
        </p>
      </div>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2 sm:gap-4">
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase transition disabled:cursor-default ${i <= step ? 'text-ink' : 'text-mist'}`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] ${i < step ? 'border-gold bg-gold text-ivory' : i === step ? 'border-ink bg-ink text-ivory' : 'border-line'}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-gold' : 'bg-line'}`} />}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form key="s0" onSubmit={submitAddress} noValidate {...stepAnim} className="grid gap-5 sm:grid-cols-2">
                <h2 className="text-3xl font-light sm:col-span-2">Contact & shipping</h2>
                <Field label="Full name" error={addressErrors.name} className="sm:col-span-2">
                  <input className="input-luxe" autoComplete="name" value={address.name} onChange={setAddr('name')} />
                </Field>
                <Field label="Email" error={addressErrors.email}>
                  <input type="email" className="input-luxe" autoComplete="email" value={address.email} onChange={setAddr('email')} />
                </Field>
                <Field label="Mobile number" error={addressErrors.phone}>
                  <div className="flex">
                    <span className="grid place-items-center border border-r-0 border-line bg-cream px-3 text-sm text-stone">+91</span>
                    <input type="tel" inputMode="numeric" className="input-luxe" autoComplete="tel-national" value={address.phone} onChange={setAddr('phone')} />
                  </div>
                </Field>
                <Field label="Address" error={addressErrors.address} className="sm:col-span-2">
                  <input className="input-luxe" autoComplete="street-address" placeholder="House no., building, street, area" value={address.address} onChange={setAddr('address')} />
                </Field>
                <Field label="City" error={addressErrors.city}>
                  <input className="input-luxe" autoComplete="address-level2" value={address.city} onChange={setAddr('city')} />
                </Field>
                <Field label="State" error={addressErrors.state}>
                  <select className="input-luxe" value={address.state} onChange={setAddr('state')}>
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Pincode" error={addressErrors.pincode}>
                  <input inputMode="numeric" className="input-luxe" autoComplete="postal-code" value={address.pincode} onChange={setAddr('pincode')} />
                </Field>
                <div className="flex items-end sm:col-span-2">
                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    Continue to delivery <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {step === 1 && (
              <motion.div key="s1" {...stepAnim}>
                <h2 className="text-3xl font-light">Delivery</h2>
                <AddressSummary address={address} onEdit={() => setStep(0)} />
                <div className="mt-6 grid gap-3">
                  {[
                    { id: 'standard', icon: Truck, title: 'Standard insured delivery', text: `3–5 business days · Arrives by ${deliveryDate(4)}`, price: 'Free' },
                    { id: 'express', icon: Zap, title: 'Express next-day delivery', text: `Arrives by ${deliveryDate(1)}`, price: formatINR(EXPRESS_SHIPPING) },
                  ].map((o) => (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center gap-4 border p-5 transition ${delivery === o.id ? 'border-ink bg-white' : 'border-line bg-white/50 hover:border-mist'}`}
                    >
                      <input type="radio" name="delivery" value={o.id} checked={delivery === o.id} onChange={() => setDelivery(o.id)} className="accent-[var(--color-gold)]" />
                      <o.icon className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
                      <span className="flex-1">
                        <span className="block text-[14px] font-semibold">{o.title}</span>
                        <span className="block text-[12.5px] text-stone">{o.text}</span>
                      </span>
                      <span className={`text-[13px] font-semibold ${o.price === 'Free' ? 'text-emerald uppercase tracking-wider' : ''}`}>{o.price}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-2 text-[12px] text-stone">
                  <ShieldCheck className="h-4 w-4 text-gold-dark" /> Every order ships fully insured in tamper-proof packaging.
                </p>
                <button type="button" onClick={() => setStep(2)} className="btn-primary mt-8 w-full sm:w-auto">
                  Continue to payment <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form key="s2" onSubmit={placeOrder} noValidate {...stepAnim}>
                <h2 className="text-3xl font-light">Payment</h2>
                <p className="mt-3 border border-dashed border-gold bg-cream/60 px-4 py-3 text-[12.5px] text-ink-soft">
                  This is a demo — no real payment is processed. Please do not enter real card details.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMethod(m.id);
                        setPayErrors({});
                      }}
                      aria-pressed={method === m.id}
                      className={`flex flex-col items-center gap-2 border px-2 py-4 text-[10.5px] font-semibold tracking-[0.14em] uppercase transition ${method === m.id ? 'border-ink bg-ink text-ivory' : 'border-line bg-white/60 text-ink hover:border-ink'}`}
                    >
                      <m.icon className="h-5 w-5" strokeWidth={1.5} />
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  {method === 'card' && (
                    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Card number" error={payErrors.number} className="col-span-2">
                          <input inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012 3456" className="input-luxe tracking-wider" value={card.number} onChange={setCardField('number')} />
                        </Field>
                        <Field label="Name on card" error={payErrors.cardName} className="col-span-2">
                          <input autoComplete="off" className="input-luxe" value={card.name} onChange={setCardField('name')} />
                        </Field>
                        <Field label="Expiry" error={payErrors.expiry}>
                          <input inputMode="numeric" autoComplete="off" placeholder="MM/YY" className="input-luxe" value={card.expiry} onChange={setCardField('expiry')} />
                        </Field>
                        <Field label="CVV" error={payErrors.cvv}>
                          <input type="password" inputMode="numeric" autoComplete="off" placeholder="•••" className="input-luxe" value={card.cvv} onChange={setCardField('cvv')} />
                        </Field>
                      </div>
                      <CardPreview card={card} />
                    </div>
                  )}
                  {method === 'upi' && (
                    <Field label="UPI ID" error={payErrors.upi} className="max-w-md">
                      <input autoComplete="off" placeholder="yourname@bank" className="input-luxe" value={upi} onChange={(e) => setUpi(e.target.value.trim())} />
                      <p className="mt-2 text-[12px] text-stone">You would receive a collect request in your UPI app.</p>
                    </Field>
                  )}
                  {method === 'netbanking' && (
                    <Field label="Select your bank" error={payErrors.bank} className="max-w-md">
                      <select className="input-luxe" value={bank} onChange={(e) => setBank(e.target.value)}>
                        <option value="">Choose a bank</option>
                        {BANKS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {method === 'cod' && (
                    <p className="max-w-md text-[13.5px] leading-relaxed text-stone">
                      Pay in cash or by card when your order arrives. Our courier partner will verify your identity at delivery for insured shipments.
                    </p>
                  )}
                </div>

                <button type="submit" disabled={processing} className="btn-gold mt-10 w-full sm:w-auto">
                  <Lock className="h-4 w-4" /> Place order · {formatINR(grandTotal)}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <OrderSummary cart={cart} shipping={shipping} total={grandTotal} />
      </div>

      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-ivory/90 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center text-center">
              <LoaderCircle className="h-10 w-10 animate-spin text-gold" strokeWidth={1.2} />
              <p className="mt-6 font-display text-3xl font-light">Securing your order…</p>
              <p className="mt-2 text-[13px] text-stone">Please don’t close this window.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const stepAnim = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.4, ease: EASE },
};

function AddressSummary({ address, onEdit }) {
  return (
    <div className="mt-6 flex items-start justify-between gap-4 border border-line bg-white/50 p-5 text-[13px]">
      <div>
        <p className="label-luxe">Shipping to</p>
        <p className="font-semibold text-ink">{address.name}</p>
        <p className="mt-1 text-stone">
          {address.address}, {address.city}, {address.state} {address.pincode}
        </p>
        <p className="text-stone">
          {address.email} · +91 {address.phone}
        </p>
      </div>
      <button type="button" onClick={onEdit} className="link-underline text-[11px] font-semibold tracking-[0.14em] text-gold-dark uppercase">
        Edit
      </button>
    </div>
  );
}

function CardPreview({ card }) {
  const digits = card.number.replace(/\s/g, '').padEnd(16, '•');
  const groups = digits.match(/.{1,4}/g);
  return (
    <div className="relative aspect-[1.586] w-full max-w-[340px] overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-noir p-5 text-ivory shadow-lift">
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gold/25 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-gold-light/10 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="flex items-center gap-2 font-display text-lg tracking-[0.2em] uppercase">
            <DiamondMark className="h-4 w-4 text-gold-light" /> Aurelia
          </span>
          <span className="h-7 w-10 rounded-[4px] bg-gradient-to-br from-gold-light to-gold" />
        </div>
        <p className="font-mono text-[17px] tracking-[0.16em] sm:text-lg">{groups.join(' ')}</p>
        <div className="flex items-end justify-between gap-3 text-[10px] tracking-[0.18em] uppercase">
          <div className="min-w-0">
            <p className="text-ivory/50">Card holder</p>
            <p className="mt-0.5 truncate text-[12px]">{card.name || 'Your name'}</p>
          </div>
          <div className="text-right">
            <p className="text-ivory/50">Expires</p>
            <p className="mt-0.5 text-[12px]">{card.expiry || 'MM/YY'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ cart, shipping, total }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="card-surface p-6 sm:p-7">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-light">Your order</h2>
          <Link to="/cart" className="link-underline text-[11px] font-semibold tracking-[0.14em] text-stone uppercase">
            Edit bag
          </Link>
        </div>
        <ul className="mt-5 max-h-[320px] divide-y divide-line overflow-y-auto border-y border-line">
          {cart.items.map((i) => (
            <li key={i.key} className="flex gap-3 py-3">
              <div className="relative h-16 w-16 shrink-0 bg-cream">
                <img src={i.product.images[0]} alt="" className="h-full w-full object-cover" />
                <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-ivory">{i.qty}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[17px] leading-tight">{i.product.name}</p>
                {i.size && <p className="mt-0.5 text-[11.5px] text-stone">Size {i.size}</p>}
              </div>
              <p className="text-[13px] font-semibold">{formatINR(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2.5 text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-stone">Subtotal</dt>
            <dd>{formatINR(cart.subtotal)}</dd>
          </div>
          {cart.savings > 0 && (
            <div className="flex justify-between text-gold-dark">
              <dt>You save</dt>
              <dd>{formatINR(cart.savings)}</dd>
            </div>
          )}
          {cart.coupon && (
            <div className="flex justify-between text-emerald">
              <dt>Coupon ({cart.coupon.code})</dt>
              <dd>− {formatINR(cart.couponDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-stone">Shipping</dt>
            <dd>{shipping ? formatINR(shipping) : <span className="font-semibold tracking-wider text-emerald uppercase">Free</span>}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <dt className="text-[12px] font-semibold tracking-[0.18em] uppercase">Total</dt>
            <dd className="text-2xl font-semibold">{formatINR(total)}</dd>
          </div>
          <p className="text-right text-[11.5px] text-mist">Includes GST of {formatINR(total - total / 1.03)}</p>
        </dl>
      </div>
    </aside>
  );
}
