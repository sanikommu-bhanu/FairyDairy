"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, Heart, SortDesc, SortAsc } from "lucide-react"
import { useEntries } from "@/hooks/useEntries"
import { EntryCard } from "@/features/entries/EntryCard"
import { EntryModal } from "@/features/entries/EntryModal"
import { cn, formatMonthYear } from "@/lib/utils"
import { MOOD_CONFIG } from "@/types"
import type { Entry, Mood } from "@/types"

type SortOrder = "newest" | "oldest"

export default function TimelinePage() {
  const { entries, searchEntries, getAllTags } = useEntries()
  const [query, setQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [favOnly, setFavOnly] = useState(false)
  const [sort, setSort] = useState<SortOrder>("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  const allTags = getAllTags()
  const moods = Object.keys(MOOD_CONFIG) as Mood[]

  const filtered = useMemo(() => {
    let results = searchEntries(query, moodFilter, tagFilter)
    if (favOnly) results = results.filter((e) => e.favorite)
    if (sort === "oldest") results = [...results].reverse()
    return results
  }, [query, moodFilter, tagFilter, favOnly, sort, searchEntries])

  // Group by month
  const grouped = useMemo(() => {
    const groups: Record<string, Entry[]> = {}
    filtered.forEach((e) => {
      const month = e.createdAt.slice(0, 7)
      if (!groups[month]) groups[month] = []
      groups[month].push(e)
    })
    return Object.entries(groups).sort((a, b) =>
      sort === "newest" ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0])
    )
  }, [filtered, sort])

  const hasFilters = query || moodFilter || tagFilter || favOnly

  return (
    <div className="min-h-screen px-4 pt-12 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold gradient-text mb-1">Timeline</h1>
        <p className="text-fairy-text-muted text-sm">{entries.length} entries in your diary</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4"
      >
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fairy-text-muted/60" />
          <input
            type="text"
            placeholder="Search entries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-fairy-text placeholder-fairy-text-muted/40 focus:outline-none border border-fairy-border/50 focus:border-fairy-purple/40"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-fairy-text-muted">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "px-3 glass rounded-xl border transition-all text-sm flex items-center gap-1.5",
            showFilters || hasFilters
              ? "border-fairy-purple/60 text-fairy-purple"
              : "border-fairy-border/50 text-fairy-text-muted"
          )}
        >
          <Filter size={14} />
          {hasFilters ? "Filtered" : "Filter"}
        </button>
        <button
          onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
          className="p-2.5 glass rounded-xl border border-fairy-border/50 text-fairy-text-muted hover:text-fairy-purple"
        >
          {sort === "newest" ? <SortDesc size={16} /> : <SortAsc size={16} />}
        </button>
      </motion.div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass rounded-2xl p-4 border border-fairy-border/30 space-y-3">
              {/* Mood filter */}
              <div>
                <p className="text-xs text-fairy-text-muted mb-2">Mood</p>
                <div className="flex flex-wrap gap-1.5">
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMoodFilter(moodFilter === m ? null : m)}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded-xl border transition-all",
                        moodFilter === m
                          ? "text-white border-transparent"
                          : "glass border-fairy-border/50 text-fairy-text-muted hover:border-fairy-purple/30"
                      )}
                      style={moodFilter === m ? { background: MOOD_CONFIG[m].color } : {}}
                    >
                      {MOOD_CONFIG[m].emoji} {MOOD_CONFIG[m].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag filter */}
              {allTags.length > 0 && (
                <div>
                  <p className="text-xs text-fairy-text-muted mb-2">Tag</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border transition-all",
                          tagFilter === tag
                            ? "bg-fairy-purple/30 border-fairy-purple text-fairy-text"
                            : "glass border-fairy-border/50 text-fairy-text-muted hover:border-fairy-purple/30"
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites */}
              <button
                onClick={() => setFavOnly(!favOnly)}
                className={cn(
                  "flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-all w-full",
                  favOnly
                    ? "bg-rose-400/15 border-rose-400/40 text-rose-300"
                    : "glass border-fairy-border/50 text-fairy-text-muted hover:border-rose-400/30"
                )}
              >
                <Heart size={14} className={favOnly ? "fill-rose-400 text-rose-400" : ""} />
                Favorites only
              </button>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={() => { setMoodFilter(null); setTagFilter(null); setFavOnly(false); setQuery("") }}
                  className="text-xs text-fairy-rose hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {hasFilters && (
        <p className="text-xs text-fairy-text-muted/60 mb-3">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"} found
        </p>
      )}

      {/* Empty states */}
      {entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4 animate-float">📖</div>
          <h3 className="font-display text-xl text-fairy-text mb-2">No entries yet</h3>
          <p className="text-fairy-text-muted text-sm">Start writing to fill your timeline</p>
        </motion.div>
      )}

      {entries.length > 0 && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-fairy-text-muted text-sm">No entries match your search</p>
        </motion.div>
      )}

      {/* Grouped entries */}
      <div className="space-y-6">
        {grouped.map(([month, monthEntries]) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-fairy-text-muted/70 font-medium uppercase tracking-wider mb-3">
              {formatMonthYear(month + "-01")}
              <span className="ml-2 text-fairy-text-muted/40">({monthEntries.length})</span>
            </p>
            <div className="space-y-3">
              {monthEntries.map((entry, i) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => setSelectedEntry(entry)}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <EntryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  )
}
