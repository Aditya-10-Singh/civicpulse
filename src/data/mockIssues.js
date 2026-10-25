export const INITIAL_MOCK_ISSUES = [
  {
    id: "g-101",
    title: "Hazardous Deep Potholes near Metro Pillar 142",
    description: "Monsoon erosion has opened up two large 2-foot potholes directly in the motorcycle lane. Multiple commuters have experienced near-accidents during evening peak hours.",
    category: "Roads & Transport",
    status: "In Progress",
    priority: "Critical",
    location: "Outer Ring Road, Pillar 142",
    reported_by_name: "Aditya Singh",
    reported_by_email: "aditya.singh00552@gmail.com",
    upvotes: 38,
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    synced_to_sheets: true
  },
  {
    id: "g-102",
    title: "Overflowing Waste Dumpster & Blocked Rain Drain",
    description: "The municipal garbage container has remained unemptied for 4 consecutive days. Rain has caused refuse to spill into drainage inlets, creating intense odor and blockage.",
    category: "Sanitation & Waste",
    status: "Pending Review",
    priority: "High",
    location: "Sector 14 Market Complex, Lane 3",
    reported_by_name: "Pooja Sharma",
    reported_by_email: "pooja.sharma@example.com",
    upvotes: 21,
    image_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    synced_to_sheets: true
  },
  {
    id: "g-103",
    title: "Main Potable Water Pipeline Rupture",
    description: "High-pressure potable water pipe cracked at dawn. Clean drinking water was flooding the pavement while nearby apartment complexes lost water pressure.",
    category: "Water Supply & Drainage",
    status: "Resolved",
    priority: "Critical",
    location: "Greenwood Avenue, Block B Crossway",
    reported_by_name: "Rohit Verma",
    reported_by_email: "rohit.verma@example.com",
    upvotes: 64,
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    synced_to_sheets: true,
    resolution_notes: "Municipal plumbing squad replaced 6-meter cast iron segment. Pressure restored at 2 PM."
  },
  {
    id: "g-104",
    title: "5 LED Streetlights Broken on Pedestrian Walkway",
    description: "The entire 200m walkway from the bus terminal to residential quarters has no functional illumination after sunset, creating severe safety concerns.",
    category: "Electrical & Streetlights",
    status: "In Progress",
    priority: "Medium",
    location: "Parkview Road, Crossway 7",
    reported_by_name: "Sneha Patil",
    reported_by_email: "sneha.patil@example.com",
    upvotes: 17,
    image_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    synced_to_sheets: true
  },
  {
    id: "g-105",
    title: "Fallen Tree Branch Obstructing Public Park Track",
    description: "Heavy thunderstorm winds snapped a large banyan branch across the main jogging loop. Senior citizens and children unable to use the northern perimeter.",
    category: "Parks & Public Spaces",
    status: "Pending Review",
    priority: "Low",
    location: "Central Jubilee Park, Jogging Track 2",
    reported_by_name: "Vikas Mehra",
    reported_by_email: "vikas.mehra@example.com",
    upvotes: 9,
    image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    synced_to_sheets: false
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
