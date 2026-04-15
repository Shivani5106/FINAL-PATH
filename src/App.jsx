import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, HeartHandshake, Plane, PhoneCall, ArrowRight, CheckCircle, Search, Truck, MessageCircle, Info } from 'lucide-react';
import './index.css';

// STABLE HASH FUNCTION TO ENSURE DETERMINISTIC (PERSISTENT) ASSIGNMENTS
const getStringHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// DYNAMIC DATABASE: Profiles
const COORDINATORS = [
  { name: "Priya Sharma",    phone: "+91 98765 43210", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Arjun Verma",     phone: "+91 87654 32109", photo: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Kavitha Reddy",   phone: "+91 99887 76655", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Omar Farooq",     phone: "+91 91234 56789", photo: "https://randomuser.me/api/portraits/men/46.jpg" },
  { name: "Meera Iyer",      phone: "+91 88990 11223", photo: "https://randomuser.me/api/portraits/women/32.jpg" },
  { name: "Rajan Pillai",    phone: "+91 97665 54433", photo: "https://randomuser.me/api/portraits/men/55.jpg" },
  { name: "Sunita Menon",    phone: "+91 93456 12345", photo: "https://randomuser.me/api/portraits/women/57.jpg" },
  { name: "Aditya Nair",     phone: "+91 96654 33210", photo: "https://randomuser.me/api/portraits/men/22.jpg" },
  { name: "Fatima Sheikh",   phone: "+91 90011 22334", photo: "https://randomuser.me/api/portraits/women/79.jpg" },
  { name: "Samuel Thomas",   phone: "+91 88112 99887", photo: "https://randomuser.me/api/portraits/men/67.jpg" },
  { name: "Ananya Krishnan", phone: "+91 94432 11009", photo: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Deepak Joshi",    phone: "+91 97001 43211", photo: "https://randomuser.me/api/portraits/men/38.jpg" },
  { name: "Lakshmi Bai",     phone: "+91 99123 45600", photo: "https://randomuser.me/api/portraits/women/91.jpg" },
  { name: "Nikhil Mehta",    phone: "+91 95543 21100", photo: "https://randomuser.me/api/portraits/men/14.jpg" },
  { name: "Reshma Qureshi",  phone: "+91 92211 00998", photo: "https://randomuser.me/api/portraits/women/23.jpg" },
];

const AMBULANCE_DRIVERS = [
  { name: 'Sanjeev Kumar',   phone: '+91 91234 11223' },
  { name: 'Ramesh Reddy',    phone: '+91 98765 43210' },
  { name: 'Manoj Tiwari',    phone: '+91 88990 01122' },
  { name: 'Deepak Yadav',    phone: '+91 97654 32109' },
  { name: 'Arjun Nair',      phone: '+91 93456 78901' },
  { name: 'Suresh Pillai',   phone: '+91 86753 22110' },
  { name: 'Ravi Shankar',    phone: '+91 99012 34567' },
  { name: 'Karthik Menon',   phone: '+91 91122 33445' },
  { name: 'Vikram Desai',    phone: '+91 87661 54322' },
  { name: 'Naresh Gupta',    phone: '+91 94433 10987' },
  { name: 'Mohan Das',       phone: '+91 92211 88776' },
  { name: 'Prasad Iyer',     phone: '+91 98001 23456' },
];

const PILOTS = [
  { name: 'Capt. R. Suresh',      phone: '+91 88776 55443' },
  { name: 'Capt. Vivek Anand',    phone: '+91 99000 88776' },
  { name: 'Capt. D. Patil',       phone: '+91 94433 22110' },
  { name: 'Capt. Arun Mehta',     phone: '+91 98123 45670' },
  { name: 'Capt. S. Krishnan',    phone: '+91 91234 56780' },
  { name: 'Capt. Nitin Bose',     phone: '+91 87654 09871' },
  { name: 'Capt. Farhan Qureshi', phone: '+91 95544 33221' },
  { name: 'Capt. Rajiv Pillai',   phone: '+91 93388 77665' },
  { name: 'Capt. T. Venkatesh',   phone: '+91 99871 23456' },
  { name: 'Capt. Manish Sinha',   phone: '+91 88001 99887' },
];

const CAUSES_OF_DEATH = [
  'Cardiopulmonary Arrest',
  'Acute Myocardial Infarction (Heart Attack)',
  'Ischaemic Stroke — Cerebrovascular Accident',
  'Septicaemia (Severe Sepsis)',
  'Chronic Kidney Disease — Stage V',
  'Respiratory Failure (ARDS)',
  'Hepatic Failure — End Stage Liver Disease',
  'Malignant Neoplasm — Stage IV Carcinoma',
  'Traumatic Brain Injury (Road Accident)',
  'Pulmonary Embolism',
  'Diabetic Ketoacidosis — Multiorgan Failure',
  'Congestive Heart Failure — Decompensated',
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // ==========================================
  // DYNAMIC APP STATE 
  // ==========================================
  const [caseData, setCaseData] = useState({ name: '', age: '', gender: '', origin: '', destination: '' });
  const [myCoordinator, setMyCoordinator] = useState(COORDINATORS[0]);
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  // TRANSIT & ROUTING LOGIC
  const [isCalculatingRoutes, setIsCalculatingRoutes] = useState(false);
  const [distanceMsg, setDistanceMsg] = useState("");
  const [transportConfirmed, setTransportConfirmed] = useState(false);
  const [scannedDocsCount, setScannedDocsCount] = useState(0);
  const [transportMethod, setTransportMethod] = useState(''); // 'road' or 'air'
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [isInternational, setIsInternational] = useState(false);
  const [destHasAirport, setDestHasAirport] = useState(true);
  const [etaDetails, setEtaDetails] = useState({ priceRoad: 0, timeRoad: 0, priceAir: 0, timeAir: 0 });

  // LIVE TRACKER & SUMMARY STATE
  const [trackingStep, setTrackingStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [displayedMins, setDisplayedMins] = useState(0);
  const [alertMsg, setAlertMsg] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const TRACKING_STAGES_DOMESTIC = [
     "Vehicle Dispatched",
     "Arrived at Origin Facility",
     "En Route / In Transit",
     "Crossed Jurisdictional Border",
     "Delivered to Destination"
  ];

  const TRACKING_STAGES_INTL = [
     "Embassy NOC & Cargo Booking",
     "Embalming & Casket Sealing",
     "Cleared Airport Customs (Origin)",
     "Airborne (International Transit)",
     "Delivered to Destination"
  ];

  const TRACKING_STAGES = isInternational ? TRACKING_STAGES_INTL : TRACKING_STAGES_DOMESTIC;

  useEffect(() => {
    let interval;
    if (currentPage === 'tracking' && trackingStep < 4) {
       interval = setInterval(() => {
          const next = trackingStep + 1;
          setTrackingStep(next);
          fireToast(next);
       }, 10000); // 10 second stage advance for presentation pacing
    }
    return () => clearInterval(interval);
  }, [currentPage, trackingStep]);

  useEffect(() => {
     let tmr;
     if (currentPage === 'tracking' && trackingStep < 4) {         
         tmr = setInterval(() => {
             setDisplayedMins(prev => Math.max(0, prev - 1));
         }, 1000); // ticks once per real second (1 simulated min per sec)
     }
     if (trackingStep === 4) setDisplayedMins(0);
     return () => clearInterval(tmr);
  }, [currentPage, trackingStep]);

  useEffect(() => {
      let interval;
      if (transportConfirmed) {
          interval = setInterval(() => {
              setScannedDocsCount(prev => prev < 10 ? prev + 1 : prev);
          }, 20000);
      } else {
          setScannedDocsCount(0);
      }
      return () => clearInterval(interval);
  }, [transportConfirmed]);

  const STAGE_NOTIFICATIONS_DOMESTIC = [
    { sms: `Dear Family, this is to inform you that the mortuary vehicle carrying the remains of your loved one has been officially dispatched from the origin facility. — FinalPath Case #IND-8291`, label: 'Vehicle Dispatched' },
    { sms: `Dear Family, our mortuary team has arrived at the origin facility and has taken charge of the remains with full protocol compliance. Departure is scheduled shortly. — FinalPath Case #IND-8291`, label: 'Arrived at Origin Facility' },
    { sms: `Dear Family, the remains are now en route to the destination. Your assigned coordinator is actively monitoring the transport. — FinalPath Case #IND-8291`, label: 'En Route / In Transit' },
    { sms: `Dear Family, the transport has successfully crossed the jurisdictional border checkpoint. All documentation has been cleared. — FinalPath Case #IND-8291`, label: 'Crossed Jurisdictional Border' },
    { sms: `Dear Family, the remains have been safely delivered to the destination facility. Please proceed to receive the Final Summary Report. — FinalPath Case #IND-8291`, label: 'Delivered to Destination' },
  ];

  const STAGE_NOTIFICATIONS_INTL = [
    { sms: `Dear Family, Embassy NOC is obtained and air cargo space is confirmed. We are proceeding with international protocols. — FinalPath Case #IND-8291`, label: 'Embassy NOC & Cargo Booking' },
    { sms: `Dear Family, embalming is complete and the casket has been hermetically sealed as per international aviation standards. — FinalPath Case #IND-8291`, label: 'Embalming & Casket Sealing' },
    { sms: `Dear Family, remains have successfully cleared outbound customs and security at the origin airport. — FinalPath Case #IND-8291`, label: 'Cleared Airport Customs (Origin)' },
    { sms: `Dear Family, the cargo is now airborne and currently in transit to the destination country. Your care coordinator is actively monitoring the flight. — FinalPath Case #IND-8291`, label: 'Airborne (International Transit)' },
    { sms: `Dear Family, the remains have landed, cleared incoming destination customs, and are available for receiving. Please review the Final Summary Report. — FinalPath Case #IND-8291`, label: 'Delivered to Destination' },
  ];

  const STAGE_NOTIFICATIONS = isInternational ? STAGE_NOTIFICATIONS_INTL : STAGE_NOTIFICATIONS_DOMESTIC;

  const fireToast = (stepIndex) => {
    const note = STAGE_NOTIFICATIONS[stepIndex];
    if (!note) return;
    setToastMsg(note);
    setTimeout(() => setToastMsg(null), 6000);
  };

  const handleTimelineClick = (index) => {
      setTrackingStep(index);
      const totalMins = transportMethod === 'road' ? etaDetails.timeRoad : etaDetails.timeAir;
      const targetMins = Math.round(totalMins * (1 - (index / 4)));
      setDisplayedMins(Math.max(0, targetMins));
      fireToast(index);
  };



  // WHATSAPP STATE 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: 'user', text: "Namaste. I need to arrange a mortuary transport." },
    { sender: 'ai', text: "Namaste. I am very sorry for your loss. 🙏\n\nI am FinalPath's care assistant."}
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // CITY DATABASE (India + International)
  const CITIES = {
    // INDIA
    mumbai:     { lat: 19.0760, lon: 72.8777, india: true },
    bombay:     { lat: 19.0760, lon: 72.8777, india: true },
    delhi:      { lat: 28.7041, lon: 77.1025, india: true },
    'new delhi':{ lat: 28.6139, lon: 77.2090, india: true },
    chennai:    { lat: 13.0827, lon: 80.2707, india: true },
    madras:     { lat: 13.0827, lon: 80.2707, india: true },
    apollo:     { lat: 13.0827, lon: 80.2707, india: true },
    kolkata:    { lat: 22.5726, lon: 88.3639, india: true },
    bangalore:  { lat: 12.9716, lon: 77.5946, india: true },
    bengaluru:  { lat: 12.9716, lon: 77.5946, india: true },
    hyderabad:  { lat: 17.3850, lon: 78.4867, india: true },
    pune:       { lat: 18.5204, lon: 73.8567, india: true },
    ahmedabad:  { lat: 23.0225, lon: 72.5714, india: true },
    jaipur:     { lat: 26.9124, lon: 75.7873, india: true },
    lucknow:    { lat: 26.8467, lon: 80.9462, india: true },
    odisha:     { lat: 20.2961, lon: 85.8245, india: true },
    odisa:      { lat: 20.2961, lon: 85.8245, india: true },
    bhubaneswar:{ lat: 20.2961, lon: 85.8245, india: true },
    patna:      { lat: 25.5941, lon: 85.1376, india: true },
    bhopal:     { lat: 23.2599, lon: 77.4126, india: true },
    surat:      { lat: 21.1702, lon: 72.8311, india: true },
    nagpur:     { lat: 21.1458, lon: 79.0882, india: true },
    coimbatore: { lat: 11.0168, lon: 76.9558, india: true },
    visakhapatnam:{ lat: 17.6868, lon: 83.2185, india: true },
    kochi:      { lat: 9.9312,  lon: 76.2673, india: true },
    indore:     { lat: 22.7196, lon: 75.8577, india: true },
    // INTERNATIONAL
    dubai:      { lat: 25.2048, lon: 55.2708, india: false },
    london:     { lat: 51.5074, lon: -0.1278, india: false },
    singapore:  { lat: 1.3521,  lon: 103.8198, india: false },
    usa:        { lat: 37.0902, lon: -95.7129, india: false },
    america:    { lat: 37.0902, lon: -95.7129, india: false },
    'new york':  { lat: 40.7128, lon: -74.0060, india: false },
    toronto:    { lat: 43.6532, lon: -79.3832, india: false },
    canada:     { lat: 56.1304, lon: -106.3468, india: false },
    australia:  { lat: -25.2744, lon: 133.7751, india: false },
    sydney:     { lat: -33.8688, lon: 151.2093, india: false },
    germany:    { lat: 51.1657, lon: 10.4515, india: false },
    france:     { lat: 46.2276, lon: 2.2137, india: false },
    paris:      { lat: 48.8566, lon: 2.3522, india: false },
    japan:      { lat: 36.2048, lon: 138.2529, india: false },
    tokyo:      { lat: 35.6762, lon: 139.6503, india: false },
    malaysia:   { lat: 4.2105,  lon: 101.9758, india: false },
    'kuala lumpur':{ lat: 3.1390, lon: 101.6869, india: false },
  };

  const getCoords = (str) => {
    const s = str.toLowerCase();
    for (const [key, val] of Object.entries(CITIES)) {
      if (s.includes(key)) return val;
    }
    return null;
  };

  const haversineKm = (c1, c2) => {
    const R = 6371;
    const dLat = (c2.lat - c1.lat) * Math.PI / 180;
    const dLon = (c2.lon - c1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(c1.lat*Math.PI/180)*Math.cos(c2.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return Math.floor(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const AIRPORT_CITIES = [
    'mumbai','bombay','delhi','chennai','madras','kolkata','bangalore','bengaluru',
    'hyderabad','pune','ahmedabad','jaipur','lucknow','patna','bhopal','surat',
    'nagpur','coimbatore','visakhapatnam','kochi','indore','madurai','trichy',
    'trivandrum','calicut','bhubaneswar','guwahati','amritsar','chandigarh',
    'varanasi','mangalore','srinagar','jammu','raipur','ranchi', 'goa', 'bagdogra',
    'dubai', 'london', 'singapore', 'new york', 'toronto', 'sydney', 'paris', 'tokyo', 'kuala lumpur'
  ];

  const hasAirport = (cityStr) => {
    const s = cityStr.toLowerCase();
    if (s.includes('international') || s.includes('airport')) return true;
    for (let c of AIRPORT_CITIES) {
      if (s.includes(c)) return true;
    }
    return false;
  };

  const fetchRealDistanceAsync = async (origStr, destStr) => {
    const c1 = getCoords(origStr);
    const c2 = getCoords(destStr);
    
    let lat1 = c1 ? c1.lat : null;
    let lon1 = c1 ? c1.lon : null;
    let india1 = c1 ? c1.india : true;

    let lat2 = c2 ? c2.lat : null;
    let lon2 = c2 ? c2.lon : null;
    let india2 = c2 ? c2.india : true;

    try {
      if (!c1) {
        // Fallback to real GPS via Nominatim API free
        const r1 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(origStr)}`);
        const data1 = await r1.json();
        if (data1 && data1.length > 0) {
           lat1 = parseFloat(data1[0].lat); lon1 = parseFloat(data1[0].lon);
           india1 = data1[0].display_name.includes('India');
        }
      }
      if (!c2) {
        const r2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destStr)}`);
        const data2 = await r2.json();
        if (data2 && data2.length > 0) {
           lat2 = parseFloat(data2[0].lat); lon2 = parseFloat(data2[0].lon);
           india2 = data2[0].display_name.includes('India');
        }
      }
    } catch(err) { console.error("GPS Fetch failed", err); }

    const international = !india1 || !india2;

    if (lat1 && lat2) {
      const airKm = haversineKm({lat: lat1, lon: lon1}, {lat: lat2, lon: lon2});
      let roadKm = Math.floor(airKm * 1.35);
      let realEtaMins = Math.max(360, Math.floor(roadKm / 50) * 60);

      try {
          const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
          const osrmData = await osrmRes.json();
          if (osrmData.routes && osrmData.routes[0]) {
              roadKm = Math.floor(osrmData.routes[0].distance / 1000);
              realEtaMins = Math.max(1, Math.round(osrmData.routes[0].duration / 60));
          }
      } catch(e) { console.error("OSRM failed", e) }

      return { airKm, roadKm, realEtaMins, international };
    }

    const fallbackAir = Math.floor(((origStr.length + destStr.length) * 58) % 1400) + 300;
    return { airKm: fallbackAir, roadKm: Math.floor(fallbackAir * 1.35), realEtaMins: 24 * 60, international: false };
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsCalculatingRoutes(true);

    const newCase = {
       name: e.target[0].value.trim(),
       age: e.target[1].value,
       gender: e.target[2].value,
       origin: e.target[3].value.trim(),
       destination: e.target[4].value.trim(),
       rites: e.target[5].value
    };
    setCaseData(newCase);
    
    const { airKm, roadKm, realEtaMins, international } = await fetchRealDistanceAsync(newCase.origin, newCase.destination);
    
    // Check airport availability
    const dAirport = international ? true : hasAirport(newCase.destination); // Int'l implies airport
    setIsInternational(international);
    setDestHasAirport(dAirport);

    // If international, lock to Air. If no airport, lock to Road.
    if (international) setTransportMethod('air');
    if (!dAirport) setTransportMethod('road');

    setDistanceMsg(
      international
        ? `✈ ${airKm.toLocaleString('en-IN')} KM — International Air Cargo Only`
        : `${roadKm.toLocaleString('en-IN')} KM Road | ${airKm.toLocaleString('en-IN')} KM Air`
    );
    
    // Transport Pricing Based on Latest Market Rates
    const baseAmbulancePrice = 850;
    const subsequentAmbulancePerKm = 14;
    const ambulanceCost = roadKm <= 10 
      ? baseAmbulancePrice 
      : baseAmbulancePrice + ((roadKm - 10) * subsequentAmbulancePerKm);

    const passengerCostPerKm = 5;
    const cargoMultiplier = 6;
    const baseAirHandling = international ? 25000 : 8000;
    const airCost = (airKm * passengerCostPerKm * cargoMultiplier) + baseAirHandling;

    setEtaDetails({
        priceRoad: Math.round(ambulanceCost),
        timeRoad: realEtaMins,
        priceAir: Math.round(airCost),
        timeAir: (international ? Math.max(10, Math.round(airKm / 800) + 8) : Math.max(3, Math.round(airKm / 600) + 3)) * 60
    });

    // DYNAMIC ASSIGNMENT LOGIC: Picks randomly for every new case
    const baseCoord = COORDINATORS[Math.floor(Math.random() * COORDINATORS.length)];
    const randomCoordId = Math.floor(Math.random() * 99) + 1;
    
    const assignedCoord = {
        ...baseCoord,
        photo: baseCoord.photo.includes('women') 
            ? `https://randomuser.me/api/portraits/women/${randomCoordId}.jpg` 
            : `https://randomuser.me/api/portraits/men/${randomCoordId}.jpg`
    };
    setMyCoordinator(assignedCoord);

    setChatMessages([
        { sender: 'user', text: `Namaste. I need to transport a body from ${newCase.origin} to ${newCase.destination}.` },
        { sender: 'ai', text: `Namaste. I am very sorry for your loss. 🙏\n\nCase #IND-8291 opened for ${newCase.name} (Age: ${newCase.age}, ${newCase.gender}).\n\nDistance: ${airKm} km. Coordinator ${assignedCoord.name} assigned.`}
    ]);

    // Navigate IMMEDIATELY — don't block on backend response
    setIsCalculatingRoutes(false);
    setCurrentPage('coordinator');

    // Fire-and-forget backend save
    fetch('http://localhost:5000/api/cases', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(newCase)
    }).catch(() => {});
  };

  const handleConfirmService = () => {
      // DYNAMIC ASSIGNMENT LOGIC: New drivers / pilots per checkout
      const randomId = Math.floor(Math.random() * 9999);

      if (transportMethod === 'road') {
          const d = AMBULANCE_DRIVERS[Math.floor(Math.random() * AMBULANCE_DRIVERS.length)];
          setAssignedDriver({
              name: d.name,
              phone: d.phone,
              role: 'Mortuary Road Specialist',
              vehicle: `MH-${(randomId % 89) + 10}-RT-${(randomId % 8999) + 1000}`,
              icon: '🚑',
              agency: 'National Ambulance Corp'
          });
      } else {
          const p = PILOTS[Math.floor(Math.random() * PILOTS.length)];
          setAssignedDriver({
              name: p.name,
              phone: p.phone,
              role: 'IndiGo Base Manager',
              vehicle: `Flight 6E-${(randomId % 899) + 100} Cargo`, // fixed error
              icon: '✈️',
              agency: 'IndiGo Human Remains Cargo'
          });
      }
      setTransportConfirmed(true);
      setDisplayedMins((transportMethod === 'road' ? etaDetails.timeRoad : etaDetails.timeAir));
      setAlertMsg('Transportation confirmed! ✅\nLive Tracking is now enabled. Check the Transportation Details page for driver info.');
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
        setChatMessages(prev => [...prev, { 
            sender: 'ai', 
            text: `I understand. We are actively organizing the transport from ${caseData.origin} to ${caseData.destination} for ${caseData.name}. Coordinator ${myCoordinator.name} is on standby.` 
        }]);
    }, 1500);
  };
  const getDocumentList = (origin, dest, isIntl, tMethod, isConfirmed, scannedCount) => {
      const o = origin.toLowerCase();
      const d = dest.toLowerCase();
      
      const vStatus = (txt) => isConfirmed ? txt : 'Pending Confirmation';
      const vLink = (type) => isConfirmed ? type : null;

      const scanStatus = (reqCount) => isConfirmed ? (scannedCount >= reqCount ? 'Verified' : 'Scanning...') : 'Pending Confirmation';
      const scanLink = (type, reqCount) => (isConfirmed && scannedCount >= reqCount) ? type : null;

      // Default Road documents
      let docs = [
          { id: 'dc', name: 'Original Death Certificate', status: vStatus('OCR Verified'), viewable: vLink('death_certificate') },
          { id: 'pn', name: 'Police NOC', status: vStatus('Verified'), viewable: vLink('police_noc') },
          { id: 'ec', name: 'Embalming Certificate', status: scanStatus(1), viewable: scanLink('embalming', 1) }
      ];

      // Air Cargo / International Documents
      if (tMethod === 'air' || isIntl) {
          docs = [
              { id: 'dc', name: 'Original Death Certificate', status: vStatus('OCR Verified'), viewable: vLink('death_certificate') },
              { id: 'pp', name: 'Passport of Deceased', status: vStatus('Verified'), viewable: vLink('passport') },
              { id: 'ec', name: 'Embalming & Coffin Certificate', status: scanStatus(1), viewable: scanLink('embalming', 1) },
              { id: 'noc', name: 'Embassy NOC', status: scanStatus(2), viewable: scanLink('embassy_noc', 2) },
              { id: 'awb', name: 'Airway Bill (Cargo)', status: scanStatus(3), viewable: scanLink('airway_bill', 3) }
          ];

          if (o.includes('usa') || o.includes('america') || o.includes('new york') || d.includes('usa') || d.includes('america') || d.includes('new york')) {
              docs[3].name = 'Consular Mortuary Certificate (US)';
              docs.push({ id: 'hd', name: 'Health Department Transit Permit', status: scanStatus(4), viewable: scanLink('transit_permit', 4) });
          } else if (o.includes('dubai') || o.includes('uae') || d.includes('dubai') || d.includes('uae')) {
              docs[3].name = 'UAE Indian Embassy NOC';
              docs.push({ id: 'pc', name: 'Dubai Police Clearance', status: scanStatus(4), viewable: scanLink('police_clearance', 4) });
          } else if (o.includes('singapore') || d.includes('singapore')) {
              docs[3].name = 'Singapore NEA Export Permit';
              docs.push({ id: 'sgp', name: 'Sealing Certificate (Singapore)', status: scanStatus(4), viewable: scanLink('sealing_cert', 4) });
          } else if (o.includes('uk') || o.includes('london') || d.includes('uk') || d.includes('london')) {
              docs[3].name = 'Out of England & Wales Free from Infection Cert';
              docs.push({ id: 'cor', name: 'Coroner’s Order for Removal', status: scanStatus(4), viewable: scanLink('coroner_order', 4) });
          } else if (o.includes('canada') || o.includes('toronto') || d.includes('canada') || d.includes('toronto')) {
               docs[3].name = 'Canadian Statement of Death';
               docs.push({ id: 'transit', name: 'Burial Permit / Transit Permit', status: scanStatus(4), viewable: scanLink('transit_permit', 4) });
          } else if (o.includes('australia') || o.includes('sydney') || d.includes('australia') || d.includes('sydney')) {
               docs[3].name = 'Australian Official Death Notice';
               docs.push({ id: 'quarantine', name: 'Biosecurity Clearance', status: scanStatus(4), viewable: scanLink('biosecurity', 4) });
          } else if (o.includes('malaysia') || o.includes('kuala lumpur') || d.includes('malaysia') || d.includes('kuala lumpur')) {
              docs[3].name = 'Malaysia Export Permit';
              docs.push({ id: 'customs', name: 'Customs K3 Form', status: scanStatus(4), viewable: scanLink('customs_k3', 4) });
          }
      }
      return docs;
  };

  const getRitualsText = (rite) => {
    switch(rite) {
      case 'Hindu': return "Antim Sanskar protocols active. Handlers instructed to ensure appropriate resting direction, avoidance of prohibited materials, and facilitation of final rites parameters.";
      case 'Muslim': return "Ghusl and Kafan protocols active. Specialized teams ensuring strict adherence to Islamic burial preparations and timeline sensitivity.";
      case 'Christian': return "Standard Embalming and Casket protocols active. Respectful preparation for viewing and church services as requested.";
      default: return "Standard respectful handlers instructed. Neutral dignified handling rules enforced across all checkpoints.";
    }
  };

  const renderDocumentViewer = () => {
      if (!docViewerOpen) return null;

      let title = "";
      let subTitle = "";
      let docContent = null;

      let intlCountry = "INTERNATIONAL (REPUBLIC OF INDIA)";
      const originDestStr = (caseData.origin + " " + caseData.destination).toLowerCase();
      if (originDestStr.includes('usa') || originDestStr.includes('america') || originDestStr.includes('new york')) intlCountry = "UNITED STATES OF AMERICA";
      else if (originDestStr.includes('dubai') || originDestStr.includes('uae')) intlCountry = "UNITED ARAB EMIRATES";
      else if (originDestStr.includes('uk') || originDestStr.includes('london')) intlCountry = "UNITED KINGDOM";
      else if (originDestStr.includes('canada') || originDestStr.includes('toronto')) intlCountry = "CANADA";
      else if (originDestStr.includes('singapore')) intlCountry = "REPUBLIC OF SINGAPORE";
      else if (originDestStr.includes('australia') || originDestStr.includes('sydney')) intlCountry = "AUSTRALIA";
      else if (originDestStr.includes('malaysia') || originDestStr.includes('kuala lumpur')) intlCountry = "MALAYSIA";

      if (docViewerOpen === 'death_certificate' || docViewerOpen === true) {
          title = "Official Death Certificate";
          subTitle = `Form No. 6 (Sec 12/17 Govt of India / ${intlCountry})`;
          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'monospace', fontSize: '1.05rem', color: '#334155'}}>
                  <div><strong>Name of Deceased:</strong> <span style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.name.toUpperCase()}</span></div>
                  <div><strong>Age:</strong> <span style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.age} Years</span></div>
                  <div><strong>Sex:</strong> <span style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.gender.toUpperCase()}</span></div>
                  <div><strong>Place of Origin:</strong> <span style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.origin.toUpperCase()}</span></div>
                  <div><strong>Destination for Rites:</strong> <span style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.destination.toUpperCase()}</span></div>
                  <div><strong style={{color: 'transparent'}}>...</strong></div>
                  <div><strong>Cause of Death (Medically Certified):</strong> {CAUSES_OF_DEATH[getStringHash(caseData.name + caseData.age) % CAUSES_OF_DEATH.length]}</div>
                  <div style={{borderBottom: '1px dashed #cbd5e1', margin: '20px 0'}}></div>
                  <div><strong>Registration Signature:</strong> ✔ Validated Digitally</div>
              </div>
          );
      } else if (docViewerOpen === 'passport') {
          title = "Passport Biodata Page";
          subTitle = `Issuing Authority: ${intlCountry}`;
          
          let passportNum = `P${getStringHash(caseData.name).toString().substring(0,7).padEnd(7,'0')}`;
          let mrz1 = `P<IND${caseData.name.replace(/\\s+/g, '<<').toUpperCase()}<<<<<<<<<<<<<<<<<<`;
          let mrz2 = `${passportNum}1IND${(100 - (parseInt(caseData.age)||50)).toString().padStart(2,'0')}0101${caseData.gender.toUpperCase()[0] || 'M'}<<<<<<<<<<<<<<<<<<<2`;
          let passportPhotoNum = (getStringHash(caseData.name) % 99) + 1;

          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                 <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                    <div style={{width: '120px', height: '160px', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                       <img src={caseData.gender === 'Female' || caseData.gender === 'female' ? `https://randomuser.me/api/portraits/women/${passportPhotoNum}.jpg` : `https://randomuser.me/api/portraits/men/${passportPhotoNum}.jpg`} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) opacity(0.8)'}} alt="Passport Photo" />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, fontFamily: 'monospace', fontSize: '0.9rem', color: '#1e293b'}}>
                       <div><span style={{color: '#64748b'}}>Type/Type</span><br/><strong>P</strong></div>
                       <div><span style={{color: '#64748b'}}>Country Code</span><br/><strong>IND</strong></div>
                       <div><span style={{color: '#64748b'}}>Passport No.</span><br/><strong>{passportNum}</strong></div>
                       <div><span style={{color: '#64748b'}}>Given Name(s)</span><br/><strong style={{fontSize: '1.2rem'}}>{caseData.name.toUpperCase()}</strong></div>
                       <div style={{display: 'flex', gap: '20px'}}>
                          <div><span style={{color: '#64748b'}}>Sex</span><br/><strong>{(caseData.gender.toUpperCase()[0]) === 'F' ? 'F' : 'M'}</strong></div>
                          <div><span style={{color: '#64748b'}}>Nationality</span><br/><strong>INDIAN</strong></div>
                       </div>
                    </div>
                 </div>
                 
                 <div style={{marginTop: '20px', fontFamily: '"Courier New", Courier, monospace', fontSize: '1.05rem', backgroundColor: '#f1f5f9', padding: '15px', letterSpacing: '3px', wordBreak: 'break-all', fontWeight: 'bold', color: '#0f172a'}}>
                     {mrz1.substring(0, 44).padEnd(44,'<')}<br/>
                     {mrz2.substring(0, 44).padEnd(44,'<')}
                 </div>
              </div>
          );
      } else if (docViewerOpen === 'embalming') {
          title = "Embalming & Coffin Sealing Certificate";
          subTitle = `Valid for Interstate & International Transit`;
          
          const morticians = ['Dr. R. K. Nair', 'Dr. S. Menon', 'Dr. A. Patel', 'Dr. J. Fernandez', 'Dr. K. Iyer'];
          const facilities = ['Terminal Transit Mortuary Services', 'Aviation Care Mortuary', 'Global Transit Rites Facility', 'National Embalming Center', 'Apex Mortuary Services'];
          const fluids = ['Formalin 30% (Standard)', 'Formalin 35% (Vascular)', 'Methanol-Formalin Mix (International)', 'Eco-embalming fluid (Non-toxic)'];
          
          const hashIdx = getStringHash(caseData.name);
          const mortician = morticians[hashIdx % morticians.length];
          const facility = facilities[hashIdx % facilities.length];
          const fluid = fluids[hashIdx % fluids.length];
          const regNum = `#${8000 + (hashIdx % 1999)}`;

          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'monospace', fontSize: '1.05rem', color: '#1e293b'}}>
                  <p>Certified that the remains of <strong style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.name.toUpperCase()}</strong> have been embalmed according to the regulations of the International Embalmers Association.</p>
                  <div><strong>Embalming Fluid:</strong> {fluid}, arterial injection complete.</div>
                  <div><strong>Coffin Sealing:</strong> Zinc-lined, hermetically sealed, and soldered via international aviation guidelines.</div>
                  <div style={{borderBottom: '1px solid #cbd5e1', margin: '15px 0'}}></div>
                  <div><strong>Certifying Mortician:</strong> {mortician}, Reg. {regNum}</div>
                  <div><strong>Facility:</strong> {facility}</div>
              </div>
          );
      } else if (docViewerOpen === 'police_noc') {
          title = "Local Police No Objection Certificate (NOC)";
          subTitle = `Issued by Jurisdictional Police - ${caseData.origin.toUpperCase()}`;
          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'monospace', fontSize: '1.05rem', color: '#1e293b'}}>
                  <p>This is to certify that there is no pending investigation or medico-legal objection to the transport of <strong>{caseData.name.toUpperCase()}</strong>.</p>
                  <div><strong>Clearance Authorized for:</strong> Route to {caseData.destination}</div>
                  <div style={{borderBottom: '1px dashed #cbd5e1', margin: '15px 0'}}></div>
                  <div><strong>Station House Officer:</strong> Insp. V. Kumar</div>
                  <div><strong>Status:</strong> CLEARED FOR INTER-STATE TRANSIT</div>
              </div>
          );
      } else if (docViewerOpen === 'embassy_noc') {
          title = "Consular / Embassy Transfer NOC";
          subTitle = `Approved Repatriation Request`;
          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'monospace', fontSize: '1.05rem', color: '#1e293b', border: '2px solid #0f172a', padding: '15px'}}>
                  <div style={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px'}}>EMBASSY CLEARANCE MEMO</div>
                  <p>The consulate waves objections for the repatriation of mortal remains for <strong>{caseData.name.toUpperCase()}</strong>.</p>
                  <div><strong>Carrier:</strong> AUTHORIZED FLIGHT SYSTEM</div>
                  <div><strong>Route:</strong> {caseData.origin} ✈ {caseData.destination}</div>
                  <div style={{color: '#16a34a', marginTop: '10px'}}><strong>[ DIGITAL SEAL AFFIXED ]</strong></div>
              </div>
          );
      } else if (docViewerOpen === 'airway_bill') {
          title = "Master Airway Bill (Cargo)";
          subTitle = `HUMAN REMAINS (H.U.M) - URGENT TRANSPORT`;
          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'monospace', fontSize: '1.05rem', color: '#1e293b'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', backgroundColor: '#f1f5f9', padding: '10px'}}>
                      <span><strong>AWB:</strong> 098-{getStringHash(caseData.name).toString().substring(0,8)}</span>
                      <span><strong>CLASS:</strong> PRIORITY</span>
                  </div>
                  <div><strong>Consignee:</strong> RECEIVING MORTUARY, {caseData.destination.toUpperCase()}</div>
                  <div><strong>Commodity:</strong> Human Remains in Coffin (1 Pc)</div>
                  <div><strong>Gross Weight:</strong> 120.5 KG (Chargeable Weight)</div>
                  <div style={{borderBottom: '1px solid #cbd5e1', margin: '15px 0'}}></div>
                  <div><strong>Clearance Agent:</strong> FinalPath Logistics Desk</div>
              </div>
          );
      } else if (docViewerOpen === 'transit_permit') {
          title = "Health Dept. Burial / Transit Permit";
          subTitle = `Cross-Border Health Clearance`;
          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'monospace', fontSize: '1.05rem'}}>
                  <p>Official permission to transport <strong>{caseData.name.toUpperCase()}</strong> across statutory boundaries.</p>
                  <p>Subject is verified free from infectious quarantiable diseases. Casket is verified permanently sealed.</p>
                  <div><strong>Valid Until:</strong> 72 Hours from issuance</div>
              </div>
          );
      } else if (docViewerOpen === 'police_clearance' || docViewerOpen === 'sealing_cert' || docViewerOpen === 'coroner_order' || docViewerOpen === 'biosecurity' || docViewerOpen === 'customs_k3') {
          title = "Specialized Customs & Legal Clearance";
          subTitle = `INTERNATIONAL REGIONAL CLEARANCE`;
          docContent = (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'monospace', fontSize: '1.05rem', color: '#1e293b'}}>
                  <p>Specialized regional clearance issued for the remains of <strong style={{backgroundColor: '#fef08a', padding: '2px 8px'}}>{caseData.name.toUpperCase()}</strong>.</p>
                  <div><strong>Origin:</strong> {caseData.origin}</div>
                  <div><strong>Destination:</strong> {caseData.destination}</div>
                  <div><strong>Routing Validation:</strong> PASS / NO PENDING HOLD</div>
                  <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0'}}>
                     Clearance confirmed by regional authorities. Document digitally verified and legally binding.
                  </div>
              </div>
          );
      }
      
      return (
          <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setDocViewerOpen(false)}>
             <div className="animate-fade" style={{backgroundColor: '#e2e8f0', padding: '20px', borderRadius: '5px', maxWidth: '500px', width: '90%', height: '75vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}} onClick={(e) => e.stopPropagation()}>
                <div style={{backgroundColor: 'white', height: '100%', width: '100%', padding: '40px', boxShadow: '0 0 15px rgba(0,0,0,0.1)', overflowY: 'auto', position: 'relative'}}>
                    <div style={{position: 'absolute', top: '10px', right: '15px', cursor: 'pointer', color: '#94a3b8', fontSize: '1.5rem', fontWeight:'bold'}} onClick={() => setDocViewerOpen(false)}>✕</div>
                    
                    {title && <h1 style={{textAlign: 'center', textTransform: 'uppercase', color: '#1e293b', borderBottom: '2px solid #94a3b8', paddingBottom: '10px', fontSize: '1.6rem'}}>{title}</h1>}
                    {subTitle && <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>{subTitle}</p>}
                    
                    <div style={{marginTop: '30px'}}>
                       {docContent}
                    </div>
                    
                    <div style={{marginTop: '40px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '15px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #bbf7d0'}}>
                       <CheckCircle size={28}/> 
                       <div><strong style={{display:'block'}}>OCR Validation Complete</strong><span style={{fontSize: '0.85rem'}}>Data identical to internal case.</span></div>
                    </div>
                </div>
             </div>
          </div>
      );
  };

  return (
    <div className="animate-fade" style={{position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      {/* Top Navigation Bar */}
      <div className="container" style={{backgroundColor: 'white', position: 'relative', zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0'}}>
          <div className="logo" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)'}}>
            <HeartHandshake size={32} /> FinalPath
          </div>
          <div style={{display:'flex', gap:'25px', alignItems:'center'}}>
            {currentPage !== 'home' && (
              <>
                <div style={{display: 'flex', alignItems: 'center', gap: '0'}}>
                  <button 
                    onClick={() => {
                        if (!transportConfirmed) alert("Please confirm a transportation method on the Dashboard first.");
                        else setCurrentPage('tracking');
                    }} 
                    style={{background:'none', border:'none', cursor: transportConfirmed ? 'pointer' : 'not-allowed', fontWeight:'bold', color: transportConfirmed ? 'var(--primary)' : '#94a3b8', textDecoration: transportConfirmed ? 'underline' : 'none', fontSize: '1.05rem'}}
                  >
                    LIVE TRACKER
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                      if (!transportConfirmed) alert("Please confirm a transportation method on the Dashboard first.");
                      else setCurrentPage('transportDetails');
                  }} 
                  style={{backgroundColor: transportConfirmed ? '#2563eb' : '#cbd5e1', cursor: transportConfirmed ? 'pointer' : 'not-allowed'}}
                  className="text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition"
                >
                  Transportation Details
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {renderDocumentViewer()}

      <div style={{position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000}}>
        {isChatOpen && (
          <div className="animate-fade" style={{width: '350px', backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', marginBottom: '15px'}}>
            <div style={{backgroundColor: '#075E54', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <HeartHandshake size={20} color="#075E54" />
              </div>
              <div>
                <h4 style={{margin: 0, fontSize: '1.1rem'}}>FinalPath AI</h4>
                <p style={{margin: 0, fontSize: '0.8rem', opacity: 0.8}}>Multi-lingual Digital Assistant</p>
              </div>
            </div>

            <div style={{backgroundColor: '#e5ddd5', height: '320px', padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#667781', margin: '5px 0'}}>Today 2:14 PM</p>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{
                  backgroundColor: msg.sender === 'user' ? '#dcf8c6' : 'white', 
                  padding: '10px 15px', 
                  borderRadius: msg.sender === 'user' ? '15px 15px 0 15px' : '0 15px 15px 15px', 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                  maxWidth: '85%', 
                  fontSize: '0.9rem', 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleChatSubmit} style={{padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', gap: '10px'}}>
               <input 
                 type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                 placeholder="Message FinalPath AI..." 
                 style={{flex: 1, padding: '10px 15px', borderRadius: '20px', border: 'none', outline: 'none', fontSize: '0.9rem'}}
               />
               <button type="submit" style={{backgroundColor: '#075E54', color: 'white', border: 'none', borderRadius: '20px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><ArrowRight size={20} /></button>
            </form>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-green-500 hover:bg-green-600 transition" style={{color: 'white', width: '65px', height: '65px', borderRadius: '35px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)', marginLeft: 'auto'}}>
          {isChatOpen ? <span style={{fontSize: '28px', fontWeight: 'bold'}}>✕</span> : <MessageCircle size={32} />}
        </button>
      </div>

      {/* ================================================== */}
      {/* PAGE 1: HOME PAGE */}
      {/* ================================================== */}
      {currentPage === 'home' && (
        <div className="animate-fade">
          <section className="hero" style={{paddingBottom: '80px'}}>
            <div className="container" style={{maxWidth: '800px', margin: '0 auto'}}>
              <h1>No Family Should Navigate <br /> Loss Alone.</h1>
              <button className="btn-primary" onClick={() => setCurrentPage('register')} style={{marginTop: '20px', marginBottom: '50px'}}>
                <PhoneCall size={20} /> Register a Case Now
              </button>

              {/* CORE WORKFLOW TRACKER */}
              <div style={{textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.95)', padding: '35px 40px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)'}}>
                 <h3 style={{color: 'var(--text-dark)', margin: '0 0 25px 0', fontSize: '1.3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px'}}>The FinalPath Promise</h3>
                 
                 {/* Step 1 */}
                 <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', minHeight: '60px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch'}}>
                       <div style={{backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#3b82f6'}}><CheckCircle size={22} /></div>
                       <div style={{width: '2px', backgroundColor: '#bfdbfe', flex: 1, margin: '8px 0'}}></div>
                    </div>
                    <div style={{paddingTop: '6px', display: 'flex', alignItems: 'center'}}>
                       <strong style={{display: 'block', fontSize: '1.15rem', color: '#1e293b'}}>Real-time status updates at every step</strong>
                    </div>
                 </div>

                 {/* Step 2 */}
                 <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', minHeight: '60px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch'}}>
                       <div style={{backgroundColor: '#fdf4ff', padding: '10px', borderRadius: '12px', color: '#d946ef'}}><HeartHandshake size={22} /></div>
                       <div style={{width: '2px', backgroundColor: '#f5d0fe', flex: 1, margin: '8px 0'}}></div>
                    </div>
                    <div style={{paddingTop: '6px', display: 'flex', alignItems: 'center'}}>
                       <strong style={{display: 'block', fontSize: '1.15rem', color: '#1e293b'}}>Religious/cultural preferences handled</strong>
                    </div>
                 </div>

                 {/* Step 3 */}
                 <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                       <div style={{backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '12px', color: '#22c55e'}}><ShieldCheck size={22} /></div>
                    </div>
                    <div style={{paddingTop: '6px', display: 'flex', alignItems: 'center'}}>
                       <strong style={{display: 'block', fontSize: '1.15rem', color: '#1e293b'}}>Deceased reaches destination</strong>
                    </div>
                 </div>

              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================================================== */}
      {/* PAGE 2: REGISTRATION FORM */}
      {/* ================================================== */}
      {currentPage === 'register' && (
        <section className="container animate-fade pt-8">
          <div className="form-card" style={{backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
            <h2 style={{marginBottom: '5px', color: 'var(--primary)', fontSize: '2rem'}}>Intake Registration</h2>
            <p style={{marginBottom: '30px', color: 'var(--text-light)'}}>Please provide exact details for accurate logistical routing.</p>
            
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Deceased Person's Name</label>
                <input type="text" className="form-input" placeholder="e.g. Anand Sharma" required disabled={isCalculatingRoutes} />
              </div>
              
              <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                  <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                    <label>Age</label>
                    <input type="number" min="0" max="130" className="form-input" placeholder="e.g. 64" required disabled={isCalculatingRoutes} />
                  </div>
                  <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                    <label>Gender</label>
                    <select className="form-input" required disabled={isCalculatingRoutes} style={{backgroundColor: 'white'}}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                  </div>
              </div>

              <div className="form-group"><label>Origin City / Hospital</label><input type="text" className="form-input" placeholder="e.g. Mumbai, MH" required disabled={isCalculatingRoutes} /></div>
              <div className="form-group"><label>Destination City / Mortuary</label><input type="text" className="form-input" placeholder="e.g. Chennai, TN" required disabled={isCalculatingRoutes} /></div>
              
              <div className="form-group" style={{marginTop: '20px'}}>
                 <label>Religious / Cultural Protocol Focus</label>
                 <select className="form-input" required disabled={isCalculatingRoutes} style={{backgroundColor: 'white'}}>
                    <option value="">Select Primary Preference</option>
                    <option value="Hindu">Hindu (Cremation/Antim Sanskar protocols)</option>
                    <option value="Muslim">Muslim (Ghusl/Burial protocols)</option>
                    <option value="Christian">Christian (Embalming/Casket protocols)</option>
                    <option value="General">No Cultural Preference Needed</option>
                 </select>
              </div>

              <div style={{display: 'flex', gap: '15px', marginTop: '30px'}}>
                <button type="button" className="btn-secondary" onClick={() => setCurrentPage('home')} disabled={isCalculatingRoutes}>Cancel</button>
                <button type="submit" className="btn-primary" style={{flex: 1, justifyContent: 'center', opacity: isCalculatingRoutes ? 0.7 : 1}} disabled={isCalculatingRoutes}>
                  {isCalculatingRoutes ? 'Calculating Route...' : 'Submit Case'} {!isCalculatingRoutes && <ArrowRight size={20} />}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* PAGE 3: DYNAMIC MARKETPLACE & COORDINATOR */}
      {/* ================================================== */}
      {currentPage === 'coordinator' && (
        <section className="container animate-fade pt-6">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Case Review <span style={{color: 'orange'}}>#IND-8291</span></h2>
          </div>

          <div className="dashboard-grid">
            <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
              
              {/* ASSIGNED HUMAN CARE COORDINATOR */}
              <div className="feature-card animate-fade" style={{display: 'flex', gap: '25px', alignItems: 'center', backgroundColor: '#eff6ff', borderColor: '#bfdbfe', padding: '25px', borderRadius: '15px'}}>
                <img src={myCoordinator.photo} alt={myCoordinator.name} style={{width: '90px', height: '90px', borderRadius: '45px', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                <div>
                  <h3 style={{margin: '0 0 5px 0', color: 'var(--primary)', fontSize: '1.5rem'}}>{myCoordinator.name}</h3>
                  <p style={{margin: 0, fontWeight: '600', color: '#3b82f6', marginBottom: '10px'}}>Dedicated Care Coordinator</p>
                  <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <p style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: 'bold'}}>{myCoordinator.phone}</p>
                    <a href={`tel:${myCoordinator.phone}`} className="bg-green-500 hover:bg-green-600 transition" style={{color: 'white', textDecoration: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)'}}><PhoneCall size={14}/> Call</a>
                  </div>
                </div>
              </div>

              {/* CULTURAL PROTOCOLS */}
              <div className="feature-card animate-fade" style={{backgroundColor: '#faf5ff', borderColor: '#e9d5ff', padding: '25px', borderRadius: '15px'}}>
                 <h3 style={{margin: '0 0 10px 0', color: '#7e22ce', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px'}}><HeartHandshake size={18}/> {caseData.rites} Protocols Active</h3>
                 <p style={{margin: 0, fontSize: '0.9rem', color: '#6b21a8'}}>{getRitualsText(caseData.rites)}</p>
              </div>

              {/* DYNAMIC MARKETPLACE: EXACT PRICING */}
              <div className="feature-card" style={{padding: '30px', borderRadius: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
                   <h3 style={{fontSize: '1.4rem', color: 'var(--primary)', margin: 0}}>Transporter Marketplace</h3>
                </div>
                <p style={{fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '25px'}}>Select transport mode for <strong>{caseData.origin}</strong> to <strong>{caseData.destination}</strong>.</p>
                
                {/* International notice banner */}
                {isInternational && (
                  <div style={{backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '12px 18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#92400e', fontWeight: '600'}}>
                    ✈ International route detected — only Air Cargo is available.
                  </div>
                )}

                {/* Option 1: Road — hidden for international */}
                {!isInternational && (
                 <label onClick={() => !transportConfirmed && setTransportMethod('road')} style={{display: 'flex', justifyContent: 'space-between', cursor: transportConfirmed ? 'not-allowed' : 'pointer', backgroundColor: transportMethod === 'road' ? '#f0fdf4' : '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '15px', border: transportMethod === 'road' ? '2px solid #22c55e' : '1px solid #e2e8f0', opacity: transportConfirmed && transportMethod !== 'road' ? 0.4 : 1, transition: 'all 0.2s'}}>
                   <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                     <div style={{width: '24px', height: '24px', borderRadius: '12px', border: '2px solid #22c55e', backgroundColor: transportMethod === 'road' ? '#22c55e' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
                       {transportMethod === 'road' && <div style={{width:'10px', height:'10px', backgroundColor:'white', borderRadius:'5px'}}></div>}
                     </div>
                     <div>
                       <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem'}}>Inter-State Road Ambulance <Truck size={16} color="var(--secondary)"/></h4>
                       <p style={{fontSize: '0.9rem', color: 'var(--text-light)', margin: '5px 0 0 0'}}>ETA: Approx {Math.floor(etaDetails.timeRoad / 60)}h {etaDetails.timeRoad % 60}m</p>
                     </div>
                   </div>
                   <strong style={{fontSize: '1.4rem', color: 'var(--primary)'}}>₹{etaDetails.priceRoad.toLocaleString('en-IN')}</strong>
                 </label>
                )}

                {/* Warning if no airport */}
                {!destHasAirport && !isInternational && (
                  <div style={{backgroundColor: '#fee2e2', border: '1px solid #f87171', borderRadius: '10px', padding: '12px 18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#991b1b', fontWeight: '600'}}>
                    ⚠ Destination does not have direct cargo airport facilities. Only road transport is available.
                  </div>
                )}

                {/* Option 2: Air Cargo — hidden if NO airport */}
                {destHasAirport && (
                  <label onClick={() => !transportConfirmed && setTransportMethod('air')} style={{display: 'flex', justifyContent: 'space-between', cursor: transportConfirmed ? 'not-allowed' : 'pointer', backgroundColor: transportMethod === 'air' ? '#f0fdf4' : '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '15px', border: transportMethod === 'air' ? '2px solid #22c55e' : '1px solid #e2e8f0', opacity: transportConfirmed && transportMethod !== 'air' ? 0.4 : 1, transition: 'all 0.2s'}}>
                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                      <div style={{width: '24px', height: '24px', borderRadius: '12px', border: '2px solid #22c55e', backgroundColor: transportMethod === 'air' ? '#22c55e' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {transportMethod === 'air' && <div style={{width:'10px', height:'10px', backgroundColor:'white', borderRadius:'5px'}}></div>}
                      </div>
                      <div>
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem'}}>Air Cargo Transfer (Flights) <Plane size={16} color="var(--secondary)"/></h4>
                        <p style={{fontSize: '0.9rem', color: 'var(--text-light)', margin: '5px 0 0 0'}}>ETA: Approx {Math.floor(etaDetails.timeAir / 60)}h {etaDetails.timeAir % 60}m</p>
                      </div>
                    </div>
                    <strong style={{fontSize: '1.4rem', color: 'var(--primary)'}}>₹{etaDetails.priceAir.toLocaleString('en-IN')}</strong>
                  </label>
                )}
                
                <div style={{marginTop: '25px'}}>
                   {!transportConfirmed ? (
                       <button disabled={!transportMethod} className={transportMethod ? "btn-primary" : "btn-secondary"} style={{width: '100%', padding: '20px', fontSize: '1.2rem', justifyContent: 'center', opacity: transportMethod ? 1 : 0.5}} onClick={handleConfirmService}>
                         Confirm {transportMethod === 'road' ? 'Ambulance' : (transportMethod === 'air' ? 'Air Cargo' : 'Service')} <CheckCircle size={20} style={{marginLeft: '10px'}} />
                       </button>
                   ) : (
                       <div style={{backgroundColor: '#dcfce7', color: '#16a34a', padding: '15px', borderRadius: '10px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #bbf7d0'}}>
                           ✔ Transportation Successfully Confirmed
                       </div>
                   )}
                </div>
              </div>
            </div>

            {/* DOCUMENT CHECKLIST */}
            <div>
              <div className="feature-card" style={{padding: '30px', borderRadius: '15px'}}>
                <h3 style={{fontSize: '1.4rem', color: 'var(--primary)'}}>Verification Checklist</h3>
                <p style={{fontSize: '0.9rem', marginBottom: '25px'}}>{isInternational ? 'Required for International Repatriation & Customs Clearance.' : 'Required for State-to-State transfer legality.'}</p>
                {getDocumentList(caseData.origin, caseData.destination, isInternational, transportMethod, transportConfirmed, scannedDocsCount).map((doc, idx) => (
                  <div key={doc.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', opacity: transportConfirmed ? 1 : 0.6}}>
                    <div style={{display:'flex', flexDirection: 'column', gap:'8px'}}>
                      <span style={{fontWeight:'bold', fontSize: '1.1rem', color: '#1e293b'}}>{idx + 1}. {doc.name}</span>
                      {doc.viewable && (
                        <button onClick={() => setDocViewerOpen(doc.viewable)} className="hover:bg-slate-200 transition" style={{border:'1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius:'5px', padding:'6px 10px', fontSize:'0.85rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', width: 'max-content', color: '#475569'}}><Search size={14}/> Validate Data</button>
                      )}
                    </div>
                    <span className={`status-badge ${doc.status.includes('Verified') ? 'status-done' : (doc.status.includes('Scanning') ? 'status-pending' : 'status-pending')}`} style={{whiteSpace: 'nowrap', backgroundColor: doc.status.includes('Scanning') ? '#fef08a' : undefined, color: doc.status.includes('Scanning') ? '#854d0e' : undefined}}>{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* PAGE 4: FULL SCREEN ORIGINAL GOOGLE MAPS */}
      {/* ================================================== */}
      {currentPage === 'tracking' && (
        <section className="animate-fade" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: 'white'}}>
          
          {/* MOVED BUTTON TO TOP RIGHT SO IT WONT OVERLAP GOOGLE INFO CARDS */}
          <div style={{position: 'absolute', top: '20px', right: '30px', zIndex: 10000}}>
             <button onClick={() => setCurrentPage('coordinator')} className="bg-white text-gray-800 px-8 py-4 rounded-full shadow-2xl font-black hover:bg-gray-100 border border-gray-400 transition" style={{boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
                ← Go Back to Dashboard
             </button>
          </div>

          <div style={{position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, backgroundColor: 'rgba(255,255,255,0.95)', padding: '25px 40px', borderRadius: '30px', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.4)', border: '1px solid rgba(0,0,0,0.1)', width: '90%', maxWidth: '800px'}}>
             <h2 style={{margin: '0 0 15px 0', fontSize: '1.4rem', color: trackingStep === 4 ? '#16a34a' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
               <CheckCircle size={24} /> {trackingStep === 4 ? "Delivery Complete" : "Transport Active"}
             </h2>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold', color: '#475569', textAlign: 'center'}}>{caseData.origin} → {caseData.destination}</p>
             
             {/* TICKING COUNTDOWN CLOCK */}
             {trackingStep < 4 && (
                <div style={{margin: '0 auto 20px auto', backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '10px 20px', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ea580c', fontWeight: 'black', fontSize: '1.2rem'}}>
                  ⏱ Arriving in: {Math.floor(displayedMins / 60)}h {Math.floor(displayedMins % 60)}m
                </div>
             )}

             {/* TIMELINE */}
             <div style={{display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '10px'}}>
                <div style={{position: 'absolute', top: '15px', left: '0', width: '100%', height: '4px', backgroundColor: '#e2e8f0', zIndex: 0}}></div>
                <div style={{position: 'absolute', top: '15px', left: '0', width: `${(trackingStep / 4) * 100}%`, height: '4px', backgroundColor: trackingStep === 4 ? '#16a34a' : '#3b82f6', zIndex: 1, transition: 'width 1s ease-in-out'}}></div>
                {TRACKING_STAGES.map((stage, i) => {
                  const total = transportMethod === 'road' ? etaDetails.timeRoad : etaDetails.timeAir;
                  const targetMins = Math.round(total * (1 - (i / 4)));
                  const tH = Math.floor(targetMins / 60);
                  const tM = targetMins % 60;
                  return (
                    <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '20%'}}>
                       <div onClick={() => handleTimelineClick(i)} style={{cursor: 'pointer', width: '34px', height: '34px', borderRadius: '17px', backgroundColor: i <= trackingStep ? (trackingStep === 4 ? '#16a34a' : '#3b82f6') : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'background-color 0.5s', border: '4px solid white'}}>
                         {i <= trackingStep ? '✓' : i + 1}
                       </div>
                       <span style={{fontSize: '0.75rem', marginTop: '8px', textAlign: 'center', color: i <= trackingStep ? '#1e293b' : '#94a3b8', fontWeight: i <= trackingStep ? 'bold' : 'normal'}}>{stage}</span>
                       <span style={{fontSize: '0.65rem', color: '#64748b', marginTop: '2px'}}>{i === 4 ? 'Arrived' : `+ ${tH}h ${tM}m target`}</span>
                    </div>
                  );
                })}
             </div>

             {trackingStep === 4 && (
                <div style={{marginTop: '25px', textAlign: 'center'}}>
                  <button onClick={() => setShowSummary(true)} className="btn-primary" style={{backgroundColor: '#16a34a'}}>View Final Summary Report</button>
                </div>
             )}
          </div>

          {/* RESTORED FULL SCREEN GOOGLE MAP HTML IFRAME WITH REAL ROUTE */}
          {transportMethod === 'air' ? (
              <iframe 
                 key="map-air" width="100%" height="100%" frameBorder="0" scrolling="no" 
                 src={"https://maps.google.com/maps?q=" + encodeURIComponent(caseData.origin + " Airport to " + caseData.destination + " Airport") + "&t=k&z=5&ie=UTF8&iwloc=near&output=embed"}
                 style={{border: 0, display: 'block'}} title="Air Cargo Route"
              ></iframe>
          ) : (
              <iframe 
                 key="map-road" width="100%" height="100%" frameBorder="0" scrolling="no" 
                 src={"https://maps.google.com/maps?q=" + encodeURIComponent(caseData.origin + " to " + caseData.destination) + "&t=m&z=5&ie=UTF8&iwloc=near&output=embed"}
                 style={{border: 0, display: 'block'}} title="Road Ambulance Route"
              ></iframe>
          )}
        </section>
      )}

      {/* ================================================== */}
      {/* PAGE 5: TRANSPORTATION DETAILS PORTAL */}
      {/* ================================================== */}
      {currentPage === 'transportDetails' && (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade">
             
             {/* Header */}
             <div className="bg-blue-600 p-8 text-white text-center rounded-b-3xl shadow-lg relative">
               <button onClick={() => setCurrentPage('coordinator')} className="absolute top-6 left-6 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2 rounded-lg font-black shadow-lg transition flex items-center gap-2">
                 ← Go Back to Dashboard
               </button>
               <h2 className="text-3xl font-bold mt-12 mb-2">Transportation Details</h2>
               <p className="text-blue-200 text-md">Secure Transport ID: TX-8291</p>
             </div>
             
             <div className="p-10 flex flex-col items-center">
                
                {/* Driver Identity Card */}
                {assignedDriver && (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8 text-center" style={{boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
                     <div className="mx-auto w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white" style={{fontSize: '3rem'}}>
                        {assignedDriver.icon}
                     </div>
                     <h3 className="text-2xl font-bold text-gray-800 mb-1">{assignedDriver.name}</h3>
                     <p className="text-blue-600 font-bold mb-4">{assignedDriver.role}</p>
                     
                     <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col gap-3 text-left w-full mx-auto" style={{maxWidth: '300px'}}>
                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Contact:</span> <span className="font-semibold text-slate-800">{assignedDriver.phone}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Assignment:</span> <span className="font-semibold text-slate-800">{transportMethod === 'air' ? 'Flight Number' : 'Vehicle Plate'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Identity Tag:</span> <span className="font-bold text-slate-800">{assignedDriver.vehicle}</span></div>
                     </div>
                  </div>
                )}

               <button onClick={() => setCurrentPage('tracking')} className="w-full bg-green-500 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-green-600 transition">
                  Open Live Tracker Screen
               </button>
             </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* FINAL SUMMARY REPORT MODAL */}
      {/* ================================================== */}
      {showSummary && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
           <div className="animate-fade" style={{backgroundColor: '#f8fafc', width: '90%', maxWidth: '600px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'}}>
              <div style={{backgroundColor: '#16a34a', padding: '25px', color: 'white', textAlign: 'center'}}>
                 <h2 style={{margin: 0, fontSize: '1.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}><CheckCircle size={30}/> Service Complete</h2>
                 <p style={{margin: '5px 0 0 0', opacity: 0.9}}>Summary Report for Case #IND-8291</p>
              </div>
              <div style={{padding: '30px'}}>
                 <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px'}}>
                    <tbody>
                       <tr style={{borderBottom: '1px solid #e2e8f0'}}><td style={{padding: '12px 0', color: '#64748b'}}>Deceased:</td><td style={{padding: '12px 0', fontWeight: 'bold', textAlign: 'right'}}>{caseData.name.toUpperCase()}</td></tr>
                       <tr style={{borderBottom: '1px solid #e2e8f0'}}><td style={{padding: '12px 0', color: '#64748b'}}>Route:</td><td style={{padding: '12px 0', fontWeight: 'bold', textAlign: 'right'}}>{caseData.origin} → {caseData.destination}</td></tr>
                       <tr style={{borderBottom: '1px solid #e2e8f0'}}><td style={{padding: '12px 0', color: '#64748b'}}>Method:</td><td style={{padding: '12px 0', fontWeight: 'bold', textAlign: 'right'}}>{transportMethod === 'air' ? 'Air Cargo' : 'Inter-State Road Ambulance'}</td></tr>
                       <tr style={{borderBottom: '1px solid #e2e8f0'}}><td style={{padding: '12px 0', color: '#64748b'}}>Protocols Exectued:</td><td style={{padding: '12px 0', fontWeight: 'bold', color: '#7e22ce', textAlign: 'right'}}>{caseData.rites} Rites Validated</td></tr>
                       <tr><td style={{padding: '12px 0', color: '#64748b'}}>Final Cost:</td><td style={{padding: '12px 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#3b82f6', textAlign: 'right'}}>₹{transportMethod === 'air' ? etaDetails.priceAir.toLocaleString('en-IN') : etaDetails.priceRoad.toLocaleString('en-IN')}</td></tr>
                    </tbody>
                 </table>
                 <div style={{backgroundColor: '#e2e8f0', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                    <p style={{margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b'}}>Digital Receiver Signature</p>
                    <p style={{fontFamily: 'cursive', fontSize: '1.5rem', color: '#0f172a', margin: 0}}>Verified & Accepted</p>
                 </div>
                 <div style={{marginTop: '30px', textAlign: 'center'}}>
                    <button onClick={() => { setShowSummary(false); setTrackingStep(0); setCurrentPage('home'); }} style={{padding: '12px 24px', backgroundColor: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%'}}>Close & Return Home</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* CUSTOM BRANDED ALERT — replaces browser "localhost says" popup */}
      {alertMsg && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="animate-fade" style={{backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', width: '90%', maxWidth: '420px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)'}}>
            <div style={{background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>🛤️</div>
              <div>
                <p style={{margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Notification</p>
                <h4 style={{margin: 0, color: 'white', fontSize: '1rem', fontWeight: 'bold'}}>FinalPath says</h4>
              </div>
            </div>
            <div style={{padding: '24px 22px'}}>
              <p style={{margin: 0, color: '#334155', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-line'}}>{alertMsg}</p>
            </div>
            <div style={{padding: '0 22px 20px 22px'}}>
              <button
                onClick={() => setAlertMsg('')}
                style={{width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'}}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
