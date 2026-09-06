(() => {
  // Preserve the athlete the user explicitly selected across background renders.
  // The base render path still calls renderProfile(stats[0]), which otherwise
  // causes the athlete page to jump back to the first-ranked athlete on refresh.

  const previousSelectAthlete = selectAthlete;
  selectAthlete = function(name) {
    window.selectedAthleteName = name;
    return previousSelectAthlete(name);
  };

  const previousRender = render;
  render = function(stats, rows) {
    const selectedName = window.selectedAthleteName;
    previousRender(stats, rows);

    if (!selectedName) return;
    const selected = (stats || []).find(s => s.name === selectedName);
    if (!selected) return;

    window.selectedAthleteName = selectedName;
    renderProfile(selected);
  };
})();
