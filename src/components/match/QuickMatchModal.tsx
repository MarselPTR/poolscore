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

    // Update settings preferences
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
      <form onSubmit={handleStart} className="space-y-4">
        {/* 1. Game Selection */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Pilih Jenis Permainan (Game)
          </label>
          <div className="flex flex-wrap gap-2">
            {games.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGameType(g)}
                className={`py-2 px-3.5 rounded-xl border text-xs font-ui font-bold uppercase tracking-wider transition-all ${
                  gameType === g
                    ? 'border-felt bg-felt/20 text-emerald-300 shadow-[0_0_12px_rgba(31,138,90,0.3)]'
                    : 'border-line bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Players Setup */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim">
            Nama Pemain
          </label>

          {/* Player 1 (Red) */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-surface-2 border border-red/40 focus-within:border-red transition-all">
            <PlayerAvatar playerNumber={1} size="xs" />
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Nama Pemain 1 (Merah)"
              className="w-full bg-transparent text-sm font-display font-bold uppercase tracking-wider text-text placeholder-text-faint focus:outline-none"
              required
            />
          </div>

          {/* Player 2 (Blue) */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-surface-2 border border-blue/40 focus-within:border-blue transition-all">
            <PlayerAvatar playerNumber={2} size="xs" />
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Nama Pemain 2 (Biru)"
              className="w-full bg-transparent text-sm font-display font-bold uppercase tracking-wider text-text placeholder-text-faint focus:outline-none"
              required
            />
          </div>

          {/* Quick Player Suggester Chips */}
          {savedPlayers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-mono text-text-faint">Pemain tersimpan:</span>
              {savedPlayers.slice(0, 5).map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    if (player1Name !== name) {
                      setPlayer2Name(name);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-surface-3 hover:bg-surface-2 text-[11px] font-mono text-text-dim hover:text-text border border-line"
                >
                  +{name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Set / Babak Selection (Target Sets) */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber" /> Format Babak / Set Match
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { sets: 1, label: '1 Babak', desc: 'Standar Single Set' },
              { sets: 2, label: 'Best of 3', desc: 'Menang 2 Set' },
              { sets: 3, label: 'Best of 5', desc: 'Menang 3 Set' },
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
                    ? 'border-amber bg-amber/20 text-amber shadow-[0_0_12px_rgba(242,169,59,0.25)]'
                    : 'border-line bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text'
                }`}
              >
                <div className="text-xs font-mono font-bold uppercase">{s.label}</div>
                <div className="text-[10px] text-text-faint mt-0.5">{s.desc}</div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomSetsActive(true)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isCustomSetsActive
                  ? 'border-amber bg-amber/20 text-amber'
                  : 'border-line bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text'
              }`}
            >
              <div className="text-xs font-mono font-bold uppercase">Custom Set</div>
              <div className="text-[10px] text-text-faint mt-0.5">Bebas Atur Set</div>
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
                className="p-2.5 rounded-xl bg-surface-2 border border-line text-sm font-mono text-text focus:outline-none focus:border-amber w-full"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* 4. Race To Selection (Rack per Set) */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
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
                    ? 'border-felt bg-felt text-white shadow-md'
                    : 'border-line bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text'
                }`}
              >
                {r}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomRaceActive(true)}
              className={`px-3 h-11 rounded-xl border font-mono text-xs uppercase font-bold transition-all flex items-center justify-center ${
                isCustomRaceActive
                  ? 'border-felt bg-felt/20 text-emerald-300'
                  : 'border-line bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text'
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
                className="p-2.5 rounded-xl bg-surface-2 border border-line text-sm font-mono text-text focus:outline-none focus:border-felt w-full"
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
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-dim hover:text-text transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            {showAdvanced ? 'Sembunyikan Pengaturan Lanjutan' : 'Opsi Lanjutan (Break, Foul, Wake Lock)'}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3 rounded-2xl bg-surface-2 border border-line space-y-3 animate-fade-in text-xs">
              {/* Break Rule */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-text-faint mb-1.5">
                  Aturan Giliran Break Berikutnya
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Winner Breaks', 'Alternate Breaks', 'Loser Breaks'] as BreakRule[]).map((rule) => (
                    <button
                      type="button"
                      key={rule}
                      onClick={() => setBreakRule(rule)}
                      className={`p-2 rounded-lg border text-[10px] font-mono uppercase font-bold text-center ${
                        breakRule === rule
                          ? 'border-felt bg-felt/20 text-emerald-300'
                          : 'border-line bg-surface-3 text-text-dim'
                      }`}
                    >
                      {rule.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">Foul Tracking & Ball in Hand</span>
                  <input
                    type="checkbox"
                    checked={isFoulTracking}
                    onChange={(e) => setIsFoulTracking(e.target.checked)}
                    className="w-4 h-4 accent-felt rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-dim">Match & Rack Timer</span>
                  <input
                    type="checkbox"
                    checked={isTimerEnabled}
                    onChange={(e) => setIsTimerEnabled(e.target.checked)}
                    className="w-4 h-4 accent-felt rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-dim">Layar Tetap Menyala (Wake Lock)</span>
                  <input
                    type="checkbox"
                    checked={isWakeLockEnabled}
                    onChange={(e) => setIsWakeLockEnabled(e.target.checked)}
                    className="w-4 h-4 accent-felt rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-dim">Efek Suara Audio & Getar</span>
                  <input
                    type="checkbox"
                    checked={isSoundEnabled}
                    onChange={(e) => setIsSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-felt rounded"
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
            className="w-full py-4 rounded-xl bg-felt hover:bg-emerald-600 text-white font-display font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-felt/30 transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            Mulai Pertandingan
          </button>
        </div>
      </form>
    </Modal>
  );
};
