import React, { useState, useEffect } from 'react';
import type { Tournament, GameType, TournamentFormat } from '../../types';
import { db } from '../../db/database';
import { BracketTree } from './BracketTree';
import { PlayerPicker } from './PlayerPicker';
import { RegistrationPanel } from './RegistrationPanel';
import type { TournamentRegistration } from '../../types';
import { generateTournamentMatches } from '../../utils/tournamentGenerator';
import { syncTournamentToSupabase, fetchTournamentsFromSupabase, deleteTournamentFromSupabase } from '../../services/supabaseService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Plus, ArrowLeft, Trash2, ChevronRight } from 'lucide-react';
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

const generateDefaultPlayerNames = (count: number, realPlayers: string[] = []): string[] => {
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    list.push(realPlayers[i] || `Pemain ${i + 1}`);
  }
  return list;
};

const FORMAT_LABEL: Record<TournamentFormat, string> = {
  'Single Elimination': 'Gugur tunggal',
  'Double Elimination': 'Gugur ganda',
  'Round Robin': 'Round robin',
};

export const TournamentView: React.FC<TournamentViewProps> = ({ onLaunchTournamentMatch }) => {
  const { success } = useToast();
  const { user } = useAuth();
  // Only venue admins (and super admins) create & manage tournaments. Everyone
  // else sees them read-only.
  const canManage = !!user && !user.isGuest && (user.role === 'venue_admin' || user.role === 'super_admin');
  const isSuperAdmin = user?.role === 'super_admin';
  const ownsTournament = (t: Tournament | null) =>
    !!t && !!user && (t.createdBy === user.id || isSuperAdmin);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingTournamentId, setDeletingTournamentId] = useState<string | null>(null);
  const [registeredPlayerNames, setRegisteredPlayerNames] = useState<string[]>([]);

  // Form states
  const [tourneyName, setTourneyName] = useState('Kejuaraan Klub');
  const [gameType, setGameType] = useState<GameType>('9-Ball');
  const [tourneyFormat, setTourneyFormat] = useState<TournamentFormat>('Single Elimination');
  const [raceTo, setRaceTo] = useState<number>(7);
  const [numPlayers, setNumPlayers] = useState<number>(8);
  // When on, the tournament opens for self-registration (no bracket yet).
  const [openRegistration, setOpenRegistration] = useState<boolean>(false);
  const [playerNames, setPlayerNames] = useState<string[]>(() => generateDefaultPlayerNames(8));
  // Account id per participant slot (undefined = walk-in / not linked).
  const [participantIds, setParticipantIds] = useState<(string | undefined)[]>(() => Array(8).fill(undefined));

  const fetchTournaments = async () => {
    try {
      // Tournaments are public: read the shared list from the cloud so
      // participants see every venue's open tournaments. Fall back to local.
      const cloud = await fetchTournamentsFromSupabase();
      let all: Tournament[];
      if (cloud.length > 0) {
        await db.tournaments.bulkPut(cloud);
        all = cloud;
      } else {
        all = await db.tournaments.reverse().sortBy('createdAt');
      }
      setTournaments(all);
      if (selectedTournament) {
        const updated = all.find((t) => t.id === selectedTournament.id);
        if (updated) setSelectedTournament(updated);
      }

      const allPlayers = await db.players.toArray();
      const names = allPlayers.map(p => p.name).filter(Boolean);
      setRegisteredPlayerNames(names);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handlePlayerCountChange = (count: number) => {
    setNumPlayers(count);
    setPlayerNames(generateDefaultPlayerNames(count, registeredPlayerNames));
    setParticipantIds(Array(count).fill(undefined));
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !user) return;
    const tId = `TOURNEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let newTournament: Tournament;
    if (openRegistration) {
      // Registration tournament: no players/bracket yet — players join first.
      newTournament = {
        id: tId,
        name: tourneyName.trim() || 'Turnamen PoolScore',
        gameType,
        format: tourneyFormat,
        raceTo,
        status: 'draft',
        maxPlayers: numPlayers,
        players: [],
        participants: [],
        matches: [],
        venueName: user.venueName,
        isPublic: true,
        createdBy: user.id,
        createdAt: Date.now(),
      };
    } else {
      const cleanedPlayers = playerNames.map((p, idx) => p.trim() || `Pemain ${idx + 1}`);
      const matches = generateTournamentMatches(tId, cleanedPlayers, tourneyFormat, numPlayers);
      const participants = cleanedPlayers.map((name, idx) => ({ name, userId: participantIds[idx] }));
      newTournament = {
        id: tId,
        name: tourneyName.trim() || 'Turnamen PoolScore',
        gameType,
        format: tourneyFormat,
        raceTo,
        status: 'in_progress',
        players: cleanedPlayers,
        participants,
        matches,
        venueName: user.venueName,
        isPublic: true,
        createdBy: user.id,
        createdAt: Date.now(),
      };
    }

    await db.tournaments.put(newTournament);
    syncTournamentToSupabase(newTournament).catch(() => {});
    setSelectedTournament(newTournament);
    setIsCreateModalOpen(false);
    fetchTournaments();
  };

  // Owner starts a registration tournament: build the bracket from registrants.
  const handleStartTournament = async (regs: TournamentRegistration[]) => {
    if (!selectedTournament) return;
    const count = regs.length;
    const players = regs.map((r) => r.name);
    const participants = regs.map((r) => ({ name: r.name, userId: r.userId }));
    const matches = generateTournamentMatches(selectedTournament.id, players, selectedTournament.format, count);

    const started: Tournament = {
      ...selectedTournament,
      status: 'in_progress',
      players,
      participants,
      matches,
    };
    await db.tournaments.put(started);
    syncTournamentToSupabase(started).catch(() => {});
    setSelectedTournament(started);
    success('Turnamen dimulai', 'Bagan disusun dari peserta yang mendaftar.');
    fetchTournaments();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTournamentId) return;
    try {
      await db.tournaments.delete(deletingTournamentId);
      deleteTournamentFromSupabase(deletingTournamentId).catch(() => {});
      if (selectedTournament?.id === deletingTournamentId) {
        setSelectedTournament(null);
      }
      success('Turnamen dihapus', 'Bagan dan skor turnamen sudah dihapus.');
      fetchTournaments();
    } catch {
      // ignore
    } finally {
      setDeletingTournamentId(null);
    }
  };

  const formatOptions: { id: TournamentFormat; label: string; desc: string }[] = [
    { id: 'Single Elimination', label: 'Gugur tunggal', desc: 'Kalah sekali, tersingkir' },
    { id: 'Double Elimination', label: 'Gugur ganda', desc: 'Dua kali kalah' },
    { id: 'Round Robin', label: 'Round robin', desc: 'Grup lalu playoff' },
  ];

  return (
    <div className="w-full space-y-6 select-none">
      {/* Header */}
      {selectedTournament ? (
        <div>
          <button
            onClick={() => setSelectedTournament(null)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Semua turnamen
          </button>
          <h1 className="page-title break-words">{selectedTournament.name}</h1>
          <p className="text-sm text-ink-2 mt-1.5">
            {selectedTournament.venueName ? `${selectedTournament.venueName} · ` : ''}
            {selectedTournament.gameType} · {FORMAT_LABEL[selectedTournament.format] || selectedTournament.format} ·{' '}
            {selectedTournament.status === 'draft'
              ? `kuota ${selectedTournament.maxPlayers || '-'} pemain`
              : `${selectedTournament.players.length} pemain`}{' '}
            · race to {selectedTournament.raceTo}
          </p>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-4">
          <h1 className="page-title">Turnamen</h1>
          {canManage && (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary shrink-0">
              <Plus className="w-4 h-4" />
              Turnamen baru
            </button>
          )}
        </div>
      )}

      {selectedTournament ? (
        selectedTournament.status === 'draft' ? (
          <RegistrationPanel
            tournament={selectedTournament}
            isOwner={ownsTournament(selectedTournament)}
            onStart={handleStartTournament}
            onChanged={fetchTournaments}
          />
        ) : (
          <BracketTree
            tournament={selectedTournament}
            readOnly={!ownsTournament(selectedTournament)}
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
        )
      ) : tournaments.length === 0 ? (
        <div className="py-16 text-center border-y border-rule">
          <div className="display text-2xl">Belum ada turnamen</div>
          <p className="text-sm text-ink-2 mt-2 max-w-sm mx-auto">
            {canManage
              ? 'Buat turnamen dan bagan pertandingannya disusun otomatis dari daftar pemain.'
              : 'Belum ada turnamen terbuka. Turnamen yang dibuat pengelola tempat akan muncul di sini.'}
          </p>
          {canManage && (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary mt-5">
              <Plus className="w-4 h-4" />
              Buat turnamen
            </button>
          )}
        </div>
      ) : (
        <div className="rows border-y border-rule">
          {tournaments.map((t) => {
            const isCompleted = t.status === 'completed';
            const isDraft = t.status === 'draft';
            const statusLabel = isCompleted ? 'Selesai' : isDraft ? 'Pendaftaran' : 'Berlangsung';

            return (
              <div key={t.id} className="flex items-center gap-2 hover:bg-panel-2">
                <button
                  onClick={() => setSelectedTournament(t)}
                  className="flex-1 min-w-0 flex items-center gap-4 px-1 py-3.5 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-ink truncate">{t.name}</span>
                      <span className={`tag shrink-0 ${isCompleted ? '' : 'tag-live'}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-[13px] text-ink-3 mt-1 truncate">
                      {t.venueName ? `${t.venueName} · ` : ''}
                      {t.gameType} · race to {t.raceTo} ·{' '}
                      {isDraft ? `kuota ${t.maxPlayers || '-'}` : `${t.players.length} pemain`} ·{' '}
                      {FORMAT_LABEL[t.format] || t.format}
                      {t.winnerName && (
                        <>
                          {' · '}juara <span className="text-ink font-semibold">{t.winnerName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-3 shrink-0" />
                </button>

                {(t.createdBy === user?.id || isSuperAdmin) && (
                  <button
                    onClick={() => setDeletingTournamentId(t.id)}
                    className="icon-btn hover:!text-danger"
                    title="Hapus turnamen"
                    aria-label={`Hapus turnamen ${t.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tournament Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Turnamen baru"
      >
        <form onSubmit={handleCreateTournament} className="space-y-5">
          <div>
            <label htmlFor="t-name" className="label">
              Nama turnamen
            </label>
            <input
              id="t-name"
              type="text"
              value={tourneyName}
              onChange={(e) => setTourneyName(e.target.value)}
              className="field"
              required
            />
          </div>

          <div>
            <span className="label">Format</span>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => {
                    setTourneyFormat(f.id);
                    if (f.id === 'Double Elimination' && numPlayers > 16) {
                      handlePlayerCountChange(16);
                    }
                  }}
                  data-on={tourneyFormat === f.id}
                  className="opt !px-1.5"
                >
                  <span>{f.label}</span>
                  <span className="opt-sub">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-game" className="label">
                Permainan
              </label>
              <select
                id="t-game"
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
                className="field"
              >
                <option value="9-Ball">9-Ball</option>
                <option value="8-Ball">8-Ball</option>
                <option value="10-Ball">10-Ball</option>
                <option value="Straight Pool">Straight Pool</option>
              </select>
            </div>

            <div>
              <label htmlFor="t-race" className="label">
                Race to
              </label>
              <input
                id="t-race"
                type="number"
                min="1"
                max="25"
                value={raceTo}
                onChange={(e) => setRaceTo(parseInt(e.target.value, 10) || 7)}
                className="field"
              />
            </div>
          </div>

          <label className="flex items-start justify-between gap-4 py-2 cursor-pointer border-y border-rule">
            <span className="min-w-0">
              <span className="text-sm text-ink">Buka pendaftaran</span>
              <span className="block text-[12px] text-ink-3 mt-0.5">
                Peserta mendaftar sendiri; bagan disusun saat Anda memulai.
              </span>
            </span>
            <input
              type="checkbox"
              checked={openRegistration}
              onChange={(e) => setOpenRegistration(e.target.checked)}
              className="switch shrink-0 mt-1"
            />
          </label>

          <div>
            <span className="label">{openRegistration ? 'Kuota peserta' : 'Jumlah pemain'}</span>
            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((count) => {
                const disabled = tourneyFormat === 'Double Elimination' && count > 16;
                return (
                  <button
                    type="button"
                    key={count}
                    disabled={disabled}
                    onClick={() => handlePlayerCountChange(count)}
                    data-on={numPlayers === count}
                    className="opt"
                  >
                    <span className="num text-xl">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!openRegistration && (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[13px] font-medium text-ink-2">Peserta ({playerNames.length})</span>
              <button
                type="button"
                onClick={() => {
                  setPlayerNames(generateDefaultPlayerNames(numPlayers, registeredPlayerNames));
                  setParticipantIds(Array(numPlayers).fill(undefined));
                }}
                className="text-[13px] font-medium text-ink-2 hover:text-ink underline underline-offset-2"
              >
                Atur ulang nama
              </button>
            </div>
            <p className="text-[12px] text-ink-3 mb-2">
              Ketik nama bebas untuk pemain walk-in, atau cari pemain terdaftar untuk menautkan ke akunnya
              (ditandai <span className="text-ok">✓</span>).
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-52 overflow-y-auto pr-1">
              {playerNames.map((name, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="num text-base text-ink-3 w-6 text-right shrink-0">{idx + 1}</span>
                  <PlayerPicker
                    index={idx}
                    value={name}
                    linked={!!participantIds[idx]}
                    onChangeName={(val) => {
                      setPlayerNames((prev) => {
                        const u = [...prev];
                        u[idx] = val;
                        return u;
                      });
                      setParticipantIds((prev) => {
                        const u = [...prev];
                        u[idx] = undefined;
                        return u;
                      });
                    }}
                    onPick={(userId, pickedName) => {
                      setPlayerNames((prev) => {
                        const u = [...prev];
                        u[idx] = pickedName;
                        return u;
                      });
                      setParticipantIds((prev) => {
                        const u = [...prev];
                        u[idx] = userId;
                        return u;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          )}

          {openRegistration && (
            <p className="text-[13px] text-ink-3 border-y border-rule py-3">
              Turnamen akan dibuka untuk pendaftaran. Pemain memilih "Daftar" sendiri, lalu Anda menekan
              "Mulai turnamen" untuk menyusun bagan.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-lg btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-lg btn-primary flex-1">
              {openRegistration ? 'Buka pendaftaran' : 'Buat bagan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingTournamentId}
        onClose={() => setDeletingTournamentId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus turnamen ini?"
        message="Seluruh bagan pertandingan dan skor pada turnamen ini akan dihapus permanen."
        confirmText="Ya, hapus"
        cancelText="Batal"
        iconType="delete"
        type="danger"
      />
    </div>
  );
};
