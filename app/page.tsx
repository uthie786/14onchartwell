"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Utensils,
  ChevronDown,
  Sparkles,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Wine,
  X,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Venue details — confirm these before going live                    */
/* ------------------------------------------------------------------ */
const WHATSAPP_NUMBER = "27315611017"; // international format, no "+" or spaces
const PHONE_DISPLAY = "+27 31 561 1017";
const PHONE_HREF = "tel:+27315611017";
const ADDRESS_LINE_1 = "14 Chartwell Drive";
const ADDRESS_LINE_2 = "Umhlanga Rocks, KwaZulu-Natal";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=14+Chartwell+Drive+Umhlanga+Rocks";
const HOURS: { days: string; time: string }[] = [
  { days: "Monday to Thursday", time: "12:00 – 22:00" },
  { days: "Friday & Saturday", time: "12:00 – 23:00" },
  { days: "Sunday", time: "12:00 – 21:00" },
];
const TIME_SLOTS = buildSlots("12:00", "21:30", 30);

/* ------------------------------------------------------------------ */
/*  Menu data                                                          */
/* ------------------------------------------------------------------ */
type MenuItem = { name: string; price: string; desc?: string; extra?: string };
type MenuGroup = { label?: string; items: MenuItem[] };
type Category = {
  id: string;
  title: string;
  note?: string;
  groups: MenuGroup[];
  footnote?: string;
};

const MENU: Category[] = [
  {
    id: "smalls",
    title: "Smalls",
    note: "To share, or not",
    groups: [
      {
        items: [
          { name: "Pork Belly Bites", price: "R85", desc: "basted in a red wine and citrus marinade with a crispy rind" },
          { name: "Calamari", price: "R98", desc: "grilled with butter, parsley, lemon & white wine" },
          { name: "Lamb Riblets", price: "R135", desc: "flame grilled & served with a tomato chilli pesto" },
          { name: "Chicken Liver", price: "R105", desc: "in a creamy white wine, sage, garlic, chilli & parmesan sauce with toasted ciabatta" },
          { name: "Chicken Wings", price: "R91", desc: "bourbon & chilli basted" },
          { name: "Brisket", price: "R118", desc: "flame grilled beef brisket, with signature bourbon & chilli basting" },
          { name: "Charred Garlic-Butter Bread", price: "R75", desc: "hot flatbread with melted garlic-butter & herbs" },
        ],
      },
    ],
  },
  {
    id: "bistro",
    title: "Bistro",
    groups: [
      {
        items: [
          { name: "Chicken Caprese", price: "R180", desc: "flame grilled chicken breasts topped with basil & spinach pesto, slow cooked napolitana sauce, mozzarella, parmesan & breadcrumbs, served with seasonal vegetables" },
          { name: "600g Pork Ribs", price: "R350", desc: "bourbon & chilli sticky ribs served with fries" },
          { name: "400g Lamb Loin Chops", price: "R420", desc: "herb-butter basted, served with butter & thyme mash" },
          { name: "Peri Peri Chicken", price: "R235", desc: "flame grilled half chicken served with skinny fries" },
        ],
      },
    ],
  },
  {
    id: "slow-cooked",
    title: "Slow Cooked",
    note: "Given the hours they deserve",
    groups: [
      {
        items: [
          { name: "Butter Chicken Curry", price: "R200", desc: "slow cooked masala and coconut-milk chicken curry, with fragrant spices served with basmati rice, sambals & pompadum", extra: "Add prawns +R80" },
          { name: "Lamb Curry", price: "R245", desc: "slow cooked lamb leg in a fragrant and spicy gravy, served with basmati rice, sambals & pompadum" },
          { name: "Lamb Osso Bucco", price: "R260", desc: "slow cooked lamb-on-the-bone in tomato, red wine, thyme & rosemary gravy, served with butter & thyme mash" },
          { name: "Red Wine Beef Short-Rib", price: "R220", desc: "rich & flavourful stew of slow cooked beef short-ribs served with butter & thyme mash" },
          { name: "Lamb Shank", price: "R340", desc: "slow cooked in a red wine, tomato, mushroom & rosemary ragu, served with butter & thyme mash" },
        ],
      },
    ],
  },
  {
    id: "seafood",
    title: "Seafood",
    groups: [
      {
        items: [
          { name: "600g King Prawns", price: "R400", desc: "pan fried with garlic, lemon & butter, served with rice & fries" },
          { name: "Salmon", price: "R385", desc: "pan fried with butter and capers, served with mash & lemon-butter cream" },
          { name: "Kingklip", price: "R290", desc: "pan fried with lemon-butter cream & served with mash" },
          { name: "Calamari", price: "R225", desc: "grilled or fried, served with rice & fries" },
          { name: "Battered Hake", price: "R185", desc: "served with fries & tartar sauce" },
        ],
      },
    ],
  },
  {
    id: "burgers",
    title: "Chartwell Burgers",
    note: "Served with a side of fries",
    groups: [
      {
        items: [
          { name: "Cheese & Bacon Burger", price: "R180", desc: "homemade 100% beef patty, toasted brioche bun, cheddar cheese, crispy streaky bacon, fresh tomato & crisp lettuce" },
          { name: "Crispy Chicken Burger", price: "R170", desc: "buttermilk battered crispy chicken breast, toasted brioche bun, honey-mustard slaw, fresh tomato & crisp lettuce" },
          { name: "Classic Burger", price: "R140", desc: "homemade 100% beef patty, toasted brioche bun, bbq bourbon relish, fresh tomato & crisp lettuce" },
        ],
      },
      {
        label: "Add on",
        items: [
          { name: "Cheese", price: "+R30" },
          { name: "Mushroom Sauce", price: "+R45" },
          { name: "Sauce Diane", price: "+R55" },
        ],
      },
    ],
  },
  {
    id: "pasta",
    title: "Pasta",
    groups: [
      {
        items: [
          { name: "Chilli Chicken Linguine", price: "R190", desc: "butter grilled chicken breast, sliced and served on a bed of linguine pasta in a creamy sauce of sundried tomatoes, paprika, parmesan & chilli, topped with finely grated parmesan" },
          { name: "Prawn Napoli", price: "R220", desc: "king prawns in a creamy napolitana sauce of tomato, chilli & parmesan tossed with linguine and topped with finely grated parmesan" },
          { name: "Creamy Chilli Penne", price: "R190", desc: "slow cooked beef bolognaise, finished off with cream, chilli & parmesan" },
          { name: "Lasagne", price: "R195", desc: "layers of baked pasta, bechamel & slow cooked beef bolognaise, topped with mozzarella & parmesan" },
          { name: "Mushroom Ragu", price: "R180", desc: "rich blend of finely diced mushrooms, tomato, rosemary, balsamic & cream, served with tagliatelle pasta and topped with finely grated parmesan" },
          { name: "Chicken Alfredo", price: "R170", desc: "butter grilled chicken breast, sliced and served on a bed of tagliatelle tossed in ultimate cream, parmesan & garlic sauce, topped with finely grated parmesan" },
        ],
      },
    ],
  },
  {
    id: "steaks",
    title: "Steaks",
    note: "21 day aged, grass-fed beef with crispy roast potatoes, green beans & sauce of choice",
    groups: [
      {
        items: [
          { name: "250g Fillet Medallion", price: "R370" },
          { name: "350g Rib-Eye Off The Bone", price: "R490" },
          { name: "700g Rib-Eye On The Bone", price: "R720" },
          { name: "500g T-Bone", price: "R425" },
          { name: "300g Rump", price: "R350" },
        ],
      },
    ],
  },
  {
    id: "platters",
    title: "Platters",
    note: "For the whole table",
    groups: [
      {
        items: [
          { name: "Shishanyama", price: "R650", desc: "flame grilled lamb cutlets, beef brisket, sticky chicken wings, marinated lamb riblets, beef boerewors, jeqe buns, pap, fries and chakalaka" },
          { name: "Chicken & Prawn", price: "R530", desc: "flame grilled half peri-peri chicken, bourbon & chilli basted wings, butter-fried prawns with lemon & butter sauce, served with signature savoury rice" },
          { name: "Tasting Plate", price: "R600", desc: "slow cooked pork belly bites, fried calamari, lamb riblets in gravy, creamy chicken livers & ciabatta, bourbon & chilli chicken wings, sticky beef short rib rashers" },
        ],
      },
    ],
  },
  {
    id: "sides",
    title: "Salads, Sauces & Sides",
    groups: [
      {
        label: "Salads",
        items: [
          { name: "Chicken Caesar", price: "R160" },
          { name: "Green Salad", price: "R110" },
        ],
      },
      {
        label: "Sauces",
        items: [
          { name: "Mushroom & Sherry", price: "R45" },
          { name: "Sauce Diane", price: "R55" },
          { name: "Cheddar & Parmesan Cheese", price: "R45" },
          { name: "Chakalaka", price: "R35" },
        ],
      },
      {
        label: "Sides",
        items: [
          { name: "Green Salad", price: "R75" },
          { name: "Wilted Spinach", price: "R40" },
          { name: "Butter & Thyme Mash", price: "R45" },
          { name: "Basmati Rice", price: "R35" },
          { name: "Seasonal Vegetables", price: "R50" },
          { name: "Ciabatta Roll", price: "R10" },
          { name: "Fries", price: "R40" },
          { name: "Pap", price: "R30" },
          { name: "Jeqe", price: "R10" },
        ],
      },
    ],
  },
  {
    id: "sweetish",
    title: "Sweetish",
    groups: [
      {
        items: [
          { name: "Peppermint Crisp", price: "R95", desc: "layers of fresh cream, thick caramel, crushed peppermint crisp & coconut cookies, served with vanilla ice cream" },
          { name: "Basque Cheesecake", price: "R85", desc: "baked cheesecake topped with raspberry-cream mess" },
          { name: "14 Cookies & Cream", price: "R100", desc: "3 scoops of creamy vanilla ice cream, topped with chunks of homemade chocolate & caramel brownie, Oreo cookies and thick dark chocolate sauce" },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function buildSlots(start: string, end: string, stepMin: number): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  for (let t = toMin(start); t <= toMin(end); t += stepMin) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    out.push(`${h}:${m}`);
  }
  return out;
}

function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/*  Double-line frame                                                  */
/* ------------------------------------------------------------------ */
function DoubleFrame({
  children,
  className = "",
  tone = "wine",
}: {
  children: ReactNode;
  className?: string;
  tone?: "wine" | "gold";
}) {
  const outer = tone === "wine" ? "border-wine/40" : "border-gold/50";
  const inner = tone === "wine" ? "border-wine/25" : "border-gold/30";
  return (
    <div className={`relative border ${outer} ${className}`}>
      <div aria-hidden className={`pointer-events-none absolute inset-[5px] border ${inner}`} />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Page() {
  const [openIds, setOpenIds] = useState<string[]>(["smalls"]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const reduce = useReducedMotion();

  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const jumpTo = (id: string) => {
    setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    );
  };

  const allOpen = openIds.length === MENU.length;

  return (
    <div className="min-h-screen bg-ink font-sans text-parchment antialiased selection:bg-gold/40 selection:text-ink">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-gold/15 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="font-serif text-xl tracking-wide text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
            14 on Chartwell
          </a>
          <nav className="flex items-center gap-2 sm:gap-6">
            <a href="#menu" className="hidden text-sm text-parchment/75 hover:text-gold sm:inline">Menu</a>
            <a href="#visit" className="hidden text-sm text-parchment/75 hover:text-gold sm:inline">Visit</a>
            <button
              onClick={() => setBookingOpen(true)}
              className="inline-flex items-center gap-2 border border-gold/60 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Calendar className="h-4 w-4" aria-hidden />
              Reserve a table
            </button>
          </nav>
        </div>
      </header>

      <Hero onReserve={() => setBookingOpen(true)} />
      <OnyxBar />

      {/* Menu */}
      <section id="menu" className="relative z-10 scroll-mt-16 overflow-clip bg-forest-deep px-5 py-24">
        <SectionGlow className="top-0 h-[640px]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-10 flex flex-col gap-3 text-center">
            <Utensils className="mx-auto h-6 w-6 text-gold" aria-hidden />
            <h2 className="font-serif text-5xl text-parchment md:text-6xl">The menu</h2>
            <p className="mx-auto max-w-md font-serif text-lg italic text-parchment/70">
              Open a section to see what the kitchen is cooking.
            </p>
          </div>

          {/* Quick jump */}
          <div className="sticky top-[57px] z-30 -mx-5 mb-8 border-y border-gold/15 bg-forest-deep/95 px-5 py-3 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {MENU.map((c) => (
                <button
                  key={c.id}
                  onClick={() => jumpTo(c.id)}
                  className={`shrink-0 border px-3 py-1.5 font-serif text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                    openIds.includes(c.id)
                      ? "border-gold/70 bg-gold/15 text-gold"
                      : "border-parchment/20 text-parchment/70 hover:border-gold/50 hover:text-parchment"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setOpenIds(allOpen ? [] : MENU.map((c) => c.id))}
              className="text-sm text-parchment/60 underline-offset-4 hover:text-gold hover:underline"
            >
              {allOpen ? "Close all sections" : "Open all sections"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {MENU.map((cat) => (
              <CategoryPanel
                key={cat.id}
                cat={cat}
                open={openIds.includes(cat.id)}
                onToggle={() => toggle(cat.id)}
              />
            ))}
          </div>

          <p className="mt-10 text-center font-serif text-base italic text-parchment/55">
            Please let your waiter know about any allergies before you order.
          </p>
        </div>
      </section>

      <Visit onReserve={() => setBookingOpen(true)} />

      <footer className="border-t border-gold/15 bg-ink px-5 py-10 text-center">
        <p className="font-serif text-2xl text-parchment">Fourteen on Chartwell</p>
        <p className="mt-2 text-sm text-parchment/50">
          {ADDRESS_LINE_1}, {ADDRESS_LINE_2}
        </p>
        <p className="mt-6 text-xs text-parchment/35">© {new Date().getFullYear()} 14 on Chartwell</p>
      </footer>

      <ReservationModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function Hero({ onReserve }: { onReserve: () => void }) {
  const reduce = useReducedMotion();
  return (
    <section id="top" className="relative z-10 flex min-h-[92vh] items-center overflow-hidden px-5 pb-16 pt-28">
      <motion.div
        aria-hidden
        className="absolute -inset-[20%] bg-[radial-gradient(circle_at_29%_71%,rgba(122,28,28,0.5),transparent_45%)]"
        animate={reduce ? undefined : { x: ["0%", "7%", "-4%", "0%"], y: ["0%", "-6%", "3%", "0%"], opacity: [0.75, 1, 0.8, 0.75] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -inset-[20%] bg-[radial-gradient(circle_at_75%_29%,rgba(28,58,39,0.65),transparent_42%)]"
        animate={reduce ? undefined : { x: ["0%", "-6%", "5%", "0%"], y: ["0%", "5%", "-4%", "0%"], opacity: [0.85, 0.65, 1, 0.85] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-end gap-12 md:grid-cols-[1.3fr_1fr]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <h1 className="font-serif text-[clamp(3.5rem,11vw,8.5rem)] font-semibold leading-[0.88] tracking-tight text-parchment">
            Fourteen
            <span className="block pl-[0.6em] font-normal italic text-gold">on Chartwell</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-parchment/75">
            Flame-grilled steaks, slow-cooked curries and a glowing onyx bar, a short walk from the
            Umhlanga promenade.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={onReserve}
              className="inline-flex items-center gap-2 bg-wine px-7 py-3.5 text-parchment shadow-[0_0_40px_-8px_rgba(212,175,55,0.5)] transition-colors hover:bg-[#8e2525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Calendar className="h-4 w-4" aria-hidden />
              Reserve a table
            </button>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 border border-parchment/30 px-7 py-3.5 text-parchment/90 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Utensils className="h-4 w-4" aria-hidden />
              See the menu
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease: EASE }}
          className="hidden md:block"
        >
          <DoubleFrame tone="gold" className="bg-ink/40 p-8 backdrop-blur-sm">
            <p className="font-serif text-2xl italic leading-snug text-parchment/90">
              “Twenty-one day aged rib-eye on the bone, a Lamb Shank that falls apart at the fork, and
              a Shishanyama platter built for the whole table.”
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-gold/90">
              <Sparkles className="h-4 w-4" aria-hidden />
              From tonight’s kitchen
            </div>
          </DoubleFrame>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Subtle gold glow that brightens as a section scrolls into view     */
/* ------------------------------------------------------------------ */
function SectionGlow({ className = "inset-y-0" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  const opacity = useTransform(p, [0, 0.45, 0.55, 1], [0.1, 1, 1, 0.2]);
  const scale = useTransform(p, [0, 0.5, 1], [0.6, 1.15, 0.8]);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-x-0 ${className}`}>
      <motion.div
        style={{ opacity, scale }}
        className="absolute left-1/2 top-1/2 h-[520px] w-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.45),rgba(212,175,55,0.12)_40%,transparent_70%)] blur-2xl"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The bar                                                            */
/* ------------------------------------------------------------------ */
function OnyxBar() {
  return (
    <section aria-label="The onyx bar" className="relative z-10 overflow-hidden px-5 py-28">
      <SectionGlow />
      <div className="relative mx-auto max-w-5xl">
        <Wine className="mx-auto mb-6 h-6 w-6 text-gold" aria-hidden />
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <h2 className="font-serif text-4xl leading-tight text-parchment md:text-5xl">
          Lit from within, poured with care.
        </h2>
        <p className="text-lg leading-relaxed text-parchment/70 md:pt-2">
          The backlit onyx bar is the heart of the room. Come early for a glass of red before
          dinner, or stay late once the kitchen has sent out its last plate.
        </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Accordion category                                                 */
/* ------------------------------------------------------------------ */
function CategoryPanel({
  cat,
  open,
  onToggle,
}: {
  cat: Category;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const panelId = `${cat.id}-panel`;
  return (
    <div id={cat.id} className="scroll-mt-36">
      <DoubleFrame className="bg-parchment text-ink shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)]">
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-wine md:px-9"
        >
          <span>
            <span className="block font-serif text-3xl font-semibold text-wine md:text-4xl">{cat.title}</span>
            {cat.note && (
              <span className="mt-1 block font-serif text-base italic text-forest/85">{cat.note}</span>
            )}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-wine/30 text-wine"
          >
            <ChevronDown className="h-5 w-5" aria-hidden />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-8 md:px-9">
                <div className="mb-6 h-px bg-linear-to-r from-transparent via-gold/70 to-transparent" />
                <div className={cat.groups.length > 2 ? "grid gap-x-12 gap-y-8 md:grid-cols-2" : "flex flex-col gap-8"}>
                  {cat.groups.map((g, gi) => (
                    <div key={gi} className={cat.groups.length > 2 && gi === cat.groups.length - 1 ? "md:col-span-2" : ""}>
                      {g.label && (
                        <h4 className="mb-3 font-serif text-xl italic text-forest">{g.label}</h4>
                      )}
                      <ul className={g.label === "Sides" ? "grid gap-x-12 md:grid-cols-2" : "flex flex-col"}>
                        {g.items.map((item, i) => (
                          <MenuRow key={`${item.name}-${i}`} item={item} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DoubleFrame>
    </div>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className={item.desc ? "py-3.5" : "py-2"}>
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-xl font-semibold text-ink">{item.name}</span>
        <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-wine/35" />
        <span className="font-serif text-xl font-semibold tabular-nums text-wine">{item.price}</span>
      </div>
      {item.desc && (
        <p className="mt-1 max-w-[62ch] font-serif text-[1.05rem] italic leading-relaxed text-ink/70">
          {item.desc}
        </p>
      )}
      {item.extra && <p className="mt-1 text-sm font-medium text-forest">{item.extra}</p>}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Visit                                                              */
/* ------------------------------------------------------------------ */
function Visit({ onReserve }: { onReserve: () => void }) {
  return (
    <section id="visit" className="relative z-10 scroll-mt-16 overflow-hidden bg-wine-deep px-5 py-24">
      <SectionGlow />
      <div className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <DoubleFrame tone="gold" className="p-7">
          <MapPin className="h-5 w-5 text-gold" aria-hidden />
          <h3 className="mt-4 font-serif text-2xl text-parchment">Find us</h3>
          <p className="mt-2 leading-relaxed text-parchment/75">
            {ADDRESS_LINE_1}
            <br />
            {ADDRESS_LINE_2}
          </p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-gold underline-offset-4 hover:underline">
            Open in Google Maps
          </a>
        </DoubleFrame>

        <DoubleFrame tone="gold" className="p-7">
          <Clock className="h-5 w-5 text-gold" aria-hidden />
          <h3 className="mt-4 font-serif text-2xl text-parchment">Opening hours</h3>
          <dl className="mt-2 flex flex-col gap-2">
            {HOURS.map((h) => (
              <div key={h.days} className="flex justify-between gap-4 text-parchment/75">
                <dt>{h.days}</dt>
                <dd className="tabular-nums text-parchment">{h.time}</dd>
              </div>
            ))}
          </dl>
        </DoubleFrame>

        <DoubleFrame tone="gold" className="p-7">
          <Phone className="h-5 w-5 text-gold" aria-hidden />
          <h3 className="mt-4 font-serif text-2xl text-parchment">Book or call</h3>
          <a href={PHONE_HREF} className="mt-2 block text-parchment/75 hover:text-gold">
            {PHONE_DISPLAY}
          </a>
          <button
            onClick={onReserve}
            className="mt-5 inline-flex items-center gap-2 bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-[#e3c45a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment"
          >
            <Calendar className="h-4 w-4" aria-hidden />
            Reserve a table
          </button>
        </DoubleFrame>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  WhatsApp reservation modal                                         */
/* ------------------------------------------------------------------ */
type Booking = { name: string; date: string; time: string; guests: string; notes: string };
const EMPTY: Booking = { name: "", date: "", time: "19:00", guests: "2", notes: "" };

function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Booking>(EMPTY);
  const [minDate, setMinDate] = useState<string>("");
  const [error, setError] = useState<string>("");
  const firstField = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMinDate(todayISO()), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstField.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const set = (k: keyof Booking) => (e: { target: { value: string } }) => {
    setError("");
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const send = () => {
    if (!form.name.trim()) return setError("Add the name the booking should be under.");
    if (!form.date) return setError("Choose a date for your visit.");
    if (minDate && form.date < minDate) return setError("Choose today or a later date.");

    const lines = [
      "Hello 14 on Chartwell, I'd like to reserve a table.",
      "",
      `Name: ${form.name.trim()}`,
      `Date: ${prettyDate(form.date)}`,
      `Time: ${form.time}`,
      `Guests: ${form.guests}`,
    ];
    if (form.notes.trim()) lines.push(`Notes: ${form.notes.trim()}`);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  const field =
    "w-full border border-wine/30 bg-white/70 px-3 py-2.5 text-ink outline-none transition-colors focus:border-wine focus:ring-2 focus:ring-gold/50";
  const label = "mb-1.5 flex items-center gap-2 text-sm font-medium text-forest";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto"
          >
            <DoubleFrame className="bg-parchment text-ink">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="booking-title" className="font-serif text-3xl font-semibold text-wine">
                      Reserve a table
                    </h2>
                    <p className="mt-1 font-serif text-base italic text-ink/65">
                      We’ll open WhatsApp with your request ready to send.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-full p-2 text-ink/60 hover:bg-wine/10 hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-wine"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  <div>
                    <label htmlFor="b-name" className={label}>Name</label>
                    <input id="b-name" ref={firstField} value={form.name} onChange={set("name")} autoComplete="name" className={field} placeholder="Name for the booking" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="b-date" className={label}>
                        <Calendar className="h-4 w-4" aria-hidden /> Date
                      </label>
                      <input id="b-date" type="date" min={minDate || undefined} value={form.date} onChange={set("date")} className={field} />
                    </div>
                    <div>
                      <label htmlFor="b-time" className={label}>
                        <Clock className="h-4 w-4" aria-hidden /> Time
                      </label>
                      <select id="b-time" value={form.time} onChange={set("time")} className={field}>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className={label}>
                      <Users className="h-4 w-4" aria-hidden /> Guests
                    </span>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Number of guests">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9+"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          role="radio"
                          aria-checked={form.guests === g}
                          onClick={() => set("guests")({ target: { value: g } })}
                          className={`h-10 min-w-10 border px-3 font-serif text-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                            form.guests === g
                              ? "border-wine bg-wine text-parchment"
                              : "border-wine/30 text-ink hover:border-wine"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="b-notes" className={label}>
                      <Sparkles className="h-4 w-4" aria-hidden /> Occasion or requests
                    </label>
                    <textarea id="b-notes" rows={3} value={form.notes} onChange={set("notes")} className={`${field} resize-none`} placeholder="Birthday, anniversary, a table near the bar…" />
                  </div>

                  {error && (
                    <p role="alert" className="text-sm font-medium text-wine">{error}</p>
                  )}

                  <button
                    onClick={send}
                    className="mt-2 inline-flex items-center justify-center gap-2 bg-forest px-6 py-3.5 text-parchment transition-colors hover:bg-[#244b33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Send request on WhatsApp
                  </button>
                  <p className="text-center text-xs text-ink/55">
                    Your table is confirmed once we reply on WhatsApp.
                  </p>
                </div>
              </div>
            </DoubleFrame>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
