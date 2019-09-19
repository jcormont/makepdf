export function pageBreakBefore(cur: any, follow: any[], nextPage: any[]) {
  let lvl = cur.headlineLevel;
  if (cur.table) {
    follow = follow.filter(n => n.style !== "tableHeader");
  } else if (!lvl) {
    return;
  }
  let footIdx = follow.findIndex(n => n.style === "footer");
  if (footIdx >= 0) follow = follow.slice(0, footIdx);
  if (
    !follow.length &&
    nextPage.length &&
    !(nextPage[0].headlineLevel <= lvl) &&
    !(nextPage[0].style === "footer")
  ) {
    return true;
  }
}
