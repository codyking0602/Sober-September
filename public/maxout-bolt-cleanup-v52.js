(() => {
  const style = document.createElement("style");
  style.textContent = `
    .today-strip-icon{display:none!important}
    .today-strip{
      grid-template-columns:minmax(112px,1.25fr) minmax(82px,.8fr) minmax(82px,.8fr)!important;
    }
    @media(max-width:390px){
      .today-strip{
        grid-template-columns:minmax(92px,1.15fr) minmax(68px,.8fr) minmax(68px,.8fr)!important;
      }
    }
  `;
  document.head.appendChild(style);

  const previousUpdateCountdown = updateCountdown;
  updateCountdown = function() {
    previousUpdateCountdown();

    const phase = typeof getChallengePhase === "function" ? getChallengePhase() : null;
    const pureMaxOut = !!phase && phase.phase === "maxout" && !phase.both;
    const eventTitle = document.getElementById("eventTitle");
    const eventIcon = document.getElementById("eventIcon");

    if (eventTitle && pureMaxOut) {
      eventTitle.textContent = eventTitle.textContent.replace(/^⚡\s*/, "");
    }
    if (eventIcon) {
      eventIcon.style.display = pureMaxOut ? "none" : "flex";
    }
  };
})();
