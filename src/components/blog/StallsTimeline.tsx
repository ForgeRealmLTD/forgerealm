import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

type Stall = {
  kind?: 'stall' | 'note';
  label: string;
  date: string;
  title: string;
  location?: string;
  partner?: string;
  images?: { src: string; alt: string; portrait?: boolean }[];
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
      'The one that turned the DnD-prop hobby into an actual side hustle. Albion\'s Christmas market with Artsmix, our priciest booking to date and neither of us slept the night before. Against all odds, we broke even and then some.',
      'We\'ll never forget our first customer ever, Michelle March, an artist who\'d flown in from the US and bought from the table before we\'d even finished setting up. The display itself was rough: no tarpaulin, no real branding, just stuff from the kitchen table. We spent the day fighting wind and rain. Painful, but we learned.',
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
      'Stall 3 is where ForgeRealm started looking like ForgeRealm: branded tarpaulin and banner, proper business cards, a tightened-up display. For the first time it felt less like two guys selling prints and more like a brand.',
      'The weather did us a massive favour: clear sunshine open to close. Silk PLA in direct sunlight is a completely different object; people stopped for the glint before they\'d even processed what the items were. Still our most successful stall to date and the one we\'re using as the bar.',
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
      'First stall outside of Albion. Still central Leeds, still one of our favourite markets in the city. If you live here you love Kirkgate by default. Shorter hours, lower booking cost, easier parking; we went home less shattered than usual.',
      'This is also where we properly committed to the medieval-fantasy aesthetic for the stall front. It landed: for the first time other traders, people who\'d been doing this for years, came over to say the stall looked good. Commercially strong given the shorter hours, and we\'d absolutely do Kirkgate again.',
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
      'Stall 5 was a deliberate experiment: what happens when we set up outside the city centre, in a residential area? Commercially it wasn\'t our best, but we expected that going in. What it was, genuinely, was the most wholesome day we\'ve had.',
      'We met our first real "competitor", a printer of five-plus years with a different range entirely. He came over first to support us and gave us a stack of advice we\'re still using. We also met Dawn, who sells baby products. Her displays are beautiful, and she basically set up our stall for us in the layout you see in the photos. The plan is to evolve from Dawn\'s base, not abandon it.',
    ],
    pull: 'The plan going forward is to evolve from Dawn\'s base, not abandon it.',
  },
  {
    kind: 'note',
    label: 'Studio',
    date: '20 April 2026',
    title: 'We invested in the Flashforge Creator 5',
    paragraphs: [
      'There has been a genuine debate in the 3D printing community between two new machines that hadn\'t officially shipped yet: the Snapmaker UI and the Flashforge Creator 5. Most of the experienced traders we\'ve met at stalls landed on the Snapmaker UI. We went the other way.',
      'Our whole farm runs on Flashforge and the reliability has been consistently solid. Switching ecosystems felt like unnecessary risk when a newer Flashforge option existed. We took the useful advice from people who know more than us and made our own call. We\'re not trying to be the next anybody, ForgeRealm has its own direction.',
      'The Creator 5 is booked and we\'re expecting it at the start of May. Once it\'s properly run in it should expand both our volume and material range at stalls.',
    ],
  },
  {
    label: 'Stall 06',
    date: '25 April 2026',
    title: 'Albion, arrests and a 4pm surge',
    location: 'Albion Place, Leeds',
    partner: 'Artsmix',
    images: [
      { src: '/blog/albionStall6.jpg', alt: 'ForgeRealm display at Stall 06, Albion Place, showing the tiered product stand loaded with silk PLA pieces.', portrait: true },
      { src: '/blog/2albionStall6.jpg', alt: 'Ishmam and Tobi behind the ForgeRealm Leeds banner at Stall 06, Albion Place.' },
    ],
    paragraphs: [
      'A large protest ran through the city that day. Six people were arrested near The Headrow, right next to Albion, and foot traffic was low because of it. By early afternoon we\'d more or less written the stall off.',
      'Then around 4pm it turned. A late surge pulled the day into a result a lot better than we\'d expected, and we left genuinely proud of how the stall looked. Best presentation to date, and proof the branded front was earning its place. Pack-down had its own moment when a rising metal bollard caught a white van near our cars (nobody hurt, just one of those days).',
    ],
    pull: 'We left genuinely proud of how the stall looked, our best presentation to date.',
  },
  {
    label: 'Stall 07',
    date: '9 May 2026',
    title: 'Albion, our new third best',
    location: 'Albion Place, Leeds',
    partner: 'Artsmix',
    images: [
      { src: '/blog/albionStall7.jpg', alt: 'ForgeRealm at Stall 07, Albion Place, with the first proper product sheets on the table.', portrait: true },
      { src: '/blog/2albionStall7.jpg', alt: 'Display detail at Stall 07 showing the new printed price sheets in front of the silk PLA pieces.', portrait: true },
    ],
    paragraphs: [
      'Back at Albion and we came in with more confidence in our products than we\'ve ever had. The proof was on the table: our first proper product sheets, openly listing prices. Until now we\'d kept the pricing conversational, partly because the motive and the vibe are what we put the most weight on (the prices reflect that, quietly), but writing the numbers in front of customers felt like a real step up. People responded to it, and product sheets are now a permanent fixture at every stall we run.',
      'Commercially this one bumped Stall 6 out of the top three. Stall 7 is our new third best to date, and the gap to Stall 3 (still the bar) is closing.',
    ],
    pull: 'Stall 7 is our new third best, and the gap to Stall 3 is closing.',
  },
  {
    label: 'Stall 08',
    date: '17 May 2026',
    title: 'Manchester Jazz Festival',
    location: 'Manchester Jazz Festival',
    images: [
      { src: '/blog/manchesterStall8.jpg', alt: 'ForgeRealm\'s first stall in Manchester, set up at the Manchester Jazz Festival.' },
      { src: '/blog/2manchesterStall8.jpg', alt: 'Display detail at the Manchester Jazz Festival stall on a wet afternoon.' },
      { src: '/blog/3manchesterStall8.jpg', alt: 'Jazz musicians performing live at Manchester Jazz Festival behind the stall.' },
    ],
    paragraphs: [
      'Our first stall outside Leeds and our first time in Manchester, at the Manchester Jazz Festival. Not our best day commercially, but we\'d assumed that going in (new city, no reputation built yet). The weather contributed a fair bit, and the day was shorter than we\'re used to: 11 to 4 versus Albion\'s 9 to 7, with a lot of it taken over by the rain. One thing the photos do show: this was our prettiest setup to date.',
      'The vibes were great regardless. Food was delicious. We met an experienced trader, shout out to The Mexican Coffee Company, who gave us pro tips and trade secrets on running a stall properly. The third photo is the jazz performance we caught in the gaps; both of us are jazz enthusiasts so that alone made the trip worth it. Four of us travelled together, the owners and our partners, which made it feel less like work and more like a proper day out.',
    ],
    pull: 'Our prettiest setup to date, with The Mexican Coffee Company for the tips and the jazz musicians for the soundtrack.',
  },
];

function StallEntry({ stall, index }: { stall: Stall; index: number }) {
  const entryRef = useRef<HTMLDivElement>(null);
  const inReadingZone = useInView(entryRef, { margin: '-40% 0px -50% 0px' });
  const dotPulse = inReadingZone ? { scale: [1, 1.6, 1] } : { scale: 1 };
  const dotTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
  const isNote = stall.kind === 'note';

  const dotGradient = isNote
    ? 'from-amber-300 to-orange-400'
    : 'from-cyan-300 to-blue-500';
  const dotBorder = isNote ? 'border-amber-300/30' : 'border-cyan-300/30';
  const dotShadow = isNote
    ? 'shadow-[0_0_0_3px_rgba(251,191,36,0.08)]'
    : 'shadow-[0_0_0_3px_rgba(6,182,212,0.08)]';
  const dotShadowMd = isNote
    ? 'shadow-[0_0_0_4px_rgba(251,191,36,0.08)]'
    : 'shadow-[0_0_0_4px_rgba(6,182,212,0.08)]';
  const labelColor = isNote ? 'text-amber-300/70' : 'text-cyan-300/70';
  const dividerColor = isNote ? 'from-amber-400/30 via-orange-500/10' : 'from-cyan-400/30 via-blue-500/10';
  const cardGradient = isNote
    ? 'from-amber-500/[0.05] via-transparent to-orange-500/[0.03]'
    : 'from-cyan-500/[0.04] via-transparent to-blue-500/[0.04]';
  const pullBorder = isNote ? 'border-amber-400/40' : 'border-cyan-400/40';
  const pullText = isNote ? 'text-amber-100/90' : 'text-cyan-100/90';

  return (
    <div ref={entryRef} className="relative flex flex-col md:flex-row md:gap-10 pb-16 sm:pb-24 pl-12 md:pl-0">
      <motion.div
        animate={dotPulse}
        transition={dotTransition}
        className={`md:hidden absolute left-3 top-2 h-4 w-4 rounded-full border ${dotBorder} bg-[#0a0f1a] ${dotShadow}`}
      >
        <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${dotGradient}`} />
      </motion.div>
      <div className="sticky top-24 md:top-32 self-start md:w-64 md:flex-shrink-0 md:pl-24 z-10 -mt-2 mb-6 md:mb-0">
        <motion.div
          animate={dotPulse}
          transition={dotTransition}
          className={`hidden md:block absolute left-8 top-2 h-5 w-5 rounded-full border ${dotBorder} bg-[#0a0f1a] ${dotShadowMd}`}
        >
          <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${dotGradient}`} />
        </motion.div>
        <div className="flex items-center gap-3 md:flex-col md:items-start">
          <span className={`text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.28em] ${labelColor}`} style={{ fontFamily: 'Jost, sans-serif' }}>
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
          <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient} pointer-events-none`} />
          <div className="relative">
            {!isNote && (stall.location || stall.partner) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {stall.location && (
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200" style={{ fontFamily: 'Jost, sans-serif' }}>
                    {stall.location}
                  </span>
                )}
                {stall.partner && (
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400" style={{ fontFamily: 'Jost, sans-serif' }}>
                    via {stall.partner}
                  </span>
                )}
              </div>
            )}

            <h3 className="text-xl sm:text-2xl lg:text-[26px] leading-[1.2] text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              {stall.title}
            </h3>

            <div className={`mt-5 h-px w-full bg-gradient-to-r ${dividerColor} to-transparent`} />

            <div className="mt-6 space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {stall.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] sm:text-base text-slate-300 leading-[1.8]">
                  {p}
                </p>
              ))}
            </div>

            {stall.pull && (
              <blockquote className={`mt-6 border-l-2 ${pullBorder} pl-5 py-1`}>
                <p className={`text-base sm:text-lg ${pullText}`} style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{stall.pull}"
                </p>
              </blockquote>
            )}

            {!isNote && stall.images && stall.images.length > 0 && (
              <div className={`mt-7 grid gap-3 ${stall.images.length === 1 ? 'grid-cols-1' : stall.images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {stall.images.map((img, i) => (
                  <figure key={i} className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1220]">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading={index === 0 && i === 0 ? 'eager' : 'lazy'}
                      className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${img.portrait ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </figure>
                ))}
              </div>
            )}
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
      <div className="absolute top-0 left-9 sm:left-11 md:left-[66px] lg:left-[72px] w-px h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" aria-hidden>
        <motion.div
          style={{ height: heightTransform, opacity: opacityTransform }}
          className="absolute inset-x-0 top-0 w-px bg-gradient-to-b from-cyan-300 via-cyan-400 to-blue-500"
        >
          {/* Pulsing tip (leading edge of the fill) */}
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
