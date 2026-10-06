// Versión en ESPAÑOL del quiz "Truque da Cavala" (quiz-sf-v2).
// Misma estructura, mismas etapas, mismos `value` / `variableToSave` / `stepName`
// del original en portugués (así el panel sigue comparando tela por tela).
// Solo cambian los textos visibles. Las imágenes y videos están en ./images y ./videos.
//
// PARA AJUSTAR ANTES DE PUBLICAR:
//   - checkoutUrl / backredirectUrl (abajo y en index.html): siguen apuntando al checkout en BRL.
//   - Precios (priceLine, priceSub, bonuses[].price): quedaron en US$ con los mismos números; cámbialos.
//   - Imágenes con texto: noticia-v2.webp y print-grupo-cavala-*.webp ya están en español.

window.QUIZ_DATA = {
  meterInitial: 5,
  meterMax: 100,
  meterLabel: '',
  sounds: false,
  toasts: false,
  optionStyle: 'radio',
  optionsNote: '(Selecciona una de las opciones de abajo)',
  checkoutUrl: 'https://checkout.payt.com.br/4a4bea40dea96c1b7ffe1aee1168d8ca?payment=pix',
  funnelTag: 'quiz-sf-es',
  sendSid: true,
  backredirectUrl: '/oferta-especial-sf?funnel=quiz-sf-es',

  gateTeamName: 'Brenda',
  gateTeamAvatar: 'images/brenda-avatar.webp',

  gateFooter: {
    links: [
      { label: 'Política de Privacidad', href: '/politicas-de-privacidade' },
      { label: 'Términos de Uso', href: '/termos-de-uso' },
      { label: 'Contacto', href: '/contato' },
      { label: 'Aviso legal', href: '/aviso-legal' },
    ],
    note: 'Los entrenamientos y protocolos mencionados en esta página tienen carácter educativo y de acondicionamiento físico general. ' +
      'No constituyen consulta, diagnóstico, prescripción ni tratamiento médico y no sustituyen la evaluación y autorización ' +
      'de un profesional de la salud. Consulta a un médico antes de comenzar, especialmente si estás embarazada, tienes alguna ' +
      'condición de salud preexistente o tomas medicamentos.',
    company: '',
  },

  // ==========================================================================
  // PERSONALIZACIÓN POR TIPO
  // ==========================================================================
  varDefaults: { nome_prep: '', nome: 'tu tipo', apelido: '', obstaculo_texto: 'tu mayor obstáculo' },

  tipos: {
    reto: {
      nome: 'Síndrome del Glúteo Dormido',
      apelido: 'El famoso glúteo plano.',
      nome_prep: 'para el Síndrome del Glúteo Dormido',
      botao: 'ACCEDER A MI PLAN PARA GLÚTEO DORMIDO',
      b1: 'De lado, casi ninguna curva. La cintura del pantalón sobra atrás, y la ropa te queda distinta adelante y atrás: marca la cintura y desaparece en los glúteos.',
      b3: 'El glúteo dormido no responde al esfuerzo común porque el cuerpo lo salta: el muslo y la zona lumbar hacen el movimiento en su lugar. Tú te esfuerzas y él no participa. Por eso el resultado nunca llegó, y por eso aparece rápido cuando el estímulo es el correcto.',
      c: 'Despertar el músculo antes de cargarlo. Primero una activación corta, luego ejercicios multiangulares que reclutan el glúteo mayor y el medio al mismo tiempo: elevación pélvica a una pierna con el pie en el sofá, zancada búlgara, patada en cuatro apoyos con pausa arriba y abducción lateral con banda elástica. Todos caben en la sala de tu casa. Lo que separa el estímulo del desperdicio es el orden y la dosis, y eso está en el plan.',
      d: 'Hacer más sentadillas. La sentadilla es un ejercicio de muslo. Para el glúteo dormido, estorba más de lo que ayuda.',
    },
    quadrado: {
      nome: 'Perfil Gota Invertida',
      apelido: 'El famoso glúteo cuadrado.',
      nome_prep: 'para el Perfil Gota Invertida',
      botao: 'ACCEDER A MI PLAN PARA GOTA INVERTIDA',
      b1: 'De espaldas, es más ancho arriba, en el hueso de la cadera, y vacío abajo. Tiene ese quiebre en el costado que el pantalón marca en lugar de redondear. Tiene volumen, pero no tiene forma.',
      b3: 'La Gota Invertida no es falta de glúteo, son el glúteo medio y el menor apagados. Son ellos los que rellenan el costado y dan la forma redondeada. Como casi nadie los entrena (la sentadilla y la elevación pélvica apenas los tocan), el costado sigue vacío por más que te esfuerces.',
      c: 'Trabajo lateral y de abducción, que es lo que rellena el quiebre, más la porción inferior del glúteo mayor, que da la curva de abajo: almeja, hidrante en cuatro apoyos, abducción de pie con banda elástica, caminata lateral con banda y elevación pélvica con banda arriba de la rodilla. Ninguno necesita gimnasio. El orden y la dosis, que es lo que hace responder al costado, están en el plan.',
      d: 'Entrenar solo para "glúteo grande". Volumen sin trabajo lateral deja la forma aún más cuadrada. Aquí, el costado va antes que el volumen.',
    },
    caido: {
      nome: 'Perfil Baja Sujeción',
      apelido: 'El famoso glúteo caído.',
      nome_prep: 'para el Perfil Baja Sujeción',
      botao: 'ACCEDER A MI PLAN PARA BAJA SUJECIÓN',
      b1: 'Tiene volumen, pero no se queda en su lugar: se dobla abajo, se mueve cuando caminas, el short corta en el pliegue y la celulitis se nota más con la luz de arriba.',
      b3: 'La Baja Sujeción no es falta de glúteo, es falta de tensión. Un músculo sin tono no sostiene su propio volumen, y la gravedad gana. Lo bueno: la firmeza responde más rápido que el volumen, porque la base ya existe.',
      c: 'Tensión continua y bajada lenta, que es lo que crea densidad, más frecuencia alta: puente isométrico, sentadilla sumo con pausa abajo, peso muerto rumano a una pierna con una mochila y caminata lateral con banda elástica. Y el antirretención, porque la hinchazón hace que la celulitis parezca el doble de lo que es. El orden y la dosis están en el plan.',
      d: 'Entrenar para "crecer". Volumen sobre un músculo sin tono se cae junto con él. Primero se reafirma, después crece.',
    },
  },

  obstaculos: {
    motivacao: { texto: 'la falta de motivación', titulo: 'Tu salida para la falta de motivación', paragrafo: 'La motivación no se encuentra, se fabrica. El plan está hecho para que sientas el glúteo más firme al tacto en la primera semana, y los encuentros en vivo existen para que no entrenes sola.' },
    comecar: { texto: 'no saber por dónde empezar', titulo: 'Tu salida si no sabes por dónde empezar', paragrafo: 'No tienes que decidir nada: día 1, ejercicio 1, video mostrándote. Solo darle play.' },
    tempo: { texto: 'la rutina apretada', titulo: 'Tu salida para la rutina apretada', paragrafo: '20 minutos, sin traslados, sin ropa de gimnasio, sin equipo. Cabe antes de la ducha.' },
    compulsao: { texto: 'la ansiedad y la compulsión por comer', titulo: 'Tu salida para la ansiedad y la compulsión por comer', paragrafo: 'El plan no es una dieta restrictiva, y la restricción es lo que alimenta la compulsión. La guía de alimentos muestra qué comer, no qué cortar.' },
    autoestima: { texto: 'la baja autoestima', titulo: 'Tu salida para la baja autoestima', paragrafo: 'La primera victoria es física y llega rápido. La autoestima es lo que pasa cuando ves que tu cuerpo responde.' },
  },

  textos: {
    minutos: { menos_20: 'menos de 20 minutos', '20_30': '20 a 30 minutos', mais_30: 'más de 30 minutos' },
    frequencia: { '3x': '3 veces por semana', '4_5x': '4 a 5 veces por semana', todos: 'todos los días' },
    objetivo: { levantado: 'levantado', esculpido: 'esculpido', musculoso: 'musculoso', redondinho: 'redondito' },
  },

  paginaTipo: {
    rotulo: 'Tu análisis indicó:',
    mostrar_tipo_comum: false,
    linha_tipo_comum: 'Este es el tipo más común entre las alumnas de Brenda.',
    titulos: {
      b1: 'Lo que ves en el espejo',
      b2: 'Lo que probablemente ya viviste',
      b3: 'Por qué nada funcionó hasta ahora',
      c: 'Lo que funciona para tu tipo',
      d: 'El error más común de tu tipo',
    },
    b2: 'Probablemente ya dejaste ropa guardada por eso: el short, el vestido más ajustado, el bikini que quedó para "cuando mejore". Ya te comparaste con otra mujer y pensaste que en tu caso es genética. Y o nunca empezaste de verdad porque no sabías por dónde, o empezaste algo de internet y lo dejaste antes de ver resultados. Nada de eso es falta de fuerza de voluntad.',
    ponte: 'Tu plan de 21 días para tu tipo, <b>{nome}</b>, ya está armado: <b>{minutos_txt}</b> por día, <b>{frequencia_txt}</b>, con objetivo <b>{objetivo_txt}</b> y la salida para tu mayor obstáculo, <b>{obstaculo_texto}</b>, ya incluida. {frase_idade}',
    frase_idade: 'Las mujeres de {idade_txt} con este perfil suelen sentir el glúteo más firme al tacto dentro de la primera semana.',
    frase_sem_idade: 'Las mujeres con este perfil suelen sentir el glúteo más firme al tacto dentro de la primera semana.',
    grafico_titulo: 'Proyección de tu evolución en los 21 días del reto',
  },

  recuperacao: 'Tu plan {nome_prep} todavía está reservado. Cabe en {minutos_txt} por día, y la salida para tu mayor obstáculo, {obstaculo_texto}, ya está incluida. {link}',

  steps: [
    // 1 — APERTURA
    {
      type: 'gate',
      stepName: 'abertura',
      meterGain: 0,
      eyebrow: 'CUESTIONARIO PERSONALIZADO',
      title: 'Este cuestionario es exclusivo para mujeres.<br>¿Eres mujer?',
      cta: 'Sí, soy mujer',
      decline: 'No lo soy',
      comments: [
        { id: 'c1', name: 'Camila', avatar: 'images/comentarios q1/1.jpg', text: '¿De verdad es rapidito? Quiero descubrir por dónde empezar.', time: '12 min', likes: 8, replies: [{ name: 'Brenda', text: 'Sí, Camila. Toma unos 2 minutos y el resultado considera tus respuestas.' }] },
        { id: 'c2', name: 'Patricia', avatar: 'images/comentarios q1/2.jpg', text: 'Me gustó porque las preguntas son muy directas 👏', time: '26 min', likes: 11, replies: [] },
        { id: 'c3', name: 'Mariana', avatar: 'images/comentarios q1/3.jpg', text: '¿Se puede responder aunque entrene en casa?', time: '41 min', likes: 5, replies: [{ name: 'Brenda', text: 'Claro que sí. El cuestionario considera tu rutina y tu punto de partida.' }] },
        { id: 'c4', name: 'Bruna', avatar: 'images/comentarios q1/4.jpg', text: 'Empezando ahora 🍑', time: '1 h', likes: 3, replies: [] },
        { id: 'c5', name: 'Fernanda', avatar: 'images/comentarios q1/5.jpg', text: '¿El resultado aparece apenas termine?', time: '1 h', likes: 6, replies: [{ name: 'Brenda', text: 'Sí. Al final recibes la recomendación basada en tus respuestas.' }] },
        { id: 'c6', name: 'Larissa', avatar: 'images/comentarios q1/6.jpg', text: '¿Hace falta gimnasio o equipos?', time: '2 h', likes: 4, replies: [{ name: 'Brenda', text: 'No. Hay opciones pensadas para quien entrena en casa y con poco tiempo.' }] },
        { id: 'c7', name: 'Juliana', avatar: 'images/comentarios q1/7.jpg', text: 'Quiero entender cuál es mi punto de partida 🙌', time: '2 h', likes: 9, replies: [] },
        { id: 'c8', name: 'Ana Paula', avatar: 'images/comentarios q1/8.jpg', text: 'Acabo de terminar, las preguntas son muy fáciles de responder.', time: '3 h', likes: 7, replies: [] },
        { id: 'c9', name: 'Daniela', avatar: 'images/comentarios q1/9.jpg', text: '¿Puedo adaptarlo a los horarios que tengo libres?', time: '4 h', likes: 3, replies: [{ name: 'Brenda', text: 'Sí. Tu disponibilidad es parte del cuestionario.' }] },
        { id: 'c10', name: 'Natalia', avatar: 'images/comentarios q1/10.jpg', text: 'Lo guardé para responder con calma esta noche.', time: '5 h', likes: 2, replies: [] },
        { id: 'c11', name: 'Érica', avatar: 'images/comentarios q1/11.jpg', text: 'Ya voy a empezar 💪', time: '6 h', likes: 5, replies: [] },
      ],
    },

    // 2 — SATISFACCIÓN
    {
      type: 'question',
      stepName: 'satisfacao',
      meterGain: 4,
      title: 'Empecemos.',
      body: '<div class="step-note">Responde con sinceridad: el plan sale de tus respuestas.</div>' +
        '<div class="step-title2">¿Hoy estás satisfecha con el <b>tamaño, la firmeza y la forma de tus glúteos?</b></div>',
      options: [
        { emoji: '☹️', label: 'Estoy insatisfecha', value: 'insatisfeita' },
        { emoji: '😀', label: 'Estoy satisfecha, pero quiero mejorar', value: 'quero_melhorar' },
      ],
      variableToSave: 'satisfacao',
    },

    // 3 — LO QUE MOLESTA
    {
      type: 'question',
      stepName: 'incomodo',
      optionSkin: 'rosaclara',
      meterGain: 4,
      title: '¿Qué es lo que más te molesta al mirarte en el espejo?',
      options: [
        { emoji: '😩', label: 'Glúteos pequeños o sin volumen', value: 'sem_volume' },
        { emoji: '😢', label: 'Falta de firmeza o definición', value: 'sem_firmeza' },
        { emoji: '😐', label: 'Todo está bien, solo quiero mejorar', value: 'so_melhorar' },
      ],
      variableToSave: 'incomodo',
    },

    // 4 — FORMA DEL GLÚTEO (define el `tipo`)
    {
      type: 'question',
      stepName: 'formato',
      optionSkin: 'rosaclara',
      meterGain: 4,
      eventoAoResponder: 'tipo_definido',
      title: '¿Cuál de estas formas se parece más a tus glúteos hoy?',
      body: 'Mírate de lado y de espaldas en el espejo y elige la más parecida.',
      options: [
        { image: 'images/formato-reto.svg', label: 'Plano', sub: 'Casi sin curva de lado, "aplanado"', value: 'reto' },
        { image: 'images/formato-quadrado.svg', label: 'Cuadrado', sub: 'Más ancho arriba, con un quiebre en el costado de la cadera', value: 'quadrado' },
        { image: 'images/formato-caido.svg', label: 'Caído', sub: 'Tiene volumen, pero sin sujeción, con un pliegue abajo', value: 'caido' },
      ],
      variableToSave: 'tipo',
    },

    // 5 — ROPA
    {
      type: 'question',
      stepName: 'roupas',
      optionSkin: 'rosaclara',
      meterGain: 4,
      title: '¿Alguna vez dejaste de usar una prenda por no sentirte segura?',
      body: 'Vestido ajustado, short de jean, bikini.',
      options: [
        { emoji: '🤯', label: 'Sí, muchas veces', value: 'varias_vezes' },
        { emoji: '🥹', label: 'Algunas veces, pero intento disimularlo', value: 'algumas_vezes' },
        { emoji: '😁', label: 'No, eso no es un problema para mí', value: 'nao' },
      ],
      variableToSave: 'roupas',
    },

    // 6 — CREENCIA
    {
      type: 'question',
      stepName: 'crenca',
      optionSkin: 'rosa',
      meterGain: 4,
      title: '¿Crees que es posible transformar tus glúteos <b class="hl-pink">entrenando en casa?</b>',
      body: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">' +
        '<img src="images/prova-1.webp" alt="Antes y después" style="width:100%" />' +
        '<img src="images/prova-2.webp" alt="Antes y después" style="width:100%" />' +
        '</div>Resultados de alumnas que entrenaron en la sala de su casa.',
      options: [
        { emoji: '💪', label: 'Sí, creo que es posible', value: 'acredito' },
        { emoji: '🤔', label: 'Tal vez, pero nunca vi que funcionara para mí', value: 'talvez' },
        { emoji: '🙏', label: 'No estoy segura, pero estoy dispuesta a intentarlo', value: 'disposta' },
      ],
      variableToSave: 'crenca',
    },

    // 7 — MÉTODO
    {
      type: 'question',
      stepName: 'metodo',
      optionSkin: 'rosa',
      meterGain: 4,
      title: 'Si existiera un método probado que combina <b>entrenamiento corto</b> con <b>alimentación simple</b>, ¿te animarías?',
      options: [
        { emoji: '😁', label: 'Sí, por supuesto', value: 'sim' },
        { emoji: '🤨', label: 'Dependería de los resultados', value: 'depende' },
        { emoji: '😏', label: 'Tal vez, si es accesible y fácil de hacer', value: 'talvez' },
      ],
      variableToSave: 'metodo',
    },

    // 8 — PRUEBA SOCIAL
    {
      type: 'message',
      stepName: 'prova_social',
      meterGain: 5,
      title: 'Mira el resultado de quienes siguieron estos ejercicios en casa',
      body: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">' +
        '<img src="images/antes-e-depois-presell-1.jpeg" alt="Antes y después" style="width:100%" />' +
        '<img src="images/antes-e-depois-presell-2.jpeg" alt="Antes y después" style="width:100%" />' +
        '<img src="images/prova-3.webp" alt="Antes y después" style="width:100%" />' +
        '<img src="images/prova-4.webp" alt="Antes y después" style="width:100%" />' +
        '</div><div class="step-sub">¿Te gustaría mirarte al espejo y sentirte así también?</div>',
      cta: '¡Estoy lista!',
    },

    // 9 — TIEMPO POR DÍA
    {
      type: 'question',
      stepName: 'tempo_dia',
      optionSkin: 'rosa',
      meterGain: 4,
      title: '¿Cuántos minutos por día puedes dedicarle al entrenamiento?',
      options: [
        { emoji: '🕐', label: 'Menos de 20 minutos', value: 'menos_20' },
        { emoji: '🕑', label: 'Entre 20 y 30 minutos', value: '20_30' },
        { emoji: '🕒', label: 'Más de 30 minutos', value: 'mais_30' },
      ],
      variableToSave: 'tempo_dia',
    },

    // 10 — FRECUENCIA
    {
      type: 'question',
      stepName: 'frequencia',
      optionSkin: 'rosa',
      meterGain: 4,
      title: '¿Con qué frecuencia podrías entrenar por semana?',
      options: [
        { emoji: '3️⃣', label: '3 veces por semana', value: '3x' },
        { emoji: '4️⃣', label: '4 a 5 veces por semana', value: '4_5x' },
        { emoji: '🔥', label: 'Todos los días', value: 'todos' },
      ],
      variableToSave: 'frequencia',
    },

    // 11 — COMIDAS
    {
      type: 'question',
      stepName: 'refeicoes',
      optionSkin: 'rosa',
      meterGain: 4,
      title: '¿Cuántas comidas haces por día normalmente?',
      body: 'Esto cambia tu metabolismo. En <b>15 años dando clases</b>, Brenda vio que aquí es donde la mayoría se estanca — y ni lo sospecha.',
      options: [
        { emoji: '🍽️', label: '1 a 2 comidas', value: '1_2' },
        { emoji: '🥗', label: '3 comidas por día', value: '3' },
        { emoji: '🍎', label: '4 a 5 comidas', value: '4_5' },
        { emoji: '🍪', label: 'Como varias veces, sin horario fijo', value: 'sem_hora' },
      ],
      variableToSave: 'refeicoes',
    },

    // 12 — EDAD (el value aparece después en {idade})
    {
      type: 'question',
      stepName: 'idade',
      optionSkin: 'rosaclara',
      meterGain: 4,
      title: '¿Cuál es tu edad?',
      body: 'El protocolo cambia según el rango de edad — eso es lo que hace que el plan sea tuyo, y no un entrenamiento genérico.',
      variableToSave: 'idade',
      options: [
        { label: '18 a 24 años', value: '18 a 24 años' },
        { label: '25 a 34 años', value: '25 a 34 años' },
        { label: '35 a 44 años', value: '35 a 44 años' },
        { label: '45 años o más', value: '45 años o más' },
      ],
    },

    // 13 — MECANISMO (solo para 35+)
    {
      type: 'question',
      stepName: 'mecanismo',
      optionSkin: 'rosaclara',
      meterGain: 5,
      mostrarSe: { idade: ['35 a 44 años', '45 años o más'] },
      title: '¿Sabías esto sobre los <b>glúteos femeninos</b> después de los 30?',
      body: '<img src="images/noticia-v2.webp" alt="Por qué el glúteo no responde al entrenamiento" style="width:100%;margin:10px 0" />' +
        'Existe un protocolo específico que <b>obliga al glúteo a volver a su estado de respuesta máxima</b>, ' +
        'incluso sin gimnasio y sin carga pesada.\n\n' +
        'Yo lo llamo <b class="hl-pink">El Truco de las Brasileñas</b>.\n\n' +
        '¿Sabías que existe un protocolo capaz de <b>"resetear" tu metabolismo</b> y acelerar ' +
        'la quema de grasa hasta <b>3 veces más rápido</b>?',
      options: [
        { emoji: '🤓', label: 'Ya conocía esta información', value: 'conhecia' },
        { emoji: '😲', label: 'Es la primera vez que lo escucho', value: 'primeira_vez' },
      ],
      variableToSave: 'mecanismo',
    },

    // 14 — PROCESANDO
    {
      type: 'processing',
      stepName: 'processando_1',
      meterGain: 4,
      durationMs: 6000,
      title: 'Procesando tus respuestas...',
      body: 'Estamos armando tu plan personalizado.',
      messages: [
        'Leyendo lo que respondiste...',
        'Cruzando con el historial de <b>más de 17 mil alumnas</b>...',
        'Definiendo los ejercicios para tu punto de partida...',
      ],
      images: ['images/depo-2.jpeg', 'images/prova-5.webp', 'images/prova-6.webp', 'images/antes-depois-2-web.webp'],
    },

    // 15 — ANÁLISIS
    {
      type: 'bars',
      stepName: 'analise',
      meterGain: 5,
      title: '¡Análisis completado!',
      body: 'Las mujeres de <b class="hl-pink">{idade}</b> responden muy bien al estímulo correcto de glúteo. Esta es la proyección de tu caso:',
      bars: [
        { pct: 20, label: '7 DÍAS', caption: 'Glúteo más firme al tacto' },
        { pct: 55, label: '14 DÍAS', caption: 'Firmeza y reducción de celulitis' },
        { pct: 96, label: '21 DÍAS', caption: 'Glúteos levantados y con volumen' },
      ],
      cta: 'Continuar',
    },

    // 16 — DISPOSICIÓN
    {
      type: 'question',
      stepName: 'prontidao',
      optionSkin: 'rosa',
      meterGain: 4,
      title: '¿Te sientes lista para transformar tu cuerpo y tu autoestima?',
      options: [
        { emoji: '🙋‍♀️', label: 'Sí, estoy lista', value: 'pronta' },
        { emoji: '💫', label: 'Casi, solo necesito un empujón', value: 'quase' },
        { emoji: '🌱', label: 'Necesito más motivación para empezar', value: 'motivacao' },
      ],
      variableToSave: 'prontidao',
    },

    // 17 — GLÚTEOS DE TUS SUEÑOS
    {
      type: 'question',
      stepName: 'bumbum_sonhos',
      meterGain: 4,
      title: '¿Cuáles son los <b class="hl-pink">glúteos de tus sueños?</b>',
      body: '<div class="step-sub">👇 Elige tu objetivo: es lo que define la intensidad de tu plan.</div>',
      options: [
        { emoji: '🍑', label: 'Levantado', sub: 'Para llamar la atención a distancia', value: 'levantado' },
        { emoji: '💪', label: 'Esculpido', sub: 'Con curvas marcadas', value: 'esculpido' },
        { emoji: '🔥', label: 'Musculoso', sub: 'Definido y fuerte', value: 'musculoso' },
        { emoji: '✨', label: 'Redondito', sub: 'Con volumen y forma', value: 'redondinho' },
      ],
      variableToSave: 'bumbum_sonhos',
    },

    // 18 — OBSTÁCULO
    {
      type: 'question',
      stepName: 'obstaculo',
      optionSkin: 'rosaclara',
      meterGain: 4,
      title: '¿Cuál es tu mayor obstáculo hoy?',
      body: 'Brenda armó una salida específica para cada uno de ellos.',
      options: [
        { emoji: '😮‍💨', label: 'Falta de motivación constante', value: 'motivacao' },
        { emoji: '🍫', label: 'Ansiedad y compulsión por comer', value: 'compulsao' },
        { emoji: '⏰', label: 'Rutina apretada, sin tiempo', value: 'tempo' },
        { emoji: '🤷‍♀️', label: 'No sé por dónde empezar', value: 'comecar' },
        { emoji: '💔', label: 'La baja autoestima me sabotea', value: 'autoestima' },
      ],
      variableToSave: 'obstaculo',
    },

    // 19 — COMPROMISO
    {
      type: 'question',
      stepName: 'compromisso',
      optionSkin: 'rosaclara',
      meterGain: 4,
      title: '¿Estás lista para levantar tus glúteos en hasta <b>21 días?</b>',
      options: [
        { emoji: '🔥', label: 'SÍ, ESTOY 100% COMPROMETIDA', value: 'comprometida' },
        { emoji: '💪', label: 'ABSOLUTAMENTE, VOY A DAR LO MÁXIMO', value: 'maximo' },
        { emoji: '🚀', label: 'CLARO QUE SÍ, QUIERO EMPEZAR HOY', value: 'hoje' },
      ],
      variableToSave: 'compromisso',
    },

    // 20 — PROCESANDO 2
    {
      type: 'processing',
      stepName: 'processando_2',
      meterGain: 4,
      durationMs: 5000,
      title: 'Analizando tus respuestas...',
      body: 'Falta poco para que tu plan esté listo.',
      messages: [
        'Ajustando el volumen de entrenamiento a tu tiempo...',
        'Encajando los ejercicios en tu rutina...',
        'Cerrando tu cronograma de 21 días...',
      ],
      images: ['images/prova-7.webp', 'images/prova-8.webp', 'images/antes-depois-3-web.webp', 'images/antes-depois-4-web.webp'],
    },

    // 21 — PÁGINA DEL TIPO
    {
      type: 'tipo',
      stepName: 'pagina_tipo',
      meterGain: 5,
      eyebrow: 'Tu análisis indicó:',
      title: '{nome}',
      body: '<div class="tipo-apelido">{apelido}</div>',
      chart: {
        points: [
          { x: 'DÍA 1', y: 5, label: 'Punto de partida' },
          { x: 'DÍA 3', y: 18, label: 'Primera evolución' },
          { x: 'DÍA 8', y: 42, label: 'Adaptación' },
          { x: 'DÍA 14', y: 68, label: 'Aceleración' },
          { x: 'DÍA 21', y: 96, label: 'Resultado' },
        ],
      },
      cta: '¡ACCEDER A MI PLAN PERSONALIZADO!',
    },

    // 22 — PLAN GENERADO + QUIÉN ES BRENDA
    {
      type: 'message',
      stepName: 'plano_gerado',
      meterGain: 5,
      armBackredirect: true,
      title: '✅ ¡Plan generado!',
      body: '<img src="images/brenda-aula-cavala-web.jpg" alt="Brenda dando clase" style="width:100%;margin:10px 0" />' +
        '<b>Brenda</b> — educadora física desde hace <b>más de 15 años</b>, <b>más de 50 mil seguidores</b> en redes y ' +
        '<b>más de 17 mil alumnas</b> en Brasil y en el mundo.\n\n' +
        'Referente en <b class="hl-pink">entrenamiento femenino enfocado en glúteos</b>, ' +
        'especializada en activación, firmeza y proyección de los glúteos <b>sin gimnasio</b>.',
      cta: 'VER MI PLAN',
    },

    // 23 — OFERTA
    {
      type: 'pitch',
      stepName: 'pitch',
      meterGain: 6,
      title: 'Tu plan {nome_prep} está listo. Mira todo lo que te llevas 👇',
      pitch: {
        reframe: 'El <b>Reto de 21 Días</b> es el mismo protocolo que Brenda aplica con sus alumnas: ' +
          '<b>20 a 30 minutos por día</b>, en la sala de tu casa, sin gimnasio y sin equipos caros.',

        printsTitle: 'Lo que las alumnas están mandando al grupo 💬',
        prints: [
          { src: 'images/print-grupo-cavala-1.webp', w: 1828, h: 860 },
          { src: 'images/print-grupo-cavala-4.webp', w: 1536, h: 1024 },
          { src: 'images/print-grupo-cavala-3.webp', w: 1505, h: 1045 },
          { src: 'images/print-grupo-cavala-2.webp', w: 1678, h: 937 },
        ],

        testimonialsTitle: 'Alumnas que hicieron El Truco de las Brasileñas',
        testimonials: [
          { name: 'Fernanda', image: 'images/depo-1.webp', text: 'Ya había probado el gimnasio y nada cambiaba. Con El Truco de las Brasileñas mis glúteos ganaron volumen y se levantaron de verdad — hoy el short me queda como siempre quise.' },
          { name: 'Isabella', image: 'images/depoimento-2.webp', text: 'Yo no tenía nada de glúteos. Hice El Truco de las Brasileñas en casa y gané forma: quedaron redondos, firmes y en su lugar. Fue lo primero que funcionó para mí.' },
        ],

        benefitsTitle: 'Lo que logras en el reto',
        benefits: [
          '✔️ <b>Volumen y forma</b> — glúteos más grandes y redondos',
          '✔️ <b>Firmeza</b> — adiós a la flacidez y a la falta de sujeción',
          '✔️ <b>Menos celulitis</b> — piel más lisa en la zona',
          '✔️ <b>Resultado rápido</b> — cambio visible dentro de los 21 días',
          '✔️ <b>Entrenamiento práctico</b> — 20 a 30 minutos, en casa, con video de cada ejercicio',
          '✔️ <b>Autoestima</b> — ponerte lo que quieras sin pensarlo dos veces',
        ],

        videosTitle: 'Mira cómo es el entrenamiento 🎥',
        videoTreino: {
          porTipo: {
            reto: { src: 'videos/elevacao-pelvica-loop.mp4', poster: 'videos/elevacao-pelvica-loop.jpg' },
            quadrado: { src: 'videos/avancos-laterais-loop.mp4', poster: 'videos/avancos-laterais-loop.jpg' },
            caido: { src: 'videos/avanco-reverso-loop.mp4', poster: 'videos/avanco-reverso-loop.jpg' },
          },
          padrao: 'reto',
          legenda: 'Uno de los ejercicios de tu plan, en la sala de tu casa',
        },
        videoApp: { src: 'videos/app-por-dentro-loop.mp4', poster: 'videos/app-por-dentro-loop.jpg', legenda: 'La app por dentro: cada ejercicio con video' },

        bonusesTitle: '🎁 Y además te llevas 3 bonos gratis',
        bonuses: [
          {
            name: '4 Encuentros en Vivo con el equipo',
            description: 'Entrenas en grupo, resuelves dudas en tiempo real y no abandonas a mitad de camino.',
            price: 'US$ 197,00',
          },
          {
            name: 'Té Asiático Antirretención',
            description: 'Desinflama el cuerpo — y es la hinchazón lo que hace que la celulitis se vea más de lo que es.',
            price: 'US$ 67,00',
          },
          {
            name: 'Guía de Alimentos que Activan el Glúteo',
            description: 'Qué comer para que el músculo responda al entrenamiento, sin dietas locas y sin pasar hambre.',
            price: 'US$ 87,00',
          },
        ],

        scarcity: '⚠️ Cupos con bonos disponibles <b>solo hoy</b>',

        priceLine: 'De <s>US$ 67,00</s> por solo <b>US$ 19,90</b>',
        priceSub: 'Pago único de US$ 19,90 — menos de US$ 1,00 por día del reto',

        timerMinutes: 10,
        timerNote: 'Este precio con los bonos expira cuando se acabe el tiempo',

        seals: [
          { title: '✅ Pago único', sub: 'Sin mensualidades' },
          { title: '✅ Acceso inmediato', sub: 'La app se abre en el momento del pago' },
        ],

        guaranteeLine: '<b>Garantía de 30 días.</b> Entras, aplicas el protocolo y, si no ves resultados, ' +
          'te devolvemos el 100% de tu dinero. El riesgo es nuestro.',

        beforeAfterTitle: 'Resultados reales de alumnas',
        beforeAfterSubtitle: 'Todas entrenando en casa, sin gimnasio',
        beforeAfterImages: [
          { src: 'images/antes-depois-set-3.webp', alt: 'Antes y después' },
          { src: 'images/prova-9.webp', alt: 'Antes y después' },
          { src: 'images/antes-depois-5-web.webp', alt: 'Antes y después' },
        ],

        cta: 'QUIERO ASEGURAR MI CUPO',
      },
    },
  ],
};
