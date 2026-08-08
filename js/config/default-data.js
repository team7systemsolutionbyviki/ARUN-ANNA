/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - DEFAULT CONFIGURATION & SEED DATA
   ========================================================================== */

export const DEFAULT_SETTINGS = {
  shopName: "TEAM 7 SYSTEM SOLUTION",
  tagline: "Premium Online Printing & Document Solutions",
  logoText: "T7",
  phone: "+91 97891 23456",
  altPhone: "+91 98765 43210",
  email: "orders@team7system.com",
  address: "No. 45, Tech Park Road, Near Main Bus Stand, Sector 7, Chennai, Tamil Nadu - 600001",
  googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6262444358!2d80.22!3d13.06!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzM2LjAiTiA4MMKwMTMnMTIgMCJF!5e0!3m2!1sen!2sin!4v1625000000000!5m2!1sen!2sin",
  upiId: "9789123456@upi",
  merchantName: "TEAM 7 SYSTEM SOLUTION",
  qrCodeUrl: "", // Will fall back to canvas generator
  gstNumber: "33AAAAA0000A1Z5",
  gstPercentage: 18,
  businessHours: "Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 6:00 PM",
  whatsappNumber: "919789123456",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com"
  }
};

export const DEFAULT_PRICING = {
  paperSizes: {
    "A4": { baseRate: 1.50, label: "A4 Standard (210 x 297 mm)" },
    "A5": { baseRate: 1.00, label: "A5 Compact (148 x 210 mm)" },
    "Legal": { baseRate: 2.00, label: "Legal Document (216 x 356 mm)" },
    "Letter": { baseRate: 1.50, label: "Letter Size (216 x 279 mm)" },
    "A3": { baseRate: 4.00, label: "A3 Large (297 x 420 mm)" }
  },
  paperQualities: {
    "70 GSM": { multiplier: 1.0, label: "70 GSM Standard Paper" },
    "80 GSM": { multiplier: 1.2, label: "80 GSM Executive Bond" },
    "100 GSM": { multiplier: 1.6, label: "100 GSM Heavy Paper" },
    "Glossy": { multiplier: 2.5, label: "Photo Glossy Paper" },
    "Matt": { multiplier: 2.2, label: "Premium Matt Paper" }
  },
  colorModes: {
    "Black & White": { costPerPage: 1.50 },
    "Color": { costPerPage: 6.00 }
  },
  sides: {
    "Single": { multiplier: 1.0 },
    "Double": { multiplier: 1.8 } // Slight discount for double side
  },
  bindings: {
    "None": { price: 0 },
    "Spiral": { price: 35.00 },
    "Soft": { price: 65.00 },
    "Hard": { price: 140.00 }
  },
  lamination: {
    "No": { pricePerPage: 0 },
    "Yes": { pricePerPage: 12.00 }
  },
  deliveryZones: {
    "Pickup": { fee: 0, label: "Store Pickup (Self Collection - Free)" },
    "Zone 1 (Anna Nagar / Nearby)": { fee: 30.00, label: "Local Area Zone 1 (Within 5 km) - ₹30" },
    "Zone 2 (Velachery / Central)": { fee: 50.00, label: "City Area Zone 2 (5-12 km) - ₹50" },
    "Zone 3 (Tambaram / Suburbs)": { fee: 80.00, label: "Extended Area Zone 3 (12-20 km) - ₹80" },
    "Express Urgent Doorstep": { fee: 120.00, label: "Express Same-Day Priority Delivery - ₹120" }
  }
};

export const DEFAULT_SERVICES = [
  {
    id: "doc-print",
    title: "Document Printing",
    description: "High-speed B&W and vivid Color printing for reports, projects, and contracts.",
    icon: "📄",
    popular: true,
    startingPrice: "₹1.50 / page"
  },
  {
    id: "binding",
    title: "Professional Binding",
    description: "Spiral, Soft Cover, and Luxury Hard Bound binding for theses and manuals.",
    icon: "📚",
    popular: true,
    startingPrice: "₹35.00 / book"
  },
  {
    id: "lamination",
    title: "Document Lamination",
    description: "Waterproof protective thermal lamination for certificates & ID cards.",
    icon: "🛡️",
    popular: false,
    startingPrice: "₹12.00 / page"
  },
  {
    id: "poster-print",
    title: "Posters & Architectural Prints",
    description: "A3/A2 high-resolution photo poster and CAD drawing printing.",
    icon: "🖼️",
    popular: false,
    startingPrice: "₹4.00 / page"
  },
  {
    id: "visiting-card",
    title: "Business Cards",
    description: "Premium matte and velvet laminated business card printing.",
    icon: "📇",
    popular: true,
    startingPrice: "₹350 / 100 cards"
  },
  {
    id: "certificate",
    title: "Certificates & Flyers",
    description: "Heavy 300 GSM cardstock printing for achievements and promotion.",
    icon: "🎓",
    popular: false,
    startingPrice: "₹15.00 / card"
  }
];

const SAMPLE_PDF_PREVIEW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:%23ffffff; font-family:sans-serif;"><rect width="600" height="800" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="720" rx="12" fill="white" stroke="%23cbd5e1" stroke-width="2"/><text x="70" y="100" font-size="24" font-weight="bold" fill="%231e293b">Project Final Report</text><text x="70" y="130" font-size="14" fill="%2364748b">Anna University - Department of Computer Science</text><line x1="70" y1="150" x2="530" y2="150" stroke="%23e2e8f0" stroke-width="2"/><rect x="70" y="180" width="460" height="12" rx="4" fill="%23cbd5e1"/><rect x="70" y="205" width="420" height="12" rx="4" fill="%23e2e8f0"/><rect x="70" y="230" width="440" height="12" rx="4" fill="%23e2e8f0"/><rect x="70" y="255" width="380" height="12" rx="4" fill="%23e2e8f0"/><rect x="70" y="300" width="220" height="140" rx="8" fill="%23eff6ff" stroke="%233b82f6" stroke-dasharray="4"/><text x="110" y="375" font-size="14" fill="%232563eb">Figure 1. Diagram</text><rect x="310" y="300" width="220" height="140" rx="8" fill="%23f0fdf4" stroke="%2322c55e" stroke-dasharray="4"/><text x="350" y="375" font-size="14" fill="%2316a34a">Table 1. Results</text></svg>`;

const SAMPLE_SCREENSHOT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" style="background:%230f172a; font-family:sans-serif;"><rect width="400" height="600" fill="%230f172a"/><rect x="20" y="20" width="360" height="560" rx="20" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="200" cy="90" r="35" fill="%2310b981"/><text x="200" y="100" font-size="36" text-anchor="middle" fill="white">✓</text><text x="200" y="155" font-size="18" font-weight="bold" text-anchor="middle" fill="white">Payment Successful</text><text x="200" y="180" font-size="13" text-anchor="middle" fill="%2394a3b8">Paid to TEAM 7 SYSTEM SOLUTION</text><text x="200" y="235" font-size="32" font-weight="800" text-anchor="middle" fill="%2338bdf8">₹225.97</text><rect x="40" y="270" width="320" height="240" rx="12" fill="%230f172a" stroke="%23334155"/><text x="60" y="310" font-size="12" fill="%2394a3b8">UPI Ref / UTR No.</text><text x="60" y="335" font-size="16" font-weight="bold" fill="%23f8fafc" font-family="monospace">329817264512</text><text x="60" y="380" font-size="12" fill="%2394a3b8">From Google Pay UPI</text><text x="60" y="405" font-size="15" font-weight="bold" fill="%23f8fafc">Rajesh Kumar</text><text x="60" y="450" font-size="12" fill="%2394a3b8">Merchant UPI ID</text><text x="60" y="475" font-size="14" fill="%2338bdf8">9789123456@upi</text></svg>`;

const SAMPLE_SCREENSHOT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" style="background:%230f172a; font-family:sans-serif;"><rect width="400" height="600" fill="%230f172a"/><rect x="20" y="20" width="360" height="560" rx="20" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="200" cy="90" r="35" fill="%233b82f6"/><text x="200" y="100" font-size="36" text-anchor="middle" fill="white">✓</text><text x="200" y="155" font-size="18" font-weight="bold" text-anchor="middle" fill="white">PhonePe Transfer Done</text><text x="200" y="180" font-size="13" text-anchor="middle" fill="%2394a3b8">Paid to TEAM 7 SYSTEM SOLUTION</text><text x="200" y="235" font-size="32" font-weight="800" text-anchor="middle" fill="%2338bdf8">₹395.30</text><rect x="40" y="270" width="320" height="240" rx="12" fill="%230f172a" stroke="%23334155"/><text x="60" y="310" font-size="12" fill="%2394a3b8">UPI Ref / UTR No.</text><text x="60" y="335" font-size="16" font-weight="bold" fill="%23f8fafc" font-family="monospace">482910394812</text><text x="60" y="380" font-size="12" fill="%2394a3b8">From PhonePe UPI</text><text x="60" y="405" font-size="15" font-weight="bold" fill="%23f8fafc">Priya Sundaram</text><text x="60" y="450" font-size="12" fill="%2394a3b8">Merchant UPI ID</text><text x="60" y="475" font-size="14" fill="%2338bdf8">9789123456@upi</text></svg>`;

export const INITIAL_ORDERS = [
  {
    id: "ORD-2026-1001",
    customerName: "Rajesh Kumar",
    customerPhone: "9876543210",
    customerEmail: "rajesh.k@example.com",
    customerAddress: "12, MG Road, Anna Nagar, Chennai",
    files: [
      { name: "Project_Final_Report.pdf", size: "4.2 MB", pages: 45, url: SAMPLE_PDF_PREVIEW, options: { paperSize: "A4", paperQuality: "80 GSM", colorMode: "Black & White", printSide: "Double", copies: 2, binding: "Spiral" } },
      { name: "Executive_Summary_Appendix.pdf", size: "1.8 MB", pages: 12, url: SAMPLE_PDF_PREVIEW, options: { paperSize: "A4", paperQuality: "70 GSM", colorMode: "Color", printSide: "Single", copies: 2, binding: "None" } }
    ],
    options: {
      paperSize: "A4",
      paperQuality: "80 GSM",
      colorMode: "Black & White",
      printSide: "Double",
      orientation: "Portrait",
      copies: 2,
      binding: "Spiral",
      lamination: "No",
      notes: "Please add clear cover in front."
    },
    pricing: {
      paperCost: 121.50,
      colorCost: 0,
      bindingCost: 70.00,
      laminationCost: 0,
      deliveryFee: 30.00,
      deliveryZone: "Zone 1 (Anna Nagar / Nearby)",
      subtotal: 221.50,
      gst: 34.47,
      discount: 0,
      total: 225.97
    },
    payment: {
      method: "UPI QR",
      utr: "329817264512",
      payerName: "Rajesh Kumar",
      screenshotUrl: SAMPLE_SCREENSHOT_1,
      status: "Verified"
    },
    status: "Printing",
    createdAt: "2026-08-07T14:30:00Z",
    estimatedReady: "2026-08-08T11:00:00Z"
  },
  {
    id: "ORD-2026-1002",
    customerName: "Priya Sundaram",
    customerPhone: "9123456789",
    customerEmail: "priya.s@example.com",
    customerAddress: "Flat 4B, Lotus Apartments, Velachery, Chennai",
    files: [
      { name: "Design_Portfolio.pdf", size: "12.8 MB", pages: 20, url: SAMPLE_PDF_PREVIEW, options: { paperSize: "A4", paperQuality: "Glossy", colorMode: "Color", printSide: "Single", copies: 1, binding: "Hard" } },
      { name: "Client_Testimonials.pdf", size: "2.4 MB", pages: 8, url: SAMPLE_PDF_PREVIEW, options: { paperSize: "A4", paperQuality: "80 GSM", colorMode: "Black & White", printSide: "Single", copies: 1, binding: "None" } },
      { name: "Certifications_Certificate.pdf", size: "1.1 MB", pages: 5, url: SAMPLE_PDF_PREVIEW, options: { paperSize: "A4", paperQuality: "Matt", colorMode: "Color", printSide: "Single", copies: 1, binding: "None" } }
    ],
    options: {
      paperSize: "A4",
      paperQuality: "Glossy",
      colorMode: "Color",
      printSide: "Single",
      orientation: "Landscape",
      copies: 1,
      binding: "Hard",
      lamination: "No",
      notes: "High quality color calibration needed."
    },
    pricing: {
      paperCost: 75.00,
      colorCost: 120.00,
      bindingCost: 140.00,
      laminationCost: 0,
      deliveryFee: 50.00,
      deliveryZone: "Zone 2 (Velachery / Central)",
      subtotal: 385.00,
      gst: 60.30,
      discount: 0,
      total: 395.30
    },
    payment: {
      method: "UPI QR",
      utr: "482910394812",
      payerName: "Priya S",
      screenshotUrl: SAMPLE_SCREENSHOT_2,
      status: "Waiting Verification"
    },
    status: "Waiting Verification",
    createdAt: "2026-08-07T18:15:00Z",
    estimatedReady: "2026-08-08T16:00:00Z"
  }
];

export const FAQS = [
  {
    q: "How fast can I get my printed documents?",
    a: "Standard print orders are usually completed within 2 to 4 hours. Express same-day pickup and delivery options are available for urgent orders."
  },
  {
    q: "What file formats do you accept for upload?",
    a: "We support PDF, Microsoft Word (.docx), Excel (.xlsx), PowerPoint (.pptx), JPG, PNG, and ZIP archives up to 200MB."
  },
  {
    q: "How does the Business UPI QR payment work?",
    a: "Once you configure your print options, our system generates a dynamic UPI QR Code with your exact order total. Scan it using Google Pay, PhonePe, Paytm, or any UPI app, complete the transfer, and enter your 12-digit UTR/Ref number."
  },
  {
    q: "Can I inspect the status of my print order?",
    a: "Yes! Use the 'Track Order' page and enter your Order ID or registered Phone Number to view real-time progression from Pending to Printing and Pickup."
  }
];
