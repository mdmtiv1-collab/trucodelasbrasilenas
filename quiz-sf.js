// Motor do BRACO NOVO do quiz (quiz-sf) — le window.QUIZ_DATA
// (quiz-sf-data.js) e renderiza por step.type.
//
// E o motor do augustoteam.com trazido inteiro pra ca: e dele que vem a
// abertura de baixo atrito (type 'gate', com os comentarios) e o carrossel,
// que o motor do quiz atual (quiz.js) nao tem. O que foi portado do quiz
// atual da Cavala e o que a atribuicao daqui depende: o gancho do Google Ads
// no clique do checkout, os click ids do Google na URL do checkout e o
// backredirect ligado. O que NAO veio: o teste de imagem da tela 1 e o type
// 'vsl' — o braco novo nao tem nem um nem outro.
//
// Reaproveita tracking.js (trackEvent) e manda pro checkout da Payt com a
// atribuicao (funnel=, site=, sid= e utm_*) na URL, no MESMO formato do quiz
// atual: o painel amarra a venda pelo sid e a Payt devolve esses params no
// postback.

(function () {
  var data = window.QUIZ_DATA;
  var CHECKOUT_URL = data.checkoutUrl;
  // O medidor e opcional: sem os campos ele parte de 0 e vai ate 100.
  var METER_INITIAL = Number(data.meterInitial) || 0;
  var METER_MAX = Number(data.meterMax) || 100;
  var METER_LABEL = data.meterLabel || 'progresso';

  var state = {
    stepIndex: 0,
    name: '',
    vars: {},
    meterValue: METER_INITIAL,
    // A tela mais adiante que a pessoa ja alcancou: o medidor so sobe na
    // primeira chegada (a seta de voltar deixa revisitar).
    maiorTela: 0,
    // meterGain das telas puladas (mostrarSe) ainda nao somado na barra: entra
    // na proxima tela vista, pra barra continuar fechando 100 na oferta.
    ganhoPulado: 0,
    muted: sessionStorage.getItem('quiz_muted') === '1',
  };

  // Cada renderStep abre uma "vez" nova da tela. Timer e clique atrasado que
  // nasceram numa tela so agem se a pessoa ainda estiver NELA: sem isso, quem
  // voltava pela seta durante o processamento era empurrada pra frente
  // sozinha quando o timer antigo acabava — e, respondendo no meio, dois
  // timers vivos pulavam a tela seguinte inteira.
  var vezDaTela = 0;
  function avancaSeAinda(vez) {
    return function () { if (vez === vezDaTela) advance(); };
  }

  // Trava de toque duplo nas opcoes da tela que vem LOGO DEPOIS de uma
  // pergunta binaria (layout 'binary', ver bindBinary). A binaria avanca no
  // mesmo toque, e no celular as opcoes da tela seguinte caem bem embaixo do
  // botao cheio e do link dela: no enxuto, dois toques rapidos no "Sinto o
  // gluteo queimando" respondiam a Q3 com "Quadrado" sem a lead ler a
  // pergunta — e o admin gravava essa resposta. Clique nas opcoes nos
  // primeiros TRAVA_TOQUE_DUPLO_MS dessa tela e ignorado (o mesmo prazo da
  // trava da propria binaria). So liga quando a tela de antes era binaria: o
  // quiz-sf de 22 telas nao tem nenhuma, entao nada muda pra ele. telaDeAntes
  // e a tela que estava na frente (a seta de voltar tambem conta: voltar da
  // Q4 pra Q3 nao liga a trava, porque ninguem tocou numa binaria).
  var TRAVA_TOQUE_DUPLO_MS = 350;
  var telaDeAntes = null;
  var opcoesLiberadasEm = 0;

  // --- DOM refs ---
  var $app = document.getElementById('quiz-app');
  var $meterFill = document.getElementById('meter-fill');
  var $meterValue = document.getElementById('meter-value');
  var $meterLabel = document.getElementById('meter-label');
  var $muteBtn = document.getElementById('mute-toggle');
  var $toastSlot = document.getElementById('toast-slot');
  var $stepContainer = document.getElementById('step-container');
  var $ctaDock = document.getElementById('cta-dock');
  var $footer = document.getElementById('qb-foot');
  var $footerHome = document.getElementById('qb-foot-home');
  var $modalRoot = document.getElementById('modal-root');

  if ($meterLabel) $meterLabel.textContent = METER_LABEL;
  updateMeterUI(METER_INITIAL, METER_INITIAL);
  if ($muteBtn) updateMuteBtn();

  if ($muteBtn) $muteBtn.addEventListener('click', function () {
    state.muted = !state.muted;
    sessionStorage.setItem('quiz_muted', state.muted ? '1' : '0');
    updateMuteBtn();
  });

  function updateMuteBtn() {
    if (!$muteBtn) return;
    $muteBtn.textContent = state.muted ? '🔇' : '🔊';
    $muteBtn.setAttribute('aria-label', state.muted ? 'Ativar som' : 'Desativar som');
  }

  // --- Escape HTML ---
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // --- Template substituicao ({name}) ---
  // data.varDefaults e a reserva de uma variavel que a lead nao respondeu: o
  // braco enxuto mostra o tempo de treino da Q4 no pitch ({tempo_treino_txt})
  // e, se alguem chegar no pitch sem essa resposta (seta de voltar, QA), o
  // texto volta a ser o de sempre em vez de exibir a chave crua. Sem reserva
  // declarada, a chave continua saindo literal como antes — o quiz-sf de 22
  // telas nao declara nenhuma, entao nada muda pra ele.
  var VAR_DEFAULTS = data.varDefaults || {};
  function tpl(str) {
    return String(str || '').replace(/\{(\w+)\}/g, function (todo, chave) {
      if (chave === 'name') return esc(state.name || 'tú');
      var v = state.vars[chave];
      // Derivadas da personalizacao (v2): {nome}, {nome_prep}, {obstaculo_texto},
      // {minutos_txt}... — ver atualizaDerivadas(). Nunca sobrescrevem uma
      // resposta gravada em state.vars.
      if (v === undefined || v === null || v === '') {
        var temDerivada = Object.prototype.hasOwnProperty.call(derivadas, chave);
        if (temDerivada) v = derivadas[chave];
        if (v === undefined || v === null || v === '') {
          var reserva = VAR_DEFAULTS[chave];
          if (reserva !== undefined && reserva !== null && reserva !== '') return esc(reserva);
          // Derivada declarada e vazia SOME da frase (ex.: frase_roupa com
          // roupa = nenhuma); chave desconhecida continua saindo crua.
          return temDerivada ? '' : todo;
        }
      }
      return esc(v);
    });
  }

  // Variaveis extras que a opcao grava junto com a resposta (opt.vars). O
  // value da opcao e um codigo curto (e o que vai pro admin); o texto que uma
  // tela seguinte mostra no meio da frase vem daqui — ex.: a Q4 do enxuto grava
  // tempo_treino_txt = 'até 12 minutos' pro pitch. Opcao sem vars: nada muda.
  function gravaVarsDaOpcao(opt) {
    var extras = opt && opt.vars;
    if (!extras || typeof extras !== 'object') return;
    Object.keys(extras).forEach(function (k) { state.vars[k] = extras[k]; });
  }

  // ==========================================================================
  // PERSONALIZACAO POR TIPO (v2, spec "Pagina do Tipo" de 01/10/2026)
  // Os textos moram em data.tipos / data.obstaculos / data.textos /
  // data.paginaTipo. Aqui so a regra: qual versao mostrar e como preencher
  // a ponte. As derivadas vivem FORA de state.vars: o que vai pro admin e
  // pro checkout_clicked continua sendo so o que a lead respondeu.
  // ==========================================================================
  var derivadas = {};
  function tipoAtual() { return (data.tipos && data.tipos[state.vars.tipo]) || null; }
  function obstaculoAtual() { return (data.obstaculos && data.obstaculos[state.vars.obstaculo]) || null; }

  // Regra da idade (spec): inteiro de 18 a 80 vira "34 anos"; vazio, nao
  // numerico ou fora da faixa some. A faixa etaria do quiz de hoje ("25 a 34
  // anos", "45 anos ou mais") ja e texto pronto e entra como esta.
  function idadeTexto(raw) {
    var t = String(raw == null ? '' : raw).trim();
    if (!t) return '';
    if (/^\d{1,3}$/.test(t)) { var n = parseInt(t, 10); return (n >= 18 && n <= 80) ? n + ' años' : ''; }
    return /\baños\b/.test(t) ? t : '';
  }

  function atualizaDerivadas() {
    var v = state.vars, tx = data.textos || {}, pg = data.paginaTipo || {};
    var t = tipoAtual(), ob = obstaculoAtual();
    derivadas = {
      nome: t ? t.nome : '',
      nome_prep: t ? t.nome_prep : '',
      apelido: t ? t.apelido : '',
      // v3: apelido curto ("reto") e a linha ("O famoso bumbum reto.") sao
      // chaves separadas; a v2 so tem apelido (= a linha) e nada muda pra ela.
      linha_apelido: t ? (t.linha_apelido || '') : '',
      data_turma: data.data_turma || '',
      botao_tipo: t ? t.botao : '',
      obstaculo_texto: ob ? ob.texto : '',
      minutos_txt: (tx.minutos || {})[v.tempo_dia] || '',
      frequencia_txt: (tx.frequencia || {})[v.frequencia] || '',
      objetivo_txt: (tx.objetivo || {})[v.bumbum_sonhos] || '',
      idade_txt: idadeTexto(v.idade),
    };
    // v3: derivadas genericas do dado — data.derivadas = { chave: { de, textos,
    // padrao } }. A fonte e uma resposta (state.vars) ou outra derivada ja
    // calculada (ordem do objeto): faixa <- idade, frase_faixa_11 <- faixa.
    // Vem DEPOIS das fixas de proposito: o dado pode sobrescrever (a B manda
    // a idade por codigo, 25_34, e define idade_txt por aqui).
    var gen = data.derivadas || {};
    Object.keys(gen).forEach(function (k) {
      var g = gen[k] || {};
      var fonte = state.vars[g.de];
      if (fonte === undefined || fonte === null || fonte === '') fonte = derivadas[g.de];
      var val = (g.textos || {})[fonte];
      derivadas[k] = (val === undefined || val === null) ? (g.padrao || '') : val;
    });
    // A frase da idade inteira some quando nao ha idade valida (spec).
    derivadas.frase_idade = derivadas.idade_txt
      ? String(pg.frase_idade || '').split('{idade_txt}').join(esc(derivadas.idade_txt))
      : String(pg.frase_sem_idade || '');
  }

  // Evento com nome proprio (ex.: 'tipo_definido' ao sair da tela Formato):
  // pixel (trackCustom), dataLayer e servidor (tracking.js), nesta ordem.
  function eventoCustom(nome, dados) {
    if (!nome) return;
    dados = dados || {};
    if (typeof window.fbq === 'function') { try { window.fbq('trackCustom', nome, dados); } catch (e) {} }
    var p = { event: nome };
    for (var k in dados) if (dados.hasOwnProperty(k)) p[k] = dados[k];
    dl(p);
    if (window.QUIZ_PREVIEW) return;
    if (typeof window.trackEvent === 'function') { try { window.trackEvent(nome, dados); } catch (e) {} }
  }

  // Par antes/depois (prova social, bloco B4 e grade da oferta). A imagem ja
  // e o par lado a lado; com img.rotulos os rotulos DIA 1 / DIA 21 entram por
  // cima, na tipografia da marca, e a legenda (img.caption) embaixo.
  function parHtml(img, lazy) {
    if (!img || !img.src) return '';
    var rot = img.rotulos
      ? '<div class="ba-rotulos"><span>' + esc(img.rotuloA || 'DIA 1') + '</span><span>' + esc(img.rotuloB || 'DIA 21') + '</span></div>'
      : '';
    var cap = img.caption ? '<div class="ba-caption">' + esc(img.caption) + '</div>' : '';
    return '<div class="ba-card' + (img.rotulos ? ' ba-com-rotulos' : '') + '">' +
      '<div class="ba-img"><img src="' + esc(img.src) + '" alt="' + esc(img.alt || 'Antes y después') + '"' +
        (lazy ? ' loading="lazy"' : '') + ' onerror="this.style.display=\'none\'" />' + rot + '</div>' +
      cap +
    '</div>';
  }

  // Comentario so de leitura (v3: os comentarios da abertura migram pra
  // oferta, abaixo da garantia, sem curtir/responder). Resposta sem horario
  // nao mostra horario nenhum — nada de "Agora".
  function comentarioEstaticoHtml(c) {
    var team = c.name === GATE_TEAM_NAME;
    var replies = (c.replies || []).map(function (r) {
      var t = r.name === GATE_TEAM_NAME;
      return '<div class="gate-reply">' + gateAvatarHtml(r.name, r.avatar || (t ? GATE_TEAM_AVATAR : ''), true, t) +
        '<div><div class="gate-comment-copy"><b>' + esc(r.name) + '</b> ' + esc(r.text) + '</div>' +
        (r.time ? '<div class="gate-comment-meta">' + esc(r.time) + '</div>' : '') + '</div></div>';
    }).join('');
    var likes = Number(c.likes || 0);
    return '<article class="gate-comment gate-comment-static">' +
      gateAvatarHtml(c.name, c.avatar || (team ? GATE_TEAM_AVATAR : ''), false, team) +
      '<div class="gate-comment-main"><div class="gate-comment-copy"><b>' + esc(c.name || 'Aluna') + '</b> ' + esc(c.text) + '</div>' +
      '<div class="gate-comment-meta">' + (c.time ? '<span>' + esc(c.time) + '</span>' : '') +
      (likes ? '<span>' + likes + (likes === 1 ? ' me gusta' : ' me gusta') + '</span>' : '') + '</div>' +
      replies + '</div>' +
    '</article>';
  }

  // Pagina do Tipo (type 'tipo'): blocos B1..G na ordem da spec. O bloco A
  // (rotulo, nome, apelido) e o eyebrow/title/body do passo, que o
  // renderStep ja desenha. Bloco sem texto (tipo nao respondido) nao aparece.
  function renderTipo(step) {
    var cfg = data.paginaTipo || {};
    var t = tipoAtual();
    var ob = obstaculoAtual();
    var ti = cfg.titulos || {};
    var h = '';
    if (cfg.mostrar_tipo_comum === true && cfg.linha_tipo_comum) {
      h += '<div class="tipo-comum">' + tpl(cfg.linha_tipo_comum) + '</div>';
    }
    function bloco(cls, titulo, texto, extra) {
      if (!texto) return '';
      return '<section class="tipo-bloco ' + cls + '">' +
        (titulo ? '<h2 class="tipo-h2">' + tpl(titulo) + '</h2>' : '') +
        '<p class="tipo-p">' + tpl(texto) + '</p>' + (extra || '') +
      '</section>';
    }
    // Clipe do exercicio dentro do bloco C (t.c_video): mudo, em loop.
    function videoTipo(v) {
      if (!v || !v.src) return '';
      return '<video class="tipo-video" src="' + esc(v.src) + '"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : '') +
        ' muted loop playsinline autoplay preload="auto" disablepictureinpicture></video>';
    }
    h += bloco('tipo-b1', ti.b1, t && t.b1);
    h += bloco('tipo-b2', ti.b2, cfg.b2);
    h += bloco('tipo-b3', ti.b3, t && t.b3);
    // v3: B4, prova do tipo — um par de aluna do mesmo formato. Fica atras da
    // flag ate existirem os tres pares.
    if (cfg.mostrar_prova_tipo === true && t && t.prova && t.prova.src) {
      h += '<section class="tipo-bloco tipo-b4">' +
        (ti.b4 ? '<h2 class="tipo-h2">' + tpl(ti.b4) + '</h2>' : '') +
        '<div class="ba-list ba-lista-1">' + parHtml(t.prova, true) + '</div>' +
      '</section>';
    }
    h += bloco('tipo-c', ti.c, t && t.c, t && videoTipo(t.c_video));
    h += bloco('tipo-d', ti.d, t && t.d);
    if (ob) h += bloco('tipo-e', ob.titulo, ob.paragrafo);
    if (cfg.ponte) h += '<section class="tipo-bloco tipo-f"><p class="tipo-p tipo-ponte">' + tpl(cfg.ponte) + '</p></section>';
    if (step.chart) {
      h += '<section class="tipo-bloco tipo-g">' +
        (cfg.grafico_titulo ? '<h2 class="tipo-h2">' + tpl(cfg.grafico_titulo) + '</h2>' : '') +
        renderChart(step) +
      '</section>';
    }
    return h;
  }

  // "Como funciona" da oferta (pitch.comoFunciona): passos, tabela da primeira
  // semana (exercicios por formato, duracao pelo tempo respondido) e cartoes.
  function comoFuncionaHtml(cf) {
    if (!cf) return '';
    var h = '';
    if (cf.passos && cf.passos.length) {
      h += '<ol class="como-passos">' + cf.passos.map(function (x) { return '<li>' + tpl(x) + '</li>'; }).join('') + '</ol>';
    }
    var sem = cf.semana;
    if (sem && sem.porTipo) {
      var lista = sem.porTipo[state.vars.tipo] || sem.porTipo[sem.padrao] || [];
      var tempos = (sem.duracoes && (sem.duracoes[state.vars.tempo_dia] || sem.duracoes['20_30'])) || [];
      var cab = cf.semanaCab || ['', '', ''];
      if (lista.length) {
        h += (cf.semanaTitulo ? '<h4 class="como-h4">' + tpl(cf.semanaTitulo) + '</h4>' : '') +
          '<table class="como-semana"><thead><tr><th>' + esc(cab[0]) + '</th><th>' + esc(cab[1]) + '</th><th>' + esc(cab[2]) + '</th></tr></thead><tbody>' +
          lista.map(function (nome, i) {
            var badge = (i === 0 && cf.adaptacao) ? ' <span class="como-badge">' + esc(cf.adaptacao) + '</span>' : '';
            var min = tempos[i] != null ? tempos[i] + ' min' : '';
            return '<tr' + (i === lista.length - 1 ? ' class="como-descanso"' : '') + '><td>' + (i + 1) + '</td><td>' + esc(nome) + badge + '</td><td>' + esc(min) + '</td></tr>';
          }).join('') +
          '</tbody></table>' +
          (cf.semanaNota ? '<p class="como-nota">' + esc(cf.semanaNota) + '</p>' : '');
      }
    }
    (cf.cards || []).forEach(function (c) {
      h += '<div class="como-card"><h4 class="como-h4">' + esc(c.titulo) + '</h4><p>' + esc(c.texto) + '</p></div>';
    });
    return h;
  }

  // --- Tracking wrapper (reusa tracking.js) ---
  function track(eventType, eventData) {
    if (window.QUIZ_PREVIEW) return;
    if (typeof window.trackEvent === 'function') {
      try { window.trackEvent(eventType, eventData); } catch (e) {}
    }
    paraDataLayer(eventType, eventData);
  }

  // ==========================================================================
  // PIXEL DO META + dataLayer
  //
  // Sai do mesmo track() que alimenta o nosso banco, de proposito: dois
  // gatilhos separados acabariam divergindo, e ninguem ia notar ate os
  // numeros do painel e os do gerenciador de anuncios nao baterem.
  //
  // O pixel do Meta e carregado direto no <head> (rastreamento.js, sem GTM).
  // Daqui saem ViewContent (chegou na oferta) e InitiateCheckout (clicou em
  // comprar). O Purchase NAO sai do navegador: a venda fecha no checkout da
  // Payt e quem manda o Purchase e o servidor, pela API de Conversoes
  // (meta.js), quando o webhook chega.
  //
  // O dataLayer segue recebendo os eventos de sempre (quiz_start, quiz_step,
  // quiz_answer, view_item, begin_checkout), mas ninguem consome: o GTM foi
  // aposentado. Fica porque nao custa nada e religar um consumidor um dia e
  // so carregar um script.
  //
  // O que muda por pagina — valor, oferta, pixel — vem de window.__TRACK,
  // declarado no HTML antes deste arquivo.
  // ==========================================================================
  var TRK = window.__TRACK || {};
  var NOME_DA_OFERTA = TRK.nome || 'Truque da Cavala';

  function dl(obj) {
    if (!window.dataLayer || !window.dataLayer.push) return;
    try { window.dataLayer.push(obj); } catch (e) {}
  }

  // Evento padrao do pixel (ViewContent / InitiateCheckout), com valor e
  // oferta de window.__TRACK. O eventID vai junto pra o Meta deduplicar se o
  // mesmo evento chegar tambem pelo servidor um dia. Sem fbq (pixel
  // desligado, bloqueador), nao faz nada.
  function pixel(nome, eventID) {
    if (typeof window.fbq !== 'function') return;
    try {
      window.fbq('track', nome, {
        currency: TRK.moeda || 'BRL',
        value: (TRK.valorCents || 0) / 100,
        // O mesmo content_id do Purchase que sai do servidor (codigo do
        // produto na Payt): os tres eventos do funil apontam pro mesmo produto.
        content_ids: [TRK.oferta || TRK.funil || 'quiz'],
        content_type: 'product',
        content_name: NOME_DA_OFERTA,
      }, eventID ? { eventID: eventID } : undefined);
    } catch (e) {}
  }

  function itensDaOferta() {
    return [{
      item_id: TRK.oferta || TRK.funil || 'quiz',
      item_name: NOME_DA_OFERTA,
      item_category: 'programa',
      price: (TRK.valorCents || 0) / 100,
      quantity: 1,
    }];
  }

  // O objeto ecommerce GRUDA entre pushes: sem zerar antes, o proximo
  // evento herda os itens do anterior e o relatorio soma compra que nao
  // existiu. E a pegadinha classica do GA4 com dataLayer.
  function ecommerce(evento, extra) {
    dl({ ecommerce: null });
    var p = {
      event: evento,
      ecommerce: {
        currency: TRK.moeda || 'BRL',
        value: (TRK.valorCents || 0) / 100,
        items: itensDaOferta(),
      },
    };
    if (extra) { for (var k in extra) if (extra.hasOwnProperty(k)) p[k] = extra[k]; }
    dl(p);
  }

  // Um ViewContent por sessao: o id deriva da sessao de proposito, pra um F5
  // na oferta nao contar duas vezes. Chamado quando o pitch renderiza.
  function ofertaVista() {
    ecommerce('view_item');
    pixel('ViewContent', window._sessionId ? window._sessionId + '.vc' : null);
  }

  function paraDataLayer(evento, dados) {
    dados = dados || {};
    var passo = null;
    try { passo = currentStep(); } catch (e) {}

    if (evento === 'step_reached') {
      var i = dados.index || 0;
      if (i === 0) dl({ event: 'quiz_start', funil: TRK.funil, versao: TRK.versao });
      dl({
        event: 'quiz_step',
        step_name: dados.step,
        // 1-based: "etapa 1" no relatorio tem que ser a primeira tela.
        step_index: i + 1,
      });
      if (passo && passo.type === 'pitch') ofertaVista();
      return;
    }

    if (evento === 'step_answered') {
      dl({
        event: 'quiz_answer',
        step_name: dados.step,
        step_index: (dados.index || 0) + 1,
        answer: String(dados.answer == null ? '' : dados.answer).slice(0, 100),
      });
      return;
    }

    if (evento === 'checkout_clicked') {
      // O event_id e o que impede a Meta de contar duas vezes quando o
      // mesmo clique for mandado tambem pelo servidor.
      var eid = typeof window.eventoIdDoCheckout === 'function' ? window.eventoIdDoCheckout() : '';
      ecommerce('begin_checkout', { event_id: eid, sid: window._sessionId || '' });
      // O beacon /checkout do tracking.js sai com este MESMO event_id
      // (window.eventoIdDoCheckout = sid + '.ic'), entao a sessao guarda o
      // id do clique que o pixel mandou.
      pixel('InitiateCheckout', eid);
      // Google Ads: a conversao "iniciar checkout" sai no mesmo clique, como
      // no quiz atual. O google-ads.js so existe no truquedacavala.site; no
      // desinflameja.site a funcao nao existe e este if nao faz nada — o
      // codigo fica igual nos dois repos de proposito, pra um dia ligar a
      // Google tag no outro dominio ser so adicionar o script no HTML.
      if (typeof window.googleAdsIniciarCheckout === 'function') {
        try { window.googleAdsIniciarCheckout({ sid: window._sessionId || '' }); } catch (e) {}
      }
      return;
    }
  }

  // O InitiateCheckout do pixel sai como uma imagem pra facebook.com/tr; se
  // a pagina trocar no mesmo instante, o navegador cancela a requisicao e o
  // evento nunca chega (visto no Testar eventos da recorrencia em
  // 15/09/2026). Segura a navegacao por um piscar de olhos. So o clique
  // simples: ctrl/cmd/shift/botao do meio abrem em outra aba e nao precisam.
  // A conversao da Google tag sai do mesmo jeito (um pedido pra
  // googleadservices.com), entao o gtag ligado tambem segura.
  function navegarComAtraso(e, destino) {
    if (typeof window.fbq !== 'function' && typeof window.gtag !== 'function') return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    if (!destino || destino === '#') return;
    e.preventDefault();
    setTimeout(function () { window.location.href = destino; }, 150);
  }

  // ==========================================================================
  // WEB AUDIO — sons sintetizados (playReward, playUnlock, playTick)
  // ==========================================================================
  var audioCtx = null;
  function getCtx() {
    if (state.muted || data.sounds === false) return null;
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playNote(ctx, freq, startAt, dur, type, gain) {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    g.gain.setValueAtTime(0, startAt);
    g.gain.linearRampToValueAtTime(gain, startAt + 0.015);
    g.gain.exponentialRampToValueAtTime(gain * 0.5, startAt + 0.075);
    g.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(startAt); osc.stop(startAt + dur + 0.05);
  }

  function playReward() {
    var ctx = getCtx(); if (!ctx) return;
    var now = ctx.currentTime;
    // C5 - E5 - G5 (triade maior C), 3 notas sine ascendentes
    var freqs = [523.25, 659.25, 783.99];
    freqs.forEach(function (f, i) {
      playNote(ctx, f, now + i * 0.18, 0.22, 'sine', 0.18);
    });
  }

  function playUnlock() {
    var ctx = getCtx(); if (!ctx) return;
    var now = ctx.currentTime;
    // Fanfarra G4-C5-E5-G5-C6, ultima nota sustentada
    var seq = [
      { f: 392.00, t: 0.00, d: 0.18 },
      { f: 523.25, t: 0.18, d: 0.18 },
      { f: 659.25, t: 0.36, d: 0.18 },
      { f: 783.99, t: 0.54, d: 0.18 },
      { f: 1046.50, t: 0.72, d: 0.78 },
    ];
    seq.forEach(function (n) {
      playNote(ctx, n.f, now + n.t, n.d, 'sine', 0.22);
      // Camada triangle uma oitava acima na ultima nota
      if (n.f === 1046.50) playNote(ctx, n.f * 2, now + n.t, n.d, 'triangle', 0.10);
    });
  }

  function playTick() {
    var ctx = getCtx(); if (!ctx) return;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.04);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.1);
  }

  // ==========================================================================
  // MEDIDOR — count-up animado
  // ==========================================================================
  function updateMeterUI(from, to) {
    if (!$meterFill && !$meterValue) return;
    var start = performance.now();
    var duration = 850;
    if ($meterFill) $meterFill.style.width = Math.min(100, to) + '%';
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      var val = from + (to - from) * eased;
      if ($meterValue) $meterValue.textContent = Math.round(val) + '%';
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function addMeter(gain) {
    setMeter(state.meterValue + gain);
  }

  function setMeter(valor) {
    var from = state.meterValue;
    var to = Math.max(from, Math.min(METER_MAX, valor));
    state.meterValue = to;
    updateMeterUI(from, to);
  }

  // ==========================================================================
  // TOAST — aparece ACIMA do titulo, empurra conteudo pra baixo
  // ==========================================================================
  var toastTimer = null;
  function showToast(icon, msg) {
    if (!$toastSlot) return;
    if (toastTimer) clearTimeout(toastTimer);
    $toastSlot.innerHTML =
      '<div class="toast-inner"><div class="toast">' +
        '<span class="toast-icon">' + icon + '</span>' +
        '<span>' + msg + '</span>' +
      '</div></div>';
    // rAF pra o browser aplicar grid-template-rows:0fr antes da transicao
    requestAnimationFrame(function () {
      $toastSlot.classList.add('show');
    });
    toastTimer = setTimeout(hideToast, 4500);
  }
  function hideToast() {
    $toastSlot.classList.remove('show');
    setTimeout(function () {
      if (!$toastSlot.classList.contains('show')) $toastSlot.innerHTML = '';
    }, 500);
  }

  // ==========================================================================
  // MODAL (bonus)
  // ==========================================================================
  function openBonusModal(cfg, onClose) {
    var bonusesHtml = cfg.bonuses.map(function (b) {
      return '<div class="modal-bonus">' +
        '<div class="modal-bonus-header">' +
          '<span class="modal-bonus-emoji">' + b.emoji + '</span>' +
          '<span class="modal-bonus-name">' + esc(b.name) + '</span>' +
        '</div>' +
        '<div class="modal-bonus-desc">' + esc(b.description) + '</div>' +
      '</div>';
    }).join('');

    $modalRoot.innerHTML =
      '<div class="modal-overlay" role="dialog" aria-modal="true">' +
        '<div class="modal-card">' +
          '<div class="modal-badge">' + esc(cfg.badge) + '</div>' +
          '<h2 class="modal-title">' + tpl(cfg.title) + '</h2>' +
          '<p class="modal-subtitle">' + tpl(cfg.subtitle) + '</p>' +
          '<div class="modal-bonuses">' + bonusesHtml + '</div>' +
          '<button class="cta cta-gold" id="modal-close-btn">' + esc(cfg.cta) + '</button>' +
        '</div>' +
      '</div>';

    playUnlock();
    track('bonus_modal_opened', { step: currentStep().stepName });

    document.getElementById('modal-close-btn').addEventListener('click', function () {
      $modalRoot.innerHTML = '';
      onClose();
    });
  }

  // ==========================================================================
  // RENDER — dispatch por step.type
  // ==========================================================================
  function currentStep() { return data.steps[state.stepIndex]; }

  function renderCarousel(items) {
    if (!items || !items.length) return '';
    var slides = items.map(function (item, i) {
      return '<div class="photo-carousel-slide" role="group" aria-label="' + (i + 1) + ' de ' + items.length + '">' +
        '<img src="' + esc(item.src) + '" alt="' + esc(item.alt || '') + '"' +
          (i > 0 ? ' loading="lazy"' : '') + ' draggable="false" onerror="this.style.display=\'none\'" />' +
      '</div>';
    }).join('');
    var dots = items.map(function (_, i) {
      return '<button class="photo-carousel-dot' + (i === 0 ? ' is-active' : '') + '" type="button" data-slide="' + i +
        '" aria-label="Ver foto ' + (i + 1) + '" aria-current="' + (i === 0 ? 'true' : 'false') + '"></button>';
    }).join('');
    var controls = items.length > 1
      ? '<div class="photo-carousel-dots">' + dots + '</div>'
      : '';
    return '<div class="photo-carousel" data-photo-carousel tabindex="0" aria-label="Fotos del entrenamiento">' +
      '<div class="photo-carousel-viewport"><div class="photo-carousel-track">' + slides + '</div></div>' +
      controls +
    '</div>';
  }

  function bindCarousels() {
    Array.from(document.querySelectorAll('[data-photo-carousel]')).forEach(function (carousel) {
      var track = carousel.querySelector('.photo-carousel-track');
      var slides = Array.from(carousel.querySelectorAll('.photo-carousel-slide'));
      var dots = Array.from(carousel.querySelectorAll('.photo-carousel-dot'));
      if (!track || slides.length < 2) return;
      var index = 0;
      var touchStartX = null;
      var autoplayTimer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
        dots.forEach(function (dot, i) {
          var active = i === index;
          dot.classList.toggle('is-active', active);
          dot.setAttribute('aria-current', active ? 'true' : 'false');
        });
      }

      function scheduleAutoplay() {
        clearTimeout(autoplayTimer);
        autoplayTimer = setTimeout(function () {
          if (!carousel.isConnected) return;
          show(index + 1);
          scheduleAutoplay();
        }, 2500);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(parseInt(dot.dataset.slide, 10));
          scheduleAutoplay();
        });
      });
      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); scheduleAutoplay(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); scheduleAutoplay(); }
      });
      carousel.addEventListener('touchstart', function (e) {
        clearTimeout(autoplayTimer);
        touchStartX = e.touches.length ? e.touches[0].clientX : null;
      }, { passive: true });
      carousel.addEventListener('touchend', function (e) {
        if (touchStartX === null || !e.changedTouches.length) { scheduleAutoplay(); return; }
        var distance = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(distance) >= 40) show(index + (distance < 0 ? 1 : -1));
        scheduleAutoplay();
      }, { passive: true });
      carousel.addEventListener('touchcancel', function () {
        touchStartX = null;
        scheduleAutoplay();
      }, { passive: true });
      scheduleAutoplay();
    });
  }

  // ========================================================================
  // ABERTURA — prova social no formato de comentarios
  //
  // As interacoes da visitante ficam apenas no localStorage deste aparelho.
  // Assim ela pode comentar, curtir e responder sem publicar conteudo sem
  // moderacao para todas as outras pessoas.
  // ========================================================================
  // Chave PROPRIA deste projeto: se ficasse a do molde de origem, um aparelho
  // que passou pelos dois sites veria aqui os comentarios que escreveu la.
  var GATE_STORAGE_KEY = '_cavala_gate_comments_v1';
  // Quem responde os comentarios e a especialista da marca. O nome e o avatar
  // saem do dado (gateTeamName / gateTeamAvatar) pra o motor nao ter nome de
  // pessoa escrito dentro dele.
  var GATE_TEAM_NAME = data.gateTeamName || 'Carolina';
  var GATE_TEAM_AVATAR = data.gateTeamAvatar || 'images/brenda-avatar.webp';
  var gateReplyTo = null;

  function gateState() {
    try {
      var parsed = JSON.parse(localStorage.getItem(GATE_STORAGE_KEY) || '{}');
      return {
        comments: Array.isArray(parsed.comments) ? parsed.comments.slice(-20) : [],
        replies: parsed.replies && typeof parsed.replies === 'object' ? parsed.replies : {},
        likes: parsed.likes && typeof parsed.likes === 'object' ? parsed.likes : {},
      };
    } catch (e) {
      return { comments: [], replies: {}, likes: {} };
    }
  }

  function saveGateState(value) {
    try { localStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(value)); } catch (e) {}
  }

  function gateInitials(name) {
    return String(name || 'Tú').trim().split(/\s+/).slice(0, 2).map(function (p) {
      return p.charAt(0).toUpperCase();
    }).join('') || 'V';
  }

  function gateAvatarHtml(name, avatar, small, team) {
    var classes = 'gate-avatar' + (small ? ' gate-avatar-small' : '') + (team ? ' gate-avatar-team' : '');
    if (avatar) {
      return '<img class="' + classes + '" src="' + esc(avatar) + '" alt="' + esc(name || '') + '" loading="lazy">';
    }
    return '<span class="' + classes + '">' + esc(gateInitials(name)) + '</span>';
  }

  function gateCommentHtml(comment, saved, own) {
    var id = String(comment.id || 'comment');
    var replies = (comment.replies || []).concat(saved.replies[id] || []);
    var liked = !!saved.likes[id];
    var totalLikes = Number(comment.likes || 0) + (liked ? 1 : 0);
    var isTeam = comment.name === GATE_TEAM_NAME;
    var replyHtml = replies.map(function (reply) {
      var team = reply.name === GATE_TEAM_NAME;
      return '<div class="gate-reply">' +
        gateAvatarHtml(reply.name, reply.avatar || (team ? GATE_TEAM_AVATAR : ''), true, team) +
        '<div><div class="gate-comment-copy"><b>' + esc(reply.name) + '</b> ' + esc(reply.text) + '</div>' +
        '<div class="gate-comment-meta">Ahora</div></div></div>';
    }).join('');
    return '<article class="gate-comment" data-comment-id="' + esc(id) + '">' +
      gateAvatarHtml(comment.name, comment.avatar || (isTeam ? GATE_TEAM_AVATAR : ''), false, isTeam) +
      '<div class="gate-comment-main"><div class="gate-comment-copy"><b>' + esc(comment.name || (own ? 'Tú' : 'Alumna')) + '</b> ' + esc(comment.text) + '</div>' +
      '<div class="gate-comment-meta"><span>' + esc(comment.time || 'Ahora') + '</span>' +
      (totalLikes ? '<span>' + totalLikes + (totalLikes === 1 ? ' me gusta' : ' me gusta') + '</span>' : '') +
      '<button class="gate-reply-btn" type="button">Responder</button></div>' + replyHtml + '</div>' +
      '<button class="gate-like' + (liked ? ' is-liked' : '') + '" type="button" aria-label="' + (liked ? 'Quitar me gusta' : 'Me gusta') + '">♡</button>' +
      '</article>';
  }

  function renderGateComments(step) {
    var list = document.getElementById('gate-comments-list');
    if (!list) return;
    var saved = gateState();
    var seeded = step.comments || [];
    list.innerHTML = seeded.map(function (comment) {
      return gateCommentHtml(comment, saved, false);
    }).join('') + saved.comments.map(function (comment) {
      return gateCommentHtml(comment, saved, true);
    }).join('');
    var count = document.getElementById('gate-comment-count');
    if (count) count.textContent = String(seeded.length + saved.comments.length);
  }

  // Rodape legal da abertura. Os links, o aviso e a linha da empresa saem do
  // dado (data.gateFooter): sao copy e CNPJ, nao motor. Os valores abaixo sao
  // so a rede de seguranca — uma pagina que roda anuncio nao pode ficar sem
  // os links legais porque alguem esqueceu de declarar.
  function gateFooterHtml() {
    var cfg = data.gateFooter || {};
    var previewQs = window.QUIZ_PREVIEW ? '?preview=1' : '';
    var links = Array.isArray(cfg.links) && cfg.links.length ? cfg.links : [
      { label: 'Política de Privacidad', href: '/politicas-de-privacidade' },
      { label: 'Términos de Uso', href: '/termos-de-uso' },
      { label: 'Contacto', href: '/contato' },
      { label: 'Aviso legal', href: '/aviso-legal' },
    ];
    var nav = links.map(function (l, i) {
      return (i ? '<span>·</span>' : '') +
        '<a href="' + esc(l.href) + previewQs + '">' + esc(l.label) + '</a>';
    }).join('');
    var nota = cfg.note || 'Los entrenamientos y protocolos mencionados en esta página tienen carácter educativo y de acondicionamiento físico general. ' +
      'No constituyen consulta, diagnóstico, prescripción ni tratamiento médico, y no sustituyen la evaluación y autorización de un profesional de la salud. ' +
      'Consulta con un médico antes de comenzar, especialmente si estás embarazada, tienes alguna condición de salud preexistente o tomas medicamentos.';
    return '<footer class="gate-footer"><nav aria-label="Enlaces legales">' + nav + '</nav>' +
      '<p>' + esc(nota) + '</p>' +
      (cfg.company ? '<p class="gate-company">' + esc(cfg.company) + '</p>' : '') +
      '</footer>';
  }

  // Tracinhos de progresso do topo da abertura (e da tela binaria). Sem
  // step.progress sai EXATAMENTE o markup de sempre (3 tracinhos, o primeiro
  // aceso pelo :first-child do CSS) — e o que o quiz-sf de 22 telas usa. Com
  // step.progress = { total, lit } o dado diz quantos tracinhos e quantos
  // acesos: o enxuto tem 4 perguntas e mostra 4 desde a primeira tela. A
  // largura cresce com o total pra cada tracinho manter o tamanho do gate de
  // 3 (232px de largura com 7px de vao = 72,67px por tracinho).
  function gateProgressHtml(step) {
    var cfg = step.progress;
    if (!cfg) return '<div class="gate-progress" aria-hidden="true"><i></i><i></i><i></i></div>';
    var total = Math.max(1, Math.min(12, parseInt(cfg.total, 10) || 3));
    var acesos = cfg.lit == null ? 1 : Math.max(0, Math.min(total, parseInt(cfg.lit, 10) || 0));
    var largura = Math.round(total * (218 / 3) + (total - 1) * 7);
    var tracos = '';
    for (var i = 0; i < total; i++) tracos += i < acesos ? '<i class="is-on"></i>' : '<i></i>';
    return '<div class="gate-progress gate-progress-n" aria-hidden="true" style="grid-template-columns:repeat(' + total +
      ',1fr);width:' + largura + 'px">' + tracos + '</div>';
  }

  function renderGate(step) {
    return '<section class="gate-hero" aria-labelledby="gate-title">' +
      '<img class="gate-expert" src="' + esc(GATE_TEAM_AVATAR) + '" alt="' + esc(GATE_TEAM_NAME) + '" width="64" height="64">' +
      gateProgressHtml(step) +
      '<div class="gate-eyebrow"><span aria-hidden="true">▣</span> ' + esc(step.eyebrow || 'CUESTIONARIO PERSONALIZADO') + '</div>' +
      '<h1 id="gate-title">' + tpl(step.title) + '</h1>' +
      '<button class="gate-primary" id="gate-primary" type="button">' + esc(step.cta || 'Empezar ahora') + '</button>' +
      '<button class="gate-decline" id="gate-decline" type="button">' + esc(step.decline || 'No soy') + '</button>' +
      '<p class="gate-decline-note" id="gate-decline-note" hidden>Este cuestionario fue creado para el público femenino.</p>' +
      '</section>' +
      '<section class="gate-social" aria-labelledby="gate-comments-title">' +
      '<div class="gate-comments-head" id="gate-comments-title"><svg class="gate-comment-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4.75h14a2.25 2.25 0 0 1 2.25 2.25v8A2.25 2.25 0 0 1 19 17.25H10l-4.9 3.2.65-3.2H5A2.25 2.25 0 0 1 2.75 15V7A2.25 2.25 0 0 1 5 4.75Z"/></svg><b id="gate-comment-count">0</b> comentarios <small>· dudas sobre el cuestionario</small></div>' +
      '<div id="gate-comments-list"></div>' +
      '<form class="gate-composer" id="gate-composer"><div class="gate-replying" id="gate-replying" hidden></div>' +
      '<div class="gate-composer-row"><span class="gate-avatar">T</span><input id="gate-comment-input" type="text" maxlength="280" autocomplete="off" placeholder="Escribe un comentario…" aria-label="Tu comentario"><button type="submit" aria-label="Enviar comentário">➤</button></div>' +
      '<small>Tu comentario y tus respuestas se guardan solo en este dispositivo.</small></form>' +
      '</section>' +
      gateFooterHtml();
  }

  function bindGate(step) {
    renderGateComments(step);
    var primary = document.getElementById('gate-primary');
    var decline = document.getElementById('gate-decline');
    var form = document.getElementById('gate-composer');
    var input = document.getElementById('gate-comment-input');

    primary.addEventListener('click', function () {
      track('step_answered', { step: step.stepName, index: state.stepIndex, answer: 'mulher' });
      advance();
    });
    decline.addEventListener('click', function () {
      document.getElementById('gate-decline-note').hidden = false;
      track('gate_declined', { step: step.stepName });
    });

    document.getElementById('gate-comments-list').addEventListener('click', function (e) {
      var article = e.target.closest('.gate-comment');
      if (!article) return;
      var id = article.getAttribute('data-comment-id');
      var saved = gateState();
      if (e.target.closest('.gate-like')) {
        if (saved.likes[id]) delete saved.likes[id]; else saved.likes[id] = true;
        saveGateState(saved);
        renderGateComments(step);
      } else if (e.target.closest('.gate-reply-btn')) {
        var nameEl = article.querySelector('.gate-comment-copy b');
        gateReplyTo = { id: id, name: nameEl ? nameEl.textContent : 'comentario' };
        var replying = document.getElementById('gate-replying');
        replying.textContent = 'Respondiendo a ' + gateReplyTo.name + ' · toca para cancelar';
        replying.hidden = false;
        input.focus();
      }
    });

    document.getElementById('gate-replying').addEventListener('click', function () {
      gateReplyTo = null;
      this.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      var saved = gateState();
      if (gateReplyTo) {
        if (!Array.isArray(saved.replies[gateReplyTo.id])) saved.replies[gateReplyTo.id] = [];
        saved.replies[gateReplyTo.id].push({ name: 'Tú', text: text.slice(0, 280) });
        saved.replies[gateReplyTo.id] = saved.replies[gateReplyTo.id].slice(-10);
        track('gate_reply_added', { comment: gateReplyTo.id });
      } else {
        saved.comments.push({ id: 'user-' + Date.now(), name: 'Tú', text: text.slice(0, 280), time: 'Ahora', likes: 0, replies: [] });
        saved.comments = saved.comments.slice(-20);
        track('gate_comment_added', { length: text.length });
      }
      saveGateState(saved);
      gateReplyTo = null;
      input.value = '';
      renderGateComments(step);
      document.getElementById('gate-replying').hidden = true;
    });
  }

  // ========================================================================
  // PERGUNTA BINARIA — type 'question' com layout 'binary'
  //
  // Uma pergunta de duas respostas no desenho da abertura: avatar da
  // especialista, tracinhos, eyebrow, titulo grande, options[0] como botao
  // cheio e options[1] como link sublinhado embaixo. Sem comentarios e sem o
  // rodape legal (a abertura ja mostrou os dois).
  // Diferente do "Nao sou" da abertura, AS DUAS opcoes sao resposta: gravam
  // variableToSave (e opt.vars), mandam step_answered com o value escolhido e
  // avancam. E 'question' + layout (e nao um type novo) de proposito: um
  // motor que nao conheca o layout cai na pergunta comum de duas opcoes, que
  // funciona — em vez de uma tela sem botao.
  // ========================================================================
  function ehBinaria(step) {
    return step.type === 'question' && step.layout === 'binary' &&
      Array.isArray(step.options) && step.options.length >= 2;
  }

  function renderBinary(step) {
    var principal = step.options[0];
    var alternativa = step.options[1];
    return '<section class="gate-hero gate-binary" aria-labelledby="gate-title">' +
      '<img class="gate-expert" src="' + esc(GATE_TEAM_AVATAR) + '" alt="' + esc(GATE_TEAM_NAME) + '" width="64" height="64">' +
      gateProgressHtml(step) +
      (step.eyebrow ? '<div class="gate-eyebrow">' + esc(step.eyebrow) + '</div>' : '') +
      '<h1 id="gate-title">' + tpl(step.title) + '</h1>' +
      '<button class="gate-primary" type="button" data-idx="0">' + esc(principal.label) + '</button>' +
      '<button class="gate-decline" type="button" data-idx="1">' + esc(alternativa.label) + '</button>' +
      '</section>';
  }

  function bindBinary(step) {
    var botoes = Array.from(document.querySelectorAll('.gate-binary [data-idx]'));
    var respondida = false;
    // O botao cheio desta tela fica quase no mesmo lugar do "Sim, sou mulher"
    // da abertura: um toque duplo la chegaria aqui como clique e responderia
    // esta pergunta sem a lead ler. Clique nos primeiros 350 ms da tela e
    // ignorado.
    var abriuEm = Date.now();
    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (respondida || Date.now() - abriuEm < 350) return;
        respondida = true;
        botoes.forEach(function (b) { b.disabled = true; });
        var opt = step.options[parseInt(btn.getAttribute('data-idx'), 10)];
        playTick();
        if (step.variableToSave) state.vars[step.variableToSave] = opt.value;
        gravaVarsDaOpcao(opt);
        track('step_answered', { step: step.stepName, index: state.stepIndex, answer: opt.value });
        advance();
      });
    });
  }

  function renderStep(reset) {
    var step = currentStep();
    vezDaTela++;
    // v2: o tipo/obstaculo podem ter mudado (seta de voltar + outra resposta).
    atualizaDerivadas();
    // Veio de uma pergunta binaria? Entao as opcoes desta tela so ouvem
    // clique depois da trava (ver TRAVA_TOQUE_DUPLO_MS).
    opcoesLiberadasEm = (telaDeAntes && ehBinaria(telaDeAntes)) ? Date.now() + TRAVA_TOQUE_DUPLO_MS : 0;
    telaDeAntes = step;
    // Voltar e avancar de novo somava o meterGain outra vez e a barra batia
    // 100% antes da oferta: o ganho (e o toast dele) e so da primeira chegada.
    var primeiraVez = state.stepIndex > state.maiorTela;
    if (primeiraVez) state.maiorTela = state.stepIndex;

    // meter subida (nao no step 0). No pitch pula o toast "+X%" pra dar espaco ao "destravou 100%".
    // Sobe a barra de progresso. Sem meterGain no passo, a barra segue a
    // posicao no fluxo — assim o dado nao precisa distribuir porcentagem a mao.
    if (state.stepIndex > 0 && primeiraVez) {
      if (step.meterGain) {
        // O ganho das telas puladas no caminho (mostrarSe) entra aqui, de uma
        // vez, pra soma dos meterGain continuar fechando 100 na oferta.
        var ganho = step.meterGain + state.ganhoPulado;
        state.ganhoPulado = 0;
        addMeter(ganho);
        if (data.toasts !== false && step.type !== 'pitch' && step.type !== 'scratch') {
          showToast('💪', '+' + ganho + '% en el ' + METER_LABEL.toLowerCase());
          playReward();
        }
      } else if (data.meterAuto !== false) {
        setMeter(Math.round(METER_MAX * state.stepIndex / (data.steps.length - 1)));
      }
    }

    // Toast de clima no scratch (momento do brinde), quando a pagina tem o slot.
    if (step.type === 'scratch') {
      setTimeout(function () {
        showToast('🏆', '¡Desbloqueaste el 100% + una sorpresa!');
        playUnlock();
      }, 500);
    }

    track('step_reached', { step: step.stepName, index: state.stepIndex });

    // Troca a imagem do topo a partir do passo que pedir (o head comeca com o
    // avatar da Brenda; um passo pode trocar por uma marca larga).
    if (step.headerLogo) {
      var logoEl = document.querySelector('.qb-logo');
      if (logoEl && logoEl.getAttribute('src') !== step.headerLogo) {
        logoEl.setAttribute('src', step.headerLogo);
        logoEl.classList.add('qb-logo-wide');
      }
    }

    // Backredirect: arma no passo que o dado indicar (armAtStep ou
    // armBackredirect no proprio passo). armBackredirect() tem guarda interna:
    // chamar 2x nao arma 2x, e com data.backredirect === false nao arma nunca.
    if ((data.armAtStep && step.stepName === data.armAtStep) || step.armBackredirect === true) armBackredirect();

    // scroll pro topo (mantem medidor visivel)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // A pergunta binaria usa a MESMA moldura da abertura (tela cheia, sem o
    // cabecalho com seta e barra, sem dock), entao liga a mesma classe.
    var binaria = ehBinaria(step);
    document.body.classList.toggle('quiz-gate-active', step.type === 'gate' || binaria);

    // A abertura usa a largura inteira e nao herda o cabecalho/dock do quiz.
    if (step.type === 'gate') {
      if ($footer && $footerHome) $footerHome.appendChild($footer);
      $ctaDock.innerHTML = '';
      $stepContainer.className = 'step-' + step.stepName;
      $stepContainer.innerHTML = renderGate(step);
      bindGate(step);
      return;
    }

    if (binaria) {
      if ($footer && $footerHome) $footerHome.appendChild($footer);
      $ctaDock.innerHTML = '';
      $stepContainer.className = 'step-' + step.stepName;
      $stepContainer.innerHTML = renderBinary(step);
      bindBinary(step);
      return;
    }

    // renderiza container do step
    // step.eyebrow nas telas comuns: a linha curta acima do titulo ("PERGUNTA
    // 3 DE 4" no enxuto). Na abertura o eyebrow tem desenho proprio (acima);
    // nenhuma outra tela do quiz-sf declara, entao o markup dele nao muda.
    var eyebrowH = step.eyebrow ? '<div class="step-eyebrow">' + esc(step.eyebrow) + '</div>' : '';
    var titleH = eyebrowH + '<h1 class="step-title">' + tpl(step.title) + '</h1>';
    var carousel = renderCarousel(step.carousel);
    var bodyP = (carousel || step.body) ? '<div class="step-body">' + carousel + tpl(step.body || '') + '</div>' : '';
    // O funil de referencia repete essa nota embaixo de toda pergunta.
    if (data.optionsNote && (step.type === 'question' || step.type === 'decision')) {
      bodyP += '<div class="step-note">' + esc(data.optionsNote) + '</div>';
    }
    $stepContainer.className = 'step-' + step.stepName;
    $stepContainer.innerHTML = titleH + bodyP + renderStepBody(step);

    // bind depois do render
    bindCarousels();
    bindStepHandlers(step);

    // Antes de trocar o HTML do dock, devolve o rodape ao lugar seguro para
    // que ele nao seja apagado pelo innerHTML do proximo CTA.
    if ($footer && $footerHome) $footerHome.appendChild($footer);

    // CTA dock
    renderCta(step);

    // Com CTA, a assinatura fica logo abaixo do botao. Sem CTA (perguntas e
    // processamento), ela continua no fluxo normal ao fim da pagina.
    if ($footer && $ctaDock && $ctaDock.children.length) $ctaDock.appendChild($footer);
  }

  // Grafico de linha em SVG inline — sem biblioteca, sem requisicao extra.
  // Era o case 'chart' do renderStepBody; virou funcao porque a Pagina do
  // Tipo (v2) desenha o MESMO grafico como bloco G.
  function renderChart(step) {
    var pts = (step.chart && step.chart.points) || [];
    if (!pts.length) return '';
    var L = 34, R = 10, T = 14, Bo = 34, W = 320, H = 210;
    var maxY = 100;
    var coord = pts.map(function (p, i) {
      var x = L + (W - L - R) * (pts.length === 1 ? 0 : i / (pts.length - 1));
      var y = T + (H - T - Bo) * (1 - Number(p.y) / maxY);
      return { x: x, y: y, p: p };
    });
    var linha = coord.map(function (c) { return c.x.toFixed(1) + ',' + c.y.toFixed(1); }).join(' ');
    var area = 'M' + coord[0].x.toFixed(1) + ',' + (H - Bo) + ' L' + linha.split(' ').join(' L') +
      ' L' + coord[coord.length - 1].x.toFixed(1) + ',' + (H - Bo) + ' Z';
    var grade = [0, 25, 50, 75, 100].map(function (v) {
      var y = T + (H - T - Bo) * (1 - v / maxY);
      return '<line class="ch-grid" x1="' + L + '" y1="' + y.toFixed(1) + '" x2="' + (W - R) + '" y2="' + y.toFixed(1) + '" />' +
             '<text class="ch-ytick" x="' + (L - 6) + '" y="' + (y + 3).toFixed(1) + '">' + v + '</text>';
    }).join('');
    var bolas = coord.map(function (c) {
      return '<circle class="ch-dot" cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4" />';
    }).join('');
    // O primeiro e o ultimo rotulo do eixo sao ancorados pra DENTRO. Os
    // pontos extremos ficam em x=L e x=W-R, entao um rotulo centralizado
    // ali vaza metade da largura pra fora do viewBox e o navegador corta —
    // era o que fazia "4a SEM" aparecer como "4a SEI".
    var xticks = coord.map(function (c, i) {
      var anc = i === 0 ? 'start' : (i === coord.length - 1 ? 'end' : 'middle');
      return '<text class="ch-xtick" style="text-anchor:' + anc + '" x="' + c.x.toFixed(1) +
        '" y="' + (H - Bo + 16) + '">' + esc(c.p.x) + '</text>';
    }).join('');
    var marcas = coord.map(function (c) {
      if (!c.p.label) return '';
      var ancora = c.x > W * 0.7 ? 'end' : (c.x < W * 0.3 ? 'start' : 'middle');
      return '<text class="ch-mark" text-anchor="' + ancora + '" x="' + c.x.toFixed(1) + '" y="' + (c.y - 10).toFixed(1) + '">' + esc(c.p.label) + '</text>';
    }).join('');
    return '<div class="chart-wrap"><svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Proyección de evolución">' +
      grade +
      '<path class="ch-area" d="' + area + '" />' +
      '<polyline class="ch-line" points="' + linha + '" />' +
      bolas + xticks + marcas +
    '</svg></div>';
  }

  function renderStepBody(step) {
    switch (step.type) {
      case 'name':
        return '<input class="name-input" id="name-input" type="text" placeholder="' + esc(step.placeholder) + '" maxlength="30" autocomplete="given-name" />';

      case 'message':
        // v3: step.pares desenha pares antes/depois, um por linha (prova social).
        if (step.pares && step.pares.length) {
          return '<div class="ba-list ba-lista-1">' + step.pares.map(function (img) { return parHtml(img, true); }).join('') + '</div>';
        }
        return ''; // so titulo + body

      // Campo digitado que respeita variableToSave (o 'name' grava sempre em state.name).
      // inputMode='numeric' abre o teclado de numeros no celular.
      case 'input': {
        var im = step.inputMode ? ' inputmode="' + esc(step.inputMode) + '"' : '';
        return '<input class="name-input" id="input-field" type="text"' + im +
          ' placeholder="' + esc(step.placeholder || '') + '"' +
          ' maxlength="' + (step.maxLength || 30) + '" autocomplete="off" />';
      }

      // Tela que avanca sozinha: barra de 0 a 100% no tempo de step.durationMs,
      // frases que trocam no meio do caminho e imagens de prova social embaixo.
      case 'processing': {
        var msgs = (step.messages || []).map(function (m, i) {
          return '<div class="proc-msg' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + tpl(m) + '</div>';
        }).join('');
        var pics = (step.images || []).map(function (src) {
          return '<img src="' + esc(src) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />';
        }).join('');
        return '<div class="proc">' +
          '<div class="proc-track"><div class="proc-fill" id="proc-fill"></div></div>' +
          '<div class="proc-pct" id="proc-pct">0%</div>' +
          '<div class="proc-msgs" id="proc-msgs">' + msgs + '</div>' +
          (pics ? '<div class="proc-pics">' + pics + '</div>' : '') +
        '</div>';
      }

      // Barras verticais de resultado (ex: 20% em 7 dias / 50% em 21 / 96% em 28).
      case 'bars': {
        var barras = (step.bars || []).map(function (b) {
          return '<div class="bar-col">' +
            '<div class="bar-pct">' + esc(b.pct) + '%</div>' +
            '<div class="bar-track"><div class="bar-fill" style="height:' + Number(b.pct) + '%"></div></div>' +
            '<div class="bar-label">' + esc(b.label) + '</div>' +
            '<div class="bar-caption">' + esc(b.caption || '') + '</div>' +
          '</div>';
        }).join('');
        return '<div class="bars">' + barras + '</div>';
      }

      // Grafico de linha em SVG inline — sem biblioteca, sem requisicao extra.
      case 'chart': return renderChart(step);

      // v2: Pagina do Tipo (blocos por tipo/obstaculo + o mesmo grafico).
      case 'tipo': return renderTipo(step);

      case 'question':
      case 'decision': {
        var comFoto = step.options.some(function (o) { return !!o.image; });
        var opts = step.options.map(function (o, i) {
          var isNeg = step.type === 'decision' && o.advance === false;
          // Opcao com foto: a imagem entra no lugar do emoji e a linha de apoio
          // vira uma segunda linha embaixo do label.
          var visual = o.image
            ? '<img class="option-image" src="' + esc(o.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'" />'
            : '<span class="option-emoji">' + (o.emoji || '') + '</span>';
          var sub = o.sub ? '<span class="option-sub">' + esc(o.sub) + '</span>' : '';
          // optionStyle 'radio' desenha a bolinha de selecao do funil de referencia.
          // Sem a flag o markup fica igual ao de antes (quiz gamificado).
          var radio = data.optionStyle === 'radio' ? '<span class="option-radio"></span>' : '';
          var texto = '<span class="option-text"><span>' + esc(o.label) + '</span>' + sub + '</span>';
          var miolo = data.optionStyle === 'radio'
            ? '<span class="option-row">' + radio + texto + '</span>'
            : texto;
          return '<button class="option' + (isNeg ? ' option-negative' : '') + '" data-idx="' + i + '">' +
            visual + miolo +
          '</button>';
        }).join('');
        // optionSkin escolhe o visual da tela ('suave' com tom de Energy,
        // 'energy' solido). Sem o campo, fica o card escuro padrao.
        var skin = step.optionSkin ? ' options-' + step.optionSkin : '';
        return '<div class="options' + (comFoto ? ' options-foto' : '') + skin + '">' + opts + '</div><div id="negative-msg-slot"></div>';
      }

      case 'slider': {
        var s = step.slider;
        return '<div class="slider-wrap">' +
          '<div class="slider-emojis"><span>' + s.leftEmoji + '</span><span>' + s.rightEmoji + '</span></div>' +
          '<input class="slider-input" id="slider-input" type="range" min="' + s.min + '" max="' + s.max + '" value="' + s.default + '" step="1" />' +
          '<div class="slider-value" id="slider-value">' + s.default + '</div>' +
        '</div>';
      }

      case 'testimonials': {
        var cards = step.testimonials.map(function (t) {
          return '<div class="testi-card">' +
            '<img class="testi-photo" src="' + t.image + '" alt="' + esc(t.name) + '" loading="lazy" onerror="this.style.display=\'none\'" />' +
            '<div class="testi-body">' +
              '<div class="testi-name">' + esc(t.name) + '</div>' +
              '<div class="testi-text">' + esc(t.text) + '</div>' +
            '</div>' +
          '</div>';
        }).join('');
        var opts = step.options.map(function (o, i) {
          return '<button class="option" data-idx="' + i + '">' +
            '<span class="option-emoji">' + o.emoji + '</span>' +
            '<span>' + esc(o.label) + '</span>' +
          '</button>';
        }).join('');
        return '<div class="testi-list">' + cards + '</div><div class="options">' + opts + '</div>';
      }

      case 'scratch': {
        var sc = step.scratch || {};
        var prizeEmoji = sc.prizeEmoji || '🎁';
        var prizeBadge = sc.prizeBadge || 'BONO SORPRESA';
        var prizeTitle = sc.prizeTitle || '¡Ganaste un regalo!';
        var prizeDesc = sc.prizeDesc || '';
        var hintLabel = sc.hintLabel || 'RASPA AQUÍ';
        var hintIcon = sc.hintIcon || '👆';
        var progressNote = sc.progressNote || 'Passe o dedo pra revelar';
        return '<div class="scratch-wrap">' +
          '<div class="scratch-container" id="scratch-container">' +
            '<div class="scratch-prize" id="scratch-prize">' +
              '<div class="scratch-prize-badge">' + esc(prizeBadge) + '</div>' +
              '<div class="scratch-prize-emoji">' + prizeEmoji + '</div>' +
              '<div class="scratch-prize-title">' + tpl(prizeTitle) + '</div>' +
              '<div class="scratch-prize-desc">' + tpl(prizeDesc) + '</div>' +
            '</div>' +
            '<canvas class="scratch-canvas" id="scratch-canvas"></canvas>' +
            '<div class="scratch-cover-hint" id="scratch-hint">' +
              '<div class="scratch-cover-hint-icon">' + hintIcon + '</div>' +
              '<div class="scratch-cover-hint-label">' + esc(hintLabel) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="scratch-progress-note">' + esc(progressNote) + '</div>' +
          '<button class="scratch-fallback" id="scratch-fallback" type="button">No puedo raspar — revelar</button>' +
        '</div>';
      }

      case 'pitch': {
        var p = step.pitch;
        var bullets = (p.bullets || []).map(function (b) { return '<li>' + b + '</li>'; }).join('');
        // forWho/notForWho sao opcionais: o bloco inteiro so aparece se vier no dado.
        var forWho = (p.forWho || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
        var notFor = (p.notForWho || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');

        // Bloco de antes/depois — so renderiza se tem imagens listadas
        var beforeAfterBlock = '';
        if (p.beforeAfterImages && p.beforeAfterImages.length > 0) {
          var baCards = p.beforeAfterImages.map(function (img) { return parHtml(img, true); }).join('');
          beforeAfterBlock =
            '<div class="pitch-before-after">' +
              (p.beforeAfterTitle ? '<h3 class="ba-title">' + esc(p.beforeAfterTitle) + '</h3>' : '') +
              (p.beforeAfterSubtitle ? '<p class="ba-subtitle">' + esc(p.beforeAfterSubtitle) + '</p>' : '') +
              '<div class="ba-list">' + baCards + '</div>' +
            '</div>';
        }

        // Antes/depois no TOPO do pitch (logo abaixo do reframe): a prova entra
        // antes do preco, quando a leitora ainda esta decidindo se acredita.
        // Mesma grade do bloco de baixo; so muda a posicao.
        var topoBlock = '';
        if (p.topImages && p.topImages.length > 0) {
          var topoCards = p.topImages.map(function (img) {
            var cap = img.caption ? '<div class="ba-caption">' + esc(img.caption) + '</div>' : '';
            return '<div class="ba-card">' +
              '<img src="' + esc(img.src) + '" alt="' + esc(img.alt || 'Antes y después') + '" onerror="this.style.display=\'none\'" />' +
              cap +
            '</div>';
          }).join('');
          topoBlock =
            '<div class="pitch-before-after pitch-topo">' +
              (p.topImagesTitle ? '<h3 class="ba-title">' + esc(p.topImagesTitle) + '</h3>' : '') +
              (p.topImagesSubtitle ? '<p class="ba-subtitle">' + esc(p.topImagesSubtitle) + '</p>' : '') +
              '<div class="ba-list">' + topoCards + '</div>' +
            '</div>';
        }

        // Imagem opcional entre garantia e "pra quem e" (ex: depoimento em print)
        var postGuaranteeBlock = '';
        if (p.postGuaranteeImage && p.postGuaranteeImage.src) {
          var pg = p.postGuaranteeImage;
          postGuaranteeBlock = '<div class="pitch-post-guarantee">' +
            '<img src="' + esc(pg.src) + '" alt="' + esc(pg.alt || 'Testimonio') + '" loading="lazy" onerror="this.style.display=\'none\'" />' +
          '</div>';
        }

        // Carrossel de prints do grupo de alunas no WhatsApp (30/09/2026, pedido
        // do dono), logo abaixo do reframe: um print por vez na largura quase
        // toda (o proximo aparece na borda, convidando a arrastar), com o
        // scroll-snap do proprio navegador e bolinhas mostrando onde esta. O
        // texto esta dentro do print, por isso imagem; w/h reservam o espaco.
        var printsBlock = '';
        if (p.prints && p.prints.length) {
          printsBlock = '<div class="pitch-prints">' +
            (p.printsTitle ? '<h3 class="pitch-h3">' + esc(p.printsTitle) + '</h3>' : '') +
            '<div class="prints-trilho">' + p.prints.map(function (img) {
              return '<div class="prints-slide"><img src="' + esc(img.src) + '" alt="' + esc(img.alt || 'Captura del grupo de alumnas en WhatsApp') + '"' +
                (img.w && img.h ? ' width="' + Number(img.w) + '" height="' + Number(img.h) + '"' : '') + ' loading="lazy" /></div>';
            }).join('') + '</div>' +
            (p.prints.length > 1 ? '<div class="prints-pontos">' + p.prints.map(function (_, i) {
              return '<span' + (i === 0 ? ' class="on"' : '') + '></span>';
            }).join('') + '</div>' : '') +
          '</div>';
        }

        // Blocos opcionais — so entram se o dado trouxer. O quiz antigo nao tem
        // nenhuma dessas chaves, entao a tela dele continua identica.
        var depoBlock = '';
        if (p.testimonials && p.testimonials.length) {
          // v3: o depoimento do tipo dela vem primeiro (testimonialsPorTipo =
          // { tipo: [ids] }); sem a chave, a ordem do dado.
          var depos = p.testimonials;
          var ordemDepo = p.testimonialsPorTipo && p.testimonialsPorTipo[state.vars.tipo];
          if (ordemDepo && ordemDepo.length) {
            depos = ordemDepo.map(function (id) {
              return p.testimonials.filter(function (t) { return t.id === id; })[0];
            }).filter(Boolean);
            if (!depos.length) depos = p.testimonials;
          }
          depoBlock = '<div class="pitch-testi">' +
            (p.testimonialsTitle ? '<h3 class="pitch-h3">' + esc(p.testimonialsTitle) + '</h3>' : '') +
            depos.map(function (t) {
              return '<div class="testi-card">' +
                '<img class="testi-photo" src="' + esc(t.image) + '" alt="' + esc(t.name) + '" loading="lazy" onerror="this.style.display=\'none\'" />' +
                '<div class="testi-body">' +
                  '<div class="testi-name">' + esc(t.name) + '</div>' +
                  '<div class="testi-text">' + esc(t.text) + '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>';
        }

        // Beneficios e reframe passam pelo tpl: o enxuto poe ali o tempo de
        // treino que a lead escolheu ({tempo_treino_txt}). Texto sem chave sai
        // do tpl igual entrou (o HTML do dado nao e escapado), entao o pitch
        // do quiz-sf de 22 telas fica identico.
        var beneBlock = '';
        // v3: benefitsPorTipo = { tipo: [itens] } troca a ordem (e o texto) por tipo.
        var listaBene = (p.benefitsPorTipo && p.benefitsPorTipo[state.vars.tipo]) || p.benefits;
        if (listaBene && listaBene.length) {
          beneBlock = '<div class="pitch-benefits">' +
            (p.benefitsTitle ? '<h3 class="pitch-h3">' + esc(p.benefitsTitle) + '</h3>' : '') +
            '<ul>' + listaBene.map(function (b) { return '<li>' + tpl(b) + '</li>'; }).join('') + '</ul>' +
          '</div>';
        }

        // Videos do treino e do app (03/10/2026), lado a lado: o exercicio do
        // tipo dela (videoTreino.porTipo, com o padrao pra quem chega sem
        // formato) e o app por dentro. Mudos e em loop como o gift (o play()
        // explicito fica no bindStepHandlers). So entra se o dado trouxer.
        var videosBlock = '';
        var vt = p.videoTreino, va = p.videoApp;
        var clipeTreino = vt && vt.porTipo ? (vt.porTipo[state.vars.tipo] || vt.porTipo[vt.padrao] || null) : null;
        if ((clipeTreino && clipeTreino.src) || (va && va.src)) {
          var umVideo = function (v, legenda) {
            return '<figure class="pitch-video">' +
              '<video class="pitch-video-el" src="' + esc(v.src) + '"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : '') +
                ' autoplay muted loop playsinline disablepictureinpicture preload="metadata"></video>' +
              (legenda ? '<figcaption class="ba-caption">' + esc(legenda) + '</figcaption>' : '') +
            '</figure>';
          };
          videosBlock = '<div class="pitch-videos">' +
            (p.videosTitle ? '<h3 class="pitch-h3">' + esc(p.videosTitle) + '</h3>' : '') +
            '<div class="pitch-videos-grade">' +
              (clipeTreino && clipeTreino.src ? umVideo(clipeTreino, vt.legenda) : '') +
              (va && va.src ? umVideo(va, va.legenda) : '') +
            '</div>' +
            comoFuncionaHtml(p.comoFunciona) +
          '</div>';
        }

        var bonusBlock = '';
        if (p.bonuses && p.bonuses.length) {
          bonusBlock = '<div class="pitch-bonus">' +
            (p.bonusesTitle ? '<h3 class="pitch-h3">' + esc(p.bonusesTitle) + '</h3>' : '') +
            p.bonuses.map(function (b) {
              // v3: um bonus ganha o selo pela regra do dado (bonusDestaque:
              // porObstaculo > porTipo > padrao); b.notaDepois e a linha das
              // refeicoes, que so aparece se as chaves dela resolverem.
              var dst = p.bonusDestaque || null;
              var idDestaque = dst
                ? ((dst.porObstaculo && dst.porObstaculo[state.vars.obstaculo]) || (dst.porTipo && dst.porTipo[state.vars.tipo]) || dst.padrao || '')
                : '';
              var ehDestaque = !!(b.id && b.id === idDestaque);
              var nota = '';
              if (b.notaDepois) { var nt = tpl(b.notaDepois); if (nt.indexOf('{') === -1) nota = '<div class="bonus-nota">' + nt + '</div>'; }
              return '<div class="bonus-card' + (ehDestaque ? ' bonus-destaque' : '') + '">' +
                (ehDestaque && dst.selo ? '<div class="bonus-selo">' + esc(dst.selo) + '</div>' : '') +
                '<div class="bonus-name">' + esc(b.name) + '</div>' +
                '<div class="bonus-desc">' + b.description + '</div>' +
                '<div class="bonus-price"><s>' + esc(b.price) + '</s> <b>AHORA GRATIS</b></div>' +
                nota +
              '</div>';
            }).join('') +
          '</div>';
        }

        // v3: com data.data_turma preenchida e p.turmaLine no dado, a escassez
        // vira o prazo real da turma e o timer sai. Vazio: tudo como antes.
        var porTurma = !!(data.data_turma && p.turmaLine);
        var escassezBlock = porTurma
          ? '<div class="pitch-scarcity">' + tpl(p.turmaLine) + '</div>'
          : (p.scarcity ? '<div class="pitch-scarcity">' + p.scarcity + '</div>' : '');

        // Timer: o relogio em si e ligado no bindStepHandlers.
        var timerBlock = '';
        if (p.timerMinutes && !porTurma) {
          timerBlock = '<div class="pitch-timer" data-min="' + Number(p.timerMinutes) + '">' +
            '<span class="timer-box" id="timer-mm">--</span><span class="timer-sep">:</span>' +
            '<span class="timer-box" id="timer-ss">--</span>' +
            (p.timerNote ? '<div class="timer-note">' + p.timerNote + '</div>' : '') +
          '</div>';
        }

        var selosBlock = '';
        if (p.seals && p.seals.length) {
          selosBlock = '<div class="pitch-seals">' + p.seals.map(function (s) {
            return '<div class="seal"><div class="seal-title">' + esc(s.title) + '</div>' +
              '<div class="seal-sub">' + esc(s.sub || '') + '</div></div>';
          }).join('') + '</div>';
        }

        var whoforBlock = '';
        if (forWho || notFor) {
          whoforBlock = '<div class="pitch-whofor">' +
            '<div class="whofor-block for"><div class="whofor-title for">Para quién es</div><ul>' + forWho + '</ul></div>' +
            '<div class="whofor-block not"><div class="whofor-title not">No es para ti si</div><ul>' + notFor + '</ul></div>' +
          '</div>';
        }

        // Gift em video, no comportamento de GIF: toca sozinho, mudo, em loop e
        // sem controle nenhum. O muted e obrigatorio — sem ele o navegador
        // ignora o autoplay e a aluna ve um quadro parado. O poster continua
        // valendo pro instante antes do primeiro frame chegar.
        // v3: comentarios (so leitura) abaixo da garantia.
        var comentariosBlock = '';
        if (p.comments && p.comments.length) {
          comentariosBlock = '<div class="pitch-comments">' +
            (p.commentsTitle ? '<h3 class="pitch-h3">' + esc(p.commentsTitle) + '</h3>' : '') +
            p.comments.map(comentarioEstaticoHtml).join('') +
          '</div>';
        }

        var giftBlock = '';
        if (p.giftVideo) {
          giftBlock = '<div class="pitch-gift">' +
            (p.giftVideoTitle ? '<h3 class="pitch-h3">' + esc(p.giftVideoTitle) + '</h3>' : '') +
            '<video class="pitch-gift-video" src="' + esc(p.giftVideo) + '" autoplay muted loop playsinline ' +
              'disablepictureinpicture preload="auto"' + (p.giftVideoPoster ? ' poster="' + esc(p.giftVideoPoster) + '"' : '') +
            '></video>' +
            (p.giftVideoNote ? '<div class="pitch-gift-note">' + p.giftVideoNote + '</div>' : '') +
          '</div>';
        }

        return (p.subline ? '<div class="pitch-subline">' + tpl(p.subline) + '</div>' : '') +
          '<div class="pitch-reframe">' + tpl(p.reframe) + '</div>' +
          topoBlock +
          printsBlock +
          depoBlock +
          beneBlock +
          videosBlock +
          (bullets ? '<ul class="pitch-bullets">' + bullets + '</ul>' : '') +
          bonusBlock +
          giftBlock +
          escassezBlock +
          (p.somaLine ? '<div class="pitch-soma">' + tpl(p.somaLine) + '</div>' : '') +
          '<div class="pitch-price-box">' +
            '<div class="pitch-price">' + p.priceLine + '</div>' +
            '<div class="pitch-price-sub">' + esc(p.priceSub) + '</div>' +
            (p.priceNote ? '<div class="pitch-price-note">' + esc(p.priceNote) + '</div>' : '') +
          '</div>' +
          timerBlock +
          selosBlock +
          '<div class="pitch-guarantee">' + p.guaranteeLine + '</div>' +
          comentariosBlock +
          postGuaranteeBlock +
          whoforBlock +
          beforeAfterBlock +
          (p.footer ? gateFooterHtml() : '');
      }
    }
    return '';
  }

  function bindStepHandlers(step) {
    if (step.type === 'input') {
      var campo = document.getElementById('input-field');
      var minimo = step.minLength || 1;
      function valida() {
        var v = campo.value.trim();
        if (step.variableToSave) state.vars[step.variableToSave] = v;
        var cta = document.getElementById('main-cta');
        if (cta) cta.disabled = v.length < minimo;
      }
      campo.addEventListener('input', valida);
      campo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && campo.value.trim().length >= minimo) { valida(); avancarInput(step); }
      });
      valida();
      return;
    }

    if (step.type === 'processing') {
      var dur = step.durationMs || 5000;
      var $fill = document.getElementById('proc-fill');
      var $pct = document.getElementById('proc-pct');
      var msgs = Array.from(document.querySelectorAll('.proc-msg'));
      var t0 = Date.now();
      var vezProc = vezDaTela;
      // Sem requestAnimationFrame: com a aba em segundo plano ele nao roda e a
      // barra ficaria parada. O setInterval segue, mesmo que mais lento.
      var timerProc = setInterval(function () {
        // A pessoa saiu desta tela (a seta de voltar): o timer morre aqui, sem
        // avancar ninguem.
        if (vezProc !== vezDaTela) { clearInterval(timerProc); return; }
        var f = Math.min(1, (Date.now() - t0) / dur);
        if ($fill) $fill.style.width = (f * 100).toFixed(1) + '%';
        if ($pct) $pct.textContent = Math.round(f * 100) + '%';
        if (msgs.length > 1) {
          var qual = Math.min(msgs.length - 1, Math.floor(f * msgs.length));
          msgs.forEach(function (m, i) { m.classList.toggle('on', i === qual); });
        }
        if (f >= 1) { clearInterval(timerProc); advance(); }
      }, 100);
      return;
    }

    if (step.type === 'pitch' && step.pitch && step.pitch.timerMinutes) {
      var resta = Number(step.pitch.timerMinutes) * 60;
      var $mm = document.getElementById('timer-mm');
      var $ss = document.getElementById('timer-ss');
      function pinta() {
        var mm = Math.floor(resta / 60), ss = resta % 60;
        if ($mm) $mm.textContent = (mm < 10 ? '0' : '') + mm;
        if ($ss) $ss.textContent = (ss < 10 ? '0' : '') + ss;
      }
      pinta();
      var vezPitch = vezDaTela;
      var timerPitch = setInterval(function () {
        // Saiu da oferta pela seta: o relogio desta tela para (voltando, a
        // tela nova liga o dela).
        if (vezPitch !== vezDaTela) { clearInterval(timerPitch); return; }
        resta--;
        if (resta <= 0) { resta = 0; clearInterval(timerPitch); }
        pinta();
      }, 1000);
      return;
    }

    if (step.type === 'name') {
      var input = document.getElementById('name-input');
      input.focus();
      input.addEventListener('input', function () {
        var v = input.value.trim();
        state.name = v;
        var cta = document.getElementById('main-cta');
        if (cta) cta.disabled = v.length < 2;
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && state.name.length >= 2) advance();
      });
      return;
    }

    if (step.type === 'question' || step.type === 'testimonials') {
      // Guardado na hora do bind: e o prazo DESTA tela (0 = sem trava).
      var liberaEm = opcoesLiberadasEm;
      Array.from(document.querySelectorAll('.options .option')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          // Toque que sobrou da pergunta binaria de antes: nao responde.
          if (liberaEm && Date.now() < liberaEm) return;
          var idx = parseInt(btn.dataset.idx, 10);
          var opt = step.options[idx];
          playTick();
          btn.classList.add('selected');
          if (step.variableToSave) state.vars[step.variableToSave] = opt.value;
          gravaVarsDaOpcao(opt);
          track('step_answered', { step: step.stepName, index: state.stepIndex, answer: opt.value });
          // v2: a tela pode pedir um evento com nome proprio ao ser respondida
          // (Formato -> 'tipo_definido' com o valor de `tipo`).
          if (step.eventoAoResponder) {
            var dadosEv = {}; dadosEv[step.variableToSave || 'valor'] = opt.value;
            eventoCustom(step.eventoAoResponder, dadosEv);
          }
          // Tocou na opcao e na seta dentro dos 400 ms: o avanco atrasado nao
          // pode levar a pessoa pra frente a partir da tela anterior.
          setTimeout(avancaSeAinda(vezDaTela), 400);
        });
      });
      return;
    }

    if (step.type === 'decision') {
      var decisionLocked = false;
      Array.from(document.querySelectorAll('.options .option')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (decisionLocked) return;
          var idx = parseInt(btn.dataset.idx, 10);
          var opt = step.options[idx];
          playTick();
          if (opt.advance === false) {
            // Botao negativo — nao avanca, mostra mensagem suave. Nao trava o positivo.
            btn.disabled = true;
            var slot = document.getElementById('negative-msg-slot');
            if (slot) slot.innerHTML = '<div class="negative-message">' + tpl(step.negativeMessage) + '</div>';
            track('decision_negative', { step: step.stepName });
            return;
          }
          // trava contra double-click no positivo (senao abre modal 2x)
          decisionLocked = true;
          Array.from(document.querySelectorAll('.options .option')).forEach(function (b) { b.disabled = true; });
          btn.classList.add('selected');
          if (step.variableToSave) state.vars[step.variableToSave] = opt.value;
          track('step_answered', { step: step.stepName, index: state.stepIndex, answer: opt.value });
          setTimeout(function () {
            openBonusModal(step.bonusModal, advance);
          }, 350);
        });
      });
      return;
    }

    if (step.type === 'slider') {
      var input = document.getElementById('slider-input');
      var valEl = document.getElementById('slider-value');
      input.addEventListener('input', function () {
        valEl.textContent = input.value;
      });
      input.addEventListener('change', playTick);
      return;
    }

    if (step.type === 'scratch') {
      var container = document.getElementById('scratch-container');
      var canvas = document.getElementById('scratch-canvas');
      var fallbackBtn = document.getElementById('scratch-fallback');
      if (!canvas || !container) return;

      var sc = step.scratch || {};
      var threshold = typeof sc.thresholdPct === 'number' ? sc.thresholdPct : 45;
      var brushRadius = sc.brushRadius || 26;
      var ctx = canvas.getContext('2d');
      var revealed = false;
      var touched = false;
      var isDown = false;
      var lastX = 0, lastY = 0;
      var moveFrame = 0;
      var tickFrame = 0;
      var dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

      function drawCover() {
        var rect = canvas.getBoundingClientRect();
        var w = rect.width;
        var h = rect.height;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Cobertura chapada em Steel: a marca nao usa metalico nem brilho, e
        // o contraste com o Ink do fundo ja diz "tem algo embaixo".
        ctx.fillStyle = '#858B93';
        ctx.fillRect(0, 0, w, h);
        // textura pontilhada leve pra parecer raspavel
        ctx.fillStyle = 'rgba(11,12,14,0.14)';
        for (var y = 4; y < h; y += 10) {
          for (var x = (y % 20 === 0 ? 4 : 9); x < w; x += 10) {
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
      }

      function pointerPos(e) {
        var rect = canvas.getBoundingClientRect();
        var cx, cy;
        if (e.touches && e.touches.length) {
          cx = e.touches[0].clientX;
          cy = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length) {
          cx = e.changedTouches[0].clientX;
          cy = e.changedTouches[0].clientY;
        } else {
          cx = e.clientX;
          cy = e.clientY;
        }
        return { x: cx - rect.left, y: cy - rect.top };
      }

      function scratchDot(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      function scratchLine(x0, y0, x1, y1) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushRadius * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      function computeScratchedPct() {
        try {
          var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var d = img.data;
          var total = 0;
          var cleared = 0;
          // amostragem: pula de 16 em 16 bytes (a cada 4 pixels) — perf
          for (var i = 3; i < d.length; i += 16) {
            total++;
            if (d[i] < 32) cleared++;
          }
          return total === 0 ? 0 : (cleared / total) * 100;
        } catch (err) {
          return 0;
        }
      }

      function doReveal() {
        if (revealed) return;
        revealed = true;
        container.classList.add('revealed');
        playUnlock();
        track('scratch_revealed', { step: step.stepName });
        if (typeof window.__scratchUnlockCta === 'function') window.__scratchUnlockCta();
        removeListeners();
      }

      function checkReveal() {
        if (revealed) return;
        if (computeScratchedPct() >= threshold) doReveal();
      }

      function markTouched() {
        if (!touched) {
          touched = true;
          container.classList.add('touched');
          track('scratch_started', { step: step.stepName });
        }
      }

      function onDown(e) {
        if (revealed) return;
        if (e.cancelable) e.preventDefault();
        isDown = true;
        markTouched();
        var p = pointerPos(e);
        lastX = p.x; lastY = p.y;
        scratchDot(p.x, p.y);
        playTick();
      }

      function onMove(e) {
        if (revealed || !isDown) return;
        if (e.cancelable) e.preventDefault();
        var p = pointerPos(e);
        scratchLine(lastX, lastY, p.x, p.y);
        lastX = p.x; lastY = p.y;
        moveFrame++;
        if (moveFrame % 6 === 0) checkReveal();
        tickFrame++;
        if (tickFrame % 12 === 0) playTick();
      }

      function onUp() { if (isDown) { isDown = false; checkReveal(); } }
      function onLeave() { isDown = false; }

      function addListeners() {
        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onLeave);
        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove', onMove, { passive: false });
        canvas.addEventListener('touchend', onUp);
        canvas.addEventListener('touchcancel', onUp);
      }

      function removeListeners() {
        canvas.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        canvas.removeEventListener('mouseleave', onLeave);
        canvas.removeEventListener('touchstart', onDown);
        canvas.removeEventListener('touchmove', onMove);
        canvas.removeEventListener('touchend', onUp);
        canvas.removeEventListener('touchcancel', onUp);
      }

      var resizeTimer = null;
      function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (revealed || touched) return;
          drawCover();
        }, 120);
      }
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);

      // Fallback pra quem nao consegue raspar (acessibilidade): mostra botao apos 8s
      if (fallbackBtn) {
        setTimeout(function () {
          if (!touched && !revealed) {
            fallbackBtn.classList.add('show');
            track('scratch_fallback_shown', { step: step.stepName });
          }
        }, 8000);
        fallbackBtn.addEventListener('click', function () {
          if (revealed) return;
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          fallbackBtn.style.display = 'none';
          track('scratch_fallback_clicked', { step: step.stepName });
          doReveal();
        });
      }

      requestAnimationFrame(function () {
        drawCover();
        addListeners();
      });
      return;
    }
  }

  function renderCta(step) {
    if (step.type === 'scratch') {
      var ctaLabel = step.cta || 'Ver mi oferta ahora';
      $ctaDock.innerHTML = '<button class="cta cta-gold cta-scratch-locked" id="main-cta" type="button" aria-hidden="true">' + esc(ctaLabel) + '</button>';
      var btn = document.getElementById('main-cta');

      // callback que o bindStepHandlers chama quando o canvas revela
      window.__scratchUnlockCta = function () {
        if (!btn) return;
        btn.classList.remove('cta-scratch-locked');
        btn.classList.add('cta-scratch-unlocked');
        btn.removeAttribute('aria-hidden');
      };

      btn.addEventListener('click', function () {
        if (btn.classList.contains('cta-scratch-locked')) return;
        playTick();
        track('scratch_cta_clicked', { step: step.stepName });
        window.__scratchUnlockCta = null;
        advance();
      });
      return;
    }

    if (step.type === 'pitch') {
      if (window.QUIZ_PREVIEW) {
        $ctaDock.innerHTML = '<button class="cta cta-gold" type="button" disabled>Vista previa — compra desactivada</button>';
        return;
      }
      var url = buildCheckoutUrl();
      $ctaDock.innerHTML = '<a class="cta cta-gold" id="checkout-cta" href="' + url + '">' + esc(step.pitch.cta) + '</a>';
      // Trava de 1,5 s contra clique duplo. Nao pode ser uma flag definitiva:
      // quem volta do checkout pelo bfcache chega com a pagina do jeito que
      // saiu, e o botao ficaria morto.
      var clicadoEm = 0;
      document.getElementById('checkout-cta').addEventListener('click', function (e) {
        if (Date.now() - clicadoEm < 1500) { e.preventDefault(); return; }
        clicadoEm = Date.now();
        // O sid pode ter chegado depois da montagem: entra aqui, SO se faltar.
        // O link NAO e remontado: a UTMify reescreve o <a> depois que ele
        // aparece (o click id vai pro utm_content, e e assim que a venda chega
        // atribuida no painel dela), e remontar jogava isso fora — no banco do
        // desinflameja, desde 20/09, 130 de 134 postbacks do quiz-bumbum
        // chegaram com o click id no utm_content e 0 de 4 do quiz-sf. O quiz
        // atual (quiz.js) nao remonta; os dois bracos do teste tem que mandar
        // a mesma coisa pra Payt. O src=payt ja saiu no ouvinte do window.
        if (data.sendSid !== false && window._sessionId) {
          var hrefAgora = this.getAttribute('href') || '';
          var hrefComSid = comSidSeFaltar(hrefAgora, window._sessionId);
          if (hrefComSid !== hrefAgora) this.setAttribute('href', hrefComSid);
        }
        playUnlock();
        track('checkout_clicked', { step: 'pitch', vars: state.vars });
        navegarComAtraso(e, this.href);
      });
      // O video do gift tem que estar rodando quando a pessoa chega nele. O
      // atributo autoplay resolve quase sempre; o play() explicito cobre o
      // iPhone em economia de bateria, que ignora o atributo mas aceita a
      // chamada depois de uma interacao (e aqui ja houve vinte cliques).
      // 03/10/2026: os videos do treino e do app (.pitch-video-el) seguem a
      // mesma regra.
      var videosDoPitch = Array.from(document.querySelectorAll('.pitch-gift-video, .pitch-video-el'));
      if (videosDoPitch.length) {
        videosDoPitch.forEach(function (v) { v.muted = true; });
        var tocar = function () {
          videosDoPitch.forEach(function (v) { try { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} });
        };
        tocar();
        // Se mesmo assim nao tocou, o proximo toque em qualquer lugar da tela
        // destrava — sem roubar o clique de ninguem.
        document.addEventListener('touchstart', tocar, { once: true, passive: true });
        document.addEventListener('click', tocar, { once: true, passive: true });
      }

      // arma backredirect ao chegar no pitch
      armBackredirect();
      return;
    }

    if (step.type === 'testimonials' || step.type === 'question' || step.type === 'decision') {
      // sem CTA dock (opcoes ja avancam ao clicar)
      $ctaDock.innerHTML = '';
      return;
    }

    if (step.type === 'name') {
      $ctaDock.innerHTML = '<button class="cta" id="main-cta" disabled>' + esc(step.cta) + '</button>';
      document.getElementById('main-cta').addEventListener('click', function () {
        if (state.name.length >= 2) advance();
      });
      return;
    }

    if (step.type === 'message' || step.type === 'bars' || step.type === 'chart' || step.type === 'tipo') {
      var rotuloCta = step.cta;
      // v2: na Pagina do Tipo o botao e o da tabela de nomes do tipo.
      if (step.type === 'tipo') { var tp = tipoAtual(); if (tp && tp.botao) rotuloCta = tp.botao; }
      $ctaDock.innerHTML = '<button class="cta" id="main-cta">' + esc(rotuloCta) + '</button>';
      document.getElementById('main-cta').addEventListener('click', advance);
      return;
    }

    // A tela de processamento anda sozinha — nada pra clicar.
    if (step.type === 'processing') {
      $ctaDock.innerHTML = '';
      return;
    }

    if (step.type === 'input') {
      $ctaDock.innerHTML = '<button class="cta" id="main-cta" disabled>' + esc(step.cta) + '</button>';
      document.getElementById('main-cta').addEventListener('click', function () {
        var campo = document.getElementById('input-field');
        if (campo && campo.value.trim().length >= (step.minLength || 1)) avancarInput(step);
      });
      return;
    }

    if (step.type === 'slider') {
      $ctaDock.innerHTML = '<button class="cta" id="main-cta">' + esc(step.cta) + '</button>';
      document.getElementById('main-cta').addEventListener('click', function () {
        var v = document.getElementById('slider-input').value;
        if (step.variableToSave) state.vars[step.variableToSave] = v;
        track('step_answered', { step: step.stepName, index: state.stepIndex, answer: v });
        advance();
      });
      return;
    }
  }

  // Grava a resposta digitada e avanca (usado pelo Enter e pelo botao).
  function avancarInput(step) {
    var campo = document.getElementById('input-field');
    var v = campo ? campo.value.trim() : '';
    if (step.variableToSave) state.vars[step.variableToSave] = v;
    track('step_answered', { step: step.stepName, index: state.stepIndex, answer: v });
    advance();
  }

  // Tela condicional: `mostrarSe: { idade: ['35 a 44 anos', ...] }` no dado
  // mostra a tela so quando CADA chave tem a resposta dentro da lista. Sem
  // resposta tambem oculta (quem ainda nao respondeu a chave nao ve). A regra
  // mora no dado de proposito: trocar a faixa e so mexer na lista.
  function telaOculta(step) {
    var r = step.mostrarSe;
    if (!r) return false;
    for (var k in r) if (r[k].indexOf(state.vars[k]) === -1) return true;
    return false;
  }

  function advance() {
    if (state.stepIndex >= data.steps.length - 1) return;
    state.stepIndex++;
    // Pula as telas ocultas (nunca passa da ultima). O meterGain delas vai pro
    // ganhoPulado e entra na proxima tela vista — so na primeira passagem:
    // voltar, trocar a resposta e pular uma tela ja contada nao soma de novo.
    while (state.stepIndex < data.steps.length - 1 && telaOculta(data.steps[state.stepIndex])) {
      if (state.stepIndex > state.maiorTela) state.ganhoPulado += data.steps[state.stepIndex].meterGain || 0;
      state.stepIndex++;
    }
    renderStep();
  }

  // A seta do cabecalho volta UMA tela (o molde de origem chamava
  // history.back(), que sem pushState saia do quiz e voltava pro anuncio).
  // Na primeira tela nao ha pra onde voltar; o medidor nao desce — regredir
  // a barra e o tipo de detalhe que faz a pessoa desistir.
  // Tela de processamento avanca sozinha: voltar PRA ela devolveria a pessoa
  // pra frente em segundos, sem ela pedir — e ela nunca conseguiria passar
  // pra tras dali. A seta pula direto pra tela de antes — e pula tambem as
  // telas ocultas pelo mostrarSe, que a pessoa nao viu na ida.
  window.__quizVoltar = function () {
    var alvo = state.stepIndex - 1;
    while (alvo > 0 && (data.steps[alvo].type === 'processing' || telaOculta(data.steps[alvo]))) alvo--;
    if (alvo < 0) return false;
    state.stepIndex = alvo;
    renderStep();
    return true;
  };
  // ==========================================================================
  // CHECKOUT URL
  //
  // Repassa utm/fbclid (e o que mais vier na URL) como sempre. A Payt devolve
  // no postback todos os parametros que estavam na URL do checkout, entao
  // funnel=/site=/sid= bastam pra ligar a venda a sessao do quiz no painel.
  // ==========================================================================
  // --- A marca do back-redirect (src=payt) nao vai pro checkout -------------
  // src=payt e a marca que NOS pusemos na URL do back-redirect cadastrada no
  // painel da Payt (<LP de saida>?src=payt). O script da UTMify (latest.js)
  // guarda o src da URL por 7 dias no localStorage (chave 'src') e pendura de
  // novo em todo <a> da pagina a cada mudanca no DOM. Quem saiu do checkout,
  // caiu na LP de saida e voltou ao quiz levava src=payt pro checkout do quiz
  // — pelo getParam daqui, que le o mesmo localStorage, e pela propria UTMify
  // — e o webhook contava a venda como "recuperacao da Payt". Medido em
  // 23/09/2026: 7 de 7 vendas com src=payt eram isso, nenhuma foi recuperacao
  // feita pela Payt (o webhook tambem passou a exigir venda sem sid pra isso).
  //
  // Duas travas, as duas SO pra src=payt: qualquer outro src segue (e quase
  // sempre o id de sessao da UTMify), e as utm_*/xcod/sck/fbclid que a UTMify
  // pendura ficam intactas.
  //  - getParam nao devolve a marca: o link que NOS montamos nasce limpo.
  //  - no clique, antes de qualquer um ler o link, a marca sai do href (a
  //    UTMify pode ter pendurado de novo depois da montagem). O ouvinte e no
  //    window em fase de captura: roda ANTES do beacon do tracking.js (que e
  //    no document, tambem em captura), entao o href gravado na sessao e o
  //    mesmo que vai pro checkout. Tira so o pedaco src=payt em vez de
  //    remontar o link: remontar jogaria fora o que a UTMify pendurou.
  // Bloco IGUAL no quiz.js e no quiz-sf.js (os dois bracos do teste de
  // design), nos dois repos: se um braco limpar e o outro nao, a comparacao
  // entre eles distorce.
  function ehMarcaDoBackRedirect(key, val) {
    return key === 'src' && String(val == null ? '' : val).trim().toLowerCase() === 'payt';
  }

  function semMarcaDoBackRedirect(url) {
    var s = String(url == null ? '' : url);
    var iHash = s.indexOf('#');
    var semHash = iHash === -1 ? s : s.slice(0, iHash);
    var hash = iHash === -1 ? '' : s.slice(iHash);
    var iQ = semHash.indexOf('?');
    if (iQ === -1) return s;
    var partes = semHash.slice(iQ + 1).split('&');
    var ficam = partes.filter(function (p) {
      var i = p.indexOf('=');
      var k = i === -1 ? p : p.slice(0, i);
      var v = i === -1 ? '' : p.slice(i + 1);
      try {
        k = decodeURIComponent(k.replace(/\+/g, ' '));
        v = decodeURIComponent(v.replace(/\+/g, ' '));
      } catch (e) { return true; }
      return !ehMarcaDoBackRedirect(k, v);
    });
    if (ficam.length === partes.length) return s;
    return semHash.slice(0, iQ) + (ficam.length ? '?' + ficam.join('&') : '') + hash;
  }

  window.addEventListener('click', function (e) {
    try {
      var a = e.target && e.target.closest ? e.target.closest('#checkout-cta, .checkout-cta') : null;
      if (!a) return;
      var antes = a.getAttribute('href') || '';
      var depois = semMarcaDoBackRedirect(antes);
      if (depois !== antes) a.setAttribute('href', depois);
    } catch (err) {}
  }, true);

  function getParam(key) {
    var v = new URLSearchParams(window.location.search).get(key);
    if (!v) {
      try { v = localStorage.getItem(key); } catch (e) { v = null; }
    }
    if (!v || ehMarcaDoBackRedirect(key, v)) return '';
    return v;
  }

  // Etiqueta do site que sai na venda: o dado pode fixar (data.site); sem
  // isso vai o hostname da pagina, sem o www.
  function siteDaVenda() {
    if (data.site) return String(data.site);
    return String(location.hostname || '').replace(/^www\./, '');
  }

  function buildCheckoutUrl() {
    var finalUrl = CHECKOUT_URL;
    var params = [];
    // Lista IGUAL a do quiz atual da Cavala (quiz.js), de proposito: os dois
    // bracos precisam mandar a mesma coisa pra Payt, senao a comparacao entre
    // eles vira comparacao entre dois jeitos de atribuir.
    // gclid/gbraid/wbraid: os click ids do Google Ads seguem ate o checkout
    // da Payt (link.query_params do webhook) — e o caminho de reserva pra
    // conversao de compra ser atribuida quando a sessao nao for achada.
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'xcod', 'fbclid', 'gclid', 'gbraid', 'wbraid', 'sck', 'src'];
    keys.forEach(function (k) {
      var v = getParam(k);
      if (v) params.push(k + '=' + encodeURIComponent(v));
    });
    // Qualquer outro parametro da URL passa junto — menos os nossos, que
    // entram abaixo com o valor certo. 'pitch' e QA da VSL do outro funil e
    // tambem nao vai pro checkout (mesma lista do quiz atual).
    var urlParams = new URLSearchParams(window.location.search);
    var reservados = ['funnel', 'site', 'sid', 'pitch', 'tipo', 'obs'];
    urlParams.forEach(function (val, key) {
      if (keys.indexOf(key) === -1 && reservados.indexOf(key) === -1) params.push(key + '=' + encodeURIComponent(val));
    });

    // Atribuicao: so manda funnel= se o quiz declarar a etiqueta.
    if (data.funnelTag) params.push('funnel=' + encodeURIComponent(data.funnelTag));
    // v2: tipo e obstaculo vao no link de compra (a Payt devolve no postback),
    // pra aba Vendas mostrar conversao por tipo.
    if (state.vars.tipo) params.push('tipo=' + encodeURIComponent(state.vars.tipo));
    if (state.vars.obstaculo) params.push('obs=' + encodeURIComponent(state.vars.obstaculo));
    params.push('site=' + encodeURIComponent(siteDaVenda()));
    if (data.sendSid !== false && window._sessionId) params.push('sid=' + encodeURIComponent(window._sessionId));
    if (params.length > 0) {
      var sep = CHECKOUT_URL.indexOf('?') === -1 ? '?' : '&';
      finalUrl += sep + params.join('&');
    }
    return finalUrl;
  }

  // Poe sid=<sid> no link SO se ele ainda nao tiver um sid com valor, e mexe
  // so nesse pedaco: o resto do link (o que a UTMify escreveu) fica como esta.
  // Um sid vazio (sid= ou sid solto) nao conta — sai, e entra o da sessao; o
  // sid vai antes do #. A mesma funcao esta nas LPs de saida do desinflameja.
  function comSidSeFaltar(url, sid) {
    var s = String(url == null ? '' : url);
    if (!sid) return s;
    var iHash = s.indexOf('#');
    var semHash = iHash === -1 ? s : s.slice(0, iHash);
    var hash = iHash === -1 ? '' : s.slice(iHash);
    var iQ = semHash.indexOf('?');
    var partes = iQ === -1 ? [] : semHash.slice(iQ + 1).split('&');
    var jaTem = partes.some(function (p) {
      var i = p.indexOf('=');
      return i > 0 && p.slice(0, i) === 'sid' && p.slice(i + 1) !== '';
    });
    if (jaTem) return s;
    var ficam = partes.filter(function (p) { return p !== '' && p.split('=')[0] !== 'sid'; });
    ficam.push('sid=' + encodeURIComponent(sid));
    return (iQ === -1 ? semHash : semHash.slice(0, iQ)) + '?' + ficam.join('&') + hash;
  }

  // ==========================================================================
  // BACKREDIRECT — oferta de saida, LIGADA neste funil. A LP vem do dado
  // (data.backredirectUrl): desde 23/09/2026 os dois bracos de cara nova tem
  // a PROPRIA (/oferta-especial-sf, com o R$ 13,50 deles), separada da
  // /oferta-especial do quiz atual, porque cada lado vende por checkouts
  // diferentes. O endereco pode ja trazer parametros (o funnel= do braco);
  // os daqui entram depois, com &.
  // ==========================================================================
  var BACKREDIRECT_URL = data.backredirectUrl || '';
  // So intencao de saida dispara: o botao/gesto de voltar (as tres entradas
  // no historico seguram o "rage back") e, no desktop, o mouse saindo pelo
  // topo. Nada por tempo (aba oculta, inatividade): derruba quem so parou
  // pra ler ou trocou de app.
  var backredirectArmed = false;

  function armBackredirect() {
    if (window.QUIZ_PREVIEW) return;
    // Funil sem oferta de saida (ou sem LP pra mandar): sem esta guarda o
    // "voltar" jogaria a lead num 404, que e pior do que deixar ela sair.
    if (data.backredirect === false || !BACKREDIRECT_URL) return;
    if (backredirectArmed) return;
    if (sessionStorage.getItem('bkr_shown') === '1') return;
    backredirectArmed = true;

    try {
      history.pushState({ bkr: true }, '', location.href);
      history.pushState({ bkr: true }, '', location.href);
      history.pushState({ bkr: true }, '', location.href);
    } catch (e) {}

    window.addEventListener('popstate', backredirectFire);
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 0) backredirectFire();
    });
  }

  function backredirectFire() {
    if (sessionStorage.getItem('bkr_shown') === '1') return;
    sessionStorage.setItem('bkr_shown', '1');
    track('backredirect_fired', { from_step: currentStep().stepName, sid: window._sessionId || null });

    // Constroi URL final de forma robusta (funciona se BACKREDIRECT_URL ja tiver '?')
    var params = [];
    var currentQs = window.location.search;
    if (currentQs && currentQs.length > 1) {
      // tipo/obs saem daqui: vao logo abaixo, os desta lead. Um link repassado
      // com ?tipo= levaria o velho na frente, e a LP le o primeiro.
      var qsSemTipo = currentQs.substring(1).split('&').filter(function (kv) { return !/^(tipo|obs)=/.test(kv); }).join('&');
      if (qsSemTipo) params.push(qsSemTipo);
    }
    params.push('bkr=1');
    if (window._sessionId) {
      params.push('sid=' + encodeURIComponent(window._sessionId));
    }
    // v2: a LP de saida repassa tipo/obs pro checkout dela (WHITELIST).
    if (state.vars.tipo) params.push('tipo=' + encodeURIComponent(state.vars.tipo));
    if (state.vars.obstaculo) params.push('obs=' + encodeURIComponent(state.vars.obstaculo));

    var url = BACKREDIRECT_URL;
    if (params.length > 0) {
      var sep = url.indexOf('?') === -1 ? '?' : '&';
      url += sep + params.join('&');
    }

    window.location.href = url;
  }

  // ==========================================================================
  // BOOT
  // ==========================================================================
  renderStep();
})();

// Carrossel de prints do pitch (.prints-trilho): acende a bolinha do print que
// esta na tela. O scroll de um elemento nao sobe pro document, mas passa pela
// fase de captura: um ouvinte so serve pra todo carrossel que o motor desenhar
// (o pitch entra depois, por innerHTML).
(function () {
  if (typeof document === 'undefined' || !document.addEventListener) return;
  document.addEventListener('scroll', function (e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains('prints-trilho')) return;
    var pontos = t.parentNode ? t.parentNode.querySelectorAll('.prints-pontos span') : [];
    if (!pontos.length) return;
    var passo = t.firstElementChild ? t.firstElementChild.offsetWidth + 10 : t.clientWidth;
    var i = Math.min(pontos.length - 1, Math.round(t.scrollLeft / Math.max(1, passo)));
    for (var k = 0; k < pontos.length; k++) pontos[k].className = k === i ? 'on' : '';
  }, true);
})();
