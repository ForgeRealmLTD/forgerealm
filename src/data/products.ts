export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // pence for Stripe
  displayPrice: string;
  category: string; // product category (e.g., Articulated, Voronoi, Fidget)
  description: string;
  stock: number | null;
  badge?: string;
  image?: string;
  images?: string[]; // additional images for carousel
  featured?: boolean;
  bannerOnly?: boolean; // don't show in product grid, only as banner
}

export const products: Product[] = [
  // ── Dragons ──
  {
    id: "big-dragon-blue",
    name: "Mini Dragon (Blue)",
    slug: "big-dragon-blue",
    price: 1200,
    displayPrice: "£12.00",
    category: "Articulated",
    description:
      "Fully articulated dragon with smooth joint movement. A showstopper on any shelf - each segment flexes and coils naturally. Stunning cyan-blue finish.",
    stock: 2,
    image: "/shop-products/Photoroom_20260413_14613_am.jpg",
    featured: true,
  },
  {
    id: "big-dragon-red",
    name: "Mini Dragon (Red)",
    slug: "big-dragon-red",
    price: 1200,
    displayPrice: "£12.00",
    category: "Articulated",
    description:
      "Fully articulated dragon with smooth joint movement. A showstopper on any shelf - each segment flexes and coils naturally. Bold red finish.",
    stock: 1,
    badge: "Low Stock",
    image: "/shop-products/Photoroom_20260413_14646_am.jpg",
  },
  {
    id: "dragon-egg-blue",
    name: "Dragon Egg (Blue)",
    slug: "dragon-egg-blue",
    price: 800,
    displayPrice: "£8.00",
    category: "Other",
    description:
      "Large dragon egg with textured scale shell in iridescent blue-purple. A collector's centrepiece inspired by fantasy lore.",
    stock: 1,
    badge: "Low Stock",
    image: "/shop-products/Photoroom_20260412_71642_pm.jpg",
  },
  {
    id: "dragon-egg-green",
    name: "Dragon Egg (Green)",
    slug: "dragon-egg-green",
    price: 800,
    displayPrice: "£8.00",
    category: "Other",
    description:
      "Large dragon egg with textured scale shell in deep emerald green. A collector's centrepiece inspired by fantasy lore.",
    stock: 1,
    badge: "Low Stock",
    image: "/shop-products/Photoroom_20260413_14932_am.jpg",
  },
  {
    id: "dice-dragon",
    name: "Dice Dragon",
    slug: "dice-dragon",
    price: 400,
    displayPrice: "£4.00",
    category: "Home",
    description:
      "Dragon-head holder designed to cradle dice or small items. Detailed sculpt with a hollowed crown - perfect for tabletop gamers.",
    stock: 1,
    badge: "Low Stock",
    image: "/shop-products/Photoroom_20260413_14853_am.jpg",
  },

  // ── Voronoi ──
  {
    id: "voronoi-cat",
    name: "Voronoi Cat",
    slug: "voronoi-cat",
    price: 500,
    displayPrice: "£5.00",
    category: "Voronoi",
    description:
      "Cat figure with mesmerising Voronoi mesh pattern. Art meets engineering - stunning from every angle.",
    stock: 6,
    image: "/shop-products/Photoroom_20260412_71757_pm.jpg",
    featured: true,
  },
  {
    id: "voronoi-elephant",
    name: "Voronoi Elephant",
    slug: "voronoi-elephant",
    price: 400,
    displayPrice: "£4.00",
    category: "Voronoi",
    description:
      "Elephant rendered in Voronoi mesh - structural beauty that shows the magic of 3D printing.",
    stock: null,
    image: "/shop-products/Photoroom_20260412_73718_pm.jpg",
  },
  {
    id: "voronoi-elephant-tealight",
    name: "Voronoi Elephant Tealight",
    slug: "voronoi-elephant-tealight",
    price: 600,
    displayPrice: "£6.00",
    category: "Tealights",
    description:
      "Large Voronoi elephant with intricate lattice cut-outs. Place a tealight inside for a warm ambient glow through the mesh.",
    stock: 4,
    image: "/shop-products/Photoroom_20260412_74014_pm.jpg",
  },
  {
    id: "small-voronoi-cat-tealight",
    name: "Small Voronoi Cat Tealight",
    slug: "small-voronoi-cat-tealight",
    price: 400,
    displayPrice: "£4.00",
    category: "Tealights",
    description:
      "Petite Voronoi cat perched on a tealight holder base. Candlelight glows through the lattice silhouette for cosy evenings.",
    stock: 6,
    image: "/shop-products/Photoroom_20260412_74123_pm.jpg",
    images: ["/shop-products/Photoroom_20260412_74123_pm.jpg"],
  },
  {
    id: "small-voronoi-elephant-tealight",
    name: "Small Voronoi Elephant Tealight",
    slug: "small-voronoi-elephant-tealight",
    price: 300,
    displayPrice: "£3.00",
    category: "Tealights",
    description:
      "Petite Voronoi elephant on a tealight holder base. Trunk-up design said to bring good luck - looks gorgeous lit up.",
    stock: 5,
    image: "/shop-products/Photoroom_20260413_14206_am.jpg",
    images: [
      "/shop-products/Photoroom_20260413_14206_am.jpg",
      "/shop-products/tealight-elephant-lit.jpg",
    ],
  },

  // ── Spiral Cone Fidgets (renamed from Spinners - single printed piece, no bearing) ──
  {
    id: "big-spinner",
    name: "Big Spiral Cone Fidget",
    slug: "big-spinner",
    price: 800,
    displayPrice: "£8.00",
    category: "Fidget",
    description:
      "Oversized spiral cone fidget - a single printed piece with a helical cut that stretches and twists like a slinky-cone, no bearing or axle. Satisfying desk toy with iridescent blue-purple finish.",
    stock: 4,
    image: "/shop-products/Photoroom_20260413_14427_am.jpg",
  },
  {
    id: "spinner",
    name: "Spiral Cone Fidget",
    slug: "spinner",
    price: 400,
    displayPrice: "£4.00",
    category: "Fidget",
    description:
      "Compact spiral cone fidget with a smooth helical twist-and-stretch action, no bearing or axle. Pocket-sized stress relief in iridescent blue-purple.",
    stock: 28,
    image: "/shop-products/Photoroom_20260413_14501_am.jpg",
    featured: true,
  },

  // ── Hexagon Fidgets ──
  {
    id: "hexagon-fidget-green",
    name: "Hexagon Fidget (Green)",
    slug: "hexagon-fidget-green",
    price: 500,
    displayPrice: "£5.00",
    category: "Fidget",
    description:
      "Hex-shaped fidget with interlocking segments that click and twist. Geometric satisfaction in forest green.",
    stock: null,
    image: "/shop-products/Photoroom_20260413_15905_am.jpg",
    images: [
      "/shop-products/Photoroom_20260413_15905_am.jpg",
      "/shop-products/Photoroom_20260413_15937_am.jpg",
    ],
  },
  {
    id: "hexagon-fidget-gold",
    name: "Hexagon Fidget (Gold)",
    slug: "hexagon-fidget-gold",
    price: 500,
    displayPrice: "£5.00",
    category: "Fidget",
    description:
      "Hex-shaped fidget with interlocking segments that click and twist. Geometric satisfaction in metallic gold.",
    stock: null,
    image: "/shop-products/Photoroom_20260413_20007_am.jpg",
    images: [
      "/shop-products/Photoroom_20260413_20007_am.jpg",
      "/shop-products/Photoroom_20260413_20030_am.jpg",
    ],
  },
  {
    id: "hexagon-fidget-pink",
    name: "Hexagon Fidget (Pink)",
    slug: "hexagon-fidget-pink",
    price: 500,
    displayPrice: "£5.00",
    category: "Fidget",
    description:
      "Hex-shaped fidget with interlocking segments that click and twist. Geometric satisfaction in vibrant pink.",
    stock: 1,
    badge: "Low Stock",
    image: "/shop-products/Photoroom_20260413_20126_am.jpg",
    images: [
      "/shop-products/Photoroom_20260413_20126_am.jpg",
      "/shop-products/Photoroom_20260413_20155_am.jpg",
    ],
  },
  {
    id: "hexagon-fidget-purple",
    name: "Hexagon Fidget (Purple)",
    slug: "hexagon-fidget-purple",
    price: 500,
    displayPrice: "£5.00",
    category: "Fidget",
    description:
      "Hex-shaped fidget with interlocking segments that click and twist. Geometric satisfaction in iridescent purple.",
    stock: 3,
    image: "/shop-products/Photoroom_20260413_20309_am.jpg",
    images: [
      "/shop-products/Photoroom_20260413_20309_am.jpg",
      "/shop-products/Photoroom_20260413_20335_am.jpg",
    ],
    featured: true,
  },

  // ── Small prints (formerly Keychains - ring dropped, sold bare) ──
  {
    id: "hexagon-keychain-yellow",
    name: "Hexagon Keychain (Yellow)",
    slug: "hexagon-keychain-yellow",
    price: 300,
    displayPrice: "£3.00",
    category: "Keychains",
    description:
      "Geometric hexagon charm with a satisfying weight, sold as a standalone print with no keyring attached. Clean lines and modern design in golden yellow.",
    stock: null,
    image: "/shop-products/Photoroom_20260413_15601_am.jpg",
  },
  {
    id: "hexagon-keychain-purple",
    name: "Hexagon Keychain (Purple)",
    slug: "hexagon-keychain-purple",
    price: 300,
    displayPrice: "£3.00",
    category: "Keychains",
    description:
      "Geometric hexagon charm with a satisfying weight, sold as a standalone print with no keyring attached. Clean lines and modern design in iridescent purple.",
    stock: 3,
    image: "/shop-products/Photoroom_20260413_15645_am.jpg",
  },
  {
    id: "hexagon-keychain-green",
    name: "Hexagon Keychain (Green)",
    slug: "hexagon-keychain-green",
    price: 300,
    displayPrice: "£3.00",
    category: "Keychains",
    description:
      "Geometric hexagon charm with a satisfying weight, sold as a standalone print with no keyring attached. Clean lines and modern design in emerald green.",
    stock: 4,
    image: "/shop-products/Photoroom_20260413_15727_am.jpg",
  },
  {
    id: "hexagon-keychain-pink",
    name: "Hexagon Keychain (Pink)",
    slug: "hexagon-keychain-pink",
    price: 300,
    displayPrice: "£3.00",
    category: "Keychains",
    description:
      "Geometric hexagon charm with a satisfying weight, sold as a standalone print with no keyring attached. Clean lines and modern design in hot pink.",
    stock: 3,
    image: "/shop-products/Photoroom_20260413_15805_am.jpg",
  },

  // ── Lamps ──
  {
    id: "artichoke-lamp",
    name: "Artichoke Lamp",
    slug: "artichoke-lamp",
    price: 2000,
    displayPrice: "£20.00",
    category: "Home",
    description:
      "Layered petal lamp with warm ambient glow. 3D printed shade, hand-assembled in Leeds.",
    stock: 4,
    badge: "Premium",
    image: "/shop-products/lamps2.webp",
    images: ["/shop-products/lamps2.webp", "/ablamp2.webp"],
    bannerOnly: true,
  },

  // ── Home ──
  {
    id: "deer-keyring-holder",
    name: "Deer Keyring Holder",
    slug: "deer-keyring-holder",
    price: 600,
    displayPrice: "£6.00",
    category: "Home",
    description:
      "Deer figure with tree-branch antlers for hanging keyrings and jewellery. Elegant white finish on oval base.",
    stock: 3,
    image: "/shop-products/Photoroom_20260413_14825_am.jpg",
    images: [
      "/shop-products/Photoroom_20260413_14825_am.jpg",
      "/shop-products/Photoroom_20260413_15038_am.jpg",
    ],
  },
  // ── Articulated (new SKUs) ──
  {
    id: "celestial-dragon",
    name: "Celestial Dragon",
    slug: "celestial-dragon",
    price: 1500,
    displayPrice: "£15.00",
    category: "Articulated",
    description:
      "Top-tier articulated dragon with intricate scale detail. Our flagship sculpt and the centrepiece of the stall.",
    stock: null,
    badge: "Premium",
  },
  {
    id: "medium-dragon",
    name: "Medium Dragon",
    slug: "medium-dragon",
    price: 700,
    displayPrice: "£7.00",
    category: "Articulated",
    description:
      "Step-up articulated dragon between the small and big. Same flexible joints, mid-tier scale.",
    stock: null,
  },
  {
    id: "axolotl-mc",
    name: "Axolotl (MC)",
    slug: "axolotl-mc",
    price: 600,
    displayPrice: "£6.00",
    category: "Articulated",
    description:
      "Articulated axolotl with smooth joint flex. Aquatic vibe, available in multiple PLA colours.",
    stock: null,
  },
  {
    id: "articulated-dog",
    name: "Dog",
    slug: "articulated-dog",
    price: 600,
    displayPrice: "£6.00",
    category: "Articulated",
    description:
      "Articulated dog with poseable head and tail. Loyal little desk mate.",
    stock: null,
  },
  {
    id: "articulated-octopus",
    name: "Octopus",
    slug: "articulated-octopus",
    price: 500,
    displayPrice: "£5.00",
    category: "Articulated",
    description:
      "Eight-tentacle octopus with full joint flex. Drapes over edges, curls into shapes.",
    stock: null,
  },
  {
    id: "articulated-cat",
    name: "Cat",
    slug: "articulated-cat",
    price: 300,
    displayPrice: "£3.00",
    category: "Articulated",
    description:
      "Articulated cat with smooth joint flex. Sits, stretches, perches on a shelf edge.",
    stock: null,
  },
  {
    id: "penguin",
    name: "Penguin",
    slug: "penguin",
    price: 300,
    displayPrice: "£3.00",
    category: "Articulated",
    description:
      "Articulated penguin that toddles across a desk. Compact and cute.",
    stock: null,
  },
  {
    id: "red-panda",
    name: "Red Panda",
    slug: "red-panda",
    price: 300,
    displayPrice: "£3.00",
    category: "Articulated",
    description:
      "Compact articulated red panda. Sharp sculpt without the gimmick.",
    stock: null,
  },
  {
    id: "wing-dragon",
    name: "Wing Dragon",
    slug: "wing-dragon",
    price: 900,
    displayPrice: "£9.00", // TODO: placeholder price, confirm before launch
    category: "Articulated",
    description:
      "Articulated dragon with flapping wings that fold and extend with a satisfying motion, printed in one piece. Full body flex plus wing action.",
    stock: null,
  },
  {
    id: "octoring",
    name: "Octoring",
    slug: "octoring",
    price: 500,
    displayPrice: "£5.00", // TODO: placeholder price, confirm before launch
    category: "Articulated",
    description:
      "Octopus fidget built around a central cylinder with several rings that rotate freely around it. Satisfying spin, printed in one piece.",
    stock: null,
  },
  // ── Voronoi + Tealights (new SKUs) ──
  {
    id: "voronoi-dog",
    name: "Voronoi Dog",
    slug: "voronoi-dog",
    price: 500,
    displayPrice: "£5.00",
    category: "Voronoi",
    description:
      "Dog rendered in Voronoi mesh. Sturdy stance, intricate lattice throughout.",
    stock: null,
  },
  {
    id: "voronoi-giraffe",
    name: "Voronoi Giraffe",
    slug: "voronoi-giraffe",
    price: 500,
    displayPrice: "£5.00",
    category: "Voronoi",
    description:
      "Tall Voronoi giraffe with elongated lattice mesh. A statement piece for a shelf.",
    stock: null,
  },
  {
    id: "voronoi-deer",
    name: "Voronoi Deer",
    slug: "voronoi-deer",
    price: 400,
    displayPrice: "£4.00",
    category: "Voronoi",
    description:
      "Antlered Voronoi deer with airy lattice silhouette. Light and graceful.",
    stock: null,
  },
  {
    id: "voronoi-small-cat",
    name: "Voronoi Small Cat",
    slug: "voronoi-small-cat",
    price: 300,
    displayPrice: "£3.00",
    category: "Voronoi",
    description: "Small Voronoi cat figure. Same mesh aesthetic, pocket scale.",
    stock: null,
  },
  {
    id: "tealight-bunny",
    name: "Tealight Bunny",
    slug: "tealight-bunny",
    price: 300,
    displayPrice: "£3.00",
    category: "Tealights",
    description:
      "Bunny tealight holder. Glow shines through the lattice silhouette for cosy evenings.",
    stock: null,
  },
  // ── Other / Home / Easter / Clicker (new SKUs) ──
  {
    id: "giant-egg",
    name: "Giant Egg",
    slug: "giant-egg",
    price: 2000,
    displayPrice: "£20.00",
    category: "Other",
    description:
      "Showpiece giant dragon egg with deep textured shell. Centrepiece scale.",
    stock: null,
    badge: "Premium",
  },
  {
    id: "small-egg",
    name: "Egg",
    slug: "small-egg",
    price: 200,
    displayPrice: "£2.00",
    category: "Other",
    description: "Small textured egg. Display, gift, or stocking filler.",
    stock: null,
  },
  {
    id: "lamp-shade",
    name: "Lamp Shade",
    slug: "lamp-shade",
    price: 700,
    displayPrice: "£7.00",
    category: "Home",
    description:
      "Geometric 3D printed lamp shade. Fits standard fittings, diffuses warm light.",
    stock: null,
  },
  {
    id: "easter-egg-holder",
    name: "Egg Holder",
    slug: "easter-egg-holder",
    price: 200,
    displayPrice: "£2.00",
    category: "Easter",
    description:
      "Egg cup holder for Easter, painted eggs, or chocolate decorations.",
    stock: null,
  },
  {
    id: "kinder-holder",
    name: "Kinder Holder",
    slug: "kinder-holder",
    price: 200,
    displayPrice: "£2.00",
    category: "Easter",
    description: "Snug holder sized for Kinder eggs. Stand-up display piece.",
    stock: null,
  },
  {
    id: "mushroom-mc-keychain",
    name: "Mushroom Keychain (MC)",
    slug: "mushroom-mc-keychain",
    price: 500,
    displayPrice: "£5.00",
    category: "Keychains",
    description:
      "Mushroom charm with a detailed cap, sold as a standalone print with no keyring attached. Multiple colour finishes available.",
    stock: null,
  },
  {
    id: "mini-piano",
    name: "Mini Piano",
    slug: "mini-piano",
    price: 600,
    displayPrice: "£6.00",
    category: "Clicker",
    description:
      "Mini piano clicker with satisfying tactile response. Desk-toy delight.",
    stock: null,
  },
];
