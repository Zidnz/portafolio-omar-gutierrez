/* MILPÍN — capa de demo estática.
 *
 * Intercepta window.fetch hacia la API (Railway o localhost:8000) y responde
 * con instantáneas JSON tomadas del backend real (FastAPI + PostGIS) corriendo
 * sobre los datos sintéticos del DR-041. No hay servidor detrás:
 *   - GET           -> demo/api/<ruta>[@<query ordenada>].json
 *   - /auth/login   -> demo/api/_logins.json (token "demo")
 *   - balance FAO-56 -> precalculado para 20/40/60/80/100/120 días de siembra
 *   - escrituras    -> se simulan en memoria; se pierden al recargar
 *   - voz / LLM     -> intérprete de palabras clave (solo navegación)
 */
(function () {
  'use strict';

  var API_RE = /^https?:\/\/(?:milpin-pp26-v1-production\.up\.railway\.app|localhost:8000|127\.0\.0\.1:8000)\/api(\/[^#]*)?$/;
  var ROOT = 'demo/api/';
  var DIAS = [20, 40, 60, 80, 100, 120];

  var realFetch = window.fetch.bind(window);
  var cache = {};            // key -> Promise<objeto|null>
  var diasPorParcela = {};   // id_parcela -> días usados en el último cálculo
  var feedback = {};         // id_recomendacion -> {aceptada, lamina_ejecutada_mm, notas}

  function keyFor(path) {
    var i = path.indexOf('?');
    var p = (i < 0 ? path : path.slice(0, i)).replace(/^\/+|\/+$/g, '');
    var q = i < 0 ? '' : path.slice(i + 1);
    if (q) {
      var qs = q.split('&').filter(Boolean).sort().join('&');
      p += '@' + qs.replace(/[^A-Za-z0-9=&._-]/g, '_');
    }
    return p + '.json';
  }

  function load(path) {
    var k = keyFor(path);
    if (!cache[k]) {
      cache[k] = realFetch(ROOT + k).then(function (r) {
        return r.ok ? r.json() : null;
      }).catch(function () { return null; });
    }
    return cache[k].then(function (d) { return d == null ? null : JSON.parse(JSON.stringify(d)); });
  }

  function json(body, status) {
    return new Response(JSON.stringify(body), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json', 'X-Milpin-Demo': '1' }
    });
  }

  function bodyOf(init) {
    try { return init && typeof init.body === 'string' ? JSON.parse(init.body) : {}; }
    catch (e) { return {}; }
  }

  function nearest(n) {
    return DIAS.reduce(function (a, b) { return Math.abs(b - n) < Math.abs(a - n) ? b : a; });
  }

  /* ── Aviso flotante ─────────────────────────────────────────── */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('demo-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 4200);
  }

  /* ── Comandos de texto: intérprete local en lugar del LLM ───── */
  var RUTAS = [
    [/mapa|parcela|lote|satelit/, 'tab-mapas', 'Abriendo el mapa de parcelas.'],
    [/riego|agua|costo|fao|balance|recomend/, 'tab-costos', 'Abriendo el módulo de riego.'],
    [/modelo|ml|predic|anomal|drift|xgboost/, 'tab-ml', 'Abriendo el módulo de modelos.'],
    [/inicio|dashboard|tablero|resumen|bi\b/, 'tab-bi', 'Abriendo el tablero.'],
    [/ajuste|perfil|configura/, 'tab-ajustes', 'Abriendo ajustes.']
  ];
  function textCommand(texto) {
    var t = (texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/alerta/.test(t)) return { intent: 'abrir_alertas', message: 'Mostrando alertas.' };
    for (var i = 0; i < RUTAS.length; i++) {
      if (RUTAS[i][0].test(t)) return { intent: 'navegar', target: RUTAS[i][1], message: RUTAS[i][2] };
    }
    return {
      intent: 'desconocido',
      message: 'En la demo el asistente solo navega: prueba "abre el mapa", "riego" o "modelos". El modelo de lenguaje corre en el servidor.'
    };
  }

  /* ── Recomendaciones: aplica el estado simulado ─────────────── */
  function recomendaciones(id) {
    var n = diasPorParcela[id];
    var p = n ? load('/recomendaciones/parcela/' + id + '?dias_demo=' + n) : Promise.resolve(null);
    return p.then(function (d) { return d || load('/recomendaciones/parcela/' + id); })
      .then(function (d) {
        if (!d) return json({ detail: 'Sin datos' }, 404);
        var a = d.activa;
        if (a && feedback[a.id_recomendacion]) {
          Object.assign(a, feedback[a.id_recomendacion]);
          d.historial = [a].concat(d.historial || []);
          d.activa = null;
        }
        return json(d);
      });
  }

  /* ── Router ─────────────────────────────────────────────────── */
  function handle(path, init) {
    var method = ((init && init.method) || 'GET').toUpperCase();
    var bare = path.split('?')[0];
    var m;

    if (method === 'POST' && bare === '/auth/login') {
      var email = bodyOf(init).email;
      return load('/_logins').then(function (all) {
        var u = all && all[email];
        return u ? json(u) : json({ detail: 'Usuario no encontrado' }, 404);
      });
    }

    if (bare === '/text-command') return Promise.resolve(json(textCommand(bodyOf(init).texto)));

    if (bare === '/voice-command') {
      return Promise.resolve(json({
        intent: 'desconocido',
        message: 'La transcripción con Whisper corre en el servidor y no está en la demo. Usa el dictado del navegador o escribe el comando.'
      }));
    }

    if (method === 'GET' && bare === '/balance_hidrico') {
      var qs = new URLSearchParams(path.split('?')[1] || '');
      var id = qs.get('parcela_id');
      var pedido = parseInt(qs.get('dias_siembra'), 10) || 60;
      var n = nearest(pedido);
      return load('/balance_hidrico?parcela_id=' + id + '&dias_siembra=' + n).then(function (d) {
        if (!d) return json({ detail: 'Cálculo no disponible en la demo' }, 404);
        diasPorParcela[id] = n;
        if (n !== pedido) toast('Demo: se muestra el cálculo precalculado para ' + n + ' días de siembra (pediste ' + pedido + ').');
        return json(d);
      });
    }

    if (method === 'GET' && (m = bare.match(/^\/recomendaciones\/parcela\/([^/]+)$/))) {
      return recomendaciones(m[1]);
    }

    if (method === 'PATCH' && (m = bare.match(/^\/recomendaciones\/([^/]+)\/feedback$/))) {
      var b = bodyOf(init);
      feedback[m[1]] = {
        aceptada: b.aceptada,
        lamina_ejecutada_mm: b.lamina_ejecutada_mm != null ? b.lamina_ejecutada_mm : null
      };
      toast('Modo demo: la decisión se registra solo en esta pestaña.');
      return Promise.resolve(json({ id_recomendacion: m[1], aceptada: b.aceptada }));
    }

    if (method === 'PATCH' && (m = bare.match(/^\/usuarios\/([^/]+)\/nombre$/))) {
      var nombre = bodyOf(init).nombre;
      return load('/usuarios').then(function (us) {
        var u = (us || []).filter(function (x) { return x.id_usuario === m[1]; })[0] || { id_usuario: m[1] };
        u.nombre_completo = nombre;
        toast('Modo demo: el cambio no se guarda en el servidor.');
        return json(u);
      });
    }

    if (method !== 'GET') {
      toast('Modo demo: esta acción no se guarda (no hay base de datos detrás).');
      return Promise.resolve(json(Object.assign({ demo: true }, bodyOf(init)), 200));
    }

    return load(path).then(function (d) {
      if (d != null || path.indexOf('?') < 0) return d;
      return load(bare);
    }).then(function (d) {
      return d != null ? json(d) : json({ detail: 'No disponible en la demo estática' }, 404);
    });
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var m = url.match(API_RE);
    if (!m) return realFetch(input, init);
    if (!init && input && typeof input === 'object' && input.method) init = { method: input.method };
    return handle(m[1] || '/', init);
  };

  window.MILPIN_DEMO = true;

  /* ── Franja de demo ─────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var css = document.createElement('style');
    css.textContent =
      '#demo-strip{position:fixed;left:12px;bottom:92px;z-index:99999;' +
      'display:flex;gap:10px;align-items:center;max-width:calc(100% - 24px);padding:7px 14px;' +
      'border-radius:999px;background:rgba(20,32,24,.88);color:#e9f2ea;font:500 12px/1.3 system-ui,sans-serif;' +
      'box-shadow:0 4px 18px rgba(0,0,0,.25);backdrop-filter:blur(6px)}' +
      '#demo-strip b{font-weight:600;color:#9fe0a8;letter-spacing:.04em;text-transform:uppercase;font-size:11px}' +
      '#demo-strip a{color:#e9f2ea;opacity:.8}#demo-strip button{all:unset;cursor:pointer;opacity:.6;padding:0 2px}' +
      '#demo-toast{position:fixed;left:50%;bottom:140px;transform:translate(-50%,8px);z-index:99999;opacity:0;' +
      'pointer-events:none;transition:.25s;max-width:min(440px,calc(100% - 24px));padding:10px 14px;border-radius:10px;' +
      'background:#fff;color:#1c2b20;font:13px/1.4 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.18);text-align:center}' +
      '#demo-toast.on{opacity:1;transform:translate(-50%,0)}' +
      '@media(max-width:600px){#demo-strip{font-size:11px;padding:6px 11px}#demo-strip .x{display:none}}';
    document.head.appendChild(css);
    var s = document.createElement('div');
    s.id = 'demo-strip';
    s.innerHTML = '<b>Demo</b><span>Datos sintéticos del DR-041, sin servidor</span>' +
      '<a class="x" href="https://github.com/Zidnz/Milpin-pp26-v.1-" target="_blank" rel="noopener">Código</a>' +
      '<button aria-label="Ocultar">&times;</button>';
    s.querySelector('button').onclick = function () { s.remove(); };
    document.body.appendChild(s);
  });
})();
