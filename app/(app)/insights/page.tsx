"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts"
import { CalendarDays, TrendingUp } from "lucide-react"
import { useEntries } from "@/hooks/useEntries"
import { useStreak } from "@/hooks/useStreak"
import { getMoodFrequency, getMoodColor } from "@/lib/utils"
import { MOOD_CONFIG } from "@/types"
import { WeeklySummary } from "@/features/insights/WeeklySummary"
import type { Mood } from "@/types"

export default function InsightsPage() {
  const { entries, totalCount } = useEntries()
  const { currentStreak, longestStreak } = useStreak()

  const moodData = useMemo(() => {
    const freq = getMoodFrequency(entries)
    return Object.entries(freq)
      .filter(([, count]) => count > 0)
      .map(([mood, count]) => ({
        mood, count,
        label: MOOD_CONFIG[mood as Mood].label,
        emoji: MOOD_CONFIG[mood as Mood].emoji,
        color: getMoodColor(mood as Mood),
      }))
      .sort((a, b) => b.count - a.count)
  }, [entries])

  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      const month = e.createdAt.slice(0, 7)
      counts[month] = (counts[month] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
        entries: count,
      }))
  }, [entries])

  const moodTrend = useMemo(() => {
    const moodScores: Record<Mood, number> = {
      happy: 5, romantic: 4.5, dreamy: 4, calm: 3.5, neutral: 3, sad: 2, angry: 1,
    }
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000)
      const dateStr = d.toISOString().slice(0, 10)
      const dayEntries = entries.filter((e) => e.createdAt.slice(0, 10) === dateStr)
      if (!dayEntries.length) return null
      const avg = dayEntries.reduce((s, e) => s + moodScores[e.mood], 0) / dayEntries.length
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        moodScore: parseFloat(avg.toFixed(1)),
      }
    }).filter(Boolean) as { date: string; moodScore: number }[]
  }, [entries])

  const topTags = useMemo(() => {
    const tc: Record<string, number> = {}
    entries.forEach((e) => e.tags.forEach((t) => { tc[t] = (tc[t] || 0) + 1 }))
    return Object.entries(tc).sort(([, a], [, b]) => b - a).slice(0, 8)
  }, [entries])

  const totalWords = useMemo(
    () => entries.reduce((sum, e) => sum + (e.wordCount || 0), 0),
    [entries]
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 text-xs border border-fairy-border/50">
          <p className="text-fairy-text-muted mb-0.5">{label}</p>
          <p className="text-fairy-purple font-medium">{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4 animate-float">📊</div>
        <h2 className="font-display text-2xl text-fairy-text mb-2">Your Story in Numbers</h2>
        <p className="text-fairy-text-muted text-sm mb-6">Write a few entries to unlock your emotional insights</p>
        <Link href="/write">
          <span className="text-fairy-purple text-sm border border-fairy-purple/30 px-4 py-2 rounded-xl hover:bg-fairy-purple/10 transition-colors">
            Write your first entry ✨
          </span>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold gradient-text mb-1">Insights</h1>
        <p className="text-fairy-text-muted text-sm">Your emotional journey at a glance</p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Total Entries", value: totalCount, emoji: "📖" },
          { label: "Total Words", value: totalWords.toLocaleString(), emoji: "✍️" },
          { label: "Current Streak", value: `${currentStreak}d`, emoji: "🔥" },
          { label: "Best Streak", value: `${longestStreak}d`, emoji: "👑" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-4 border border-fairy-border/50"
          >
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <p className="text-xl font-bold font-display gradient-text">{stat.value}</p>
            <p className="text-xs text-fairy-text-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar link */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-5"
      >
        <Link href="/calendar">
          <div className="glass rounded-2xl p-4 border border-fairy-purple/20 hover:border-fairy-purple/40 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <CalendarDays size={20} className="text-fairy-purple" />
              <div>
                <p className="text-sm font-medium text-fairy-text">Calendar View</p>
                <p className="text-xs text-fairy-text-muted/60">See your entries by date</p>
              </div>
            </div>
            <span className="text-fairy-text-muted/40 group-hover:text-fairy-purple transition-colors">→</span>
          </div>
        </Link>
      </motion.div>

      {/* AI Summaries */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mb-6"
      >
        <p className="text-xs text-fairy-text-muted/70 font-medium uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={12} /> AI Summaries
        </p>
        <WeeklySummary type="weekly" />
        <WeeklySummary type="monthly" />
      </motion.div>

      {/* Mood Pie */}
      {moodData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-4 mb-5 border border-fairy-border/50"
        >
          <p className="text-sm font-medium text-fairy-text mb-4">Mood Frequency</p>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={moodData} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={28} outerRadius={55}>
                    {moodData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="glass text-xs px-2 py-1 rounded-lg border border-fairy-border/50">
                          {payload[0].name}: {payload[0].value}
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {moodData.map((d) => (
                <div key={d.mood} className="flex items-center justify-between">
                  <span className="text-xs text-fairy-text-muted">{d.emoji} {d.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${(d.count / totalCount) * 60}px`, background: d.color, opacity: 0.8 }} />
                    <span className="text-xs font-medium" style={{ color: d.color }}>{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Monthly chart */}
      {monthlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 mb-5 border border-fairy-border/50"
        >
          <p className="text-sm font-medium text-fairy-text mb-4">Entries per Month</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={monthlyData} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: "#9d8ec0", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="entries" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Mood trend */}
      {moodTrend.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-4 mb-5 border border-fairy-border/50"
        >
          <p className="text-sm font-medium text-fairy-text mb-1">Emotional Trend</p>
          <p className="text-xs text-fairy-text-muted/60 mb-4">Last 14 days (1=low, 5=high)</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={moodTrend}>
              <XAxis dataKey="date" tick={{ fill: "#9d8ec0", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[1, 5]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="moodScore" stroke="#c084fc" strokeWidth={2.5} dot={{ fill: "#f472b6", r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top tags */}
      {topTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-4 border border-fairy-border/50"
        >
          <p className="text-sm font-medium text-fairy-text mb-3">Top Tags</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-fairy-purple/30 bg-fairy-purple/10 text-fairy-purple"
              >
                #{tag}
                <span className="text-fairy-text-muted/60 bg-white/5 px-1 rounded-sm">{count}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
