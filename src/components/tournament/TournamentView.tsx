import React, { useState, useEffect } from 'react';
import type { Tournament, TournamentMatch, GameType } from '../../types';
import { db } from '../../db/database';
import { BracketTree } from './BracketTree';
import { Plus, ArrowLeft, Users, Trash2, Trophy, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';

interface TournamentViewProps {
  onLaunchTournamentMatch: (
    tournamentId: string,
    tournamentMatchId: string,
    player1: string,
    player2: string,
    gameType: GameType,
    raceTo: number
  ) => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({ onLaunchTournamentMatch }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [tourneyName, setTourneyName] = useState('Kejuaraan Club PoolScore');
  const [gameType, setGameType] = useState<GameType>('9-Ball');
  const [raceTo, setRaceTo] = useState<number>(7);
  const [numPlayers, setNumPlayers] = useState<4 | 8>(8);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Andi', 'Budi', 'Rizky', 'Dimas', 'Eko', 'Fajar', 'Gilang', 'Hadi'
  ]);

  const fetchTournaments = async () => {
    try {
      const all = await db.tournaments.reverse().sortBy('createdAt');
      setTournaments(all);
      if (selectedTournament) {
        const updated = await db.tournaments.get(selectedTournament.id);
        if (updated) setSelectedTournament(updated);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handlePlayerCountChange = (count: 4 | 8) => {
    setNumPlayers(count);
    const defaults = ['Andi', 'Budi', 'Rizky', 'Dimas', 'Eko', 'Fajar', 'Gilang', 'Hadi'];
    setPlayerNames(defaults.slice(0, count));
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = `TOURNEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Generate single elimination matches
    const matches: TournamentMatch[] = [];

    if (numPlayers === 4) {
      matches.push({
        id: `tm-${tId}-1`,
        tournamentId: tId,
        round: 1,
        matchIndex: 0,
        player1Name: playerNames[0] || 'Player 1',
        player2Name: playerNames[1] || 'Player 2',
        status: 'ready',
        nextMatchIndex: 2,
      });
      matches.push({
        id: `tm-${tId}-2`,
        tournamentId: tId,
        round: 1,
        matchIndex: 1,
        player1Name: playerNames[2] || 'Player 3',
        player2Name: playerNames[3] || 'Player 4',
        status: 'ready',
        nextMatchIndex: 2,
      });
      matches.push({
        id: `tm-${tId}-3`,
        tournamentId: tId,
        round: 2,
        matchIndex: 2,
        player1Name: 'Pemenang Match 1',
        player2Name: 'Pemenang Match 2',
        status: 'pending',
      });
    } else {
      // 8 players: 4 QF -> 2 SF -> 1 Final
      for (let i = 0; i < 4; i++) {
        matches.push({
          id: `tm-${tId}-${i + 1}`,
          tournamentId: tId,
          round: 1,
          matchIndex: i,
          player1Name: playerNames[i * 2] || `Player ${i * 2 + 1}`,
          player2Name: playerNames[i * 2 + 1] || `Player ${i * 2 + 2}`,
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
    }

    const newTournament: Tournament = {
      id: tId,
      name: tourneyName.trim() || 'Turnamen PoolScore',
      gameType,
      format: 'Single Elimination',
      raceTo,
      status: 'in_progress',
      players: playerNames,
      matches,
      createdAt: Date.now(),
    };

    await db.tournaments.put(newTournament);
    setSelectedTournament(newTournament);
    setIsCreateModalOpen(false);
    fetchTournaments();
  };

  const handleDeleteTournament = async (id: string) => {
    if (confirm('Hapus turnamen ini?')) {
      await db.tournaments.delete(id);
      if (selectedTournament?.id === id) {
        setSelectedTournament(null);
      }
      fetchTournaments();
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-20 select-none animate-fade-in px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {selectedTournament && (
              <button
                onClick={() => setSelectedTournament(null)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 mr-1"
                title="Kembali ke Daftar Turnamen"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-rose-500" />
              {selectedTournament ? selectedTournament.name : 'Turnamen & Bagan Bracket'}
            </h2>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            {selectedTournament
              ? `${selectedTournament.gameType} · Format Single Elimination · Race to ${selectedTournament.raceTo}`
              : 'Kelola kompetisi sistem gugur dengan bagan pertandingan otomatis dan pencatatan skor live.'}
          </p>
        </div>

        {!selectedTournament && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Turnamen Baru
          </button>
        )}
      </div>

      {/* View 1: Active Tournament Bracket */}
      {selectedTournament ? (
        <div className="space-y-4">
          <BracketTree
            tournament={selectedTournament}
            onPlayMatch={(m) => {
              onLaunchTournamentMatch(
                selectedTournament.id,
                m.id,
                m.player1Name,
                m.player2Name,
                selectedTournament.gameType,
                selectedTournament.raceTo
              );
            }}
          />
        </div>
      ) : (
        /* View 2: Tournament List */
        <div className="grid gap-3 sm:grid-cols-2">
          {tournaments.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <div className="font-bold text-base text-white">
                Belum Ada Turnamen
              </div>
              <div className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-4">
                Buat turnamen pertama Anda untuk mengorganisir kompetisi club dengan bagan gugur otomatis.
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm"
              >
                + Buat Turnamen Sekarang
              </button>
            </div>
          ) : (
            tournaments.map((t) => {
              const isCompleted = t.status === 'completed';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTournament(t)}
                  className="p-4 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm select-none group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-rose-400 uppercase">
                        {t.gameType} · RACE TO {t.raceTo}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase ${
                          isCompleted
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isCompleted ? 'SELESAI' : 'BERLANGSUNG'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-rose-400 transition-colors">
                      {t.name}
                    </h3>

                    {t.winnerName && (
                      <div className="text-xs text-rose-400 mt-1 font-medium">
                        Juara: <strong>{t.winnerName}</strong>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {t.players.length} Pemain ({t.format})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTournament(t.id);
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Hapus Turnamen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-zinc-300 group-hover:text-white font-medium text-xs flex items-center gap-0.5">
                        Buka Bagan <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Tournament Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Turnamen Baru"
      >
        <form onSubmit={handleCreateTournament} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Nama Turnamen / Event
            </label>
            <input
              type="text"
              value={tourneyName}
              onChange={(e) => setTourneyName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-rose-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Game
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="9-Ball">9-Ball</option>
                <option value="8-Ball">8-Ball</option>
                <option value="10-Ball">10-Ball</option>
                <option value="Straight Pool">Straight Pool</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Race To (Poin Menang)
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={raceTo}
                onChange={(e) => setRaceTo(parseInt(e.target.value, 10) || 7)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Jumlah Pemain (Bagan Bracket)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePlayerCountChange(4)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  numPlayers === 4
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                4 Pemain (Semi Final)
              </button>
              <button
                type="button"
                onClick={() => handlePlayerCountChange(8)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  numPlayers === 8
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                8 Pemain (Quarter Final)
              </button>
            </div>
          </div>

          {/* Player Names Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Daftar Peserta Pemain
            </label>
            <div className="grid grid-cols-2 gap-2">
              {playerNames.map((name, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 rounded-xl">
                  <span className="text-[11px] font-mono text-zinc-500 font-bold w-4">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...playerNames];
                      updated[idx] = e.target.value;
                      setPlayerNames(updated);
                    }}
                    placeholder={`Pemain ${idx + 1}`}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              Generate Bagan Turnamen
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
