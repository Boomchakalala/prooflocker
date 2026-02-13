/**
 * Seed predictions for demo/development purposes
 * These are realistic fake predictions with proper geolocation and evidence
 */

export interface SeedPrediction {
  id: string;
  claim: string;
  category: string;
  lat: number;
  lng: number;
  location: string;
  timestamp: string;
  outcome: 'correct' | 'incorrect' | 'pending';
  evidenceGrade?: 'A' | 'B' | 'C' | 'D';
  lockEvidence?: string;
  resolvedEvidence?: string;
  resolutionNote?: string;
  resolved_at?: string;
  anonId: string;
  authorNumber: number;
  isSeedData: true;
}

export const SEED_PREDICTIONS: SeedPrediction[] = [
  // US - Resolved Correct #1
  {
    id: 'seed-001',
    claim: 'The Federal Reserve will maintain interest rates at 4.25-4.50% through Q1 2026',
    category: 'Finance',
    lat: 38.8951,
    lng: -77.0364,
    location: 'Washington DC, USA',
    timestamp: '2026-01-15T10:30:00Z',
    outcome: 'correct',
    evidenceGrade: 'A',
    lockEvidence: 'Based on FOMC meeting minutes from December 2025 and strong labor market data showing 3.9% unemployment rate. Fed Chair Powell signaled pause in rate adjustments pending inflation stabilization.',
    resolvedEvidence: 'Federal Reserve official statement dated Feb 12, 2026 confirms rates held at 4.25-4.50%. FOMC minutes cite "continued progress on inflation" and "resilient employment" as key factors. Source: federalreserve.gov/newsevents',
    resolutionNote: 'Fed maintained rates exactly as predicted',
    resolved_at: '2026-02-12T18:00:00Z',
    anonId: 'demo-user-001',
    authorNumber: 2847,
    isSeedData: true,
  },

  // US - Pending #2
  {
    id: 'seed-002',
    claim: 'Nvidia stock price will exceed $180 per share by end of March 2026',
    category: 'Markets',
    lat: 37.3688,
    lng: -121.9135,
    location: 'Santa Clara, USA',
    timestamp: '2026-02-10T14:20:00Z',
    outcome: 'pending',
    evidenceGrade: 'B',
    lockEvidence: 'Nvidia currently trading at $165. Strong Q4 earnings beat with data center revenue up 217% YoY. AI chip demand surging, new Blackwell architecture orders exceeding supply. Analyst consensus target: $185.',
    anonId: 'demo-user-002',
    authorNumber: 5621,
    isSeedData: true,
  },

  // China - Resolved Incorrect #1
  {
    id: 'seed-003',
    claim: 'China will lift all remaining COVID testing requirements for international travelers by February 2026',
    category: 'Policy',
    lat: 39.9042,
    lng: 116.4074,
    location: 'Beijing, China',
    timestamp: '2026-01-18T08:15:00Z',
    outcome: 'incorrect',
    evidenceGrade: 'C',
    lockEvidence: 'Recent statements from National Health Commission indicating policy review. Hong Kong has removed most restrictions. Economic pressure to boost tourism sector significant.',
    resolvedEvidence: 'China maintains PCR testing requirement for arrivals from high-risk countries. Official announcement Feb 11, 2026 states "testing protocols remain in effect indefinitely for public health security." Only removed quarantine requirements.',
    resolutionNote: 'Only quarantine lifted, testing remains',
    resolved_at: '2026-02-11T12:00:00Z',
    anonId: 'demo-user-003',
    authorNumber: 1893,
    isSeedData: true,
  },

  // Europe - Resolved Correct #2
  {
    id: 'seed-004',
    claim: 'ECB will cut interest rates by 25 basis points in February 2026 meeting',
    category: 'Finance',
    lat: 50.1109,
    lng: 8.6821,
    location: 'Frankfurt, Germany',
    timestamp: '2026-01-22T11:45:00Z',
    outcome: 'correct',
    evidenceGrade: 'A',
    lockEvidence: 'Eurozone inflation down to 2.3%, below ECB 2.5% threshold. Manufacturing PMI weakening for 6 consecutive months. ECB President Lagarde hinted at "policy adjustment" in January press conference. Market pricing 85% probability of cut.',
    resolvedEvidence: 'ECB officially cuts rates from 3.50% to 3.25% on Feb 6, 2026. Official statement: "Monetary policy stance being recalibrated to support economic growth while maintaining price stability commitment." Source: ECB press release.',
    resolutionNote: 'Exactly 25bp cut as predicted',
    resolved_at: '2026-02-06T14:45:00Z',
    anonId: 'demo-user-004',
    authorNumber: 7234,
    isSeedData: true,
  },

  // US - Pending #3
  {
    id: 'seed-005',
    claim: 'Bitcoin will trade above $110,000 before March 15, 2026',
    category: 'Crypto',
    lat: 40.7128,
    lng: -74.0060,
    location: 'New York, USA',
    timestamp: '2026-02-08T16:30:00Z',
    outcome: 'pending',
    evidenceGrade: 'B',
    lockEvidence: 'BTC currently at $97,400. Spot Bitcoin ETFs seeing record inflows - $2.1B in past week. MicroStrategy acquired additional 5,000 BTC. Technical analysis shows breakout above $100K resistance forming bullish flag pattern targeting $115K.',
    anonId: 'demo-user-005',
    authorNumber: 3412,
    isSeedData: true,
  },

  // Europe - Pending #4
  {
    id: 'seed-006',
    claim: 'UK Labour government will announce snap general election before end of Q1 2026',
    category: 'Politics',
    lat: 51.5074,
    lng: -0.1278,
    location: 'London, UK',
    timestamp: '2026-02-05T09:20:00Z',
    outcome: 'pending',
    evidenceGrade: 'C',
    lockEvidence: 'Recent polling shows Labour lead narrowing to 6 points from 12. PM facing internal party pressure over NHS funding. Constitutional requirement for election by 2029, but speculation mounting after by-election losses.',
    anonId: 'demo-user-006',
    authorNumber: 9156,
    isSeedData: true,
  },

  // China - Pending #5
  {
    id: 'seed-007',
    claim: 'Chinese Yuan will strengthen to 7.0 per USD by end of February 2026',
    category: 'Markets',
    lat: 31.2304,
    lng: 121.4737,
    location: 'Shanghai, China',
    timestamp: '2026-02-01T13:10:00Z',
    outcome: 'pending',
    evidenceGrade: 'B',
    lockEvidence: 'USDCNY currently at 7.18. PBOC signals support for Yuan stability, dollar weakening on Fed pause expectations. China trade surplus widened to $78B in January. Foreign reserves increased $25B, suggesting intervention capacity.',
    anonId: 'demo-user-007',
    authorNumber: 4578,
    isSeedData: true,
  },

  // Europe - Resolved Incorrect #2
  {
    id: 'seed-008',
    claim: 'France will implement nationwide 32-hour work week legislation by February 2026',
    category: 'Policy',
    lat: 48.8566,
    lng: 2.3522,
    location: 'Paris, France',
    timestamp: '2026-01-12T10:00:00Z',
    outcome: 'incorrect',
    evidenceGrade: 'D',
    lockEvidence: 'Labour unions pushing for shorter work week. Some pilot programs in tech sector. President Macron faced pressure to address work-life balance concerns ahead of 2027 elections.',
    resolvedEvidence: 'French Parliament voted down 32-hour work week proposal on Feb 10, 2026. Final vote: 312 against, 223 for. Government statement: "Proposal economically unfeasible given current productivity levels and deficit targets."',
    resolutionNote: 'Proposal rejected in Parliament',
    resolved_at: '2026-02-10T17:30:00Z',
    anonId: 'demo-user-008',
    authorNumber: 6891,
    isSeedData: true,
  },

  // Europe - Pending #6
  {
    id: 'seed-009',
    claim: 'Germany will close its last three nuclear power plants permanently by March 2026',
    category: 'Energy',
    lat: 52.5200,
    lng: 13.4050,
    location: 'Berlin, Germany',
    timestamp: '2026-01-28T15:45:00Z',
    outcome: 'pending',
    evidenceGrade: 'A',
    lockEvidence: 'Official government timeline published Dec 2025 confirms March 31, 2026 shutdown date for Isar 2, Emsland, and Neckarwestheim 2. Decommissioning teams already mobilized. Green Party coalition agreement mandates complete nuclear exit.',
    anonId: 'demo-user-009',
    authorNumber: 8234,
    isSeedData: true,
  },

  // Africa - Pending #7
  {
    id: 'seed-010',
    claim: 'Nigeria will launch CBDC (eNaira 2.0) nationwide expansion reaching 20 million users by Q1 2026',
    category: 'Crypto',
    lat: 9.0579,
    lng: 7.4951,
    location: 'Abuja, Nigeria',
    timestamp: '2026-02-03T12:30:00Z',
    outcome: 'pending',
    evidenceGrade: 'B',
    lockEvidence: 'Central Bank of Nigeria announced eNaira 2.0 rollout in January 2026. Current adoption at 2.4M users. New features include offline payments and merchant incentives. Government mandated salary payments through eNaira for civil servants starting Feb 15.',
    anonId: 'demo-user-010',
    authorNumber: 5127,
    isSeedData: true,
  },

  // US - Pending #8
  {
    id: 'seed-011',
    claim: 'Apple will announce Vision Pro 2 with prescription lens support at March 2026 event',
    category: 'Tech',
    lat: 37.3318,
    lng: -122.0312,
    location: 'Cupertino, USA',
    timestamp: '2026-02-07T11:15:00Z',
    outcome: 'pending',
    evidenceGrade: 'C',
    lockEvidence: 'Supply chain reports from Ming-Chi Kuo indicate M3 chip production for new Vision Pro model. Apple historically holds March events. Patent filings show optical prescription integration system. Vision Pro 1 sales underwhelming, pressure for refresh.',
    anonId: 'demo-user-011',
    authorNumber: 7845,
    isSeedData: true,
  },

  // Europe - Pending #9
  {
    id: 'seed-012',
    claim: 'EU will approve AI Act final implementation rules before March 1, 2026',
    category: 'Policy',
    lat: 50.8503,
    lng: 4.3517,
    location: 'Brussels, Belgium',
    timestamp: '2026-01-30T14:20:00Z',
    outcome: 'pending',
    evidenceGrade: 'A',
    lockEvidence: 'EU Commission published draft implementation rules Jan 20, 2026. 30-day comment period ends Feb 20. Commissioner Breton confirmed "on track for Q1 finalization" in press statement. Member states already approved framework text in December 2025.',
    anonId: 'demo-user-012',
    authorNumber: 2943,
    isSeedData: true,
  },
];
