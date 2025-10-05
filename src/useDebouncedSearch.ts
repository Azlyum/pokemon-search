import { useEffect, useMemo, useRef, useState } from "react";

type ResultsCache = Map<string, string[]>;

interface PokemonResult {
  name: string;
  url: string;
}

interface PokeApiResponse {
  results: PokemonResult[];
}

/** Debounces a rapidly-changing value. */
export function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/** Simulated async search. */
// async function fakeSearchApi(query: string): Promise<string[]> {
//   await new Promise((r) => setTimeout(r, 250));
//   const base = ["alpha", "beta", "gamma", "delta", "epsilon"];
//   const q = query.trim().toLowerCase();
//   return q ? base.filter((x) => x.includes(q)) : [];
// }
let ALL_POKEMON: string[] | null = null;

async function fakeSearchApi(query: string): Promise<string[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (!ALL_POKEMON) {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: PokeApiResponse = await res.json();
    ALL_POKEMON = data.results.map((p) => p.name);
  }
  return ALL_POKEMON.filter((name) => name.includes(q));
}
export function useDebouncedSearch(query: string, delayMs = 400) {
  const q = useDebouncedValue(query, delayMs);

  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lastReqId = useRef(0);
  const cacheRef = useRef<ResultsCache>(new Map());

  useEffect(() => {
    let canceled = false;
    const reqId = ++lastReqId.current;
    const key = q.trim().toLowerCase();
    if (!key) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const hit = cacheRef.current.get(key);
    if (hit) {
      setResults(hit);
      setLoading(false);
      setError(null);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fakeSearchApi(key);
        if (!canceled && reqId === lastReqId.current) {
          setResults(data);
          cacheRef.current.set(key, data);
        }
      } catch (e) {
        if (!canceled && reqId === lastReqId.current) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!canceled && reqId === lastReqId.current) setLoading(false);
      }
    };

    run();
    return () => {
      canceled = true;
    };
  }, [q]);

  const labeled = useMemo(
    () =>
      results.map((r, i) => ({
        id: r,
        label: r,
        rank: i + 1,
        url: `https://pokeapi.co/api/v2/pokemon/${r}`,
      })),
    [results]
  );

  return { query: q, results: labeled, loading, error };
}
