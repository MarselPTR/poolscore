import type { TournamentMatch, TournamentFormat } from '../types';

export function generateTournamentMatches(
  tId: string,
  players: string[],
  format: TournamentFormat,
  numPlayers: number
): TournamentMatch[] {
  const matches: TournamentMatch[] = [];

  // 1. SINGLE ELIMINATION
  if (format === 'Single Elimination') {
    if (numPlayers === 4) {
      // 2 Semifinals -> 1 Final
      matches.push({
        id: `tm-${tId}-1`,
        tournamentId: tId,
        round: 1,
        matchIndex: 0,
        player1Name: players[0] || 'Player 1',
        player2Name: players[1] || 'Player 2',
        status: 'ready',
        nextMatchIndex: 2,
      });
      matches.push({
        id: `tm-${tId}-2`,
        tournamentId: tId,
        round: 1,
        matchIndex: 1,
        player1Name: players[2] || 'Player 3',
        player2Name: players[3] || 'Player 4',
        status: 'ready',
        nextMatchIndex: 2,
      });
      matches.push({
        id: `tm-${tId}-3`,
        tournamentId: tId,
        round: 2,
        matchIndex: 2,
        player1Name: 'Pemenang Semi Final 1',
        player2Name: 'Pemenang Semi Final 2',
        status: 'pending',
      });
    } else if (numPlayers === 8) {
      // 4 QF -> 2 SF -> 1 Final
      for (let i = 0; i < 4; i++) {
        matches.push({
          id: `tm-${tId}-${i + 1}`,
          tournamentId: tId,
          round: 1,
          matchIndex: i,
          player1Name: players[i * 2] || `Player ${i * 2 + 1}`,
          player2Name: players[i * 2 + 1] || `Player ${i * 2 + 2}`,
          status: 'ready',
          nextMatchIndex: 4 + Math.floor(i / 2),
        });
      }
      matches.push({
        id: `tm-${tId}-5`,
        tournamentId: tId,
        round: 2,
        matchIndex: 4,
        player1Name: 'Pemenang QF 1',
        player2Name: 'Pemenang QF 2',
        status: 'pending',
        nextMatchIndex: 6,
      });
      matches.push({
        id: `tm-${tId}-6`,
        tournamentId: tId,
        round: 2,
        matchIndex: 5,
        player1Name: 'Pemenang QF 3',
        player2Name: 'Pemenang QF 4',
        status: 'pending',
        nextMatchIndex: 6,
      });
      matches.push({
        id: `tm-${tId}-7`,
        tournamentId: tId,
        round: 3,
        matchIndex: 6,
        player1Name: 'Pemenang SF 1',
        player2Name: 'Pemenang SF 2',
        status: 'pending',
      });
    } else if (numPlayers === 16) {
      // 8 R16 -> 4 QF -> 2 SF -> 1 Final (15 matches)
      for (let i = 0; i < 8; i++) {
        matches.push({
          id: `tm-${tId}-${i + 1}`,
          tournamentId: tId,
          round: 1,
          matchIndex: i,
          player1Name: players[i * 2] || `Player ${i * 2 + 1}`,
          player2Name: players[i * 2 + 1] || `Player ${i * 2 + 2}`,
          status: 'ready',
          nextMatchIndex: 8 + Math.floor(i / 2),
        });
      }
      for (let i = 0; i < 4; i++) {
        matches.push({
          id: `tm-${tId}-${8 + i + 1}`,
          tournamentId: tId,
          round: 2,
          matchIndex: 8 + i,
          player1Name: `Pemenang R16 Match ${i * 2 + 1}`,
          player2Name: `Pemenang R16 Match ${i * 2 + 2}`,
          status: 'pending',
          nextMatchIndex: 12 + Math.floor(i / 2),
        });
      }
      matches.push({
        id: `tm-${tId}-13`,
        tournamentId: tId,
        round: 3,
        matchIndex: 12,
        player1Name: 'Pemenang QF 1',
        player2Name: 'Pemenang QF 2',
        status: 'pending',
        nextMatchIndex: 14,
      });
      matches.push({
        id: `tm-${tId}-14`,
        tournamentId: tId,
        round: 3,
        matchIndex: 13,
        player1Name: 'Pemenang QF 3',
        player2Name: 'Pemenang QF 4',
        status: 'pending',
        nextMatchIndex: 14,
      });
      matches.push({
        id: `tm-${tId}-15`,
        tournamentId: tId,
        round: 4,
        matchIndex: 14,
        player1Name: 'Pemenang SF 1',
        player2Name: 'Pemenang SF 2',
        status: 'pending',
      });
    } else if (numPlayers === 32) {
      // 16 R32 -> 8 R16 -> 4 QF -> 2 SF -> 1 Final (31 matches)
      for (let i = 0; i < 16; i++) {
        matches.push({
          id: `tm-${tId}-${i + 1}`,
          tournamentId: tId,
          round: 1,
          matchIndex: i,
          player1Name: players[i * 2] || `Player ${i * 2 + 1}`,
          player2Name: players[i * 2 + 1] || `Player ${i * 2 + 2}`,
          status: 'ready',
          nextMatchIndex: 16 + Math.floor(i / 2),
        });
      }
      for (let i = 0; i < 8; i++) {
        matches.push({
          id: `tm-${tId}-${16 + i + 1}`,
          tournamentId: tId,
          round: 2,
          matchIndex: 16 + i,
          player1Name: `Pemenang R32 #${i * 2 + 1}`,
          player2Name: `Pemenang R32 #${i * 2 + 2}`,
          status: 'pending',
          nextMatchIndex: 24 + Math.floor(i / 2),
        });
      }
      for (let i = 0; i < 4; i++) {
        matches.push({
          id: `tm-${tId}-${24 + i + 1}`,
          tournamentId: tId,
          round: 3,
          matchIndex: 24 + i,
          player1Name: `Pemenang R16 #${i * 2 + 1}`,
          player2Name: `Pemenang R16 #${i * 2 + 2}`,
          status: 'pending',
          nextMatchIndex: 28 + Math.floor(i / 2),
        });
      }
      matches.push({
        id: `tm-${tId}-29`,
        tournamentId: tId,
        round: 4,
        matchIndex: 28,
        player1Name: 'Pemenang QF 1',
        player2Name: 'Pemenang QF 2',
        status: 'pending',
        nextMatchIndex: 30,
      });
      matches.push({
        id: `tm-${tId}-30`,
        tournamentId: tId,
        round: 4,
        matchIndex: 29,
        player1Name: 'Pemenang QF 3',
        player2Name: 'Pemenang QF 4',
        status: 'pending',
        nextMatchIndex: 30,
      });
      matches.push({
        id: `tm-${tId}-31`,
        tournamentId: tId,
        round: 5,
        matchIndex: 30,
        player1Name: 'Pemenang SF 1',
        player2Name: 'Pemenang SF 2',
        status: 'pending',
      });
    }
  }

  // 2. DOUBLE ELIMINATION
  else if (format === 'Double Elimination') {
    // Standard Double Elimination: Winners Bracket, Losers Bracket, & Grand Final
    const count = numPlayers === 4 ? 4 : numPlayers === 16 ? 16 : 8;

    if (count === 4) {
      // Winners Round 1 (2 matches)
      matches.push({
        id: `tm-${tId}-w1`,
        tournamentId: tId,
        round: 1,
        matchIndex: 0,
        bracketType: 'winners',
        player1Name: players[0] || 'Player 1',
        player2Name: players[1] || 'Player 2',
        status: 'ready',
        nextMatchIndex: 2,
        nextLoserMatchIndex: 3,
      });
      matches.push({
        id: `tm-${tId}-w2`,
        tournamentId: tId,
        round: 1,
        matchIndex: 1,
        bracketType: 'winners',
        player1Name: players[2] || 'Player 3',
        player2Name: players[3] || 'Player 4',
        status: 'ready',
        nextMatchIndex: 2,
        nextLoserMatchIndex: 3,
      });
      // Winners Final
      matches.push({
        id: `tm-${tId}-wf`,
        tournamentId: tId,
        round: 2,
        matchIndex: 2,
        bracketType: 'winners',
        player1Name: 'Pemenang W-Match 1',
        player2Name: 'Pemenang W-Match 2',
        status: 'pending',
        nextMatchIndex: 5,
        nextLoserMatchIndex: 4,
      });
      // Losers Round 1
      matches.push({
        id: `tm-${tId}-l1`,
        tournamentId: tId,
        round: 1,
        matchIndex: 3,
        bracketType: 'losers',
        player1Name: 'Kalah W-Match 1',
        player2Name: 'Kalah W-Match 2',
        status: 'pending',
        nextMatchIndex: 4,
      });
      // Losers Final
      matches.push({
        id: `tm-${tId}-lf`,
        tournamentId: tId,
        round: 2,
        matchIndex: 4,
        bracketType: 'losers',
        player1Name: 'Pemenang L-Match 1',
        player2Name: 'Kalah Winners Final',
        status: 'pending',
        nextMatchIndex: 5,
      });
      // Grand Final
      matches.push({
        id: `tm-${tId}-gf`,
        tournamentId: tId,
        round: 3,
        matchIndex: 5,
        bracketType: 'finals',
        player1Name: 'Juara Winners Bracket',
        player2Name: 'Juara Losers Bracket',
        status: 'pending',
      });
    } else {
      // 8 Players Double Elimination (default)
      // Winners QF (4 matches)
      for (let i = 0; i < 4; i++) {
        matches.push({
          id: `tm-${tId}-w${i + 1}`,
          tournamentId: tId,
          round: 1,
          matchIndex: i,
          bracketType: 'winners',
          player1Name: players[i * 2] || `Player ${i * 2 + 1}`,
          player2Name: players[i * 2 + 1] || `Player ${i * 2 + 2}`,
          status: 'ready',
          nextMatchIndex: 4 + Math.floor(i / 2),
          nextLoserMatchIndex: 6 + Math.floor(i / 2),
        });
      }
      // Winners SF (2 matches)
      matches.push({
        id: `tm-${tId}-w5`,
        tournamentId: tId,
        round: 2,
        matchIndex: 4,
        bracketType: 'winners',
        player1Name: 'Pemenang W-QF 1',
        player2Name: 'Pemenang W-QF 2',
        status: 'pending',
        nextMatchIndex: 10,
        nextLoserMatchIndex: 8,
      });
      matches.push({
        id: `tm-${tId}-w6`,
        tournamentId: tId,
        round: 2,
        matchIndex: 5,
        bracketType: 'winners',
        player1Name: 'Pemenang W-QF 3',
        player2Name: 'Pemenang W-QF 4',
        status: 'pending',
        nextMatchIndex: 10,
        nextLoserMatchIndex: 9,
      });
      // Losers Round 1 (2 matches)
      matches.push({
        id: `tm-${tId}-l1`,
        tournamentId: tId,
        round: 1,
        matchIndex: 6,
        bracketType: 'losers',
        player1Name: 'Kalah W-QF 1',
        player2Name: 'Kalah W-QF 2',
        status: 'pending',
        nextMatchIndex: 8,
      });
      matches.push({
        id: `tm-${tId}-l2`,
        tournamentId: tId,
        round: 1,
        matchIndex: 7,
        bracketType: 'losers',
        player1Name: 'Kalah W-QF 3',
        player2Name: 'Kalah W-QF 4',
        status: 'pending',
        nextMatchIndex: 9,
      });
      // Losers Round 2 (2 matches)
      matches.push({
        id: `tm-${tId}-l3`,
        tournamentId: tId,
        round: 2,
        matchIndex: 8,
        bracketType: 'losers',
        player1Name: 'Pemenang L-R1 Match 1',
        player2Name: 'Kalah W-SF 1',
        status: 'pending',
        nextMatchIndex: 11,
      });
      matches.push({
        id: `tm-${tId}-l4`,
        tournamentId: tId,
        round: 2,
        matchIndex: 9,
        bracketType: 'losers',
        player1Name: 'Pemenang L-R1 Match 2',
        player2Name: 'Kalah W-SF 2',
        status: 'pending',
        nextMatchIndex: 11,
      });
      // Winners Final
      matches.push({
        id: `tm-${tId}-wf`,
        tournamentId: tId,
        round: 3,
        matchIndex: 10,
        bracketType: 'winners',
        player1Name: 'Pemenang W-SF 1',
        player2Name: 'Pemenang W-SF 2',
        status: 'pending',
        nextMatchIndex: 13,
        nextLoserMatchIndex: 12,
      });
      // Losers Semifinal
      matches.push({
        id: `tm-${tId}-lsf`,
        tournamentId: tId,
        round: 3,
        matchIndex: 11,
        bracketType: 'losers',
        player1Name: 'Pemenang L-R2 #1',
        player2Name: 'Pemenang L-R2 #2',
        status: 'pending',
        nextMatchIndex: 12,
      });
      // Losers Final
      matches.push({
        id: `tm-${tId}-lf`,
        tournamentId: tId,
        round: 4,
        matchIndex: 12,
        bracketType: 'losers',
        player1Name: 'Pemenang L-Semi',
        player2Name: 'Kalah Winners Final',
        status: 'pending',
        nextMatchIndex: 13,
      });
      // Grand Final
      matches.push({
        id: `tm-${tId}-gf`,
        tournamentId: tId,
        round: 5,
        matchIndex: 13,
        bracketType: 'finals',
        player1Name: 'Juara Winners Bracket',
        player2Name: 'Juara Losers Bracket',
        status: 'pending',
      });
    }
  }

  // 3. ROUND ROBIN (SISTEM GRUP)
  else if (format === 'Round Robin') {
    // If 4 players: 1 Group (6 matches: all vs all)
    // If 8 players: 2 Groups of 4 (12 group matches + 2 SF + 1 Final)
    if (numPlayers <= 4) {
      let mIdx = 0;
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          matches.push({
            id: `tm-${tId}-grp-${mIdx + 1}`,
            tournamentId: tId,
            round: 1,
            matchIndex: mIdx,
            bracketType: 'group',
            groupName: 'Grup Utama',
            player1Name: players[i] || `Pemain ${i + 1}`,
            player2Name: players[j] || `Pemain ${j + 1}`,
            status: 'ready',
          });
          mIdx++;
        }
      }
      // Championship Final for top 2
      matches.push({
        id: `tm-${tId}-rr-final`,
        tournamentId: tId,
        round: 2,
        matchIndex: mIdx,
        bracketType: 'finals',
        player1Name: 'Peringkat 1 Grup',
        player2Name: 'Peringkat 2 Grup',
        status: 'pending',
      });
    } else {
      // 8 or more players: Group A and Group B
      const mid = Math.ceil(players.length / 2);
      const groupA = players.slice(0, mid);
      const groupB = players.slice(mid);

      let mIdx = 0;
      // Group A Matches
      for (let i = 0; i < groupA.length; i++) {
        for (let j = i + 1; j < groupA.length; j++) {
          matches.push({
            id: `tm-${tId}-ga-${mIdx + 1}`,
            tournamentId: tId,
            round: 1,
            matchIndex: mIdx,
            bracketType: 'group',
            groupName: 'Grup A',
            player1Name: groupA[i],
            player2Name: groupA[j],
            status: 'ready',
          });
          mIdx++;
        }
      }
      // Group B Matches
      for (let i = 0; i < groupB.length; i++) {
        for (let j = i + 1; j < groupB.length; j++) {
          matches.push({
            id: `tm-${tId}-gb-${mIdx + 1}`,
            tournamentId: tId,
            round: 1,
            matchIndex: mIdx,
            bracketType: 'group',
            groupName: 'Grup B',
            player1Name: groupB[i],
            player2Name: groupB[j],
            status: 'ready',
          });
          mIdx++;
        }
      }
      // Playoff SF 1: Juara Grup A vs Runner-up Grup B
      matches.push({
        id: `tm-${tId}-sf1`,
        tournamentId: tId,
        round: 2,
        matchIndex: mIdx,
        bracketType: 'finals',
        player1Name: 'Juara Grup A',
        player2Name: 'Runner-up Grup B',
        status: 'pending',
        nextMatchIndex: mIdx + 2,
      });
      mIdx++;
      // Playoff SF 2: Juara Grup B vs Runner-up Grup A
      matches.push({
        id: `tm-${tId}-sf2`,
        tournamentId: tId,
        round: 2,
        matchIndex: mIdx,
        bracketType: 'finals',
        player1Name: 'Juara Grup B',
        player2Name: 'Runner-up Grup A',
        status: 'pending',
        nextMatchIndex: mIdx + 1,
      });
      mIdx++;
      // Playoff Grand Final
      matches.push({
        id: `tm-${tId}-grand-final`,
        tournamentId: tId,
        round: 3,
        matchIndex: mIdx,
        bracketType: 'finals',
        player1Name: 'Pemenang Semi Final 1',
        player2Name: 'Pemenang Semi Final 2',
        status: 'pending',
      });
    }
  }

  return matches;
}
