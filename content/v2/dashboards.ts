// Demo data for the three dashboards in portfolio-v2.html (section #live).
// Copied literally from the page script; types are inferred. All projects, buildings and
// candidates are invented ("Demo data" note in the page). Charts are drawn with plain SVG.
//
// Labels for every array below live in texts.json > live.i18n (cats, projs, per, months,
// aging, units, vac, stages, k_* KPI labels, tipS / tipF tooltip templates).

/* ============================================================================
 * P: Project control  (tab #t-proj -> panel #p-proj)
 *   segment control #pj-seg : labels = i18n.projs[i]  (index = project)
 *   KPIs            #pj-k
 *   S-curve         #pj-s   viewBox 0 0 520 240  + tooltip #pj-tip
 *   bar chart       #pj-b   viewBox 0 0 340 240
 *
 * Fields (one object per project):
 *   w       total weeks (x axis has w points, week 1..w)
 *   now     current week (1-based); "today" marker and the KPI "Week now / w"
 *   bud     budget per category in USD thousands, index = i18n.cats
 *           [Equipment, Labor, Subcontracts, Logistics]
 *   spentF  fraction of each category's budget already spent (0..1)
 *   plan    planned cumulative progress %, one value per week (length w)
 *   act     actual cumulative progress %, one value per elapsed week (length == now)
 *
 * Calculations (drawProject):
 *   a       = act[act.length-1]                         actual progress % (last known week)
 *   pl      = plan[now-1]                               planned % at the current week
 *   spi     = a / pl                                    Schedule Performance Index, shown toFixed(2);
 *                                                       badge "ahead" (ok) if spi>=1 else "behind" (wn)
 *   bud$    = sum(bud)                                  total budget
 *   spent   = sum(round(bud[i]*spentF[i]))              total spent
 *   costPct = round(spent/bud$*100)                     KPI "Spent of budget"
 *   earned  = round(bud$ * a/100)                       earned value; badge "on budget" (ok) if spent<=earned else "over" (wn)
 *   KPI "Actual progress": a% with badge "planned pl%" -> ok if a>=pl else wn
 *   KPI label for SPI is i18n.k_spi + " (SPI)" (literal suffix)
 *
 *   S-curve: x = week index 0..w-1, y = 0..100%; grid lines at 0/25/50/75/100;
 *     x labels every 4 weeks if w>14 else every 2 (i18n.weekL + ' ' + (i+1));
 *     plan = dashed line; act = solid line + 10% filled area + end dot; today = dashed red
 *     vertical at week now; line is animated via stroke-dashoffset.
 *   Tooltip #pj-tip: default tipS(now, pl, a); on pointermove over the plot it shows
 *     tipS(i+1, plan[i], act[i]) where act[i] may be undefined -> "n/a" / "n/d".
 *   Bar chart: for each category i, grey bar = bud[i], blue bar = round(bud[i]*spentF[i]);
 *     y max = ceil(max(bud)/100)*100, ticks at 0, max/2, max; labels below each pair:
 *     i18n.cats[i] and round(spentF[i]*100)+'%'.
 * ========================================================================== */
export const P = [
 {w:12,now:8,bud:[420,160,90,40],spentF:[.96,.71,.62,.80],plan:[2,6,12,21,32,45,58,70,81,90,96,100],act:[2,5,11,19,29,43,57,69]},
 {w:20,now:13,bud:[610,240,180,95],spentF:[.88,.74,.55,.92],plan:[1,2,4,7,10,14,19,25,32,40,48,56,64,71,78,84,89,94,98,100],act:[1,2,3,5,8,11,15,20,26,33,40,47,54]},
 {w:16,now:11,bud:[280,190,70,30],spentF:[.82,.79,.74,.61],plan:[1,3,7,12,19,27,36,46,56,66,75,83,90,95,98,100],act:[1,4,8,14,22,31,41,52,62,72,80]}];

/* ============================================================================
 * F: Building finances / PH (tab #t-fin -> panel #p-fin)
 *   segment control #fn-seg : labels = i18n.per  [Last 6 months, Last 12 months]; default = 12
 *   KPIs            #fn-k
 *   bar chart       #fn-b   viewBox 0 0 520 240  + tooltip #fn-tip
 *   aging chart     #fn-a   viewBox 0 0 340 240
 *
 * Fields:
 *   billed  monthly fees billed, USD, 12 months (index = i18n.months: Nov..Oct)
 *   coll    monthly fees collected, USD, 12 months
 *   aging   units with overdue fees, bucketed by months late (index = i18n.aging: 1, 2, 3, 4+)
 *   units   total units in the building (denominator of the "Units overdue" KPI)
 *
 * Calculations (drawFin):
 *   n    = 12 or 6 depending on the period segment; the series are sliced to the LAST n months
 *   tb   = sum(billed[-n:])        KPI "Billed"      shown as $ with en-US thousands separators
 *   tc   = sum(coll[-n:])          KPI "Collected"
 *   rate = tc/tb*100               KPI "Collection rate", toFixed(1)%; badge ok "≥ 93%" if rate>=93 else wn "< 93%"
 *   od   = sum(aging)              KPI "Units overdue" shown as "od / units" (not affected by the period)
 *   Billed vs collected: grey bar = billed[i], blue bar = coll[i]; y max fixed 24000, ticks $0k/$8k/$16k/$24k;
 *     x label = month abbreviation; hovering a month sets tooltip #fn-tip = tipF(month, billed, coll),
 *     which prints the collected/billed percentage round(c/b*100); default tooltip = last month.
 *   Aging: horizontal bars, width proportional to aging[i]/max(aging); colors blue2, warn, warn, bad;
 *     value label = aging[i] + ' ' + i18n.units.
 * ========================================================================== */
export const F = {billed:[18400,18400,18900,18900,18900,18900,19350,19350,19350,19350,19800,19800],coll:[16200,17900,15600,17100,17600,16900,18300,17700,18100,18600,18900,19100],aging:[14,7,4,3],units:120};

/* ============================================================================
 * R: Recruiting (tab #t-hire -> panel #p-hire)
 *   segment control #hr-seg : labels = i18n.vac[i]  (index = vacancy)
 *   KPIs            #hr-k
 *   funnel          #hr-f   viewBox 0 0 520 240
 *   table           #hr-t   (tbody; headers i18n.thC / thM / thR)
 *
 * Fields (one object per vacancy):
 *   f     funnel counts, index = i18n.stages [Applied, Evaluated by AI, Shortlisted, Interviewed, Hired]
 *   time  average time to score one CV, display string (not computed)
 *   c     top candidates: [id, match %, verdict]; verdict 'adv' | 'rev' | 'low'
 *         -> label i18n.adv / rev / low; pill class ok / wn / neutral (sunk background)
 *         id is rendered as '#' + id
 *
 * Calculations (drawHire):
 *   KPI "Applications" = f[0]
 *   KPI "Shortlisted"  = f[2] with badge (f[2]/f[0]*100).toFixed(1)% (always ok)
 *   KPI "Avg. time to score" = time (literal)
 *   KPI "Reading hours saved" = '~' + round(f[0]*15/60) + ' h'   (assumes 15 minutes of reading per CV)
 *   Funnel: one bar per stage, width = (plot width) * sqrt(f[i]/f[0]) (square-root scale, min 3px);
 *     first two stages blue2 (second at 70% opacity), the rest blue; value label = f[i]; width animated.
 * ========================================================================== */
export const R = [
 {f:[312,312,18,8,1],time:'1m 42s',c:[['A-104',86,'adv'],['A-221',81,'adv'],['A-057',77,'adv'],['A-188',69,'rev'],['A-240',58,'rev'],['A-013',44,'low']]},
 {f:[146,146,12,6,1],time:'1m 31s',c:[['T-019',88,'adv'],['T-102',79,'adv'],['T-077',72,'rev'],['T-130',66,'rev'],['T-045',61,'rev'],['T-008',39,'low']]},
 {f:[228,228,15,7,0],time:'1m 55s',c:[['V-066',83,'adv'],['V-150',80,'adv'],['V-021',74,'rev'],['V-199',70,'rev'],['V-090',52,'low'],['V-117',47,'low']]}];
