import { GKA_BIG_AIR_MEN_RANKINGS_2026 } from './gkaRankings';

// Real final standings for the two 2026 GKA Big Air events, per-event
// rank/points as published in the official GKA Big Air 2026 Ranking Men PDF
// (matches the season-total ranking exactly: France points + Greece points
// = each athlete's total in gkaRankings.ts).
export interface EventStandingRow {
  rank: number;
  athlete: string;
  points: number;
}

export interface GkaEvent {
  id: string;
  name: string;
  shortLabel: string;
  location: string;
  date: string;
  standings: EventStandingRow[];
}

function photoFor(athlete: string): string {
  return GKA_BIG_AIR_MEN_RANKINGS_2026.find(r => r.athlete === athlete)?.photoUrl ?? '';
}

export function getCountryForAthlete(athlete: string): string {
  return GKA_BIG_AIR_MEN_RANKINGS_2026.find(r => r.athlete === athlete)?.country ?? '';
}

export function getPhotoForAthlete(athlete: string): string {
  return photoFor(athlete);
}

export const LORDS_OF_TRAM_FRANCE_2026: GkaEvent = {
  id: 'france',
  name: 'Lords of Tram — Red Bull Big Air Kite World Cup',
  shortLabel: 'France',
  location: 'Le Barcarès, France',
  date: '2026-03-31',
  standings: [
    { rank: 1, athlete: 'Jamie Overbeek', points: 1000 },
    { rank: 2, athlete: 'Finn Flügel', points: 870 },
    { rank: 3, athlete: 'Leonardo Casati', points: 770 },
    { rank: 4, athlete: 'Zac Adams', points: 700 },
    { rank: 5, athlete: 'Cohan Van Dijk', points: 580 },
    { rank: 5, athlete: 'Jeremy Burlando', points: 580 },
    { rank: 7, athlete: 'Josué San Ferreira', points: 500 },
    { rank: 7, athlete: 'Andrea Principi', points: 500 },
    { rank: 9, athlete: 'Lorenzo Casati', points: 420 },
    { rank: 9, athlete: 'Shahar Tsabary', points: 420 },
    { rank: 9, athlete: 'Marten Koblischke', points: 420 },
    { rank: 9, athlete: 'Nathan Texier', points: 420 },
    { rank: 13, athlete: 'Maxwell Dahl', points: 280 },
    { rank: 13, athlete: 'Luca Ceruti', points: 280 },
    { rank: 13, athlete: 'Baptiste Jacquemain', points: 280 },
    { rank: 13, athlete: 'Eliott Bouton', points: 280 },
    { rank: 17, athlete: 'Jason Van Der Spuy', points: 140 },
    { rank: 17, athlete: 'Stino Mul', points: 140 },
    { rank: 17, athlete: 'Timo Boersema', points: 140 },
    { rank: 17, athlete: 'Josh Gillitt', points: 140 },
    { rank: 21, athlete: 'Hugo Wigglesworth', points: 90 },
    { rank: 21, athlete: 'Giel Vlugt', points: 90 },
    { rank: 21, athlete: 'Kimo Verkerk', points: 90 },
    { rank: 21, athlete: 'Clement Huot', points: 90 },
  ],
};

export const MYKONOS_GREECE_2026: GkaEvent = {
  id: 'mykonos',
  name: 'Capital.com Red Bull Big Air Kite World Cup',
  shortLabel: 'Greece',
  location: 'Mykonos, Greece',
  date: '2026-05-01',
  standings: [
    { rank: 1, athlete: 'Leonardo Casati', points: 1000 },
    { rank: 2, athlete: 'Lorenzo Casati', points: 870 },
    { rank: 3, athlete: 'Shahar Tsabary', points: 770 },
    { rank: 4, athlete: 'Jamie Overbeek', points: 700 },
    { rank: 5, athlete: 'Josué San Ferreira', points: 580 },
    { rank: 5, athlete: 'Hugo Wigglesworth', points: 580 },
    { rank: 7, athlete: 'Jeremy Burlando', points: 500 },
    { rank: 7, athlete: 'Jason Van Der Spuy', points: 500 },
    { rank: 9, athlete: 'Finn Flügel', points: 420 },
    { rank: 9, athlete: 'Andrea Principi', points: 420 },
    { rank: 9, athlete: 'Giel Vlugt', points: 420 },
    { rank: 9, athlete: 'Parker Sage', points: 420 },
    { rank: 13, athlete: 'Zac Adams', points: 280 },
    { rank: 13, athlete: 'Maxwell Dahl', points: 280 },
    { rank: 13, athlete: 'Stino Mul', points: 280 },
    { rank: 13, athlete: 'Yucel Paralik', points: 280 },
    { rank: 17, athlete: 'Cohan Van Dijk', points: 140 },
    { rank: 17, athlete: 'Marten Koblischke', points: 140 },
    { rank: 17, athlete: 'Josh Gillitt', points: 140 },
    { rank: 17, athlete: 'Kimo Verkerk', points: 140 },
    { rank: 21, athlete: 'Luca Ceruti', points: 90 },
    { rank: 21, athlete: 'Baptiste Bourdoulous', points: 90 },
    { rank: 21, athlete: 'Max Tullett', points: 90 },
    { rank: 21, athlete: 'Jinne Boer', points: 90 },
  ],
};

export const GKA_EVENTS_2026: GkaEvent[] = [LORDS_OF_TRAM_FRANCE_2026, MYKONOS_GREECE_2026];
