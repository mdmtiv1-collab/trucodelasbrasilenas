(function () {
  // gclid, gbraid e wbraid sao os tres click ids do Google Ads (gbraid/wbraid
  // chegam no lugar do gclid quando o iOS bloqueia o rastreamento). Vao pra
  // sessao porque a conversao de compra sai do SERVIDOR (webhook da Payt,
  // google.js) e o Google so atribui a venda a um anuncio se um deles chegar
  // junto. As colunas existem no banco desde o init; sem eles aqui uma
  // campanha neste dominio perderia toda venda de iPhone sem ninguem notar.
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'gbraid', 'wbraid'];

  function urlParam(key) {
    return new URLSearchParams(window.location.search).get(key) || '';
  }

  // Cookie 'ab_cavala' (setado pelo server.js na rota /page2) determina o braco
  // efetivo do A/B. Se cookie=A -> AB_ANTIGA. Se B -> AB_NOVA. Sem cookie
  // (trafego fora do split) -> usa window.FUNNEL_VARIANT normal.
  function getCookie(n) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
    return m ? m[1] : '';
  }
  function effectiveVariant() {
    var ab = getCookie('ab_cavala');
    if (ab === 'A') return 'AB_ANTIGA';
    if (ab === 'B') return 'AB_NOVA';
    return window.FUNNEL_VARIANT || '';
  }

  // Teste A/B 50/50 de audio no typebot: bolhas de voz no plano pronto e no pitch.
  // Sticky por cookie de 30 dias — sem isso a pessoa troca de braco entre visitas e
  // suja a amostra dos dois lados. Bot nao precisa de tratamento aqui: o servidor ja
  // barra bot antes de gravar a sessao, entao ele nao entra na amostra de nenhum braco.
  // So sorteia nas paginas que declaram window.AUDIO_TEST = true. Este tracking.js e
  // compartilhado com fluxos que nao tem audio (chat.js, chat-v3, chat-page4,
  // chat-v2-ga): sem essa trava eles tambem ganhariam o flow_version dividido em dois
  // bracos sem sentido, sujando o dado deles com um teste que nao existe ali.
    // Sessao de QA (?audio=) nao pode entrar na amostra: o sufixo -qa deixa a
    // versao sem par no admin, entao ela fica fora dos dois bracos.
  var AUDIO_QA = false;
  function audioArm() {
    // 08/09/2026: teste encerrado — o audio vendeu mais que so texto e passa a
    // rodar em 100%. AUDIO_ALWAYS liga pra todo mundo, sem sorteio e sem cookie.
    if (window.AUDIO_ALWAYS) return 'on';
    if (!window.AUDIO_TEST) return 'off';
    // ?audio=on|off forca o braco para QA. De proposito NAO grava cookie: assim
    // testar um lado nao prende a pessoa nele depois, nem mexe no sorteio real.
    var forcado = new URLSearchParams(window.location.search).get('audio');
    if (forcado === 'on' || forcado === 'off') { AUDIO_QA = true; return forcado; }
    var c = getCookie('ab_audio');
    if (c !== 'on' && c !== 'off') {
      c = Math.random() < 0.5 ? 'on' : 'off';
      document.cookie = 'ab_audio=' + c + '; Max-Age=2592000; Path=/; SameSite=Lax';
    }
    return c;
  }
  // Definido no topo deste arquivo de proposito: o motor do typebot (chat-v4.js)
  // carrega DEPOIS e le window.AUDIO_ON pra decidir se toca as bolhas de audio.
  window.AUDIO_ON = audioArm() === 'on';

  // O braco viaja no flow_version ('v6.2' vs 'v6.2-audio'). E o eixo que o admin ja
  // sabe comparar (filtro "Versao do funil" e aba Testes -> Insights), entao o teste
  // aparece la sem precisar de coluna nova no banco.
  function flowVersionAb() {
    var base = window.FLOW_VERSION || '';
    if (!base) return base;
    // Com o audio em 100% nao ha mais eixo de comparacao: o sufixo -audio so
    // faria a versao mudar de nome sem separar nada.
    var v = (window.AUDIO_ON && !window.AUDIO_ALWAYS) ? base + '-audio' : base;
    return AUDIO_QA ? v + '-qa' : v;
  }

  // ------------------------------------------------------------------
  // Identificadores de anuncio
  //
  // A venda acontece no checkout da Payt e quem nos avisa e o webhook,
  // depois, com o browser da pessoa ja fechado. Nessa hora nao existe
  // cookie pra ler. Entao o que for capturado aqui e o que o Purchase que
  // sai do servidor pela API de Conversoes (meta.js) vai ter pra dizer de
  // quem foi a compra — e sem isso a conversao chega no Meta sem dono.
  // ------------------------------------------------------------------

  // _fbc: guarda o clique no anuncio. O pixel cria sozinho, mas so quando
  // ja rodou. Se a pessoa entrou agora, com fbclid na URL, o cookie ainda
  // nao existe — e a doc da Meta diz pra montar o valor na mao nesse caso,
  // usando o instante em que o fbclid foi visto pela PRIMEIRA vez.
  // Por isso o carimbo fica guardado: recalcular a cada visita moveria a
  // data pra frente e desalinharia do que o pixel gravou.
  var FBC_KEY = '_tcv_fbc';
  function fbcDaUrl() {
    var fbclid = urlParam('fbclid');
    if (!fbclid) return '';
    try {
      var salvo = localStorage.getItem(FBC_KEY);
      // So reaproveita se for o MESMO fbclid: clique novo e atribuicao nova.
      if (salvo && salvo.indexOf('.' + fbclid) === salvo.length - fbclid.length - 1) return salvo;
    } catch (e) {}
    // Formato da doc: fb.<subdominio>.<milissegundos>.<fbclid>. O indice 1 e
    // o que a Meta manda usar quando o valor e montado no lugar do cookie.
    // O fbclid NAO pode ser alterado (a doc avisa que e sensivel a caixa).
    var v = 'fb.1.' + Date.now() + '.' + fbclid;
    try { localStorage.setItem(FBC_KEY, v); } catch (e) {}
    return v;
  }

  // client_id do GA4. O cookie _ga vem como GA1.1.<id>, e o id sao os dois
  // ultimos pedacos. Fica guardado na sessao mesmo sem GA4 na pagina hoje:
  // se um dia a venda for mandada pro GA4 tambem, e ele que junta a sessao
  // do site com a compra em vez de abrir um usuario novo por evento.
  function gaClientId() {
    var raw = getCookie('_ga');
    if (!raw) return '';
    var p = decodeURIComponent(raw).split('.');
    return p.length >= 4 ? p.slice(-2).join('.') : '';
  }

  function identificadores() {
    return {
      fbp: getCookie('_fbp') || '',
      fbc: getCookie('_fbc') || fbcDaUrl(),
      ga_client_id: gaClientId(),
    };
  }

  // Id do clique no checkout. Precisa ser o MESMO no evento que sai do
  // browser (InitiateCheckout do pixel) e no que sair do servidor, senao a
  // Meta conta a mesma pessoa duas vezes. Deriva da sessao de proposito:
  // assim o servidor consegue reconstruir o valor sem precisar que alguem
  // carregue ele por ai.
  window.eventoIdDoCheckout = function () {
    return window._sessionId ? window._sessionId + '.ic' : '';
  };

  function send(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      keepalive: true,
    })
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  function sendBeacon(url, body) {
    var data = JSON.stringify(body || {});
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([data], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      } catch (e) { /* fall through */ }
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
      keepalive: true,
    }).catch(function () {});
  }

  var _eventQueue = [];

  function flushQueue() {
    if (!window._sessionId || !_eventQueue.length) return;
    var pending = _eventQueue.splice(0);
    pending.forEach(function (payload) {
      send('/api/session/' + window._sessionId + '/event', payload);
    });
  }

  var SESSION_KEY = '_tcv_session_id';
  var SESSION_VARIANT_KEY = '_tcv_session_variant';

  function getCachedSessionId() {
    try {
      var id = sessionStorage.getItem(SESSION_KEY);
      var variant = sessionStorage.getItem(SESSION_VARIANT_KEY);
      if (!id) return null;
      // Se o usuario veio de outra variante na mesma aba, abre sessao nova
      if (variant !== effectiveVariant()) return null;
      return id;
    } catch (e) { return null; }
  }

  function cacheSessionId(id) {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
      sessionStorage.setItem(SESSION_VARIANT_KEY, effectiveVariant());
    } catch (e) {}
  }

  function startSession() {
    // Reusa sessao se ja existir nesta aba (F5, navegacao interna nao geram nova sessao)
    var cached = getCachedSessionId();
    if (cached) {
      window._sessionId = cached;
      flushQueue();
      return Promise.resolve();
    }

    var payload = {
      referrer: document.referrer || '',
      user_agent: navigator.userAgent,
      variant: effectiveVariant(),
      flow_version: flowVersionAb(),
    };
    UTM_KEYS.forEach(function (k) { payload[k] = urlParam(k); });
    var ids = identificadores();
    payload.fbp = ids.fbp;
    payload.fbc = ids.fbc;
    payload.ga_client_id = ids.ga_client_id;

    return send('/api/session/start', payload).then(function (r) {
      if (r && r.sessionId) {
        window._sessionId = r.sessionId;
        cacheSessionId(r.sessionId);
        send('/api/session/' + r.sessionId + '/event', {
          eventType: 'page_view',
          eventData: { url: window.location.href, title: document.title },
        });
        flushQueue();
      }
      // Se r.blocked === 'bot' ou r.sessionId === null, nao tenta mais nada
    });
  }

  window.trackEvent = function (eventType, eventData) {
    if (!eventType) return;
    var payload = {
      eventType: eventType,
      eventData: eventData == null ? null : eventData,
    };
    if (window._sessionId) {
      send('/api/session/' + window._sessionId + '/event', payload);
    } else {
      _eventQueue.push(payload);
    }
  };

  function attachCheckoutTracking() {
    document.addEventListener('click', function (e) {
      var target = e.target && e.target.closest
        ? e.target.closest('.cta-checkout, #cta-checkout, .checkout-cta, #checkout-cta')
        : null;
      if (!target) return;
      if (!window._sessionId) return;
      // Segunda captura, e a que mais vale: aqui o pixel ja rodou, entao o
      // _fbp costuma existir — na abertura da sessao ele quase nunca existe.
      var ids = identificadores();
      sendBeacon('/api/session/' + window._sessionId + '/checkout', {
        href: target.href || '',
        text: (target.textContent || '').trim().slice(0, 200),
        fbp: ids.fbp,
        fbc: ids.fbc,
        ga_client_id: ids.ga_client_id,
        event_id: window.eventoIdDoCheckout(),
      });
    }, true);
  }

  startSession();
  attachCheckoutTracking();
})();
