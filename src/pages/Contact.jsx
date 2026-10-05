import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Mail, MapPin, MessagesSquare, Phone, Send } from 'lucide-react';
import { Accordion, EASE, PageHero, Reveal, SectionHeading } from '../components/ui/Primitives.jsx';
import { banner } from '../data/media.js';

const SUBJECTS = ['Product enquiry', 'Order & delivery', 'Book an appointment', 'Custom / bespoke design', 'Returns & exchange', 'Other'];

const BOUTIQUES = [
  {
    city: 'Mumbai',
    name: 'Kala Ghoda Flagship',
    address: '14 Rampart Row, Kala Ghoda, Fort, Mumbai 400001',
    phone: '+91 22 4000 1987',
    hours: 'Mon – Sat · 11:00 – 20:00',
  },
  {
    city: 'New Delhi',
    name: 'Mehrauli Salon',
    address: 'Plot 7, Kalka Das Marg, Mehrauli, New Delhi 110030',
    phone: '+91 11 4100 1987',
    hours: 'Tue – Sun · 11:00 – 20:30',
  },
  {
    city: 'Bengaluru',
    name: 'Lavelle Road Atelier',
    address: '22 Lavelle Road, Ashok Nagar, Bengaluru 560001',
    phone: '+91 80 4200 1987',
    hours: 'Mon – Sat · 10:30 – 19:30',
  },
];

const FAQ = [
  {
    title: 'Is all Aurelia gold hallmarked?',
    content: 'Yes. Every piece is BIS hallmarked with a unique HUID, and every natural diamond above 0.30 ct comes with an IGI certificate.',
  },
  {
    title: 'How long does delivery take?',
    content: 'In-stock pieces ship free and fully insured within 3–5 business days. Express next-day delivery is available in most metro cities.',
  },
  {
    title: 'What is your returns policy?',
    content: 'You may return any unworn piece within 30 days for a full refund. Engraved and bespoke pieces are eligible for exchange only.',
  },
  {
    title: 'Do you offer lifetime exchange?',
    content: 'Always. Exchange any Aurelia piece at the prevailing gold rate and 100% of the diamond value, at any boutique or online.',
  },
  {
    title: 'Can I resize my ring?',
    content: 'Rings are resized free within 60 days of purchase. Use our size guide on every ring page, or visit a boutique for a professional fitting.',
  },
  {
    title: 'How accurate is the virtual try-on?',
    content: 'Try-on uses your camera to place a true-to-scale 3D model of the piece on your hand, ear or neckline. Nothing is recorded or uploaded.',
  },
];

const EMPTY = { name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => {
    const v = k === 'phone' ? e.target.value.replace(/[^\d+\s]/g, '').slice(0, 15) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Please enter a valid email.';
    if (form.message.trim().length < 10) er.message = 'Please write a short message (10+ characters).';
    setErrors(er);
    if (!Object.keys(er).length) setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Client care"
        title="We’re here for you"
        subtitle="Questions about a piece, an order or a bespoke commission? Our jewellery advisors reply within one business day."
        image={banner('showcase-noir')}
      />

      <section className="container-luxe py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="card-surface flex flex-col items-center px-6 py-16 text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-gold text-gold-dark">
                    <Send className="h-6 w-6" strokeWidth={1.3} />
                  </span>
                  <h2 className="mt-6 text-4xl font-light">Thank you, {form.name.split(' ')[0]}</h2>
                  <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-stone">
                    Your message about “{form.subject.toLowerCase()}” has been received. An advisor will reply to {form.email} within one business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(EMPTY);
                      setSent(false);
                    }}
                    className="btn-outline mt-8"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="eyebrow">Write to us</p>
                    <h2 className="mt-3 text-4xl font-light">Send a message</h2>
                  </div>
                  <div>
                    <label htmlFor="c-name" className="label-luxe">Name</label>
                    <input id="c-name" autoComplete="name" value={form.name} onChange={set('name')} className="input-luxe" />
                    {errors.name && <p className="mt-1.5 text-[11.5px] text-ruby">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className="label-luxe">Email</label>
                    <input id="c-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} className="input-luxe" />
                    {errors.email && <p className="mt-1.5 text-[11.5px] text-ruby">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="label-luxe">Phone (optional)</label>
                    <input id="c-phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} className="input-luxe" />
                  </div>
                  <div>
                    <label htmlFor="c-subject" className="label-luxe">Subject</label>
                    <select id="c-subject" value={form.subject} onChange={set('subject')} className="input-luxe">
                      {SUBJECTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-message" className="label-luxe">Message</label>
                    <textarea id="c-message" rows={6} value={form.message} onChange={set('message')} className="input-luxe resize-none" />
                    {errors.message && <p className="mt-1.5 text-[11.5px] text-ruby">{errors.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn-primary w-full sm:w-auto">
                      <Send className="h-4 w-4" /> Send message
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>

          <Reveal delay={0.1} className="space-y-8">
            <div>
              <p className="eyebrow">Client care</p>
              <h2 className="mt-3 text-4xl font-light">Talk to an advisor</h2>
            </div>
            <ul className="divide-y divide-line border-y border-line text-[14px]">
              {[
                { icon: Phone, label: 'Call us', value: '1800 120 1987 (toll free)', href: 'tel:18001201987' },
                { icon: MessagesSquare, label: 'WhatsApp', value: '+91 98200 01987', href: 'https://wa.me/919820001987' },
                { icon: Mail, label: 'Email', value: 'care@aurelia.example', href: 'mailto:care@aurelia.example' },
                { icon: Clock3, label: 'Hours', value: 'Every day · 9:00 – 21:00 IST' },
              ].map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-center gap-4 py-4">
                  <Icon className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.4} />
                  <span className="w-24 shrink-0 text-[10.5px] font-semibold tracking-[0.18em] text-stone uppercase">{label}</span>
                  {href ? (
                    <a href={href} className="link-underline min-w-0 break-words text-ink">
                      {value}
                    </a>
                  ) : (
                    <span className="text-ink">{value}</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-[13px] leading-relaxed text-stone">
              Prefer to see a piece in person? Book a private appointment at any boutique — we’ll have your shortlist ready and waiting.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="container-luxe">
          <SectionHeading eyebrow="Visit us" title="Our boutiques" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BOUTIQUES.map((b, i) => (
              <Reveal key={b.city} delay={i * 0.08} className="flex flex-col border border-line bg-ivory p-7">
                <p className="eyebrow">{b.city}</p>
                <h3 className="mt-3 text-3xl font-light">{b.name}</h3>
                <div className="gold-rule my-5 w-16" />
                <p className="flex gap-3 text-[13.5px] leading-relaxed text-stone">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={1.5} /> {b.address}
                </p>
                <p className="mt-3 flex gap-3 text-[13.5px] text-stone">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={1.5} /> {b.phone}
                </p>
                <p className="mt-3 flex gap-3 text-[13.5px] text-stone">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={1.5} /> {b.hours}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="container-luxe max-w-3xl scroll-mt-20 py-16 sm:py-24">
        <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
        <div className="mt-12">
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}
