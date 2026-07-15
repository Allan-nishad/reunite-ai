export const initialIncidents = [
  {
    id: "INC-302",
    type: "Lost Item",
    title: "Black Nike Backpack",
    description: "Black Nike backpack with a white logo. Contains a 15-inch laptop, a notebook, and has a distinct red keychain attached.",
    lastSeen: "Gate 4, East Entrance",
    time: "12 minutes ago",
    reportedAt: "8:15 PM",
    status: "Matching", // Pending, Matching, Resolved
    imageUrl: "/mock_backpack.png",
    priority: "Medium",
    reporterName: "Marcus Vance",
  },
  {
    id: "INC-301",
    type: "Lost Item",
    title: "German Passport",
    description: "Dark brown leather passport holder containing a German passport under the name Klaus Schmidt.",
    lastSeen: "VIP Lounge, Level 2",
    time: "25 minutes ago",
    reportedAt: "8:02 PM",
    status: "Pending",
    imageUrl: "/mock_passport.png",
    priority: "High",
    reporterName: "Klaus Schmidt",
  },
  {
    id: "INC-303",
    type: "Lost Item",
    title: "Blue Jacket",
    description: "Blue Adidas puffer jacket, size L, with white stripes on the sleeves.",
    lastSeen: "Zone B Food Court",
    time: "8 minutes ago",
    reportedAt: "8:19 PM",
    status: "Resolved",
    imageUrl: "/mock_jacket.png",
    priority: "Low",
    reporterName: "Elena Rostova",
  },
  {
    id: "INC-299",
    type: "Lost Child",
    title: "Lost Child (Maya)",
    description: "15-year old teenage girl with long dark brown wavy hair, wearing a grey t-shirt with pink collar trim. Separated near Gate A entrance.",
    lastSeen: "Gate A, Entrance Plaza",
    time: "45 minutes ago",
    reportedAt: "7:42 PM",
    status: "Pending",
    imageUrl: "/mock_girl.jpg",
    priority: "High",
    reporterName: "Elena Rostova (Guardian)",
  },
  {
    id: "INC-298",
    type: "Separated Group",
    title: "Group of 3 Fans (Mexico jersey)",
    description: "Separated from their main tour group. Speaking Spanish, standing near the giant World Cup trophy replica.",
    lastSeen: "Trophy Replica, Fan Zone Plaza",
    time: "1 hour ago",
    reportedAt: "7:27 PM",
    status: "Resolved",
    imageUrl: null,
    priority: "Medium",
    reporterName: "Carlos Mendez",
  }
];

export const initialFoundItems = [
  {
    id: "FND-105",
    description: "Blue puffer jacket found on a chair. Adidas brand, size L.",
    foundLocation: "Food Court, Table 14",
    timeFound: "8:25 PM",
    imageUrl: "/mock_jacket.png",
    status: "Matched"
  },
  {
    id: "FND-102",
    description: "Brown leather passport wallet containing German passport.",
    foundLocation: "VIP Lounge Reception Desk",
    timeFound: "8:10 PM",
    imageUrl: "/mock_passport.png",
    status: "Matched"
  },
  {
    id: "FND-109",
    title: "Black Backpack",
    description: "Black generic sports backpack containing water bottle and sunglasses.",
    foundLocation: "Section 104 Stand",
    timeFound: "15 minutes ago",
    reportedAt: "8:00 PM",
    imageUrl: null,
    status: "Awaiting Owner Report",
    type: "Lost Item"
  },
  {
    id: "FND-110",
    title: "Passport",
    description: "Passport booklet found near concession stand in blue envelope.",
    foundLocation: "Concession Stand A",
    timeFound: "8 minutes ago",
    reportedAt: "8:07 PM",
    imageUrl: null,
    status: "Awaiting Owner Report",
    type: "Lost Item"
  }
];

export const initialAiLogs = [
  { id: 1, message: "🤖 New incident report INC-303 (Blue Jacket) received", time: "8:19 PM", type: "info" },
  { id: 2, message: "🤖 Running visual scan on FND-105 (Blue Jacket)...", time: "8:25 PM", type: "process" },
  { id: 3, message: "✔ AI Match Found: FND-105 matched with INC-303 (98% confidence)", time: "8:25 PM", type: "success" },
  { id: 4, message: "🤖 Incident INC-303 marked as RESOLVED by volunteer", time: "8:29 PM", type: "success" },
  { id: 5, message: "🤖 Processing new report INC-301 (German Passport)", time: "8:02 PM", type: "info" },
  { id: 6, message: "🤖 Comparing INC-301 attributes with local found databases...", time: "8:03 PM", type: "process" }
];

export const sampleMatchResult = {
  incidentId: "INC-302",
  foundItemId: "FND-108",
  confidence: 94,
  foundImageUrl: "/mock_backpack.png",
  reasons: [
    { text: "Same backpack brand and type (Nike Utility)", status: "match" },
    { text: "White Nike logo detected on the center pouch", status: "match" },
    { text: "Red custom keychain matches description", status: "match" },
    { text: "Similar content profiles (notebook and laptop)", status: "match" },
    { text: "Found location differs, which is expected because found items are often moved to volunteers or the Lost & Found desk.", status: "warning" }
  ],
  timeline: [
    { time: "8:15 PM", event: "Lost Report Created (INC-302)" },
    { time: "8:21 PM", event: "Volunteer Uploaded Found Item (FND-108)" },
    { time: "8:21 PM", event: "Visual Attribute Analysis Complete" },
    { time: "8:22 PM", event: "Semantic AI Match Identified" },
    { time: "Pending", event: "Awaiting Hostess Verification" }
  ],
  verificationQuestions: [
    "What is the brand and color of the laptop inside?",
    "Does the notebook have any writing or stickers on the front?",
    "Can you describe any other items inside the smaller pockets?"
  ],
  actions: [
    { text: "Notify Volunteer at Gate 4 Info Desk", status: "done" },
    { text: "Verify Owner Identity and details", status: "pending" },
    { text: "Return Item and document signature", status: "pending" }
  ],
  estimatedResolutionTime: "4 minutes"
};
