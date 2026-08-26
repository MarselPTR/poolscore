import React, { useState, useEffect } from 'react';
import type { Tournament, GameType, TournamentFormat } from '../../types';
import { db } from '../../db/database';
import { BracketTree } from './BracketTree';
import { generateTournamentMatches } from '../../utils/tournamentGenerator';
import { syncTournamentToSupabase } from '../../services/supabaseService';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
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

const DEFAULT_NAMES = [
  'Andi', 'Budi', 'Rizky', 'Dimas', 'Eko', 'Fajar', 'Gilang', 'Hadi',
  'Irfan', 'Joko', 'Kevin', 'Lukman', 'Maulana', 'Naufal', 'Oki', 'Prasetyo',
  'Qori', 'Rian', 'Satria', 'Taufik', 'Umar', 'Vicky', 'Wahyu', 'Xavier',
  'Yusuf', 'Zainal', 'Agus', 'Bambang', 'Candra', 'Doni', 'Edwin', 'Farhan'
];

export const TournamentView: React.FC<TournamentViewProps> = ({ onLaunchTournamentMatch }) => {
  const { success } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingTournamentId, setDeletingTournamentId] = useState<string | null>(null);

  // Form states
  const [tourneyName, setTourneyName] = useState('Kejuaraan Club PoolScore');
  const [gameType, setGameType] = useState<GameType>('9-Ball');
  const [tourneyFormat, setTourneyFormat] = useState<TournamentFormat>('Single Elimination');
  const [raceTo, setRaceTo] = useState<number>(7);
  const [numPlayers, setNumPlayers] = useState<number>(8);
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_NAMES.slice(0, 8));

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

  const handlePlayerCountChange = (count: number) => {
    setNumPlayers(count);
    setPlayerNames(DEFAULT_NAMES.slice(0, count));
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = `TOURNEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const cleanedPlayers = playerNames.map((p, idx) => p.trim() || `Pemain ${idx + 1}`);
    const matches = generateTournamentMatches(tId, cleanedPlayers, tourneyFormat, numPlayers);

    const newTournament: Tournament = {
      id: tId,
      name: tourneyName.trim() || 'Turnamen PoolScore',
      gameType,
      format: tourneyFormat,
      raceTo,
      status: 'in_progress',
      players: cleanedPlayers,
      matches,
      createdAt: Date.now(),
    };

    await db.tournaments.put(newTournament);
    syncTournamentToSupabase(newTournament).catch(() => {});
    setSelectedTournament(newTournament);
    setIsCreateModalOpen(false);
    fetchTournaments();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTournamentId) return;
    try {
      await db.tournaments.delete(deletingTournamentId);
      if (selectedTournament?.id === deletingTournamentId) {
        setSelectedTournament(null);
      }
      success('Turnamen Dihapus', 'Data bagan turnamen berhasil dihapus.');
      fetchTournaments();
    } catch {
      // ignore
    } finally {
      setDeletingTournamentId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20 select-none animate-fade-in px-2 sm:px-0 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {selectedTournament && (
              <button
                onClick={() => setSelectedTournament(null)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 mr-1 transition-all active:scale-95"
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
              ? `${selectedTournament.gameType} · Format ${selectedTournament.format} (${selectedTournament.players.length} Pemain) · Race to ${selectedTournament.raceTo}`
              : 'Kelola kompetisi biliar sistem Single Elimination, Double Elimination, atau Sistem Grup Round Robin.'}
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
            <div className="col-span-2 p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
              <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <div className="font-bold text-base text-white">
                Belum Ada Turnamen
              </div>
              <div className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-4">
                Buat turnamen biliar pertama Anda untuk mengorganisir kompetisi club dengan bagan gugur otomatis.
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all"
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
                      <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide">
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
                          setDeletingTournamentId(t.id);
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
        <form onSubmit={handleCreateTournament} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
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

          {/* Tournament Format Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Format Bagan Turnamen
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Single Elimination', label: 'Single Elim', desc: 'Gugur Tunggal' },
                { id: 'Double Elimination', label: 'Double Elim', desc: 'Kalah-Menang' },
                { id: 'Round Robin', label: 'Round Robin', desc: 'Sistem Grup' },
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => {
                    const nextFormat = f.id as TournamentFormat;
                    setTourneyFormat(nextFormat);
                    if (nextFormat === 'Double Elimination' && numPlayers > 16) {
                      handlePlayerCountChange(16);
                    }
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    tourneyFormat === f.id
                      ? 'border-rose-500 bg-rose-600 text-white shadow-sm font-bold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Varian Game
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
            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((count) => {
                const disabled = tourneyFormat === 'Double Elimination' && count > 16;
                return (
                  <button
                    type="button"
                    key={count}
                    disabled={disabled}
                    onClick={() => handlePlayerCountChange(count)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                      numPlayers === count
                        ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    {count} Pemain
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Names Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
              <span>Daftar Peserta Pemain ({playerNames.length})</span>
              <button
                type="button"
                onClick={() => setPlayerNames(DEFAULT_NAMES.slice(0, numPlayers))}
                className="text-[11px] text-rose-400 hover:underline capitalize"
              >
                Reset Nama
              </button>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-zinc-950/60 rounded-xl border border-zinc-800">
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

      {/* Delete Tournament Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTournamentId}
        onClose={() => setDeletingTournamentId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Turnamen Ini?"
        message="Seluruh bagan pertandingan dan skor pada turnamen ini akan dihapus secara permanen."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        iconType="delete"
        type="danger"
      />
    </div>
  );
};
