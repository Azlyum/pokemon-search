import React, { useState } from "react";
import { useDebouncedSearch } from "./useDebouncedSearch";

export default function SearchBox() {
  const [input, setInput] = useState("");
  const { query, results, loading, error } = useDebouncedSearch(input, 400);
  const minInput = 1;

  const tooShort = query.trim().length < minInput;

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-3">Debounced Search Demo</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type to search…"
        className="w-full px-3 py-2 rounded border border-indigo-700 outline-none"
      />

      <div aria-live="polite" className="text-xs text-gray-500 mt-2">
        {loading
          ? "Searching…"
          : query
          ? `Results for “${query}”`
          : "Start typing"}
      </div>

      {error && <div className="text-red-700 mt-2">Error: {error.message}</div>}

      {tooShort && (
        <div className="text-gray-500 mt-2">
          Please type at least {minInput} character{minInput > 1 ? "s" : ""}.
        </div>
      )}

      {!loading && !tooShort && results.length === 0 && (
        <div className="text-gray-400 mt-3">No Pokémon found</div>
      )}

      {!tooShort && results.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {results.map((r) => (
            <li key={r.id}>
              <div className="flex gap-3 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-3">
                <img
                  className="w-20 h-20 object-contain"
                  src={`https://img.pokemondb.net/sprites/home/normal/${r.id}.png`}
                  alt={`${r.label} sprite`}
                  loading="lazy"
                />
                <div className="leading-tight">
                  <h5 className="text-xl font-bold text-gray-900 dark:text-white">
                    {r.label}
                  </h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Rank #{r.rank}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
