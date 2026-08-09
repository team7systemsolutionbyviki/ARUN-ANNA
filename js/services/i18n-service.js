/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - I18N & TRANSLATION SERVICE
   ========================================================================== */

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English 🇬🇧' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', label: 'தமிழ் (Tamil) 🇮🇳' },
  { code: 'tanglish', name: 'Thanglish', flag: '🗣️', label: 'Thanglish 🗣️' }
];

export const TRANSLATIONS = {
  en: {
    // Navbar
    nav_home: 'Home',
    nav_services: 'Services',
    nav_pricing: 'Price List',
    nav_how_it_works: 'How It Works',
    nav_order: 'Order Print',
    nav_track: 'Track Order',
    nav_faq: 'FAQ',
    nav_contact: 'Contact',
    nav_print_now: 'Print Now',
    nav_my_dashboard: 'My Dashboard',

    // Hero Section
    hero_badge: '⚡ Instant Online Document Printing',
    hero_title: 'High Quality Printing Delivered Right To Your Doorstep',
    hero_subtitle: 'Upload your documents, customize paper GSM, color & binding options, pay securely via Business UPI QR, and get your prints fast!',
    btn_print_now: '🖨️ Print Documents Now',
    btn_track_order: '🔍 Track Your Order',
    stat_completed: '15,000+ Orders Completed',
    stat_quality: '100% Quality Guaranteed',
    stat_speed: '2 - 4 Hrs Fast Pickup Time',

    // Privacy Guarantee
    privacy_title: '🔒 100% Privacy & Automatic File Deletion Guarantee',
    privacy_desc: 'Once your PDF is uploaded, after your document is Printed & Completed or Rejected, your PDF file is automatically deleted from our servers for complete confidentiality and data safety.',

    // Quick Calculator
    calc_title: '⚡ Quick Print Calculator',
    calc_size: 'Paper Size',
    calc_color: 'Color Mode',
    calc_pages: 'Total Pages',
    calc_binding: 'Binding Option',
    calc_what_is_binding: 'ℹ️ What is binding?',
    calc_estimated: 'Estimated Price Total:',
    calc_order_btn: '🚀 Proceed to Order Document →',
    color_bw: 'Black & White',
    color_full: 'Full Color',
    color_split: '🎨 Custom Split (Color & B&W)',

    // How It Works
    how_it_works_title: 'How Ordering Works',
    how_it_works_sub: '4 simple steps to get your documents printed effortlessly.',
    step1_title: '1. Upload Files',
    step1_desc: 'Drop PDF, Word, Excel, PowerPoint or Image files up to 200MB.',
    step2_title: '2. Customize Options',
    step2_desc: 'Select paper size (A4, A3), GSM, B&W/Color, and binding type.',
    step3_title: '3. Pay via UPI QR',
    step3_desc: 'Scan merchant Business UPI QR code with GPay, PhonePe or Paytm.',
    step4_title: '4. Delivery / Pickup',
    step4_desc: 'Get fast doorstep delivery or quick 2-hour store pickup.',

    // Order Wizard
    wizard_step1: 'Step 1: Upload Documents',
    wizard_step2: 'Step 2: Contact & Delivery Details',
    wizard_step3: 'Step 3: Business UPI Payment',
    pdf_only_title: '⚠️ Only PDF Files Accepted (Word, Excel, PPT & Images Not Allowed)',
    pdf_only_desc: 'Word (.doc / .docx), Excel (.xls / .xlsx), PowerPoint (.ppt / .pptx) and Image files are NOT accepted. Please convert your Word, Excel, PPT or Image files to PDF format first (File → Save As → PDF or export to PDF) then upload the PDF here.',
    upload_drop: '📤 Drag & Drop PDF Documents Here or Click to Browse',
    upload_note: 'Supported file type: PDF (Max 50MB per file). Auto page calculation enabled.',
    specifications: 'Specifications & Options for File:',
    copies: 'Copies',
    pages_to_print: '📄 Pages to Print',
    special_instructions: 'Special Instructions for this file',

    // Print Options Labels
    paper_quality: 'Paper Quality',
    print_side: 'Print Side',
    orientation: 'Orientation',
    single_side: 'Single Side',
    double_side: 'Double Side',
    portrait: 'Portrait',
    landscape: 'Landscape',
    lamination_label: 'Finishing / Lamination',

    // Customer Form
    cust_name_label: 'Full Name *',
    cust_phone_label: 'Mobile Phone Number *',
    delivery_zone_label: 'Delivery Zone / Store Pickup *',
    delivery_address_label: 'Delivery Address (Optional for Pickup)',
    back_btn: '← Back',
    proceed_payment: 'Proceed to UPI Payment →',

    // Payment Step
    payment_heading: 'Business UPI QR Payment',
    payment_sub: 'Scan the merchant QR code with Google Pay, PhonePe, Paytm or BHIM UPI to complete payment.',
    instructions_title: '💡 Payment Instructions:',
    utr_label: '12-Digit UTR / UPI Ref Number *',
    payer_name_label: 'Payer Name / UPI Account Name *',
    screenshot_label: 'Upload Payment Screenshot (Optional)',
    submit_order: '🚀 Submit Order & Payment',

    // Price Summary Box
    summary_title: 'Order Price Summary',
    summary_printing: 'Printing:',
    summary_color_extra: 'Color Printing Extra:',
    summary_binding: 'Binding Cost:',
    summary_lamination: 'Lamination:',
    summary_delivery: 'Delivery Charge:',
    summary_grand_total: 'Grand Total:',
    btn_proceed_contact: 'Continue to Contact Details →',

    // Track Order Page
    track_title: '🔍 Track Your Live Order Status',
    track_subtitle: 'Enter your Order ID (e.g. T7-1001) or Phone Number to view live printing status, delivery tracking, and invoice.',
    track_order_id: 'Order ID (e.g. T7-1001)',
    track_phone: 'Registered Mobile Number',
    track_btn: '🔍 Track Status',

    // Services Page
    services_heading: 'Our Professional Printing Services',
    services_subheading: 'High quality document printing, thesis hardbound binding, custom offset prints, laminated project reports, and store pickup options.',

    // Price List Page
    pricing_heading: 'Complete Transparent Price List',
    pricing_subheading: 'Dynamic rates calculated live based on paper size, paper GSM quality, color pages, binding types, and lamination options.',

    // FAQ Page
    faq_heading: 'Frequently Asked Questions',
    faq_subheading: 'Everything you need to know about document upload, privacy, printing quality, delivery zones, and UPI payments.',

    // Contact Page
    contact_heading: 'Get In Touch With Us',
    contact_subheading: 'Need help with your print order or custom business inquiries? Contact us via WhatsApp or Phone call.',

    // Footer
    footer_quick_links: 'Quick Links',
    footer_contact_info: 'Contact Information',
    footer_hours: 'Shop Business Hours',
    footer_copyright: 'All Rights Reserved.'
  },

  ta: {
    // Navbar
    nav_home: 'முகப்பு',
    nav_services: 'சேவைகள்',
    nav_pricing: 'விலைப்பட்டியல்',
    nav_how_it_works: 'செயல்படும் முறை',
    nav_order: 'ஆர்டர் செய்ய',
    nav_track: 'ஆர்டர் நிலை',
    nav_faq: 'கேள்விகள்',
    nav_contact: 'தொடர்பு',
    nav_print_now: 'அச்சிடுக',
    nav_my_dashboard: 'என் முகப்பு',

    // Hero Section
    hero_badge: '⚡ உடனடி ஆன்லைன் ஆவண அச்சிடுதல்',
    hero_title: 'உயர்தர அச்சிடுதல் உங்கள் கதவிற்கே நேரடியாக',
    hero_subtitle: 'உங்கள் ஆவணங்களை பதிவேற்றவும், காகிதம், வண்ணம் மற்றும் பிணைப்பு விருப்பங்களை தேர்வுசெய்து, UPI QR மூலம் பாதுகாப்பாக செலுத்தி விரைவாக பெறுங்கள்!',
    btn_print_now: '🖨️ ஆவணங்களை அச்சிடுக',
    btn_track_order: '🔍 ஆர்டர் நிலை பார்க்க',
    stat_completed: '15,000+ வெற்றிகரமான ஆர்டர்கள்',
    stat_quality: '100% தரம் உத்தரவாதம்',
    stat_speed: '2 - 4 மணி நேரத்தில் தயார்',

    // Privacy Guarantee
    privacy_title: '🔒 100% தனியுரிமை & தானியங்கி கோப்பு நீக்கல் உத்தரவாதம்',
    privacy_desc: 'உங்கள் PDF பதிவேற்றப்பட்டதும், அச்சிடப்பட்ட பிறகு அல்லது நிராகரிக்கப்பட்ட பிறகு, உங்கள் கோப்பு எங்கள் சர்வரிலிருந்து தானாகவே நீக்கப்படும்.',

    // Quick Calculator
    calc_title: '⚡ விரைவு அச்சு கணக்கீட்டான்',
    calc_size: 'காகித அளவு',
    calc_color: 'வண்ண முறை',
    calc_pages: 'மொத்த பக்கங்கள்',
    calc_binding: 'பிணைப்பு விருப்பம்',
    calc_what_is_binding: 'ℹ️ பிணைப்பு என்றால் என்ன?',
    calc_estimated: 'மதிப்பிடப்பட்ட மொத்த விலை:',
    calc_order_btn: '🚀 ஆர்டர் செய்ய தொடரவும் →',
    color_bw: 'கருப்பு & வெள்ளை',
    color_full: 'முழு வண்ணம்',
    color_split: '🎨 தனிப்பயன் வண்ணப் பிரிவு',

    // How It Works
    how_it_works_title: 'ஆர்டர் செய்யும் எளிய முறை',
    how_it_works_sub: '4 எளிய படிகளில் உங்கள் ஆவணங்களை அச்சிடுங்கள்.',
    step1_title: '1. கோப்புகளை பதிவேற்றவும்',
    step1_desc: 'PDF, Word, Excel அல்லது பட கோப்புகளை பதிவேற்றவும்.',
    step2_title: '2. விருப்பங்களை அமைக்கவும்',
    step2_desc: 'காகித அளவு, GSM, வண்ணம் மற்றும் பைண்டிங் வகையை தேர்ந்தெடுக்கவும்.',
    step3_title: '3. UPI QR மூலம் செலுத்துங்கள்',
    step3_desc: 'GPay, PhonePe அல்லது Paytm மூலம் UPI QR ஸ்கேன் செய்து செலுத்துங்கள்.',
    step4_title: '4. டெலிவரி / கடை பெறல்',
    step4_desc: 'வீட்டு டெலிவரி அல்லது 2 மணி நேரத்தில் கடை பெறல்.',

    // Order Wizard
    wizard_step1: 'படி 1: ஆவணங்களை பதிவேற்றவும்',
    wizard_step2: 'படி 2: தொடர்பு விவரங்கள் & டெலிவரி',
    wizard_step3: 'படி 3: வணிக UPI செலுத்துதல்',
    pdf_only_title: '⚠️ PDF கோப்புகள் மட்டுமே ஏற்கப்படும் (Word, Excel, PPT & படங்கள் ஏற்கப்படாது)',
    pdf_only_desc: 'Word (.doc / .docx), Excel (.xls / .xlsx), PowerPoint (.ppt / .pptx) மற்றும் பட கோப்புகள் ஏற்கப்படாது. உங்கள் கோப்புகளை முதலில் PDF வடிவத்திற்கு மாற்றி (File → Save As → PDF), பின்னர் இங்கு பதிவேற்றவும்.',
    upload_drop: '📤 PDF ஆவணங்களை இங்கே இழுத்து இடவும் அல்லது உலாவ கிளிக் செய்யவும்',
    upload_note: 'ஆதரிக்கப்படும் கோப்பு: PDF (அதிகபட்சம் 50MB). தானியங்கி பக்க கணக்கீடு செயல்படுத்தப்பட்டது.',
    specifications: 'கோப்பிற்கான விவரக்குறிப்புகள்:',
    copies: 'பிரதிகள்',
    pages_to_print: '📄 அச்சிடப்பட வேண்டிய பக்கங்கள்',
    special_instructions: 'சிறப்பு அறிவுறுத்தல்கள்',

    // Print Options Labels
    paper_quality: 'காகித தரம்',
    print_side: 'அச்சு பக்கம்',
    orientation: 'திசைவேகம்',
    single_side: 'ஒரு பக்கம்',
    double_side: 'இரு பக்கம்',
    portrait: 'செங்குத்து (Portrait)',
    landscape: 'கிடைமட்டம் (Landscape)',
    lamination_label: 'லேமினேஷன் / பூச்சு',

    // Customer Form
    cust_name_label: 'முழு பெயர் *',
    cust_phone_label: 'கைபேசி எண் *',
    delivery_zone_label: 'டெலிவரி மண்டலம் / கடை பெறல் *',
    delivery_address_label: 'டெலிவரி முகவரி (கடை பெறலுக்கு தேவையில்லை)',
    back_btn: '← பின்செல்க',
    proceed_payment: 'UPI செலுத்துதலுக்கு செல்லவும் →',

    // Payment Step
    payment_heading: 'வணிக UPI QR செலுத்துதல்',
    payment_sub: 'GPay, PhonePe, Paytm அல்லது BHIM UPI மூலம் ஸ்கேன் செய்து கட்டணம் செலுத்துங்கள்.',
    instructions_title: '💡 பணம் செலுத்தும் வழிமுறைகள்:',
    utr_label: '12 இலக்க UTR / UPI குறிப்பு எண் *',
    payer_name_label: 'பணம் செலுத்தியவர் பெயர் *',
    screenshot_label: 'பணம் செலுத்திய ஸ்கிரீன்ஷாட் (விருப்பமானது)',
    submit_order: '🚀 ஆர்டர் & செலுத்துதலை சமர்ப்பிக்கவும்',

    // Price Summary Box
    summary_title: 'ஆர்டர் விலை சுருக்கம்',
    summary_printing: 'அச்சிடுதல்:',
    summary_color_extra: 'வண்ண அச்சு கூடுதல்:',
    summary_binding: 'பிணைப்பு கட்டணம்:',
    summary_lamination: 'லேமினேஷன்:',
    summary_delivery: 'டெலிவரி கட்டணம்:',
    summary_grand_total: 'மொத்த கட்டணம்:',
    btn_proceed_contact: 'தொடர்பு விவரங்களுக்குச் செல்லவும் →',

    // Track Order Page
    track_title: '🔍 உங்கள் ஆர்டர் நிலையை அறியவும்',
    track_subtitle: 'உங்கள் ஆர்டர் ஐடி அல்லது தொலைபேசி எண்ணை உள்ளிட்டு நேரலை நிலையை அறியவும்.',
    track_order_id: 'ஆர்டர் ஐடி (எ.கா. T7-1001)',
    track_phone: 'பதிவுசெய்த கைபேசி எண்',
    track_btn: '🔍 நிலையை பார்க்க',

    // Services Page
    services_heading: 'எங்கள் தொழில்முறை அச்சு சேவைகள்',
    services_subheading: 'உயர்தர ஆவண அச்சிடுதல், தீசிஸ் பைண்டிங், லேமினேஷன் மற்றும் கடை நேரில் பெறல் விருப்பங்கள்.',

    // Price List Page
    pricing_heading: 'முழுமையான வெளிப்படையான விலைப்பட்டியல்',
    pricing_subheading: 'காகித அளவு, GSM தரம், வண்ண பக்கங்கள் மற்றும் பைண்டிங் வகைகளின் அடிப்படையில் நேரலை விலை.',

    // FAQ Page
    faq_heading: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    faq_subheading: 'ஆவண பதிவேற்றம், தனியுரிமை, அச்சு தரம் மற்றும் UPI செலுத்துதல் பற்றிய அனைத்து தகவல்களும்.',

    // Contact Page
    contact_heading: 'எங்களை தொடர்பு கொள்ளவும்',
    contact_subheading: 'வாட்ஸ்அப் அல்லது தொலைபேசி அழைப்பு மூலம் எங்களை தொடர்பு கொள்ளவும்.',

    // Footer
    footer_quick_links: 'விரைவு இணைப்புகள்',
    footer_contact_info: 'தொடர்பு விவரங்கள்',
    footer_hours: 'வேலை நேரங்கள்',
    footer_copyright: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
  },

  tanglish: {
    // Navbar
    nav_home: 'Home',
    nav_services: 'Services',
    nav_pricing: 'Price List',
    nav_how_it_works: 'Epdi Work Aagudhu',
    nav_order: 'Print Order',
    nav_track: 'Order Track',
    nav_faq: 'FAQ',
    nav_contact: 'Contact',
    nav_print_now: 'Print Pannunga',
    nav_my_dashboard: 'En Dashboard',

    // Hero Section
    hero_badge: '⚡ Instant Online Document Printing-u',
    hero_title: 'High Quality Printing Unga Doorstep-ukke Vanthu Cherum',
    hero_subtitle: 'Document upload pannunga, GSM, color & binding select pannunga, UPI QR-la safe-a pay pannunga, prints instant-a vangunga!',
    btn_print_now: '🖨️ Documents-a Print Pannunga',
    btn_track_order: '🔍 Unga Order-a Track Pannunga',
    stat_completed: '15,000+ Orders Complete Aachu',
    stat_quality: '100% Quality Guaranteed',
    stat_speed: '2 - 4 Hrs Fast Pickup Time',

    // Privacy Guarantee
    privacy_title: '🔒 100% Privacy & Automatic File Deletion Guarantee',
    privacy_desc: 'Unga PDF upload pannathum, print aagi completed or rejected aana udane, unga file server-la irundhu automatically delete aagidum!',

    // Quick Calculator
    calc_title: '⚡ Quick Print Calculator-u',
    calc_size: 'Paper Size-u',
    calc_color: 'Color Mode-u',
    calc_pages: 'Total Pages-u',
    calc_binding: 'Binding Option-u',
    calc_what_is_binding: 'ℹ️ Binding na enna?',
    calc_estimated: 'Estimated Price Total-u:',
    calc_order_btn: '🚀 Order-ukku Proceed Pannunga →',
    color_bw: 'Black & White',
    color_full: 'Full Color',
    color_split: '🎨 Custom Split (Color & B&W)',

    // How It Works
    how_it_works_title: 'Ordering Epdi Work Aagum',
    how_it_works_sub: '4 simple steps-la document print panni vangalaam.',
    step1_title: '1. Files Upload Pannunga',
    step1_desc: 'PDF, Word, Excel illana Image files-a drop pannunga.',
    step2_title: '2. Options Select Pannunga',
    step2_desc: 'Paper size, GSM, B&W/Color, and binding choose pannunga.',
    step3_title: '3. UPI QR-la Pay Pannunga',
    step3_desc: 'GPay, PhonePe, Paytm-la QR scan panni pay pannunga.',
    step4_title: '4. Delivery / Pickup Vangunga',
    step4_desc: 'Fast doorstep delivery illana 2-hr shop pickup.',

    // Order Wizard
    wizard_step1: 'Step 1: Documents Upload Pannunga',
    wizard_step2: 'Step 2: Unga Details & Delivery-a Enter Pannunga',
    wizard_step3: 'Step 3: Business UPI-la Pay Pannunga',
    pdf_only_title: '⚠️ PDF Files Mattum Thaan Accept Pannuvom (Word, Excel, PPT & Images Accept Agadhu)',
    pdf_only_desc: 'Word (.doc / .docx), Excel (.xls / .xlsx), PowerPoint (.ppt / .pptx) and Image files accept aagadhu. Unga Word/Excel/PPT/Image files-a first-u PDF-a convert panni (File → Save As → PDF), aprom inga PDF upload pannunga.',
    upload_drop: '📤 PDF files-a inga Drag & Drop pannunga illana click pannunga',
    upload_note: 'Supported file type: PDF (Max 50MB per file). Auto page calculation undu.',
    specifications: 'File Specs & Options:',
    copies: 'Copies',
    pages_to_print: '📄 Pages to Print-u',
    special_instructions: 'Special Notes for Shop',

    // Print Options Labels
    paper_quality: 'Paper Quality-u',
    print_side: 'Print Side-u',
    orientation: 'Orientation-u',
    single_side: 'Single Side',
    double_side: 'Double Side',
    portrait: 'Portrait',
    landscape: 'Landscape',
    lamination_label: 'Lamination / Finishing',

    // Customer Form
    cust_name_label: 'Full Name *',
    cust_phone_label: 'Mobile Number *',
    delivery_zone_label: 'Delivery Zone / Store Pickup *',
    delivery_address_label: 'Delivery Address (Pickup-ukku optional)',
    back_btn: '← Back-u',
    proceed_payment: 'UPI Payment-ukku Poonga →',

    // Payment Step
    payment_heading: 'Business UPI QR Payment-u',
    payment_sub: 'GPay, PhonePe, Paytm-la merchant QR scan panni pay pannunga.',
    instructions_title: '💡 Payment Instructions-u:',
    utr_label: '12-Digit UTR / UPI Ref Number *',
    payer_name_label: 'Payer Name / UPI Name *',
    screenshot_label: 'Payment Screenshot Upload (Optional)',
    submit_order: '🚀 Order & Payment Submit Pannunga',

    // Price Summary Box
    summary_title: 'Order Price Summary-u',
    summary_printing: 'Printing:',
    summary_color_extra: 'Color Printing Extra:',
    summary_binding: 'Binding Cost:',
    summary_lamination: 'Lamination:',
    summary_delivery: 'Delivery Charge:',
    summary_grand_total: 'Grand Total:',
    btn_proceed_contact: 'Contact Details-ukku Poonga →',

    // Track Order Page
    track_title: '🔍 Unga Order Status-a Track Pannunga',
    track_subtitle: 'Order ID (e.g. T7-1001) illana Phone Number enter panni live status-a paarunga.',
    track_order_id: 'Order ID (e.g. T7-1001)',
    track_phone: 'Registered Mobile Number',
    track_btn: '🔍 Status Paarkka',

    // Services Page
    services_heading: 'Namma Professional Printing Services-u',
    services_subheading: 'High quality document printing, thesis binding, lamination and store pickup options.',

    // Price List Page
    pricing_heading: 'Transparent Price List-u',
    pricing_subheading: 'Paper size, GSM quality, color pages & binding rate breakdown.',

    // FAQ Page
    faq_heading: 'Frequently Asked Questions (FAQ)',
    faq_subheading: 'Document upload, privacy, print quality and UPI payment pathi ellam inga irukku.',

    // Contact Page
    contact_heading: 'Nammala Contact Pannunga',
    contact_subheading: 'WhatsApp illana Call moolama enna venum nalaam ketkalaam.',

    // Footer
    footer_quick_links: 'Quick Links',
    footer_contact_info: 'Contact Details',
    footer_hours: 'Shop Timings',
    footer_copyright: 'All Rights Reserved.'
  }
};

let currentLanguage = localStorage.getItem('app_language') || 'en';
const listeners = [];

export const I18nService = {
  getLanguage() {
    return currentLanguage;
  },

  getAvailableLanguages() {
    return LANGUAGES;
  },

  getCurrentLanguageInfo() {
    return LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  },

  setLanguage(langCode) {
    if (!TRANSLATIONS[langCode]) langCode = 'en';
    currentLanguage = langCode;
    localStorage.setItem('app_language', langCode);
    
    // Set document lang attribute for accessibility
    document.documentElement.setAttribute('lang', langCode === 'ta' ? 'ta' : 'en');
    
    // Notify listeners
    listeners.forEach(fn => {
      try { fn(langCode); } catch (e) { console.error('i18n listener error:', e); }
    });
  },

  t(key, fallback = '') {
    const langObj = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    if (langObj[key] !== undefined) return langObj[key];
    const defaultObj = TRANSLATIONS.en;
    if (defaultObj[key] !== undefined) return defaultObj[key];
    return fallback || key;
  },

  onChange(listener) {
    if (typeof listener === 'function') {
      listeners.push(listener);
    }
  }
};
