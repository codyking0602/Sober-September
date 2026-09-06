(() => {
  const previousCalc = calc;

  // DJ stays fully out of the competition UI until he has a real form submission.
  // The first parsed DJ row automatically makes him active everywhere again.
  calc = function(rows) {
    const stats = previousCalc(rows);
    const djHasSubmitted = (rows || []).some(r => r && r.name === "DJ");
    return djHasSubmitted ? stats : stats.filter(s => s.name !== "DJ");
  };
})();
