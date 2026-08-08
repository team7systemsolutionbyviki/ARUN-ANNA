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

export const INITIAL_ORDERS = [
  {
    id: "ORD-2026-1001",
    customerName: "Rajesh Kumar",
    customerPhone: "9876543210",
    customerEmail: "rajesh.k@example.com",
    customerAddress: "12, MG Road, Anna Nagar, Chennai",
    files: [
      { name: "Project_Final_Report.pdf", size: "4.2 MB", pages: 45 }
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
      subtotal: 191.50,
      gst: 34.47,
      discount: 0,
      total: 225.97
    },
    payment: {
      method: "UPI QR",
      utr: "329817264512",
      payerName: "Rajesh Kumar",
      screenshotUrl: "https://via.placeholder.com/300x500?text=Payment+Screenshot",
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
      { name: "Design_Portfolio.pdf", size: "12.8 MB", pages: 20 }
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
      subtotal: 335.00,
      gst: 60.30,
      discount: 0,
      total: 395.30
    },
    payment: {
      method: "UPI QR",
      utr: "482910394812",
      payerName: "Priya S",
      screenshotUrl: "https://via.placeholder.com/300x500?text=UPI+Receipt",
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
