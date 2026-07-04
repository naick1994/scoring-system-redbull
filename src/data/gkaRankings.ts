// Snapshot of the GKA Kite World Tour 2026 Big Air rankings (Men's category
// only, since that's the rider's own division) — hardcoded, no backend/live
// fetch available. Source: https://www.gkakiteworldtour.com/rankings-2026/big-air/
// Update this list by hand if the standings change before the pitch.
export interface RankingRow {
  rank: number;
  athlete: string;
  country: string;
  points: number;
}

export const GKA_BIG_AIR_MEN_RANKINGS_2026: RankingRow[] = [
  { rank: 1, athlete: 'Leonardo Casati', country: 'Italy', points: 1770 },
  { rank: 2, athlete: 'Jamie Overbeek', country: 'Netherlands', points: 1700 },
  { rank: 3, athlete: 'Lorenzo Casati', country: 'Spain', points: 1290 },
  { rank: 4, athlete: 'Finn Flügel', country: 'Germany', points: 1290 },
  { rank: 5, athlete: 'Shahar Tsabary', country: 'Israel', points: 1190 },
  { rank: 6, athlete: 'Josué San Ferreira', country: 'Brazil', points: 1080 },
  { rank: 7, athlete: 'Jeremy Burlando', country: 'Spain', points: 1080 },
  { rank: 8, athlete: 'Zac Adams', country: 'USA', points: 980 },
  { rank: 9, athlete: 'Andrea Principi', country: 'Italy', points: 920 },
  { rank: 10, athlete: 'Cohan Van Dijk', country: 'Netherlands', points: 720 },
  { rank: 11, athlete: 'Hugo Wigglesworth', country: 'New Zealand', points: 670 },
  { rank: 12, athlete: 'Jason Van Der Spuy', country: 'South Africa', points: 640 },
  { rank: 13, athlete: 'Marten Koblischke', country: 'Germany', points: 560 },
  { rank: 14, athlete: 'Maxwell Dahl', country: 'Denmark', points: 560 },
  { rank: 15, athlete: 'Giel Vlugt', country: 'Netherlands', points: 510 },
  { rank: 16, athlete: 'Parker Sage', country: 'USA', points: 420 },
  { rank: 17, athlete: 'Nathan Texier', country: 'France', points: 420 },
  { rank: 18, athlete: 'Stino Mul', country: 'Netherlands', points: 420 },
  { rank: 19, athlete: 'Luca Ceruti', country: 'South Africa', points: 370 },
  { rank: 20, athlete: 'Yucel Paralik', country: 'Cyprus', points: 280 },
  { rank: 21, athlete: 'Josh Gillitt', country: 'South Africa', points: 280 },
  { rank: 22, athlete: 'Baptiste Jacquemain', country: 'France', points: 280 },
  { rank: 22, athlete: 'Eliott Bouton', country: 'France', points: 280 },
  { rank: 24, athlete: 'Kimo Verkerk', country: 'Netherlands', points: 230 },
  { rank: 25, athlete: 'Timo Boersema', country: 'Netherlands', points: 140 },
  { rank: 26, athlete: 'Baptiste Bourdoulous', country: 'Greece', points: 90 },
  { rank: 26, athlete: 'Jinne Boer', country: 'Netherlands', points: 90 },
  { rank: 26, athlete: 'Max Tullett', country: 'Great Britain', points: 90 },
  { rank: 29, athlete: 'Clement Huot', country: 'France', points: 90 },
];
