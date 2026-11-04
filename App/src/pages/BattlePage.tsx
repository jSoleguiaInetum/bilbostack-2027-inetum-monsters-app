import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { useMetrics } from '../lib/MetricsProvider'
import { MonsterCard } from '../monster/MonsterCard'
import { generateMonster } from '../monster/generator'
import { selectBattleQuestions } from '../lib/questions'
import { resolveRound, resolveBattle, simulateOpponentAnswer, saveBattle, hasAlreadyFought } from '../lib/battle'
import { addContact, isContact } from '../lib/contacts'
import { ARCHETYPES } from '../lib/constants'
import type { MonsterParams, Archetype } from '../monster/types'
import type { RoundResult } from '../lib/battle'
import type { Question } from '../lib/questions'

type Phase = 'intro' | 'question' | 'round-result' | 'final'

const QUESTION_TIME_LIMIT = 10000

export function BattlePage() {
  const { id: opponentId } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addMetricsReward } = useMetrics()

  const opponentData = (location.state as { name?: string; email?: string; archetype?: string }) ?? {}
  const opponentName = opponentData.name ?? 'Oponente'
  const opponentArchetype = (opponentData.archetype ?? 'developer') as Archetype

  const [phase, setPhase] = useState<Phase>('intro')
  const [playerParams, setPlayerParams] = useState<MonsterParams | null>(null)
  const [opponentParams, setOpponentParams] = useState<MonsterParams | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [rounds, setRounds] = useState<RoundResult[]>([])
  const [playerQuestions, setPlayerQuestions] = useState<Question[]>([])
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [alreadyFought, setAlreadyFought] = useState(false)

  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!user || !opponentId) return
    if (hasAlreadyFought(user.id, opponentId)) {
      setAlreadyFought(true)
      return
    }
    generateMonster(user.email).then(({ params }) => setPlayerParams(params))
    if (opponentData.email) {
      generateMonster(opponentData.email).then(({ params }) => setOpponentParams(params))
    }
    const { playerQuestions: pq } = selectBattleQuestions(user.archetype, opponentArchetype)
    setPlayerQuestions(pq)
  }, [user, opponentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback(() => {
    setPhase('question')
    setSelectedAnswer(null)
    setTimeLeft(QUESTION_TIME_LIMIT)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, QUESTION_TIME_LIMIT - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        submitAnswer(-1)
      }
    }, 100)
  }, [currentRound]) // eslint-disable-line react-hooks/exhaustive-deps

  function submitAnswer(answerIndex: number) {
    if (timerRef.current) clearInterval(timerRef.current)

    const question = playerQuestions[currentRound]
    if (!question) return

    const playerTimeMs = Date.now() - startTimeRef.current
    const playerCorrect = answerIndex === question.correctIndex
    const opponent = simulateOpponentAnswer(question.difficulty)

    const roundResult = resolveRound(playerCorrect, playerTimeMs, opponent.correct, opponent.timeMs)
    const newRounds = [...rounds, roundResult]
    setRounds(newRounds)
    setSelectedAnswer(answerIndex)

    if (playerCorrect) addMetricsReward('question_correct')
    else addMetricsReward('question_wrong')

    setTimeout(() => {
      if (currentRound < 2) {
        setCurrentRound(currentRound + 1)
        setPhase('round-result')
      } else {
        finishBattle(newRounds)
      }
    }, 1500)
  }

  function finishBattle(allRounds: RoundResult[]) {
    if (!user || !opponentId) return
    const outcome = resolveBattle(allRounds)

    saveBattle(user.id, {
      id: crypto.randomUUID(),
      opponentId,
      opponentName,
      opponentArchetype,
      rounds: allRounds,
      outcome,
      timestamp: new Date().toISOString(),
    })

    if (!isContact(user.id, opponentId) && opponentData.email) {
      addContact(user.id, {
        userId: opponentId,
        name: opponentName,
        email: opponentData.email,
        archetype: opponentArchetype,
      })
    }

    if (outcome === 'win') addMetricsReward('battle_win')
    else if (outcome === 'loss') addMetricsReward('battle_loss')
    else addMetricsReward('battle_draw')

    setPhase('final')
  }

  if (!user || !opponentId) return null

  if (alreadyFought) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-4xl">⚔️</p>
        <p className="text-white font-bold text-center">Ya has combatido contra {opponentName}</p>
        <p className="text-gray-400 text-sm text-center">Solo puedes combatir una vez contra cada jugador</p>
        <button onClick={() => navigate('/my-monster')} className="snes-button has-ocean-color mt-4">Volver</button>
      </div>
    )
  }

  const playerArchInfo = ARCHETYPES.find(a => a.key === user.archetype)
  const opponentArchInfo = ARCHETYPES.find(a => a.key === opponentArchetype)

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-accent text-sm font-bold animate-pulse">COMBATE</p>
        <div className="flex items-center gap-4 w-full max-w-sm justify-center">
          <div className="flex flex-col items-center gap-2 flex-1">
            {playerParams && <MonsterCard params={playerParams} archetype={user.archetype} evolution={0} size={100} />}
            <p className="text-white text-[10px] font-bold truncate max-w-[100px]">{user.name}</p>
            <p className="text-tech text-[9px]">{playerArchInfo?.icon}</p>
          </div>
          <p className="text-3xl font-bold text-secondary">VS</p>
          <div className="flex flex-col items-center gap-2 flex-1">
            {opponentParams && <MonsterCard params={opponentParams} archetype={opponentArchetype} evolution={0} size={100} />}
            <p className="text-white text-[10px] font-bold truncate max-w-[100px]">{opponentName}</p>
            <p className="text-tech text-[9px]">{opponentArchInfo?.icon}</p>
          </div>
        </div>
        <p className="text-gray-400 text-xs text-center">Mejor de 3 rondas — 10s por pregunta</p>
        <button onClick={startRound} className="snes-button has-rose-color mt-4">Empezar</button>
      </div>
    )
  }

  if (phase === 'question') {
    const question = playerQuestions[currentRound]
    if (!question) return null
    const seconds = Math.ceil(timeLeft / 1000)

    return (
      <div className="min-h-screen bg-background flex flex-col px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-xs">Ronda {currentRound + 1}/3</span>
          <span className={`text-sm font-bold ${seconds <= 3 ? 'text-secondary animate-pulse' : 'text-accent'}`}>
            {seconds}s
          </span>
        </div>

        <div className="flex gap-2 mb-4 justify-center">
          {rounds.map((r, i) => (
            <span key={i} className={`text-lg ${r.winner === 'player' ? 'text-nature' : r.winner === 'opponent' ? 'text-secondary' : 'text-gray-500'}`}>
              {r.winner === 'player' ? '●' : r.winner === 'opponent' ? '●' : '○'}
            </span>
          ))}
          {Array.from({ length: 3 - rounds.length }).map((_, i) => (
            <span key={`empty-${i}`} className="text-lg text-gray-700">○</span>
          ))}
        </div>

        <p className="text-white text-sm mb-4 text-center leading-relaxed break-words">{question.text}</p>

        <div className="flex flex-col gap-2">
          {question.options.map((opt, i) => {
            let btnClass = 'snes-blockquote p-3 cursor-pointer transition-all text-left'
            if (selectedAnswer !== null) {
              if (i === question.correctIndex) btnClass += ' is-selected'
              else if (i === selectedAnswer && selectedAnswer !== question.correctIndex) btnClass += ' border-secondary'
            }
            return (
              <button
                key={i}
                onClick={() => { if (selectedAnswer === null) { setSelectedAnswer(i); submitAnswer(i) } }}
                disabled={selectedAnswer !== null}
                className={btnClass}
              >
                <span className="text-xs text-white leading-relaxed">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (phase === 'round-result') {
    const lastRound = rounds[rounds.length - 1]
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-gray-400 text-xs">Ronda {currentRound} resultado</p>
        <p className="text-4xl">
          {lastRound.winner === 'player' ? '🏆' : lastRound.winner === 'opponent' ? '💀' : '🤝'}
        </p>
        <p className="text-white font-bold text-lg">
          {lastRound.winner === 'player' ? '¡Ronda ganada!' : lastRound.winner === 'opponent' ? 'Ronda perdida' : 'Empate'}
        </p>
        <div className="text-gray-400 text-xs flex flex-col gap-1 items-center">
          <span>Tú: {lastRound.playerCorrect ? '✓' : '✗'} ({(lastRound.playerTimeMs / 1000).toFixed(1)}s)</span>
          <span>Rival: {lastRound.opponentCorrect ? '✓' : '✗'} ({(lastRound.opponentTimeMs / 1000).toFixed(1)}s)</span>
        </div>
        <button onClick={startRound} className="snes-button has-ocean-color mt-4">Siguiente ronda</button>
      </div>
    )
  }

  // phase === 'final'
  const outcome = resolveBattle(rounds)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-4xl">
        {outcome === 'win' ? '🏆' : outcome === 'loss' ? '💀' : '🤝'}
      </p>
      <p className="text-white font-bold text-xl">
        {outcome === 'win' ? '¡Victoria!' : outcome === 'loss' ? 'Derrota' : 'Empate'}
      </p>

      <div className="flex gap-4">
        {rounds.map((r, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-gray-500 text-[10px]">R{i + 1}</span>
            <span className={`text-lg ${r.winner === 'player' ? 'text-nature' : r.winner === 'opponent' ? 'text-secondary' : 'text-gray-500'}`}>
              {r.winner === 'player' ? '✓' : r.winner === 'opponent' ? '✗' : '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="snes-blockquote p-4 w-full max-w-xs text-center">
        <p className="text-accent text-xs mb-2">Recompensas</p>
        <div className="flex gap-4 justify-center">
          <span className="text-accent text-sm">⚡ +{outcome === 'win' ? 5 : outcome === 'draw' ? 3 : 2}</span>
          <span className="text-energy text-sm">✨ +{outcome === 'win' ? 3 : outcome === 'draw' ? 2 : 1}</span>
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => navigate('/my-monster')} className="snes-button has-ocean-color flex-1">Mi Criatura</button>
        <button onClick={() => navigate('/scan')} className="snes-button has-rose-color flex-1">Escanear</button>
      </div>
    </div>
  )
}
