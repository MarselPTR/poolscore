import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { GameType, BreakRule } from '../../types';
import { useMatch } from '../../context/MatchContext';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/database';
import { ChevronDown } from 'lucide-react';

interface QuickMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGameType?: GameType;
  initialRaceTo?: number;
  initialPlayer1?: string;
  initialPlayer2?: string;
  tournamentId?: string;
  tournamentMatchId?: string;
  tableId?: string;
  tableLabel?: string;
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
  tableId,
  tableLabel,
}) => {
  const { startMatch } = useMatch();
  const { settings, updateSettings } = useSettings();

  const [gameType, setGameType] = useState<GameType>(initialGameType || settings.defaultGame);
  const [raceTo, setRaceTo] = useState<number>(initialRaceTo || settings.defaultRace);
  const [customRace, setCustomRace] = useState<string>('');
  const [isCustomRaceActive, setIsCustomRaceActive] = useState<boolean>(false);

  // Set / Babak System Configuration
  const [targetSets, setTargetSets] = useState<number>(settings.defaultTargetSets || 1);
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
      tableId,
      tableLabel,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tableLabel ? `Pertandingan baru · ${tableLabel}` : 'Pertandingan baru'}
    >
      <form onSubmit={handleStart} className="space-y-5 select-none">
        {/* Players */}
        <div>
          <span className="label">Pemain</span>
          <div className="space-y-2">
            <div className="flex items-stretch">
              <span className="w-1.5 bg-p1 rounded-l-[4px]" />
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Nama pemain merah"
                aria-label="Nama pemain merah"
                className="field field-lg !rounded-l-none !border-l-0 font-semibold"
                required
              />
            </div>
            <div className="flex items-stretch">
              <span className="w-1.5 bg-p2 rounded-l-[4px]" />
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Nama pemain biru"
                aria-label="Nama pemain biru"
                className="field field-lg !rounded-l-none !border-l-0 font-semibold"
                required
              />
            </div>
          </div>

          {savedPlayers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[13px] text-ink-3">Jadikan lawan:</span>
              {savedPlayers.slice(0, 5).map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    if (player1Name !== name) {
                      setPlayer2Name(name);
                    }
                  }}
                  className="h-7 px-2.5 rounded-[3px] border border-rule-strong text-[13px] text-ink-2 hover:text-ink hover:border-ink-3"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Game */}
        <div>
          <span className="label">Permainan</span>
          <div className="flex flex-wrap gap-2">
            {games.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGameType(g)}
                data-on={gameType === g}
                className="opt"
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Race to */}
        <div>
          <span className="label">Race to (rack untuk menang{targetSets > 1 || isCustomSetsActive ? ' per set' : ''})</span>
          <div className="flex flex-wrap gap-2">
            {racePresets.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => {
                  setRaceTo(r);
                  setIsCustomRaceActive(false);
                }}
                data-on={raceTo === r && !isCustomRaceActive}
                className="opt w-12 !px-0"
              >
                <span className="num text-xl">{r}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomRaceActive(true)}
              data-on={isCustomRaceActive}
              className="opt"
            >
              Lainnya
            </button>
          </div>

          {isCustomRaceActive && (
            <input
              type="number"
              min="1"
              max="100"
              value={customRace}
              onChange={(e) => setCustomRace(e.target.value)}
              placeholder="Jumlah rack, misalnya 15"
              aria-label="Race to khusus"
              className="field mt-2"
              autoFocus
            />
          )}
        </div>

        {/* Sets */}
        <div>
          <span className="label">Jumlah set</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { sets: 1, label: 'Satu set', desc: 'Tanpa set' },
              { sets: 2, label: 'Best of 3', desc: 'Menang 2 set' },
              { sets: 3, label: 'Best of 5', desc: 'Menang 3 set' },
            ].map((s) => (
              <button
                type="button"
                key={s.sets}
                onClick={() => {
                  setTargetSets(s.sets);
                  setIsCustomSetsActive(false);
                }}
                data-on={targetSets === s.sets && !isCustomSetsActive}
                className="opt"
              >
                <span>{s.label}</span>
                <span className="opt-sub">{s.desc}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomSetsActive(true)}
              data-on={isCustomSetsActive}
              className="opt"
            >
              <span>Lainnya</span>
              <span className="opt-sub">Atur sendiri</span>
            </button>
          </div>

          {isCustomSetsActive && (
            <input
              type="number"
              min="1"
              max="20"
              value={customSets}
              onChange={(e) => setCustomSets(e.target.value)}
              placeholder="Jumlah set untuk menang, misalnya 4"
              aria-label="Jumlah set khusus"
              className="field mt-2"
              autoFocus
            />
          )}
        </div>

        {/* Advanced */}
        <div className="border-t border-rule pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
            className="flex items-center justify-between w-full text-sm font-medium text-ink-2 hover:text-ink"
          >
            <span>Opsi lanjutan</span>
            <ChevronDown className={`w-4 h-4 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div>
                <span className="label">Siapa yang break di rack berikutnya</span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { rule: 'Winner Breaks', label: 'Pemenang' },
                      { rule: 'Alternate Breaks', label: 'Bergantian' },
                      { rule: 'Loser Breaks', label: 'Yang kalah' },
                    ] as { rule: BreakRule; label: string }[]
                  ).map((o) => (
                    <button
                      type="button"
                      key={o.rule}
                      onClick={() => setBreakRule(o.rule)}
                      data-on={breakRule === o.rule}
                      className="opt !px-1.5"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rows border-y border-rule">
                {[
                  { label: 'Pencatatan foul', checked: isFoulTracking, set: setIsFoulTracking },
                  { label: 'Timer pertandingan dan rack', checked: isTimerEnabled, set: setIsTimerEnabled },
                  { label: 'Layar tetap menyala', checked: isWakeLockEnabled, set: setIsWakeLockEnabled },
                  { label: 'Efek suara', checked: isSoundEnabled, set: setIsSoundEnabled },
                ].map((t) => (
                  <label key={t.label} className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
                    <span className="text-sm text-ink">{t.label}</span>
                    <input
                      type="checkbox"
                      checked={t.checked}
                      onChange={(e) => t.set(e.target.checked)}
                      className="switch"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-lg btn-block btn-primary">
          Mulai pertandingan
        </button>
      </form>
    </Modal>
  );
};
