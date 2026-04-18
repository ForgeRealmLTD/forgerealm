import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

type Stall = {
  label: string;
  date: string;
  title: string;
  location: string;
  partner: string;
  images: { src: string; alt: string }[];
  paragraphs: string[];
  pull?: string;
};

const stalls: Stall[] = [
  {
    label: 'Stall 01',
    date: '29 November 2025',
    title: 'The Albion debut',
    location: 'Albion Place, Leeds',
    partner: 'Artsmix',
    images: [
      { src: '/blog/albionStall1.jpg', alt: 'ForgeRealm\'s first ever stall at Albion Place, Leeds during the Christmas market.' },
      { src: '/blog/2albionStall1.jpg', alt: 'Close-up of the first stall\'s display table.' },
    ],
    paragraphs: [
      'This was the one that turned "DnD prop hobby" into an actual side hustle. The company we booked through was running it as the Christmas market of Albion, which technically makes our debut a Christmas stall. It was also the priciest booking we\'ve made to date, and neither of us slept much the night before. Somehow, against all odds, we broke even and then some — we\'ve tried hard not to let that set a false baseline, but it was a generous start.',
      'We will never forget our first customer ever. She goes by the pen name Michelle March, she\'d flown in from the US to support us, and she bought something from the table before we\'d even finished setting up. She\'s an artist with a real eye for design, which hit home for us because "artisan 3D printing" is exactly the identity we want: hand-finished, post-processed in-house, treated like craft. We also met someone building long-range secure routers who was looking for a manufacturer for the shells. Tempting, but a B2B commitment of that scale didn\'t make sense on our first stall. We said no and we still think that was the right call.',
      'Looking at the photos now, the display itself looked rough. We hadn\'t invested in anything. We just grabbed what we had lying around the house and made it work. You can also tell from the picture we had no tarpaulin behind the stall, which meant we spent the day fighting the wind and the rain while our neighbours stayed snug behind theirs. Painful, but we learned.',
    ],
    pull: 'Our first customer bought from us before we\'d even finished setting up.',
  },
  {
    label: 'Stall 02',
    date: '6 December 2025',
    title: 'Back at Albion',
    location: 'Albion Place, Leeds',
    partner: 'Artsmix',
    images: [
      { src: '/blog/albionStall2.jpg', alt: 'ForgeRealm\'s second stall, now with a tarpaulin behind the display.' },
    ],
    paragraphs: [
      'Stall 2 was the "okay, we\'ve learned some things" stall. We finally bought a tarpaulin, which immediately changed the day. No more sideways rain down the back of your jumper, and the products actually looked like products instead of wet cardboard.',
      'The display evolved a little. It still wasn\'t where we wanted it, but it was measurably better than Stall 1: more legible, less "stuff from the kitchen table." We made a decent profit again, confirmed that the concept worked in cold weather, and went home with a list of things to improve before next time.',
    ],
  },
  {
    label: 'Stall 03',
    date: '14 March 2026',
    title: 'Albion in the sunshine',
    location: 'Albion Place, Leeds',
    partner: 'Artsmix',
    images: [
      { src: '/blog/albionStall3.jpg', alt: 'Stall 3 at Albion Place with the new ForgeRealm branded tarpaulin and banner.' },
      { src: '/blog/2albionStall3.jpg', alt: 'Display detail at Stall 3 with silk PLA pieces catching the sun.' },
      { src: '/blog/3albionStall3.jpg', alt: 'Wider view of Stall 3 on a sunny Saturday in Leeds.' },
    ],
    paragraphs: [
      'Stall 3 is where ForgeRealm started looking like ForgeRealm. We\'d commissioned our own branded tarpaulin and banner, printed business cards that people could actually take home, and tightened up the display properly. For the first time it felt less like two guys selling prints and more like a brand.',
      'The weather did us a massive favour that day: clear sunshine from open to close. That matters more than it sounds, because so much of our work is printed in silk PLA, and silk PLA in direct sunlight is a completely different object. The colours practically shimmer. People stopped for the glint before they\'d even processed what the items were.',
      'This is still, to date, our most successful stall. Everything lined up: the weather, the display, the branding, the foot traffic. It\'s the one we\'re using as the bar.',
    ],
    pull: 'Silk PLA in direct sunlight is a completely different object.',
  },
  {
    label: 'Stall 04',
    date: '28 March 2026',
    title: 'Kirkgate Market',
    location: 'Kirkgate Market, Leeds',
    partner: 'Eventszo',
    images: [
      { src: '/blog/kirkgateStall4.jpg', alt: 'ForgeRealm at Kirkgate Market, Leeds, our first stall outside of Albion Place.' },
      { src: '/blog/2kirkgateStall4.jpg', alt: 'Display detail at Kirkgate Market with the full medieval-fantasy front.' },
    ],
    paragraphs: [
      'First stall outside of Albion. Still central Leeds, still one of our favourite markets in the city. If you live in Leeds you love Kirkgate by default, it\'s the law. Shorter hours, lower booking cost, easier parking, less setup fatigue. We went home less shattered than usual.',
      'Kirkgate is also where we properly committed to the medieval-fantasy aesthetic for the stall front, the same direction you\'re seeing across this website, with the aurora, the Cinzel headings, the serif accents. It landed. For the first time other traders, people who\'ve been doing this for years, came over to tell us the stall looked good. That meant a lot.',
      'Commercially it was strong, especially given it was shorter hours and indoors (so less footfall than a sunny outdoor market). Not Stall 3 numbers, which made sense, but we\'d absolutely do Kirkgate again if the slot opened up.',
    ],
  },
  {
    label: 'Stall 05',
    date: '12 April 2026',
    title: 'The Alwoodley experiment',
    location: 'The Avenue, Alwoodley, Leeds',
    partner: '',
    images: [
      { src: '/blog/alwoodleyStall5.jpg', alt: 'Stall 5 at The Avenue, Alwoodley, our first stall in a residential area.' },
      { src: '/blog/2alwoodleyStall5.jpg', alt: 'The Avenue stall laid out in Dawn\'s style, our best-looking stall to date.' },
    ],
    paragraphs: [
      'Stall 5 was a deliberate experiment: what happens when we set up outside the city centre, in a residential area? Commercially it wasn\'t our best, but we expected that going in. This was a test, not a peak. What it was, genuinely, was the most wholesome day we\'ve had — the other traders were kind, experienced, and quietly supportive of each other in a way you don\'t always see at bigger markets.',
      'This is also where we met our first real "competitor", and I use that word loosely, because he\'d been selling 3D prints for five-plus years and his range (action figures, bird houses) barely overlaps with ours (animals, mythical creatures, lamps, fidgets). He came over first, to support us. He gave us a stack of advice we\'re now weaving into the day-to-day, both for running a stall and for getting more out of a full print farm. We\'re still in touch with him, still learning.',
      'We also met Dawn, who was selling baby products. Her displays are beautiful, and she offered to help us tidy ours up. She basically set up our stall for us, in the layout you can see in the photos. It\'s the best ForgeRealm has ever looked. The plan going forward is to evolve from Dawn\'s base, not abandon it. Thank you, Dawn.',
    ],
    pull: 'The plan going forward is to evolve from Dawn\'s base, not abandon it.',
  },
];

function StallEntry({ stall, index }: { stall: Stall; index: number }) {
  const entryRef = useRef<HTMLDivElement>(null);
  // Fires when the entry sits in the same band as the cyan tip (roughly viewport center)
  const inReadingZone = useInView(entryRef, { margin: '-40% 0px -50% 0px' });
  const dotPulse = inReadingZone ? { scale: [1, 1.6, 1] } : { scale: 1 };
  const dotTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div ref={entryRef} className="relative flex flex-col md:flex-row md:gap-10 pb-16 sm:pb-24 pl-12 md:pl-0">
      {/* Mobile dot — sits on the rail at left-9 */}
      <motion.div
        animate={dotPulse}
        transition={dotTransition}
        className="md:hidden absolute left-3 top-2 h-4 w-4 rounded-full border border-cyan-300/30 bg-[#0a0f1a] shadow-[0_0_0_3px_rgba(6,182,212,0.08)]"
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500" />
      </motion.div>
      <div className="sticky top-24 md:top-32 self-start md:w-64 md:flex-shrink-0 md:pl-24 z-10 -mt-2 mb-6 md:mb-0">
        <motion.div
          animate={dotPulse}
          transition={dotTransition}
          className="hidden md:block absolute left-8 top-2 h-5 w-5 rounded-full border border-cyan-300/30 bg-[#0a0f1a] shadow-[0_0_0_4px_rgba(6,182,212,0.08)]"
        >
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500" />
        </motion.div>
        <div className="flex items-center gap-3 md:flex-col md:items-start">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300/70" style={{ fontFamily: 'Jost, sans-serif' }}>
            {stall.label}
          </span>
          <div className="hidden md:block w-8 h-px bg-cyan-400/30" />
          <span className="text-sm sm:text-base text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            {stall.date}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 md:pr-4"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-7 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-blue-500/[0.04] pointer-events-none" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200" style={{ fontFamily: 'Jost, sans-serif' }}>
                {stall.location}
              </span>
              {stall.partner && (
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400" style={{ fontFamily: 'Jost, sans-serif' }}>
                  via {stall.partner}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-[26px] leading-[1.2] text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              {stall.title}
            </h3>

            <div className="mt-5 h-px w-full bg-gradient-to-r from-cyan-400/30 via-blue-500/10 to-transparent" />

            <div className="mt-6 space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stall.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] sm:text-base text-slate-300 leading-[1.8]">
                  {p}
                </p>
              ))}
            </div>

            {stall.pull && (
              <blockquote className="mt-6 border-l-2 border-cyan-400/40 pl-5 py-1">
                <p className="text-base sm:text-lg text-cyan-100/90" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{stall.pull}"
                </p>
              </blockquote>
            )}

            <div className={`mt-7 grid gap-3 ${stall.images.length === 1 ? 'grid-cols-1' : stall.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {stall.images.map((img, i) => (
                <figure key={i} className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1220]">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading={index === 0 && i === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StallsTimeline() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setHeight(containerRef.current.getBoundingClientRect().height);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <div ref={containerRef} className="not-prose relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-10">
      <div className="absolute top-0 left-9 sm:left-14 lg:left-[72px] w-px h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" aria-hidden>
        <motion.div
          style={{ height: heightTransform, opacity: opacityTransform }}
          className="absolute inset-x-0 top-0 w-px bg-gradient-to-b from-cyan-300 via-cyan-400 to-blue-500"
        >
          {/* Pulsing tip — sits at the leading edge of the fill */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-60" />
            <span className="absolute inset-0 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(103,232,249,0.7)]" />
          </div>
        </motion.div>
      </div>

      <div className="relative">
        {stalls.map((stall, i) => (
          <StallEntry key={stall.label} stall={stall} index={i} />
        ))}
      </div>
    </div>
  );
}
