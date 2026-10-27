export const INITIAL_MOCK_ISSUES = [
  {
    id: "g-101",
    title: "Deep Pothole Cluster on Main Carriageway",
    description: "Monsoon erosion has opened up a dangerous 2-foot waterfilled pothole directly in the vehicle lane. Commuters and two-wheelers are swerving into oncoming traffic to avoid it.",
    category: "Roads & Transport",
    status: "In Progress",
    priority: "Critical",
    location: "Outer Ring Road, Pillar 142",
    reported_by_name: "Aditya Singh",
    reported_by_email: "adityasinghfeb102005@gmail.com",
    upvotes: 38,
    image_url: "/issues/pothole-road.png",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    synced_to_sheets: true
  },
  {
    id: "g-102",
    title: "Blocked Stormwater Drain Grating & Refuse Spill",
    description: "Plastic debris, autumn foliage, and municipal waste have completely clogged the roadside drainage inlet, causing rain runoff to overflow onto the pedestrian walkway.",
    category: "Sanitation & Waste",
    status: "Pending Review",
    priority: "High",
    location: "Sector 14 Market Complex, Lane 3",
    reported_by_name: "Pooja Sharma",
    reported_by_email: "pooja.sharma@example.com",
    upvotes: 21,
    image_url: "/issues/drain-clog.png",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    synced_to_sheets: true
  },
  {
    id: "g-103",
    title: "Severe Road Cave-In & Water Pipe Rupture",
    description: "A major underground water main burst, creating a massive 15-foot sinkhole in the road. Traffic has been diverted while repair equipment works on exposed underground conduits.",
    category: "Water Supply & Drainage",
    status: "In Progress",
    priority: "Critical",
    location: "Greenwood Avenue & Central Crossing",
    reported_by_name: "Rohit Verma",
    reported_by_email: "rohit.verma@example.com",
    upvotes: 64,
    image_url: "/issues/pipeline-cavein.png",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    synced_to_sheets: true,
    resolution_notes: "Municipal plumbing squad installed bypass line. Asphalt resurfacing scheduled."
  },
  {
    id: "g-104",
    title: "Overheating Transformer Fire on Utility Pole",
    description: "Overhead transformer on high-voltage pole short-circuited and caught fire with thick smoke billowing near residential buildings. Power supply disconnected for safety.",
    category: "Electrical & Streetlights",
    status: "Resolved",
    priority: "Critical",
    location: "Parkview Road, Crossway 7",
    reported_by_name: "Sneha Patil",
    reported_by_email: "sneha.patil@example.com",
    upvotes: 49,
    image_url: "/issues/electric-fire.png",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    synced_to_sheets: true,
    resolution_notes: "Power grid engineers replaced damaged unit and restored supply."
  },
  {
    id: "g-105",
    title: "Submerged Pedestrian Underpass & Silt Accumulation",
    description: "Subway drainage pumps failed during overnight storm. Over 18 inches of muddy standing water is blocking pedestrian foot access to Metro Station.",
    category: "Water Supply & Drainage",
    status: "Pending Review",
    priority: "High",
    location: "Metro Station North Underpass, Gate 2",
    reported_by_name: "Aditya Singh",
    reported_by_email: "adityasinghfeb102005@gmail.com",
    upvotes: 27,
    image_url: "/issues/drain-clog.png",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    synced_to_sheets: true
  },
  {
    id: "g-106",
    title: "Structural Asphalt Cratering on Highway Off-Ramp",
    description: "Continuous heavy truck movement has broken the top bitumen binding, creating 3 severe jagged ruts that pose serious rim damage and rollover risk for two-wheelers.",
    category: "Roads & Transport",
    status: "Resolved",
    priority: "Medium",
    location: "Eastern Highway Flyover Off-Ramp",
    reported_by_name: "Vikas Mehra",
    reported_by_email: "vikas.mehra@example.com",
    upvotes: 33,
    image_url: "/issues/pothole-road.png",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    synced_to_sheets: true,
    resolution_notes: "Quick-setting cold mix patch laid by municipal highway maintenance team."
  }
];

export const CATEGORIES = [
  "All Categories",
  "Roads & Transport",
  "Sanitation & Waste",
  "Water Supply & Drainage",
  "Electrical & Streetlights",
  "Parks & Public Spaces"
];

export const STATUSES = [
  "All Statuses",
  "Pending Review",
  "In Progress",
  "Resolved"
];
