import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { GameType, BreakRule } from '../../types';
import { useMatch } from '../../context/MatchContext';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/database';
import { Play, Sliders, Layers } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface QuickMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameType?: GameType;
  initialRaceTo?: number;
  initialPlayer1?: string;
  initialPlayer2?: string;
  tournamentId?: string;
  tournamentMatchId?: string;
  tableNumber?: number;
}

export const QuickMatchModal: React.FC<QuickMatchModalProps> = ({
  isOpen,
  onClose,
  initialGameType,
  initialRaceTo,
  initialPlayer1,
  initialPlayer2,
  tournamentId,
  tournamentMatchId,
  tableNumber,
}) => {
  const { startMatch } = useMatch();
  const { settings, updateSettings } = useSettings();

  const [gameType, setGameType] = useState<GameType>(initialGameType || settings.defaultGame);
  const [raceTo, setRaceTo] = useState<number>(initialRaceTo || settings.defaultRace);
  const [customRace, setCustomRace] = useState<string>('');
  const [isCustomRaceActive, setIsCustomRaceActive] = useState<boolean>(false);

  // Set / Babak System Configuration
  const [targetSets, setTargetSets] = useState<number>(1);
  const [customSets, setCustomSets] = useState<string>('');
  const [isCustomSetsActive, setIsCustomSetsActive] = useState<boolean>(false);

  const [player1Name, setPlayer1Name] = useState<string>(initialPlayer1 || 'Andi');
  const [player2Name, setPlayer2Name] = useState<string>(initialPlayer2 || 'Budi');
  const [savedPlayers, setSavedPlayers] = useState<string[]>([]);

  const [breakRule, setBreakRule] = useState<BreakRule>(settings.defaultBreakRule);
  const [isFoulTracking, setIsFoulTracking] = useState<boolean>(true);
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(settings.showTimer);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [isWakeLockEnabled, setIsWakeLockEnabled] = useState<boolean>(settings.wakeLockEnabled);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const players = await db.players.toArray();
        setSavedPlayers(players.map((p) => p.name));
      } catch {
        // ignore
      }
    };
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const games: GameType[] = ['9-Ball', '8-Ball', '10-Ball', 'Straight Pool', 'Custom'];
  const racePresets = [3, 5, 7, 9, 11];

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRace = isCustomRaceActive && customRace ? parseInt(customRace, 10) || 7 : raceTo;
    const finalSets = isCustomSetsActive && customSets ? parseInt(customSets, 10) || 1 : targetSets;

    updateSettings({
      soundEnabled: isSoundEnabled,
      wakeLockEnabled: isWakeLockEnabled,
    });

    await startMatch({
      gameType,
      format: finalSets > 1 ? 'Best Of' : 'Race To',
      raceTo: finalRace,
      targetSets: finalSets,
      player1Name: player1Name.trim() || 'Player 1',
      player2Name: player2Name.trim() || 'Player 2',
      breakRule,
      isFoulTracking,
      isTimerEnabled,
      tournamentId,
      tournamentMatchId,
      tableNumber,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Setup Pertandingan Baru">
      <form onSubmit={handleStart} className="space-y-4 select-none">
        {/* 1. Game Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Pilih Jenis Permainan
          </label>
          <div className="flex flex-wrap gap-2">
            {games.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGameType(g)}
                className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all ${
                  gameType === g
                    ? 'border-rose-500/50 bg-rose-500/15 text-rose-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Players Setup */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Nama Pemain
          </label>

          {/* Player 1 (Red) */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-rose-500/40 focus-within:border-rose-500 transition-all">
            <PlayerAvatar playerNumber={1} size="xs" />
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Nama Pemain 1 (Merah)"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none"
              required
            />
          </div>

          {/* Player 2 (Blue) */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-blue-500/40 focus-within:border-blue transition-all">
            <PlayerAvatar playerNumber={2} size="xs" />
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Nama Pemain 2 (Biru)"
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none"
              required
            />
          </div>

          {/* Quick Player Suggester Chips */}
          {savedPlayers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-zinc-500">Tersimpan:</span>
              {savedPlayers.slice(0, 5).map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    if (player1Name !== name) {
                      setPlayer2Name(name);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-zinc-700/50"
                >
                  +{name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Set / Babak Selection (Target Sets) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Format Babak / Set
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { sets: 1, label: '1 Babak', desc: 'Single Set' },
              { sets: 2, label: 'Best of 3', desc: '2 Set Win' },
              { sets: 3, label: 'Best of 5', desc: '3 Set Win' },
            ].map((s) => (
              <button
                type="button"
                key={s.sets}
                onClick={() => {
                  setTargetSets(s.sets);
                  setIsCustomSetsActive(false);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  targetSets === s.sets && !isCustomSetsActive
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">{s.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{s.desc}</div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomSetsActive(true)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isCustomSetsActive
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-semibold">Custom</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Bebas Atur</div>
            </button>
          </div>

          {isCustomSetsActive && (
            <div className="mt-2">
              <input
                type="number"
                min="1"
                max="20"
                value={customSets}
                onChange={(e) => setCustomSets(e.target.value)}
                placeholder="Target kemenangan set (misal: 4 set)"
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-white focus:outline-none focus:border-amber-500 w-full"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* 4. Race To Selection (Rack per Set) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Target Rack per Babak (Race To)
          </label>
          <div className="flex flex-wrap gap-2">
            {racePresets.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => {
                  setRaceTo(r);
                  setIsCustomRaceActive(false);
                }}
                className={`w-11 h-11 rounded-xl border font-mono font-bold text-sm transition-all flex items-center justify-center ${
                  raceTo === r && !isCustomRaceActive
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomRaceActive(true)}
              className={`px-3 h-11 rounded-xl border font-mono text-xs uppercase font-semibold transition-all flex items-center justify-center ${
                isCustomRaceActive
                  ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustomRaceActive && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={customRace}
                onChange={(e) => setCustomRace(e.target.value)}
                placeholder="Masukkan angka (misal: 15)"
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-white focus:outline-none focus:border-rose-500 w-full"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* 5. Advanced Settings Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            {showAdvanced ? 'Sembunyikan Opsi Lanjutan' : 'Opsi Lanjutan (Break, Foul, Wake Lock)'}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              {/* Break Rule */}
              <div>
                <label className="block text-[11px] uppercase text-zinc-500 font-semibold mb-1.5">
                  Aturan Giliran Break Berikutnya
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Winner Breaks', 'Alternate Breaks', 'Loser Breaks'] as BreakRule[]).map((rule) => (
                    <button
                      type="button"
                      key={rule}
                      onClick={() => setBreakRule(rule)}
                      className={`p-2 rounded-lg border text-[11px] font-medium text-center transition-all ${
                        breakRule === rule
                          ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {rule.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Foul Tracking & Ball in Hand</span>
                  <input
                    type="checkbox"
                    checked={isFoulTracking}
                    onChange={(e) => setIsFoulTracking(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Match & Rack Timer</span>
                  <input
                    type="checkbox"
                    checked={isTimerEnabled}
                    onChange={(e) => setIsTimerEnabled(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Layar Tetap Menyala (Wake Lock)</span>
                  <input
                    type="checkbox"
                    checked={isWakeLockEnabled}
                    onChange={(e) => setIsWakeLockEnabled(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Efek Suara Audio</span>
                  <input
                    type="checkbox"
                    checked={isSoundEnabled}
                    onChange={(e) => setIsSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition-all active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-white" />
            Mulai Pertandingan
          </button>
        </div>
      </form>
    </Modal>
  );
};
