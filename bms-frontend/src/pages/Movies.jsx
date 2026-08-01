import React, { useState } from "react";
import BannerSlider from "../components/shared/BannerSlider";
import MovieFilters from "../components/movies/MovieFilters";
import MovieList from "../components/movies/MovieList";
import { getAllMovies } from "../apis/index";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { allMovies as staticAllMovies } from "../utils/constants";

const Movies = () => {
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { data: fetchedMovies } = useQuery({
    queryKey: ["allMovies"],
    queryFn: async () => {
      return await getAllMovies();
    },
    placeholderData: keepPreviousData,
    select: (res) => res?.data?.movies || res?.data?.data || res?.data,
  });

  const rawList = (Array.isArray(fetchedMovies) && fetchedMovies.length > 0) ? fetchedMovies : staticAllMovies;

  const filteredMovies = rawList.filter((m) => {
    let matchesLang = true;
    let matchesGenre = true;

    if (selectedLang) {
      const langs = Array.isArray(m.language) ? m.language : Array.isArray(m.languages) ? m.languages : [m.language || m.languages];
      matchesLang = langs.some((l) => l?.toLowerCase().includes(selectedLang.toLowerCase()));
    }

    if (selectedGenre) {
      const genres = Array.isArray(m.genre) ? m.genre : [m.genre];
      matchesGenre = genres.some((g) => g?.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    return matchesLang && matchesGenre;
  });

  const clearAll = () => {
    setSelectedLang(null);
    setSelectedGenre(null);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-300">
      <BannerSlider />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row gap-8">
          <MovieFilters
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            clearAll={clearAll}
          />
          <MovieList allMovies={filteredMovies} />
        </div>
      </div>
    </div>
  );
};

export default Movies;
