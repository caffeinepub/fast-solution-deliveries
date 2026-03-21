export interface DistanceResult {
  distance: number;
  confidence: "high" | "medium" | "low";
  pickupArea: string | null;
  dropArea: string | null;
  method: string;
}

interface AreaCoord {
  name: string;
  lat: number;
  lng: number;
}

const DELHI_NCR_AREAS: AreaCoord[] = [
  // Delhi Central
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Karol Bagh", lat: 28.6519, lng: 77.1909 },
  { name: "Paharganj", lat: 28.6432, lng: 77.2133 },
  { name: "Chandni Chowk", lat: 28.6506, lng: 77.2303 },
  { name: "Kashmere Gate", lat: 28.6676, lng: 77.2285 },
  { name: "Civil Lines", lat: 28.6768, lng: 77.2246 },

  // Delhi South
  { name: "Lajpat Nagar", lat: 28.57, lng: 77.2373 },
  { name: "Saket", lat: 28.5244, lng: 77.2066 },
  { name: "Hauz Khas", lat: 28.5494, lng: 77.2001 },
  { name: "Greater Kailash", lat: 28.5391, lng: 77.2381 },
  { name: "Malviya Nagar", lat: 28.5303, lng: 77.1975 },
  { name: "South Extension", lat: 28.57, lng: 77.2166 },
  { name: "Okhla", lat: 28.5355, lng: 77.2723 },
  { name: "Kalkaji", lat: 28.5435, lng: 77.2546 },
  { name: "Vasant Kunj", lat: 28.5217, lng: 77.158 },
  { name: "Nizamuddin", lat: 28.5878, lng: 77.2502 },
  { name: "Nehru Place", lat: 28.5491, lng: 77.2534 },
  { name: "Defence Colony", lat: 28.5746, lng: 77.2296 },
  { name: "Jangpura", lat: 28.581, lng: 77.2449 },
  { name: "CR Park", lat: 28.5371, lng: 77.2469 },
  { name: "Panchsheel Park", lat: 28.539, lng: 77.2095 },

  // Delhi West
  { name: "Dwarka", lat: 28.5921, lng: 77.046 },
  { name: "Janakpuri", lat: 28.6268, lng: 77.0839 },
  { name: "Rajouri Garden", lat: 28.644, lng: 77.1208 },
  { name: "Uttam Nagar", lat: 28.6224, lng: 77.0591 },
  { name: "Tilak Nagar", lat: 28.6388, lng: 77.096 },
  { name: "Subhash Nagar", lat: 28.6423, lng: 77.1119 },
  { name: "Paschim Vihar", lat: 28.6672, lng: 77.1051 },
  { name: "IGI Airport", lat: 28.5562, lng: 77.1 },

  // Delhi North
  { name: "Rohini", lat: 28.7274, lng: 77.1168 },
  { name: "Pitampura", lat: 28.7015, lng: 77.1328 },
  { name: "Model Town", lat: 28.713, lng: 77.1936 },
  { name: "Shalimar Bagh", lat: 28.7123, lng: 77.1588 },
  { name: "Ashok Vihar", lat: 28.6956, lng: 77.1785 },
  { name: "Wazirabad", lat: 28.746, lng: 77.243 },

  // Delhi East
  { name: "Mayur Vihar", lat: 28.6083, lng: 77.2963 },
  { name: "Laxmi Nagar", lat: 28.6277, lng: 77.2757 },
  { name: "Preet Vihar", lat: 28.6402, lng: 77.2939 },
  { name: "Shahdara", lat: 28.6726, lng: 77.2888 },
  { name: "Anand Vihar", lat: 28.6471, lng: 77.3152 },
  { name: "Patparganj", lat: 28.6228, lng: 77.2919 },
  { name: "Vivek Vihar", lat: 28.6676, lng: 77.3126 },
  { name: "Gandhinagar", lat: 28.6672, lng: 77.2253 },

  // Noida
  { name: "Noida Sector 18", lat: 28.5708, lng: 77.3219 },
  { name: "Sector 18", lat: 28.5708, lng: 77.3219 },
  { name: "Noida Sector 62", lat: 28.6271, lng: 77.3712 },
  { name: "Sector 62", lat: 28.6271, lng: 77.3712 },
  { name: "Noida Sector 63", lat: 28.6235, lng: 77.3809 },
  { name: "Sector 63", lat: 28.6235, lng: 77.3809 },
  { name: "Noida City Centre", lat: 28.5742, lng: 77.3266 },
  { name: "Greater Noida", lat: 28.4744, lng: 77.504 },
  { name: "Indirapuram", lat: 28.6444, lng: 77.3616 },
  { name: "Vaishali", lat: 28.645, lng: 77.3388 },
  { name: "Kaushambi", lat: 28.6479, lng: 77.3244 },
  { name: "Noida Sector 15", lat: 28.5853, lng: 77.3152 },
  { name: "Noida Sector 16", lat: 28.582, lng: 77.3218 },
  { name: "Noida Sector 22", lat: 28.5758, lng: 77.34 },
  { name: "Noida Sector 44", lat: 28.5605, lng: 77.3517 },
  { name: "Noida Sector 50", lat: 28.5942, lng: 77.3691 },
  { name: "Noida Sector 51", lat: 28.5985, lng: 77.37 },
  { name: "Noida Extension", lat: 28.616, lng: 77.4423 },

  // Gurugram
  { name: "Cyber City", lat: 28.4951, lng: 77.0882 },
  { name: "DLF Cyber City", lat: 28.4951, lng: 77.0882 },
  { name: "MG Road", lat: 28.48, lng: 77.0888 },
  { name: "Gurugram MG Road", lat: 28.48, lng: 77.0888 },
  { name: "Sohna Road", lat: 28.4254, lng: 77.0463 },
  { name: "Golf Course Road", lat: 28.4496, lng: 77.1005 },
  { name: "Huda City Centre", lat: 28.457, lng: 77.074 },
  { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { name: "Gurgaon", lat: 28.4595, lng: 77.0266 },
  { name: "Manesar", lat: 28.3566, lng: 76.938 },
  { name: "Sector 14 Gurugram", lat: 28.4721, lng: 77.0394 },
  { name: "Sector 29 Gurugram", lat: 28.4663, lng: 77.0539 },
  { name: "Sector 56 Gurugram", lat: 28.412, lng: 77.1006 },
  { name: "South City", lat: 28.4315, lng: 77.0278 },
  { name: "DLF Phase 1", lat: 28.4766, lng: 77.0963 },
  { name: "DLF Phase 2", lat: 28.4742, lng: 77.085 },
  { name: "DLF Phase 3", lat: 28.486, lng: 77.0819 },
  { name: "DLF Phase 4", lat: 28.4632, lng: 77.0757 },
  { name: "DLF Phase 5", lat: 28.4424, lng: 77.0984 },

  // Ghaziabad
  { name: "Vasundhara", lat: 28.6572, lng: 77.3609 },
  { name: "Raj Nagar Extension", lat: 28.7031, lng: 77.4267 },
  { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { name: "Crossings Republik", lat: 28.6486, lng: 77.4432 },
  { name: "Mohan Nagar", lat: 28.6813, lng: 77.3998 },
  { name: "Lal Kuan", lat: 28.6529, lng: 77.3974 },

  // Faridabad
  { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
  { name: "Ballabhgarh", lat: 28.3426, lng: 77.3228 },
  { name: "NIT Faridabad", lat: 28.3936, lng: 77.3144 },
  { name: "Sector 15 Faridabad", lat: 28.4088, lng: 77.313 },

  // Sonipat
  { name: "Sonipat", lat: 28.9931, lng: 77.0151 },
  { name: "Murthal", lat: 29.0951, lng: 77.0673 },

  // Rohtak
  { name: "Rohtak", lat: 28.8955, lng: 76.6066 },

  // Meerut
  { name: "Meerut", lat: 28.9845, lng: 77.7064 },
  { name: "Meerut Cantonment", lat: 29.008, lng: 77.7143 },

  // Bahadurgarh
  { name: "Bahadurgarh", lat: 28.6921, lng: 76.9245 },

  // Other NCR
  { name: "Bhiwadi", lat: 28.1939, lng: 76.8561 },
  { name: "Rewari", lat: 28.1875, lng: 76.616 },
  { name: "Palwal", lat: 28.1438, lng: 77.3323 },
  { name: "Alwar", lat: 27.553, lng: 76.6346 },
];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findBestMatch(input: string): AreaCoord | null {
  const query = input.toLowerCase().trim();
  if (!query) return null;

  // Exact match first
  let best = DELHI_NCR_AREAS.find((a) => a.name.toLowerCase() === query);
  if (best) return best;

  // Starts with
  best = DELHI_NCR_AREAS.find((a) => a.name.toLowerCase().startsWith(query));
  if (best) return best;

  // Area name contains query
  best = DELHI_NCR_AREAS.find((a) => a.name.toLowerCase().includes(query));
  if (best) return best;

  // Query contains area name (user typed a longer address)
  best = DELHI_NCR_AREAS.find((a) => query.includes(a.name.toLowerCase()));
  if (best) return best;

  // Word-level partial match (any word in query matches any word in area name)
  const queryWords = query.split(/\s+/).filter((w) => w.length >= 3);
  for (const word of queryWords) {
    const found = DELHI_NCR_AREAS.find(
      (a) =>
        a.name.toLowerCase().includes(word) ||
        word.includes(a.name.toLowerCase().split(" ")[0]),
    );
    if (found) return found;
  }

  return null;
}

export function estimateSmartDistance(
  pickup: string,
  drop: string,
): DistanceResult {
  const pickupMatch = findBestMatch(pickup);
  const dropMatch = findBestMatch(drop);

  if (pickupMatch && dropMatch) {
    const straight = haversineKm(
      pickupMatch.lat,
      pickupMatch.lng,
      dropMatch.lat,
      dropMatch.lng,
    );
    const road = Number.parseFloat((straight * 1.35).toFixed(1));
    return {
      distance: Math.max(0.5, road),
      confidence: "high",
      pickupArea: pickupMatch.name,
      dropArea: dropMatch.name,
      method: "Haversine × 1.35 road multiplier",
    };
  }

  if (pickupMatch || dropMatch) {
    const est = Number.parseFloat((8 + Math.random() * 7).toFixed(1));
    return {
      distance: est,
      confidence: "medium",
      pickupArea: pickupMatch?.name ?? null,
      dropArea: dropMatch?.name ?? null,
      method: "Partial area match",
    };
  }

  const est = Number.parseFloat((5 + Math.random() * 15).toFixed(1));
  return {
    distance: est,
    confidence: "low",
    pickupArea: null,
    dropArea: null,
    method: "No area match",
  };
}
