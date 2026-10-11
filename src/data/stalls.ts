// The Stall Chronicles on /blog, newest first. Add a new stall or studio
// note at the top. After adding photos to public/blog/, run
// `npm run images:blog` to make the resized copies the page serves.

export type Stall = {
  kind?: "stall" | "note";
  label: string;
  date: string;
  title: string;
  location?: string;
  images?: { src: string; alt: string; portrait?: boolean }[];
  paragraphs: string[];
  pull?: string;
};

export const stalls: Stall[] = [
  {
    label: "Stall Session 17",
    date: "10 October 2026",
    title: "Little Fox at The Mini Mall",
    location: "The Mini Mall, Merrion Centre, Leeds",
    paragraphs: [
      "A first on two counts. This time the stall was inside The Mini Mall at the Merrion Centre, the same place our prints already sit on the shelf, and it was our first market with Little Fox Events. It went well.",
      "We met a lot of great people, customers and fellow traders alike. A friendly room, and plenty of good conversations on both sides of the table.",
      "It was also the first time our 3D printed lamppost went up on the stall, and we're very proud of it. Photos of the lamppost and the rest of the day are on their way.",
    ],
    pull: "Our first market with Little Fox Events, and the first time the 3D printed lamppost went up.",
  },
  {
    label: "Stall Session 16",
    date: "26 September 2026",
    title: "Leeds fills back up",
    location: "Albion Place & Kirkgate Market, Leeds",
    paragraphs: [
      "Double stall again for 26 September, Ishmam at Albion and Tobi at Kirkgate. Back in August the city had emptied out for the summer. This time it had filled right back up: a lot of people home from their holidays, and the students back too, some returning for another year and plenty starting uni for the first time.",
      "You could feel it on the streets. Leeds was vibrant all day, and autumn has been treating us well so far. The surprise of the day was Kirkgate: it was booming with people from start to finish and came out ahead of Albion this round. A nice reminder of what the city feels like when it's full.",
    ],
    pull: "Kirkgate was booming, and this round it came out ahead of Albion.",
  },
  {
    label: "Stall Session 15",
    date: "12 September 2026",
    title: "One percent above average",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/session15-albion.jpg",
        alt: "Odin the bearded dragon stretched out along the battlements of ForgeRealm's wooden castle display at Albion Place, with Tobi behind the stall.",
        portrait: true,
      },
      {
        src: "/blog/session15-albion-2.jpg",
        alt: "Odin the bearded dragon sitting on the wooden log slice beside the Blackthorn Manor print at the Albion Place stall.",
        portrait: true,
      },
      {
        src: "/blog/session15-albion-3.jpg",
        alt: "The full ForgeRealm table at Albion Place on 12 September, tiered display stacked with dragon eggs and figures, spiral cones, hexagon coasters and mermaid tail bowls across the front.",
      },
    ],
    paragraphs: [
      "Single stall this time, Tobi running Albion on his own. A steady Saturday that never really spiked and never went quiet either, the kind of day that doesn't leave you with a story so much as a number.",
      "The number turned out to be almost too tidy. We run our own POS system, built in-house, and when we closed the day out it put us exactly one percent above our running average. Not a record, not a washout, one percent. You could not design a more average day if you tried.",
      "Odin came back, though. The bearded dragon from Stall Session 13, who left that day with one of our castles, turned up to inspect the new stock. He settled in beside Blackthorn Manor first, then climbed the wooden castle prop and spread out along the battlements like he'd booked the spot. Two visits in, we're calling him a regular.",
    ],
    pull: "Exactly one percent above average. You could not design a more average day if you tried.",
  },
  {
    label: "Stall Session 14",
    date: "15 August 2026",
    title: "The quiet one",
    location: "Albion Place & Kirkgate Market, Leeds",
    images: [
      {
        src: "/blog/session14-albion.jpg",
        alt: "ForgeRealm's display at Stall Session 14, Albion Place, with the dragon and castle prints laid out on the table.",
        portrait: true,
      },
      {
        src: "/blog/session14-kirkgate.jpg",
        alt: "ForgeRealm's stall at Kirkgate Market for Stall Session 14, set up under the market hall roof.",
      },
    ],
    paragraphs: [
      "Back to the dual setup for 15 August, Ishmam at Albion, Tobi at Kirkgate. Both stalls were about as quiet as we've seen. Term's just ended and the city empties out fast: students back in their home towns, and everyone else seemingly on holiday too.",
      "You win some, you lose some. Possibly our quietest day yet on both sides, but the maths still landed in profit by the end. Some Saturdays are just like that.",
    ],
    pull: "Some Saturdays are just like that.",
  },
  {
    label: "Stall Session 13",
    date: "1 August 2026",
    title: "A local celebrity stops by",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/session13-albion.jpg",
        alt: "ForgeRealm's display at Stall Session 13, Albion Place, with the dragon and castle prints laid out on the table.",
        portrait: true,
      },
      {
        src: "/blog/session13-albion-2.jpg",
        alt: "Odin the bearded dragon perched on top of one of ForgeRealm's printed castles at the Albion Place stall.",
        portrait: true,
      },
      {
        src: "/blog/session13-albion-3.jpg",
        alt: "Close-up of the smaller ForgeRealm figures on display at Stall Session 13.",
      },
    ],
    paragraphs: [
      "Albion Place, and we had a proper local celebrity stop by: Odin, a bearded dragon who's become something of a fixture around town, always spotted in the palm of his owner's hand. He came over to the stall and, dragon enthusiasts that we are, we couldn't let him leave empty-handed.",
      "We gifted him one of our castles. All dragons deserve somewhere to sleep, and by the loosest possible technicality, a bearded dragon is a dragon, so Odin qualifies. He climbed straight up and posed like he'd been doing it for years, easily the best product photo we didn't have to set up ourselves.",
      "Commercially it was a big one too: our second-best stall to date by revenue, behind only Stall Session 3, which is still out in front as the bar.",
    ],
    pull: "All dragons deserve a castle to sleep on, and by the loosest possible technicality, Odin qualifies.",
  },
  {
    kind: "note",
    label: "Studio",
    date: "29 July 2026",
    title: "We are now stocked at The Mini Mall, Merrion Centre",
    images: [
      {
        src: "/blog/minimall-opening-1.jpg",
        alt: "Inside The Mini Mall at the Merrion Centre in Leeds on opening day.",
      },
      {
        src: "/blog/minimall-opening-2.jpg",
        alt: "ForgeRealm's shelves at The Mini Mall, stacked with printed dragons, dragon eggs, lamps and figurines.",
        portrait: true,
      },
    ],
    paragraphs: [
      "From this month you can find our prints on a shelf in Leeds city centre. ForgeRealm is now stocked at The Mini Mall inside the Merrion Centre, sharing the space with a load of other exciting small-maker goods.",
      "We were honoured to play a big part in the process leading up to the launch, and invited to the opening ceremony too. Being in the room while a new small-business hub in the city got off the ground was a moment.",
      "So far it has been doing well. The Voronoi Elephant Tealight has been the piece walking out fastest, and we are looking forward to seeing where The Mini Mall goes from here. If you are in the Merrion Centre, pop in and see us on the shelf.",
    ],
    pull: "Pop into the Merrion Centre and see us on the shelf.",
  },
  {
    label: "Stall Session 12",
    date: "18 July 2026",
    title: "Branching out",
    location: "Albion Place & Afrikan Market, Leeds",
    images: [
      {
        src: "/blog/session12-albion.jpg",
        alt: "Ishmam at the Albion Place stall on 18 July, ForgeRealm display under the green-striped marquee.",
        portrait: true,
      },
      {
        src: "/blog/session12-afrikan.jpg",
        alt: "Tobi at the Afrikan Market in Leeds representing ForgeRealm as a Black-owned business.",
      },
    ],
    paragraphs: [
      "Split day, both still in Leeds but on opposite ends of it. Ishmam ran Albion in the city centre solo, Tobi took the Afrikan Market out by Leeds Carnival to represent us there as a Black-owned business.",
      "Albion did the numbers. Comfortably one of our stronger Albion days, with the sunny March 14 stall still out in front as the bar. Steady flow the whole day, silk PLA doing its usual crowd-stopping thing.",
      "The Afrikan Market was quieter for us commercially. It was not our strongest stall by a wide margin, but we still walked away in profit by the end, which is not a given for a first-time market away from the city centre crowd. More importantly it was the right room to be in, and we would go back.",
    ],
    pull: "Two ends of Leeds, one Saturday. Albion did the numbers, the Afrikan Market did the point.",
  },
  {
    label: "Stall Session 11",
    date: "20 June 2026",
    title: "Stall maxxing, take two",
    location: "Albion Place & Kirkgate Market, Leeds",
    images: [
      {
        src: "/blog/albionStall12.jpg",
        alt: "Ishmam at the Albion Place stall under the green-striped marquee, full tiered display with the wooden castle prop and rows of dragons.",
      },
      {
        src: "/blog/kirkgateStall12.jpg",
        alt: "Tobi at the Kirkgate Market stall, ForgeRealm display under the market hall roof with other traders behind.",
      },
      {
        src: "/blog/2albionStall12.jpg",
        alt: "Tobi at the Albion stall after Kirkgate closed at 4pm and we restocked together, possibly the best the stall has ever looked.",
        portrait: true,
      },
    ],
    paragraphs: [
      "Round two of the dual setup, Albion + Kirkgate. Beat our recent Albion average yet again, and the overall total across both venues basically tied the first dual on Stall Session 10. A bit more if you squint, the same if you do the maths. Different day, same outcome, the model holds.",
      "When Tobi closed Kirkgate at 4 he came over to Albion and we restocked the whole display together. The third photo is what it looked like after, possibly the best the stall has ever looked. Gorgeous weather all day, and lucky timing on top: the heatwave landed the next morning.",
    ],
    pull: "Possibly the best the stall has ever looked, and the heatwave waited until the morning after.",
  },
  {
    label: "Stall Session 10",
    date: "6 June 2026",
    title: "The dual-stall debut",
    location: "Albion Place & Kirkgate Market, Leeds",
    images: [
      {
        src: "/blog/albionStall10.jpg",
        alt: "Ishmam at the Albion Place stall on the dual-stall debut, sun out on the green-striped marquee.",
      },
      {
        src: "/blog/kirkgateStall10.jpg",
        alt: "Tobi at the Kirkgate Market stall on the dual-stall debut, ForgeRealm display under the market hall roof.",
      },
    ],
    paragraphs: [
      "First time running two stalls in one day and it landed properly. Ishmam took Albion, Tobi took Kirkgate, the split worked out exactly how we hoped. We also brought Natasha on as a ForgeRealm trader for the first time, joining us at the booths and slotting straight in.",
      "New default from here. Same setup again on 20 June, and on every multi-venue Saturday we can fit. Stall maxxing was a joke for about a week. Now it is the plan.",
    ],
    pull: "Stall maxxing was a joke for about a week. Now it is the plan.",
  },
  {
    kind: "note",
    label: "Studio",
    date: "5 June 2026",
    title: "The farm is humming, FIFA 2026 next",
    paragraphs: [
      "The Creator 5 has been running a few weeks and the quality jump is real. We now have a proper Flashforge mini farm in parallel, not a couple of machines limping between jobs.",
      "The capacity buys us design freedom. First swing: a FIFA 2026 football merch line, aimed at the next stall or the ones after. Six months ago we couldn't have attempted it.",
    ],
    pull: "First swing: a FIFA 2026 football merch line.",
  },
  {
    kind: "note",
    label: "Studio",
    date: "5 June 2026",
    title: "Stall maxxing and the mini market",
    paragraphs: [
      "Busiest month yet: four stall bookings across two Saturdays, plus a shelf at the Merrion mini market from the 13th. Stall maxxing at its finest.",
      "Saturday 6 and 20 June, one of us at Kirkgate, the other at Albion. The 6th is our next stall and we're printing roughly double our usual stock for it. From the 13th, our pieces also sit at the Merrion mini market for now.",
    ],
    pull: "Stall maxxing at its finest.",
  },
  {
    label: "Stall Session 09",
    date: "23 May 2026",
    title: "Albion in the warm spell",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/albionStall9.jpg",
        alt: "ForgeRealm at Stall Session 09, Albion Place, with the full tiered display, branded tablecloth, and QR code on the front.",
      },
      {
        src: "/blog/2albionStall9.jpg",
        alt: "Display detail at Stall Session 09 with the ForgeRealm Leeds price sheet, dragon eggs, and oversized green and purple icosahedrons.",
        portrait: true,
      },
    ],
    paragraphs: [
      "Back at Albion after Manchester, and roughly three times the result. You win some, you lose some. Credit goes mostly to the weather: the UK is at an all-time high for warmth, and for once that worked in our favour. Sun out, silk PLA doing the same trick it pulled at Stall Session 3, and the usual Albion traders noticeably in better spirits than normal.",
      "A goth fest near the venue gave the stall next to us a proper boost. That is Shining Star Jewelry, one of our favourite vendors: not just for being consistently supportive of us and every other stall around them, but for having some of the coolest pieces we have seen at any fair. Slightly above our all-time average, so no complaints.",
    ],
    pull: "Roughly three times Manchester, with the sun doing most of the heavy lifting.",
  },
  {
    label: "Stall Session 08",
    date: "17 May 2026",
    title: "Manchester Jazz Festival",
    location: "Manchester Jazz Festival",
    images: [
      {
        src: "/blog/manchesterStall8.jpg",
        alt: "ForgeRealm's first stall in Manchester, set up at the Manchester Jazz Festival.",
      },
      {
        src: "/blog/2manchesterStall8.jpg",
        alt: "Display detail at the Manchester Jazz Festival stall on a wet afternoon.",
      },
      {
        src: "/blog/3manchesterStall8.jpg",
        alt: "Jazz musicians performing live at Manchester Jazz Festival behind the stall.",
      },
    ],
    paragraphs: [
      "Our first stall outside Leeds and our first time in Manchester, at the Manchester Jazz Festival. Not our best day commercially, but we'd assumed that going in (new city, no reputation built yet). The weather contributed a fair bit, and the day was shorter than we're used to: 11 to 4 versus Albion's 9 to 7, with a lot of it taken over by the rain. One thing the photos do show: this was our prettiest setup to date.",
      "The vibes were great regardless. Food was delicious. We met an experienced trader, shout out to The Mexican Coffee Company, who gave us pro tips and trade secrets on running a stall properly. The third photo is the jazz performance we caught in the gaps; both of us are jazz enthusiasts so that alone made the trip worth it. Four of us travelled together, the owners and our partners, which made it feel less like work and more like a proper day out.",
    ],
    pull: "Our prettiest setup to date, with The Mexican Coffee Company for the tips and the jazz musicians for the soundtrack.",
  },
  {
    label: "Stall Session 07",
    date: "9 May 2026",
    title: "Albion, our new third best",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/albionStall7.jpg",
        alt: "ForgeRealm at Stall Session 07, Albion Place, with the first proper product sheets on the table.",
        portrait: true,
      },
      {
        src: "/blog/2albionStall7.jpg",
        alt: "Display detail at Stall Session 07 showing the new printed price sheets in front of the silk PLA pieces.",
        portrait: true,
      },
    ],
    paragraphs: [
      "Back at Albion and we came in with more confidence in our products than we've ever had. The proof was on the table: our first proper product sheets, openly listing prices. Until now we'd kept the pricing conversational, partly because the motive and the vibe are what we put the most weight on (the prices reflect that, quietly), but writing the numbers in front of customers felt like a real step up. People responded to it, and product sheets are now a permanent fixture at every stall we run.",
      "Commercially this one bumped Stall Session 6 out of the top three. Stall Session 7 is our new third best to date, and the gap to Stall Session 3 (still the bar) is closing.",
    ],
    pull: "Stall Session 7 is our new third best, and the gap to Stall Session 3 is closing.",
  },
  {
    label: "Stall Session 06",
    date: "25 April 2026",
    title: "Albion, arrests and a 4pm surge",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/albionStall6.jpg",
        alt: "ForgeRealm display at Stall Session 06, Albion Place, showing the tiered product stand loaded with silk PLA pieces.",
        portrait: true,
      },
      {
        src: "/blog/2albionStall6.jpg",
        alt: "Ishmam and Tobi behind the ForgeRealm Leeds banner at Stall Session 06, Albion Place.",
      },
    ],
    paragraphs: [
      "A large protest ran through the city that day. Six people were arrested near The Headrow, right next to Albion, and foot traffic was low because of it. By early afternoon we'd more or less written the stall off.",
      "Then around 4pm it turned. A late surge pulled the day into a result a lot better than we'd expected, and we left genuinely proud of how the stall looked. Best presentation to date, and proof the branded front was earning its place. Pack-down had its own moment when a rising metal bollard caught a white van near our cars (nobody hurt, just one of those days).",
    ],
    pull: "We left genuinely proud of how the stall looked, our best presentation to date.",
  },
  {
    kind: "note",
    label: "Studio",
    date: "20 April 2026",
    title: "We invested in the Flashforge Creator 5",
    paragraphs: [
      "The 3D printing community has been split on the Snapmaker UI vs the Flashforge Creator 5. Most experienced traders we met at stalls landed on the Snapmaker. We went the other way.",
      "Our whole farm is already Flashforge and the reliability has held up. Switching ecosystems for the sake of consensus felt like unnecessary risk. The Creator 5 lands in May and should expand both our volume and material range at stalls.",
    ],
  },
  {
    label: "Stall Session 05",
    date: "12 April 2026",
    title: "The Alwoodley experiment",
    location: "The Avenue, Alwoodley, Leeds",
    images: [
      {
        src: "/blog/alwoodleyStall5.jpg",
        alt: "Stall Session 5 at The Avenue, Alwoodley, our first stall in a residential area.",
      },
      {
        src: "/blog/2alwoodleyStall5.jpg",
        alt: "The Avenue stall laid out in Dawn's style, our best-looking stall to date.",
      },
    ],
    paragraphs: [
      "Stall Session 5 was a deliberate experiment: what happens when we set up outside the city centre, in a residential area? Commercially it wasn't our best, but we expected that going in. What it was, genuinely, was the most wholesome day we've had.",
      "We met our first real \"competitor\", a printer of five-plus years with a different range entirely. He came over first to support us and gave us a stack of advice we're still using. We also met Dawn, who sells baby products. Her displays are beautiful, and she basically set up our stall for us in the layout you see in the photos. The plan is to evolve from Dawn's base, not abandon it.",
    ],
    pull: "The plan going forward is to evolve from Dawn's base, not abandon it.",
  },
  {
    label: "Stall Session 04",
    date: "28 March 2026",
    title: "Kirkgate Market",
    location: "Kirkgate Market, Leeds",
    images: [
      {
        src: "/blog/kirkgateStall4.jpg",
        alt: "ForgeRealm at Kirkgate Market, Leeds, our first stall outside of Albion Place.",
      },
      {
        src: "/blog/2kirkgateStall4.jpg",
        alt: "Display detail at Kirkgate Market with the full medieval-fantasy front.",
      },
    ],
    paragraphs: [
      "First stall outside of Albion. Still central Leeds, still one of our favourite markets in the city. If you live here you love Kirkgate by default. Shorter hours, lower booking cost, easier parking; we went home less shattered than usual.",
      "This is also where we properly committed to the medieval-fantasy aesthetic for the stall front. It landed: for the first time other traders, people who'd been doing this for years, came over to say the stall looked good. Commercially strong given the shorter hours, and we'd absolutely do Kirkgate again.",
    ],
  },
  {
    label: "Stall Session 03",
    date: "14 March 2026",
    title: "Albion in the sunshine",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/albionStall3.jpg",
        alt: "Stall Session 3 at Albion Place with the new ForgeRealm branded tarpaulin and banner.",
      },
      {
        src: "/blog/2albionStall3.jpg",
        alt: "Display detail at Stall Session 3 with silk PLA pieces catching the sun.",
      },
      {
        src: "/blog/3albionStall3.jpg",
        alt: "Wider view of Stall Session 3 on a sunny Saturday in Leeds.",
      },
    ],
    paragraphs: [
      "Stall Session 3 is where ForgeRealm started looking like ForgeRealm: branded tarpaulin and banner, proper business cards, a tightened-up display. For the first time it felt less like two guys selling prints and more like a brand.",
      "The weather did us a massive favour: clear sunshine open to close. Silk PLA in direct sunlight is a completely different object; people stopped for the glint before they'd even processed what the items were. Still our most successful stall to date and the one we're using as the bar.",
    ],
    pull: "Silk PLA in direct sunlight is a completely different object.",
  },
  {
    label: "Stall Session 02",
    date: "6 December 2025",
    title: "Back at Albion",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/albionStall2.jpg",
        alt: "ForgeRealm's second stall, now with a tarpaulin behind the display.",
      },
    ],
    paragraphs: [
      'Stall Session 2 was the "okay, we\'ve learned some things" stall. We finally bought a tarpaulin, which immediately changed the day. No more sideways rain down the back of your jumper, and the products actually looked like products instead of wet cardboard.',
      'The display evolved a little. It still wasn\'t where we wanted it, but it was measurably better than Stall Session 1: more legible, less "stuff from the kitchen table." We made a decent profit again, confirmed that the concept worked in cold weather, and went home with a list of things to improve before next time.',
    ],
  },
  {
    label: "Stall Session 01",
    date: "29 November 2025",
    title: "The Albion debut",
    location: "Albion Place, Leeds",
    images: [
      {
        src: "/blog/albionStall1.jpg",
        alt: "ForgeRealm's first ever stall at Albion Place, Leeds during the Christmas market.",
      },
      {
        src: "/blog/2albionStall1.jpg",
        alt: "Close-up of the first stall's display table.",
      },
    ],
    paragraphs: [
      "The one that turned the DnD-prop hobby into an actual side hustle. Albion's Christmas market with Artsmix, our priciest booking to date and neither of us slept the night before. Against all odds, we broke even and then some.",
      "We'll never forget our first customer ever, Michelle March, an artist who'd flown in from the US and bought from the table before we'd even finished setting up. The display itself was rough: no tarpaulin, no real branding, just stuff from the kitchen table. We spent the day fighting wind and rain. Painful, but we learned.",
    ],
    pull: "Our first customer bought from us before we'd even finished setting up.",
  },
];
