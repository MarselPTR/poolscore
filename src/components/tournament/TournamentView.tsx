import React, { useState, useEffect } from 'react';
import type { Tournament, TournamentMatch, GameType } from '../../types';
import { db } from '../../db/database';
import { BracketTree } from './BracketTree';
import { Plus, ArrowLeft, Users, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { IconBracketTree, IconTrophyCup } from '../common/BilliardIcons';

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
      // 4 players: 2 Semi Finals -> 1 Final
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
        player1Name: '',
        player2Name: '',
        status: 'pending',
      });
    } else {
      // 8 players: 4 Quarter Finals -> 2 Semi Finals -> 1 Final
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
        player1Name: '',
        player2Name: '',
        status: 'pending',
        nextMatchIndex: 6,
      });
      matches.push({
        id: `tm-${tId}-6`,
        tournamentId: tId,
        round: 2,
        matchIndex: 5,
        player1Name: '',
        player2Name: '',
        status: 'pending',
        nextMatchIndex: 6,
      });
      matches.push({
        id: `tm-${tId}-7`,
        tournamentId: tId,
        round: 3,
        matchIndex: 6,
        player1Name: '',
        player2Name: '',
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
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            {selectedTournament && (
              <button
                onClick={() => setSelectedTournament(null)}
                className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text mr-1"
                title="Kembali ke Daftar Turnamen"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-text flex items-center gap-2.5">
              <IconBracketTree size={28} />
              {selectedTournament ? selectedTournament.name : 'Turnamen & Bagan Bracket'}
            </h2>
          </div>
          <p className="text-text-dim text-xs mt-0.5">
            {selectedTournament
              ? `${selectedTournament.gameType} · Format Single Elimination · Race to ${selectedTournament.raceTo}`
              : 'Buat kompetisi sistem gugur (single-elimination bracket) yang terhubung langsung dengan papan skor live.'}
          </p>
        </div>

        {!selectedTournament && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-felt/30 transition-all self-start sm:self-auto active:scale-95"
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
            <div className="col-span-2 p-12 text-center rounded-3xl bg-surface-2 border border-line">
              <div className="flex justify-center mb-3">
                <IconTrophyCup size={48} className="opacity-40" />
              </div>
              <div className="font-display font-bold text-lg uppercase text-text">
                Belum Ada Turnamen
              </div>
              <div className="text-xs text-text-dim mt-1 max-w-sm mx-auto mb-4">
                Buat turnamen pertama Anda untuk mengorganisir kompetisi club atau bermain bersama teman-teman dengan bagan otomatis.
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold font-ui text-xs uppercase tracking-wider shadow-md"
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
                  className="p-4 rounded-3xl bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong transition-all cursor-pointer shadow-md select-none group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-felt uppercase">
                        {t.gameType} · RACE TO {t.raceTo}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isCompleted
                            ? 'bg-amber-500/20 text-amber border border-amber-500/30'
                            : 'bg-felt/20 text-emerald-400 border border-felt/30 animate-pulse'
                        }`}
                      >
                        {isCompleted ? 'SELESAI' : 'BERLANGSUNG'}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg uppercase text-text group-hover:text-felt transition-colors">
                      {t.name}
                    </h3>

                    {t.winnerName && (
                      <div className="text-xs font-mono text-amber mt-1 flex items-center gap-1">
                        <IconTrophyCup size={14} /> Juara: <strong>{t.winnerName}</strong>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-mono text-text-faint">
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
                        className="p-1 rounded text-text-faint hover:text-red transition-colors"
                        title="Hapus Turnamen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-felt font-bold group-hover:underline text-[11px]">
                        Buka Bagan →
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
            <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
              Nama Turnamen / Event
            </label>
            <input
              type="text"
              value={tourneyName}
              onChange={(e) => setTourneyName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-sm font-display uppercase tracking-wider text-text focus:outline-none focus:border-felt"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
                Game
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs font-mono text-text focus:outline-none focus:border-felt"
              >
                <option value="9-Ball">9-Ball</option>
                <option value="8-Ball">8-Ball</option>
                <option value="10-Ball">10-Ball</option>
                <option value="Straight Pool">Straight Pool</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
                Race To (Poin Menang)
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={raceTo}
                onChange={(e) => setRaceTo(parseInt(e.target.value, 10) || 7)}
                className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs font-mono text-text focus:outline-none focus:border-felt"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
              Jumlah Pemain (Bagan Bracket)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePlayerCountChange(4)}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold uppercase ${
                  numPlayers === 4
                    ? 'border-felt bg-felt/20 text-emerald-300'
                    : 'border-line bg-surface-2 text-text-dim'
                }`}
              >
                4 Pemain (Semi Final)
              </button>
              <button
                type="button"
                onClick={() => handlePlayerCountChange(8)}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold uppercase ${
                  numPlayers === 8
                    ? 'border-felt bg-felt/20 text-emerald-300'
                    : 'border-line bg-surface-2 text-text-dim'
                }`}
              >
                8 Pemain (Quarter Final)
              </button>
            </div>
          </div>

          {/* Player Names Input */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
              Daftar Peserta Pemain
            </label>
            <div className="grid grid-cols-2 gap-2">
              {playerNames.map((name, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-surface-2 border border-line px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] font-mono text-text-faint font-bold w-4">
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
                    className="w-full bg-transparent text-xs font-mono text-text focus:outline-none"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold uppercase tracking-wider font-ui text-xs shadow-lg transition-all active:scale-95"
            >
              Generate Bagan Turnamen
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-3 rounded-xl bg-surface-3 hover:bg-surface-2 text-text-dim font-bold text-xs uppercase font-ui"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
