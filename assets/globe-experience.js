(function () {
  'use strict';

  // ============================================================================
  // EDITABLE CHAPTER & LOCATION DATA
  // Swap in additional duty stations, exact summit names, or roles anytime.
  // ============================================================================
  const CHAPTERS = [
    {
      id: 'roots',
      num: '01',
      title: 'Roots & West Point',
      subtitle: 'Minnesota · United States Military Academy',
      center: [-84, 43],
      narrative:
        'Raised in Minnesota before attending the United States Military Academy at West Point—playing Army Hockey and commissioning as a U.S. Army officer grounded in preparation, teamwork, and accountability.',
      pins: [
        { name: 'Minnesota', coord: '44.98° N · 93.26° W', lon: -93.26, lat: 44.98, note: 'Northern roots', labelDir: 'left' },
        { name: 'West Point, NY', shortName: 'West Point', coord: '41.39° N · 73.96° W', lon: -73.96, lat: 41.39, note: 'USMA · Army Hockey', labelDir: 'right' }
      ],
      arcs: [[0, 1]]
    },
    {
      id: 'army',
      num: '02',
      title: 'U.S. Army Service',
      subtitle: 'Fort Richardson · Afghanistan · Colorado Springs',
      center: [-34, 64],
      narrative:
        'Served across demanding operational environments—stationed at Fort Richardson in Alaska, deployed to Afghanistan, and returning to Colorado Springs to help lead top military athletes in the Army’s Olympic program (WCAP) before retiring as a Captain.',
      pins: [
        { name: 'Fort Richardson, AK', shortName: 'Ft. Richardson', coord: '61.26° N · 149.68° W', lon: -149.68, lat: 61.26, note: 'Alaska duty station', labelDir: 'right' },
        { name: 'Afghanistan', coord: '34.55° N · 69.20° E', lon: 69.20, lat: 34.55, note: 'Operational deployment', labelDir: 'left' },
        { name: 'Colorado Springs, CO', shortName: 'Colorado Springs', coord: '38.83° N · 104.82° W', lon: -104.82, lat: 38.83, note: 'Army Olympic Program (WCAP)', labelDir: 'right' }
      ],
      arcs: [[0, 1], [1, 2], [0, 2]]
    },
    {
      id: 'mountains',
      num: '03',
      title: 'High-Altitude Mountaineering',
      subtitle: 'Denali (Multiple Climbs) & World Peaks',
      center: [-94, 24],
      narrative:
        'An accomplished mountaineer who has climbed Denali multiple times alongside many of the world’s largest mountains. On severe terrain, logistics are finite, local culture matters, and judgment means knowing when to hold firm and when to move forward.',
      pins: [
        { name: 'Denali, Alaska', shortName: 'Denali, AK', coord: '63.07° N · 20,310 FT', lon: -151.00, lat: 63.07, note: 'Climbed multiple times', labelDir: 'right' },
        { name: 'Andes · High Peaks', shortName: 'Andes Peaks', coord: '32.65° S · South America', lon: -70.01, lat: -32.65, note: 'World summit slot', labelDir: 'left' },
        { name: 'East Africa · High Peaks', shortName: 'East Africa', coord: '3.07° S · Africa', lon: 37.35, lat: -3.07, note: 'World summit slot', labelDir: 'left' }
      ],
      arcs: [[0, 1], [1, 2]]
    },
    {
      id: 'washington',
      num: '04',
      title: 'Georgetown & Capitol Hill',
      subtitle: 'M.A. Political Science · Bipartisan Advisory',
      center: [-104, 47],
      narrative:
        'Transitioned from military service to earn an M.A. in Political Science from Georgetown University and advise congressional leaders across both sides of the aisle—including Rep. Betty McCollum (MN) and Sen. Lisa Murkowski (AK)—bridging real regional geography with federal policy.',
      pins: [
        { name: 'Washington, D.C.', shortName: 'Washington, D.C.', coord: '38.89° N · 77.01° W', lon: -77.01, lat: 38.89, note: 'Georgetown & Capitol Hill', labelDir: 'right' },
        { name: 'Minnesota', coord: '44.98° N · Rep. Betty McCollum', lon: -93.26, lat: 44.98, note: 'Bipartisan Hill advisory', labelDir: 'left' },
        { name: 'Alaska', coord: '61.22° N · Sen. Lisa Murkowski', lon: -149.90, lat: 61.22, note: 'Bipartisan Hill advisory', labelDir: 'right' }
      ],
      arcs: [[0, 1], [0, 2]]
    },
    {
      id: 'firm',
      num: '05',
      title: 'Strategic Latitudes',
      subtitle: 'Global Perspective · Washington, D.C.',
      center: [-38, 44],
      autoSpin: true,
      narrative:
        'Today, every coordinate converges in Strategic Latitudes—advising federal agencies, Senate and House offices, and the companies and advisory groups working alongside them at the intersection of geography, power, and human culture.',
      pins: [
        { name: 'Washington, D.C.', shortName: 'D.C.', coord: '38.89° N · 77.01° W', lon: -77.01, lat: 38.89, note: 'Advisory base', labelDir: 'right' },
        { name: 'Alaska & Arctic', shortName: 'Arctic', coord: '63.07° N · High Latitudes', lon: -151.00, lat: 63.07, note: 'Northern corridors', labelDir: 'right' },
        { name: 'Central Asia', coord: '34.55° N · 69.20° E', lon: 69.20, lat: 34.55, note: 'Field experience', labelDir: 'left' },
        { name: 'Europe & Atlantic', shortName: 'Europe', coord: '50.85° N · 4.35° E', lon: 4.35, lat: 50.85, note: 'Allied corridors', labelDir: 'left' }
      ],
      arcs: [[0, 1], [0, 3], [3, 2], [1, 2]]
    }
  ];

  // ============================================================================
  // SPHERICAL MATH & 3D HORIZON-ARC CLIPPING FOR CRISP ORTHOGRAPHIC CONTINENTS
  // ============================================================================
  const DEG = Math.PI / 180;

  function toVec3(lonDeg, latDeg, cLonDeg, cLatDeg) {
    const lon = (lonDeg - cLonDeg) * DEG;
    const lat = latDeg * DEG;
    const cLat = cLatDeg * DEG;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const cosCLat = Math.cos(cLat);
    const sinCLat = Math.sin(cLat);
    const x = cosLat * Math.sin(lon);
    const y = cosCLat * sinLat - sinCLat * cosLat * Math.cos(lon);
    const z = sinCLat * sinLat + cosCLat * cosLat * Math.cos(lon);
    return [x, y, z];
  }

  function clipRingToFront(ring, cLon, cLat) {
    const n = ring.length;
    if (n < 3) return [];
    const pts = new Array(n);
    let firstInside = -1;
    let allInside = true;
    for (let i = 0; i < n; i++) {
      const v = toVec3(ring[i][0], ring[i][1], cLon, cLat);
      pts[i] = v;
      if (v[2] >= 0) {
        if (firstInside === -1) firstInside = i;
      } else {
        allInside = false;
      }
    }
    if (firstInside === -1) return [];
    if (allInside) return pts;

    const out = [];
    let pendingExit = null;
    for (let step = 0; step < n; step++) {
      const a = pts[(firstInside + step) % n];
      const b = pts[(firstInside + step + 1) % n];
      const aIn = a[2] >= 0;
      const bIn = b[2] >= 0;

      if (aIn && bIn) {
        out.push(b);
      } else if (aIn && !bIn) {
        const t = a[2] / (a[2] - b[2]);
        const ix = a[0] + t * (b[0] - a[0]);
        const iy = a[1] + t * (b[1] - a[1]);
        const len = Math.hypot(ix, iy) || 1;
        pendingExit = [ix / len, iy / len, 0];
        out.push(pendingExit);
      } else if (!aIn && bIn) {
        const t = a[2] / (a[2] - b[2]);
        const ix = a[0] + t * (b[0] - a[0]);
        const iy = a[1] + t * (b[1] - a[1]);
        const len = Math.hypot(ix, iy) || 1;
        const entry = [ix / len, iy / len, 0];

        if (pendingExit) {
          const aE = Math.atan2(pendingExit[1], pendingExit[0]);
          const aI = Math.atan2(entry[1], entry[0]);
          let delta = aI - aE;
          while (delta > 0) delta -= Math.PI * 2;
          const arcSteps = Math.max(2, Math.ceil(Math.abs(delta) / (6 * DEG)));
          for (let s = 1; s < arcSteps; s++) {
            const ang = aE + (delta * s) / arcSteps;
            out.push([Math.cos(ang), Math.sin(ang), 0]);
          }
          pendingExit = null;
        }
        out.push(entry);
        out.push(b);
      }
    }
    return out;
  }

  function slerpLonLat(lon1, lat1, lon2, lat2, steps) {
    const p1 = [
      Math.cos(lat1 * DEG) * Math.cos(lon1 * DEG),
      Math.cos(lat1 * DEG) * Math.sin(lon1 * DEG),
      Math.sin(lat1 * DEG)
    ];
    const p2 = [
      Math.cos(lat2 * DEG) * Math.cos(lon2 * DEG),
      Math.cos(lat2 * DEG) * Math.sin(lon2 * DEG),
      Math.sin(lat2 * DEG)
    ];
    const dot = Math.max(-1, Math.min(1, p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2]));
    const omega = Math.acos(dot);
    const sinO = Math.sin(omega);
    const res = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let x, y, z;
      if (sinO < 1e-4) {
        x = p1[0] + t * (p2[0] - p1[0]);
        y = p1[1] + t * (p2[1] - p1[1]);
        z = p1[2] + t * (p2[2] - p1[2]);
      } else {
        const a = Math.sin((1 - t) * omega) / sinO;
        const b = Math.sin(t * omega) / sinO;
        x = a * p1[0] + b * p2[0];
        y = a * p1[1] + b * p2[1];
        z = a * p1[2] + b * p2[2];
      }
      const len = Math.hypot(x, y, z) || 1;
      const lat = Math.asin(Math.max(-1, Math.min(1, z / len))) / DEG;
      const lon = Math.atan2(y, x) / DEG;
      res.push([lon, lat, Math.sin(Math.PI * t)]);
    }
    return res;
  }

  function shortestLonDelta(from, to) {
    return ((to - from + 540) % 360) - 180;
  }

  // ============================================================================
  // INITIALIZE GLOBE & CHAPTER INTERACTION
  // ============================================================================
  function initGlobeExperience() {
    const canvas = document.getElementById('slGlobeCanvas');
    const listEl = document.getElementById('globeChapterList');
    const coordReadout = document.getElementById('globeCoordReadout');
    const activeNameReadout = document.getElementById('globeActiveName');
    if (!canvas || !listEl) return;

    const ctx = canvas.getContext('2d');
    const rings = window.WORLD_LAND_RINGS || [];

    // Open on Chapter 02 (U.S. Army Service: Fort Richardson -> Afghanistan -> Colorado Springs)
    let activeChapterIdx =
      typeof window.__INITIAL_CHAPTER__ === 'number' ? window.__INITIAL_CHAPTER__ : 1;
    let focusedPinIdx = 0;

    let curLon = CHAPTERS[activeChapterIdx].center[0];
    let curLat = CHAPTERS[activeChapterIdx].center[1];
    let anim = null;
    let isDragging = false;
    let dragStart = null;
    let hitPins = [];

    function resizeCanvas() {
      const wrap = canvas.parentElement;
      canvas.style.width = '0px';
      const avail = Math.min(wrap.clientWidth || (window.innerWidth - 36), window.innerWidth - 36);
      const size = Math.max(260, Math.min(avail, 520));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function animateTo(targetLon, targetLat, duration) {
      anim = {
        startLon: curLon,
        startLat: curLat,
        dLon: shortestLonDelta(curLon, targetLon),
        dLat: targetLat - curLat,
        startTime: performance.now(),
        duration: duration || 820
      };
    }

    function updateReadout() {
      const ch = CHAPTERS[activeChapterIdx];
      const pin = ch.pins[focusedPinIdx] || ch.pins[0];
      if (activeNameReadout) activeNameReadout.textContent = pin.name;
      if (coordReadout) coordReadout.textContent = pin.coord;
    }

    function renderChapterList() {
      listEl.innerHTML = '';
      CHAPTERS.forEach((ch, idx) => {
        const isActive = idx === activeChapterIdx;
        const item = document.createElement('div');
        item.className = 'globe-chapter' + (isActive ? ' is-active' : '');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chapter-trigger';
        btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        btn.innerHTML =
          '<span class="ch-num">' + ch.num + '</span>' +
          '<span class="ch-head">' +
            '<span class="ch-title">' + ch.title + '</span>' +
            '<span class="ch-sub">' + ch.subtitle + '</span>' +
          '</span>' +
          '<span class="ch-indicator">' + (isActive ? '—' : '+') + '</span>';

        btn.addEventListener('click', () => selectChapter(idx));
        item.appendChild(btn);

        if (isActive) {
          const body = document.createElement('div');
          body.className = 'chapter-body';
          const p = document.createElement('p');
          p.textContent = ch.narrative;
          body.appendChild(p);

          const pinsRow = document.createElement('div');
          pinsRow.className = 'chapter-pins';
          ch.pins.forEach((pin, pIdx) => {
            const pBtn = document.createElement('button');
            pBtn.type = 'button';
            pBtn.className = 'pin-pill' + (pIdx === focusedPinIdx ? ' is-focused' : '');
            pBtn.textContent = pin.name;
            pBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              focusedPinIdx = pIdx;
              renderChapterList();
              updateReadout();
              animateTo(pin.lon, Math.max(-45, Math.min(62, pin.lat)), 720);
            });
            pinsRow.appendChild(pBtn);
          });
          body.appendChild(pinsRow);
          item.appendChild(body);
        }

        listEl.appendChild(item);
      });
    }

    function selectChapter(idx, specificPinIdx) {
      activeChapterIdx = idx;
      focusedPinIdx = typeof specificPinIdx === 'number' ? specificPinIdx : 0;
      const ch = CHAPTERS[activeChapterIdx];
      renderChapterList();
      updateReadout();
      if (typeof specificPinIdx === 'number' && ch.pins[specificPinIdx]) {
        const p = ch.pins[specificPinIdx];
        animateTo(p.lon, Math.max(-45, Math.min(62, p.lat)), 820);
      } else {
        animateTo(ch.center[0], ch.center[1], 880);
      }
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const cx = W / 2;
      const cy = H / 2;
      const compact = W < 420;
      const R = Math.min(W, H) * (compact ? 0.42 : 0.43);

      ctx.clearRect(0, 0, W, H);

      // Subtle outer halo behind globe
      const halo = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.14);
      halo.addColorStop(0, 'rgba(129, 196, 222, 0.13)');
      halo.addColorStop(1, 'rgba(129, 196, 222, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.14, 0, Math.PI * 2);
      ctx.fill();

      // Sphere ocean fill
      const ocean = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.08, cx, cy, R);
      ocean.addColorStop(0, '#13314F');
      ocean.addColorStop(0.55, '#0B1E32');
      ocean.addColorStop(1, '#06111D');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = ocean;
      ctx.fill();
      ctx.clip();

      // 1. Graticule (latitude parallels & longitude meridians)
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = 'rgba(129, 196, 222, 0.10)';
      for (let lat = -60; lat <= 75; lat += 15) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const v = toVec3(lon, lat, curLon, curLat);
          if (v[2] >= 0) {
            const sx = cx + v[0] * R;
            const sy = cy - v[1] * R;
            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }
      for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath();
        let started = false;
        for (let lat = -84; lat <= 84; lat += 4) {
          const v = toVec3(lon, lat, curLon, curLat);
          if (v[2] >= 0) {
            const sx = cx + v[0] * R;
            const sy = cy - v[1] * R;
            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 2. Continents (Natural Earth 110m clipped cleanly along horizon limb)
      ctx.fillStyle = '#183A5C';
      ctx.strokeStyle = 'rgba(129, 196, 222, 0.36)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < rings.length; i++) {
        const clipped = clipRingToFront(rings[i], curLon, curLat);
        if (clipped.length < 3) continue;
        ctx.beginPath();
        for (let j = 0; j < clipped.length; j++) {
          const sx = cx + clipped[j][0] * R;
          const sy = cy - clipped[j][1] * R;
          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 3. Highlighted latitude parallel of the focused pin
      const activeCh = CHAPTERS[activeChapterIdx];
      const focusedPin = activeCh.pins[focusedPinIdx] || activeCh.pins[0];
      if (focusedPin) {
        ctx.save();
        ctx.strokeStyle = 'rgba(129, 196, 222, 0.36)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const v = toVec3(lon, focusedPin.lat, curLon, curLat);
          if (v[2] >= 0) {
            const sx = cx + v[0] * R;
            const sy = cy - v[1] * R;
            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
          } else {
            started = false;
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // 4. Ghost dots for inactive chapters
      CHAPTERS.forEach((ch, cIdx) => {
        if (cIdx === activeChapterIdx) return;
        ch.pins.forEach((pin) => {
          const v = toVec3(pin.lon, pin.lat, curLon, curLat);
          if (v[2] <= 0.04) return;
          const sx = cx + v[0] * R;
          const sy = cy - v[1] * R;
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(129, 196, 222, 0.30)';
          ctx.fill();
        });
      });

      ctx.restore();

      // Outer atmospheric rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(129, 196, 222, 0.34)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // 5. Active Chapter Great-Circle Arcs (lifted slightly above sphere)
      activeCh.arcs.forEach(([iA, iB]) => {
        const pA = activeCh.pins[iA];
        const pB = activeCh.pins[iB];
        if (!pA || !pB) return;
        const arcPts = slerpLonLat(pA.lon, pA.lat, pB.lon, pB.lat, 64);

        [
          { w: 4.5, col: 'rgba(200, 150, 82, 0.20)' },
          { w: 1.85, col: '#D6A45C' }
        ].forEach((style) => {
          ctx.save();
          ctx.strokeStyle = style.col;
          ctx.lineWidth = style.w;
          ctx.beginPath();
          let started = false;
          for (let k = 0; k < arcPts.length; k++) {
            const [lon, lat, lift] = arcPts[k];
            const v = toVec3(lon, lat, curLon, curLat);
            if (v[2] >= -0.05) {
              const scale = 1 + lift * 0.085;
              const sx = cx + v[0] * R * scale;
              const sy = cy - v[1] * R * scale;
              if (!started) { ctx.moveTo(sx, sy); started = true; }
              else ctx.lineTo(sx, sy);
            } else {
              started = false;
            }
          }
          ctx.stroke();
          ctx.restore();
        });
      });

      // 6. Active Chapter Pins & Edge-Safe Responsive Labels
      hitPins = [];
      activeCh.pins.forEach((pin, pIdx) => {
        const v = toVec3(pin.lon, pin.lat, curLon, curLat);
        if (v[2] <= 0.02) return;
        const sx = cx + v[0] * R;
        const sy = cy - v[1] * R;
        const isFocused = pIdx === focusedPinIdx;

        hitPins.push({ sx, sy, cIdx: activeChapterIdx, pIdx, name: pin.name, z: v[2] });

        // Outer ring
        ctx.beginPath();
        ctx.arc(sx, sy, isFocused ? (compact ? 10 : 11.5) : 7.2, 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? 'rgba(129, 196, 222, 0.24)' : 'rgba(200, 150, 82, 0.18)';
        ctx.fill();

        // Pin dot
        ctx.beginPath();
        ctx.arc(sx, sy, isFocused ? 4.6 : 3.6, 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? '#81C4DE' : '#D6A45C';
        ctx.fill();
        ctx.strokeStyle = '#07131F';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Crisp monospace label clamped cleanly inside canvas bounds
        const fontSize = compact ? 9.2 : 10.5;
        ctx.font = (isFocused ? '600 ' : '500 ') + fontSize + 'px ui-monospace, SFMono-Regular, Menlo, monospace';
        const label = ((compact && pin.shortName) ? pin.shortName : pin.name).toUpperCase();
        const textW = ctx.measureText(label).width;
        const pad = 11;
        const margin = 8;

        let dir = pin.labelDir || (sx > cx + R * 0.22 ? 'left' : 'right');
        if (dir === 'right' && sx + pad + textW > W - margin) dir = 'left';
        if (dir === 'left' && sx - pad - textW < margin) dir = 'right';

        ctx.textAlign = dir === 'left' ? 'right' : 'left';
        ctx.textBaseline = 'middle';
        let lx = dir === 'left' ? sx - pad : sx + pad;
        if (dir === 'left') lx = Math.max(margin + textW, lx);
        else lx = Math.min(W - margin - textW, lx);
        const ly = Math.max(14, Math.min(H - 14, sy - (isFocused ? 2 : 0)));

        ctx.lineWidth = 3.6;
        ctx.strokeStyle = 'rgba(7, 19, 31, 0.92)';
        ctx.strokeText(label, lx, ly);
        ctx.fillStyle = isFocused ? '#FFFFFF' : '#E7CFA8';
        ctx.fillText(label, lx, ly);
      });

      window.__GLOBE_DEBUG__ = {
        rings: rings.length,
        size: Math.round(W),
        chapter: activeCh.id,
        visiblePins: hitPins.map((h) => ({
          name: h.name,
          x: Math.round(h.sx),
          y: Math.round(h.sy),
          z: Number(h.z.toFixed(2))
        }))
      };
    }

    // Animation loop (smooth chapter transitions + subtle drift on Chapter 05)
    function tick(now) {
      let dirty = false;
      if (anim) {
        const t = Math.min(1, (now - anim.startTime) / anim.duration);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        curLon = anim.startLon + anim.dLon * ease;
        curLat = anim.startLat + anim.dLat * ease;
        dirty = true;
        if (t >= 1) anim = null;
      } else if (!isDragging && CHAPTERS[activeChapterIdx].autoSpin) {
        curLon += 0.12;
        dirty = true;
      }
      if (dirty) draw();
      requestAnimationFrame(tick);
    }

    // Drag to rotate & click/tap visible pins (touch-friendly hit radius)
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      for (const hp of hitPins) {
        if (Math.hypot(x - hp.sx, y - hp.sy) < 22) {
          selectChapter(hp.cIdx, hp.pIdx);
          return;
        }
      }
      isDragging = true;
      anim = null;
      dragStart = { x: e.clientX, y: e.clientY, lon: curLon, lat: curLat };
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!isDragging || !dragStart) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      curLon = dragStart.lon - dx * 0.38;
      curLat = Math.max(-65, Math.min(72, dragStart.lat + dy * 0.38));
      draw();
    });

    function endDrag() {
      isDragging = false;
      dragStart = null;
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', resizeCanvas);
    renderChapterList();
    updateReadout();
    resizeCanvas();
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobeExperience);
  } else {
    initGlobeExperience();
  }
})();
