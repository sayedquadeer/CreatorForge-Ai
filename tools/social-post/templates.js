/**
 * Original Social Media Templates configuration for CreatorForge AI
 */

const SOCIAL_PRESETS = {
  insta_square: { name: "Instagram Square", width: 1080, height: 1080, ratio: "1:1" },
  insta_portrait: { name: "Instagram Portrait", width: 1080, height: 1350, ratio: "4:5" },
  insta_story: { name: "Instagram Story", width: 1080, height: 1920, ratio: "9:16" },
  facebook_post: { name: "Facebook Post", width: 1200, height: 630, ratio: "1.91:1" },
  x_post: { name: "X / Twitter Post", width: 1600, height: 900, ratio: "16:9" },
  linkedin_post: { name: "LinkedIn Post", width: 1200, height: 627, ratio: "1.91:1" },
  yt_community: { name: "YouTube Community", width: 1200, height: 675, ratio: "16:9" }
};

const SOCIAL_TEMPLATES = [
  {
    id: "tmpl_1",
    name: "Minimal Quote",
    category: "Motivational",
    bg: "#0f172a",
    objects: [
      { type: "rect", left: 100, top: 100, width: 880, height: 880, fill: "transparent", stroke: "#38bdf8", strokeWidth: 4 },
      { type: "text", text: "“DO WHAT FEELS\nLIMITLESS”", left: 540, top: 480, fontSize: 64, fontFamily: "Anton", fill: "#ffffff", align: "center" },
      { type: "text", text: "@creatorforge_ai", left: 540, top: 850, fontSize: 24, fontFamily: "Inter", fill: "#38bdf8", align: "center" }
    ]
  },
  {
    id: "tmpl_2",
    name: "Tech Announcement",
    category: "Technology",
    bg: "#1e1b4b",
    objects: [
      { type: "rect", left: 0, top: 0, width: 1080, height: 200, fill: "#4338ca" },
      { type: "text", text: "NEW FEATURE RELEASE", left: 540, top: 80, fontSize: 36, fontFamily: "Montserrat", fill: "#e0e7ff", align: "center" },
      { type: "text", text: "AI POWERED\nDESIGN", left: 540, top: 450, fontSize: 80, fontFamily: "Bebas Neue", fill: "#a5f3fc", align: "center" },
      { type: "rect", left: 340, top: 720, width: 400, height: 80, fill: "#06b6d4", rx: 12 }
    ]
  },
  {
    id: "tmpl_3",
    name: "Business Webinar",
    category: "Business",
    bg: "#111827",
    objects: [
      { type: "rect", left: 80, top: 80, width: 920, height: 220, fill: "#1f2937", rx: 16 },
      { type: "text", text: "LIVE WEBINAR", left: 120, top: 140, fontSize: 32, fontFamily: "Poppins", fill: "#f59e0b", align: "left" },
      { type: "text", text: "Scaling SaaS in 2026", left: 120, top: 200, fontSize: 44, fontFamily: "Inter", fill: "#ffffff", align: "left" },
      { type: "circle", left: 540, top: 600, radius: 180, fill: "#374151" }
    ]
  },
  {
    id: "tmpl_4",
    name: "Flash Sale Promo",
    category: "Promotional",
    bg: "#831843",
    objects: [
      { type: "text", text: "MEGA SALE", left: 540, top: 250, fontSize: 96, fontFamily: "Anton", fill: "#fbcfe8", align: "center" },
      { type: "text", text: "50% OFF", left: 540, top: 480, fontSize: 130, fontFamily: "Bebas Neue", fill: "#f43f5e", align: "center" },
      { type: "rect", left: 240, top: 750, width: 600, height: 100, fill: "#ffffff", rx: 50 },
      { type: "text", text: "SHOP NOW", left: 540, top: 780, fontSize: 36, fontFamily: "Montserrat", fill: "#831843", align: "center" }
    ]
  },
  {
    id: "tmpl_5",
    name: "Gaming Tournament",
    category: "Gaming",
    bg: "#020617",
    objects: [
      { type: "triangle", left: 540, top: 300, width: 500, height: 400, fill: "#a855f7" },
      { type: "text", text: "CHAMPIONSHIP", left: 540, top: 550, fontSize: 72, fontFamily: "Anton", fill: "#22d3ee", align: "center" },
      { type: "text", text: "PRIZE POOL $10,000", left: 540, top: 700, fontSize: 32, fontFamily: "Oswald", fill: "#ffffff", align: "center" }
    ]
  },
  {
    id: "tmpl_6",
    name: "Educational Tip",
    category: "Education",
    bg: "#064e3b",
    objects: [
      { type: "rect", left: 100, top: 150, width: 880, height: 120, fill: "#047857", rx: 8 },
      { type: "text", text: "TIP OF THE DAY", left: 540, top: 190, fontSize: 36, fontFamily: "Montserrat", fill: "#a7f3d0", align: "center" },
      { type: "text", text: "Consistency beats\nintensity every time.", left: 540, top: 500, fontSize: 52, fontFamily: "Poppins", fill: "#ffffff", align: "center" }
    ]
  },
  {
    id: "tmpl_7",
    name: "Creator Milestone",
    category: "Creator",
    bg: "#4c1d95",
    objects: [
      { type: "text", text: "THANK YOU!", left: 540, top: 250, fontSize: 84, fontFamily: "Bebas Neue", fill: "#ddd6fe", align: "center" },
      { type: "text", text: "100K", left: 540, top: 500, fontSize: 160, fontFamily: "Anton", fill: "#c084fc", align: "center" },
      { type: "text", text: "SUBSCRIBERS", left: 540, top: 720, fontSize: 40, fontFamily: "Montserrat", fill: "#ffffff", align: "center" }
    ]
  },
  {
    id: "tmpl_8",
    name: "Instagram Story Highlight",
    category: "Instagram",
    bg: "#0f172a",
    objects: [
      { type: "circle", left: 540, top: 400, radius: 200, fill: "#1e293b", stroke: "#38bdf8", strokeWidth: 8 },
      { type: "text", text: "NEW POST", left: 540, top: 750, fontSize: 48, fontFamily: "Oswald", fill: "#ffffff", align: "center" }
    ]
  },
  {
    id: "tmpl_9",
    name: "Podcast Episode",
    category: "Creator",
    bg: "#18181b",
    objects: [
      { type: "rect", left: 0, top: 800, width: 1080, height: 280, fill: "#27272a" },
      { type: "text", text: "EPISODE #42", left: 100, top: 860, fontSize: 28, fontFamily: "Inter", fill: "#a1a1aa", align: "left" },
      { type: "text", text: "The Future of Web Development", left: 100, top: 920, fontSize: 40, fontFamily: "Poppins", fill: "#ffffff", align: "left" }
    ]
  },
  {
    id: "tmpl_10",
    name: "Product Showcase",
    category: "Promotional",
    bg: "#1e293b",
    objects: [
      { type: "rect", left: 140, top: 140, width: 800, height: 600, fill: "#334155", rx: 20 },
      { type: "text", text: "SMART WATCH ULTRA", left: 540, top: 820, fontSize: 48, fontFamily: "Montserrat", fill: "#38bdf8", align: "center" }
    ]
  },
  {
    id: "tmpl_11",
    name: "Daily Motivation",
    category: "Motivational",
    bg: "#2e1065",
    objects: [
      { type: "text", text: "FOCUS ON THE\nPROCESS", left: 540, top: 450, fontSize: 72, fontFamily: "Anton", fill: "#e9d5ff", align: "center" },
      { type: "rect", left: 440, top: 680, width: 200, height: 6, fill: "#c084fc" }
    ]
  },
  {
    id: "tmpl_12",
    name: "Simple Infographic Header",
    category: "Education",
    bg: "#0f172a",
    objects: [
      { type: "rect", left: 60, top: 60, width: 960, height: 160, fill: "#0284c7", rx: 12 },
      { type: "text", text: "5 STEPS TO BETTER UI DESIGN", left: 540, top: 110, fontSize: 38, fontFamily: "Inter", fill: "#ffffff", align: "center" }
    ]
  }
];
