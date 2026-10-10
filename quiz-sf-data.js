// Versão em ESPANHOL (LatAm neutro, tuteo) do funil quiz-sf na versão NOVA
// (a dos prints: abre direto no formato do bumbum, sem a abertura "¿Eres mujer?"
// e sem a tela de satisfação). Reconstruída a partir dos prints das telas, usando
// os componentes que o motor já tem (quiz-b, derivadas, pares DIA 1 / DIA 21).
// Tracking, checkout, pixel e oferta ficam como no original.

window.QUIZ_DATA = {
  meterInitial: 5,
  meterMax: 100,
  meterLabel: '',
  sounds: false,
  toasts: false,
  optionStyle: 'radio',
  // Sem a nota "(Selecciona una de las opciones)": o funil novo não tem.
  optionsNote: '',
  checkoutUrl: 'https://pay.hotmart.com/A107907296H?off=1prvupmk&checkoutMode=10',
  funnelTag: 'quiz-sf',
  sendSid: true,
  backredirectUrl: '/oferta-especial-sf?funnel=quiz-sf',

  gateTeamName: 'Carolina',
  gateTeamAvatar: 'images/carolina-avatar.webp',

  gateFooter: {
    links: [
      { label: 'Política de Privacidad', href: '/politicas-de-privacidade' },
      { label: 'Términos de Uso', href: '/termos-de-uso' },
      { label: 'Contacto', href: '/contato' },
      { label: 'Aviso legal', href: '/aviso-legal' },
    ],
    note: 'Los entrenamientos y protocolos mencionados en esta página tienen carácter educativo y de acondicionamiento físico general. ' +
      'No constituyen consulta, diagnóstico, prescripción ni tratamiento médico, y no sustituyen la evaluación y autorización ' +
      'de un profesional de la salud. Consulta con un médico antes de comenzar, especialmente si estás embarazada, tienes alguna ' +
      'condición de salud preexistente o tomas medicamentos.',
    company: 'contato@sejafit.site · (11) 92681-0324',
  },

  varDefaults: { nome_prep: '', nome: 'tu tipo', apelido: '', obstaculo_texto: 'tu mayor obstáculo' },

  tipos: {
    reto: {
      nome: 'Síndrome del Glúteo Dormido',
      apelido: 'El famoso glúteo plano.',
      nome_prep: 'para el Síndrome del Glúteo Dormido',
      botao: 'ACCEDER A MI PLAN PARA GLÚTEO DORMIDO',
      b1: 'De lado, casi sin curva. La cintura del pantalón te sobra atrás, y la ropa te queda distinta adelante y atrás: marca la cintura y desaparece en los glúteos.',
      b3: '{tentou_frase} El glúteo dormido no responde al esfuerzo común porque el cuerpo lo salta: el muslo y la zona lumbar hacen el movimiento en su lugar. Cuando te esfuerzas, él no participa. Por eso aparece rápido cuando el estímulo es el correcto.',
      c: 'Despertar el músculo antes de cargarlo. Primero una activación corta, después ejercicios que reclutan el glúteo mayor y el medio al mismo tiempo: puente de glúteos, pulsos de puente, puente marchando, patadas de glúteo y zancada inversa. Todos caben en la sala de tu casa, sin ningún equipo. Lo que separa el estímulo del desperdicio es el orden y la dosis, y eso está en el plan.',
      c_video: { src: 'videos/elevacao-pelvica-loop.mp4', poster: 'videos/elevacao-pelvica-loop.jpg' },
      d: 'Hacer más sentadillas. La sentadilla es un ejercicio de muslo. Para el glúteo dormido, estorba más de lo que ayuda.',
    },
    quadrado: {
      nome: 'Perfil Gota Invertida',
      apelido: 'El famoso glúteo cuadrado.',
      nome_prep: 'para el Perfil Gota Invertida',
      botao: 'ACCEDER A MI PLAN PARA GOTA INVERTIDA',
      b1: 'De espaldas, es más ancho arriba, en el hueso de la cadera, y vacío abajo. Tiene esa quebradura en el costado que el pantalón marca en vez de redondear. Tiene volumen, pero no tiene forma.',
      b3: '{tentou_frase} La Gota Invertida no es falta de glúteo, son el glúteo medio y el menor apagados. Son ellos los que llenan el costado y hacen lo redondeado. Como casi nadie entrena esos dos, el costado sigue vacío por más que te esfuerces.',
      c: 'Trabajo lateral y de abducción, que es lo que rellena la quebradura, más la porción inferior del glúteo mayor, que da la curva de abajo: almeja, hidrante en cuatro apoyos, abducción de pie con banda elástica, caminata lateral con banda elástica y elevación pélvica con banda arriba de las rodillas. Ninguno necesita gimnasio. El orden y la dosis, que es lo que hace que el costado responda, están en el plan.',
      c_video: { src: 'videos/avancos-laterais-loop.mp4', poster: 'videos/avancos-laterais-loop.jpg' },
      d: 'Entrenar solo para "glúteo grande". Volumen sin costado deja la forma todavía más cuadrada. Aquí, el costado va antes que el volumen.',
    },
    caido: {
      nome: 'Perfil Baja Sustentación',
      apelido: 'El famoso glúteo caído.',
      nome_prep: 'para el Perfil Baja Sustentación',
      botao: 'ACCEDER A MI PLAN PARA BAJA SUSTENTACIÓN',
      b1: 'Tiene volumen, pero no se queda en su lugar: se dobla abajo, se mueve cuando caminas, el short corta en el pliegue y la celulitis se nota más con la luz de arriba.',
      b3: '{tentou_frase} La Baja Sustentación no es falta de glúteo, es falta de tensión. El músculo sin tono no sostiene su propio volumen, y la gravedad gana. Lo bueno: la firmeza responde más rápido que el volumen, porque la base ya existe.',
      c: 'Tensión continua y bajada lenta, que es lo que crea densidad, más frecuencia alta: puente de glúteo isométrico, sentadilla sumo con pausa abajo, peso muerto a una pierna con una mochila y caminata lateral con banda elástica. Y el antirretención, porque la hinchazón hace que la celulitis parezca el doble de lo que es. El orden y la dosis están en el plan.',
      c_video: { src: 'videos/avanco-reverso-loop.mp4', poster: 'videos/avanco-reverso-loop.jpg' },
      d: 'Entrenar para "crecer". El volumen sobre un músculo sin tono baja con él. Primero se afirma, después crece.',
    },
  },

  obstaculos: {
    motivacao: { texto: 'falta de motivación', titulo: 'Tu salida para la falta de motivación', paragrafo: 'La motivación no se encuentra, se fabrica. El plan está hecho para que sientas el glúteo más firme al tacto en la primera semana, y los encuentros en vivo existen para que no entrenes sola.' },
    comecar: { texto: 'no saber por dónde empezar', titulo: 'Tu salida para quien no sabe por dónde empezar', paragrafo: 'No decides nada: día 1, ejercicio 1, con video que te lo muestra. Solo tienes que darle al play.' },
    tempo: { texto: 'rutina apretada', titulo: 'Tu salida para la rutina apretada', paragrafo: 'Entrenamientos de {minutos_txt}, sin traslados, sin ropa de gimnasio, sin equipo. Caben antes de la ducha.' },
    compulsao: { texto: 'ansiedad y atracones de comida', titulo: 'Tu salida para la ansiedad y los atracones de comida', paragrafo: 'El plan no es una dieta restrictiva, y la restricción es lo que alimenta los atracones. La guía de alimentos te muestra qué comer, no qué eliminar.' },
    autoestima: { texto: 'baja autoestima', titulo: 'Tu salida para la baja autoestima', paragrafo: 'La primera victoria es física y llega rápido. La autoestima es lo que pasa cuando ves que tu cuerpo responde.' },
  },

  textos: {
    minutos: { menos_20: '15 minutos', '20_30': '20 a 30 minutos', mais_30: 'más de 30 minutos' },
    frequencia: { '3x': '3 veces por semana', '4_5x': '4 a 5 veces por semana', todos: 'todos los días' },
    objetivo: { levantado: 'levantado', esculpido: 'esculpido', musculoso: 'musculoso', redondinho: 'redondeado' },
  },

  // Frases que dependem de uma resposta anterior (o motor as monta em {chave}).
  // Valor vazio some da frase. Sem tags HTML aqui: o motor escapa o valor.
  derivadas: {
    tipo_titulo: { de: 'tipo', textos: { reto: 'Glúteo Plano', quadrado: 'Glúteo Cuadrado', caido: 'Glúteo Caído' } },
    tipo_chip: { de: 'tipo', textos: { reto: 'Glúteo plano', quadrado: 'Glúteo cuadrado', caido: 'Glúteo caído' } },
    tipo_img: { de: 'tipo', textos: { reto: 'images/formato-reto.svg', quadrado: 'images/formato-quadrado.svg', caido: 'images/formato-caido.svg' } },
    curios_a: { de: 'tipo', textos: {
      reto: 'La mayoría de los ejercicios "de glúteos" ni siquiera despierta el glúteo de quien tiene la forma plana.',
      quadrado: 'La mayoría de los ejercicios "de glúteos" ni siquiera llega al costado de quien tiene la forma cuadrada.',
      caido: 'La mayoría de los ejercicios "de glúteos" da volumen, pero no da tensión a quien tiene la forma caída.',
    } },
    curios_b: { de: 'tipo', textos: {
      reto: 'El muslo y la zona lumbar asumen el movimiento. El glúteo se queda afuera.',
      quadrado: 'El glúteo mayor trabaja, pero el medio y el menor se quedan afuera.',
      caido: 'Sin tensión, el músculo no sostiene su propio volumen.',
    } },
    padrao_a: { de: 'tipo', textos: {
      reto: 'Quien tiene este perfil se traba en el mismo punto:',
      quadrado: 'Quien tiene este perfil se traba en el mismo punto:',
      caido: 'Quien tiene este perfil se traba en el mismo punto:',
    } },
    padrao_b: { de: 'tipo', textos: {
      reto: 'el entrenamiento llega al muslo y no llega al glúteo.',
      quadrado: 'el entrenamiento llena la parte de arriba y no llena el costado.',
      caido: 'el entrenamiento da volumen, pero no da la tensión que lo sostiene.',
    } },
    curios_idade: { de: 'idade', textos: {
      '18 a 24 años': 'Hasta los 24 es la fase en que el glúteo responde más rápido al estímulo correcto. Después de eso, el protocolo cambia.',
      '25 a 34 años': 'De los 25 a los 34 es la última fase en que responde rápido sin esfuerzo extra. Después de eso, el protocolo cambia.',
      '35 a 44 años': 'De los 35 a los 44 el glúteo ya pide un estímulo más preciso: sin el protocolo correcto, el esfuerzo rinde menos. Por eso el protocolo cambia.',
      '45 años o más': 'A partir de los 45 el glúteo necesita un estímulo todavía más preciso para responder. Por eso el protocolo es otro.',
    } },
    tentou_chip: { de: 'tentou', textos: {
      internet: 'Ya probó entrenamientos de internet',
      academia: 'Ya probó el gimnasio',
      dieta: 'Ya probó dietas',
      nada: 'Primera vez entrenando',
    } },
    tentou_frase: { de: 'tentou', textos: {
      internet: 'Ya probaste sentadillas y entrenamientos de internet, y el glúteo fue lo último en cambiar.',
      academia: 'Ya probaste el gimnasio, y el glúteo fue lo último en cambiar.',
      dieta: 'Ya probaste dietas, y el glúteo fue lo último en cambiar.',
      nada: 'Todavía no probaste nada, así que tu glúteo nunca recibió el estímulo correcto.',
    } },
    frase_roupa: { de: 'roupas', textos: {
      short: 'Probablemente ya dejaste el short de mezclilla guardado para "cuando mejore".',
      vestido: 'Probablemente ya dejaste el vestido ajustado guardado para "cuando mejore".',
      biquini: 'Probablemente ya dejaste el bikini guardado para "cuando mejore".',
      nenhuma: '',
    } },
    refeicoes_nota: { de: 'refeicoes', textos: {
      '1_2': 'Marcaste 1 a 2 comidas al día: por eso las 51 recetas proteicas entran en tu plan.',
      '3': 'Marcaste 3 comidas al día: por eso las 51 recetas proteicas entran en tu plan.',
      '4_5': 'Marcaste 4 a 5 comidas al día: por eso las 51 recetas proteicas entran en tu plan.',
      sem_hora: 'Marcaste que comes varias veces, sin horario fijo: por eso las 51 recetas proteicas entran en tu plan.',
    } },
    horario_txt: { de: 'horario', textos: { manha: 'por la mañana', almoco: 'a la hora del almuerzo', noite: 'por la noche' } },
    horario_proc: { de: 'horario', textos: { manha: 'por la mañana', almoco: 'a la hora del almuerzo', noite: 'por la noche' } },
    incomodo_frase: { de: 'incomodo', textos: {
      sem_volume: 'Como lo que más te molesta es la falta de volumen, los primeros entrenamientos despiertan el glúteo para que vuelva a responder y gane forma.',
      sem_firmeza: 'Como lo que más te molesta es la falta de firmeza, los primeros entrenamientos crean tensión para afirmar el glúteo y sostener el volumen.',
      so_melhorar: 'Como quieres mejorar lo que ya tienes, los primeros entrenamientos afinan la forma y la firmeza.',
    } },
  },

  paginaTipo: {
    rotulo: 'Resultado de tu análisis',
    mostrar_tipo_comum: false,
    linha_tipo_comum: 'Este es el tipo más común entre las alumnas de Carolina.',
    titulos: {
      b1: 'Lo que ves en el espejo',
      b2: 'Lo que probablemente ya viviste',
      b3: 'Por qué nada funcionó hasta ahora',
      c: 'Lo que funciona para tu tipo',
      d: 'El error más común de tu tipo',
    },
    b2: '{frase_roupa} Ya te comparaste con otra mujer y pensaste que en tu caso es genética. No es genética, y no es falta de fuerza de voluntad.',
    ponte: 'Tu plan de 21 días para tu tipo, <b>{nome}</b>, ya está armado: entrenamientos de <b>{minutos_txt}</b>, <b>{frequencia_txt}</b>, <b>{horario_txt}</b>, con objetivo <b>{objetivo_txt}</b> y la salida para tu mayor obstáculo, <b>{obstaculo_texto}</b>, ya incluida. {incomodo_frase} {frase_idade}',
    frase_idade: 'Las mujeres de {idade_txt} con este perfil suelen sentir el glúteo más firme al tacto dentro de la primera semana.',
    frase_sem_idade: 'Las mujeres con este perfil suelen sentir el glúteo más firme al tacto dentro de la primera semana.',
    grafico_titulo: 'Proyección de tu evolución en los 21 días del reto',
  },

  recuperacao: 'Tu plan {nome_prep} sigue reservado. Cabe en {minutos_txt} por día, y la salida para tu mayor obstáculo, {obstaculo_texto}, ya está incluida. {link}',

  steps: [
    // 1 — FORMATO (abertura do funil novo)
    {
      type: 'question',
      stepName: 'formato',
      meterGain: 5,
      eventoAoResponder: 'tipo_definido',
      eyebrow: 'PRUEBA DE 1 MINUTO',
      title: '¿Cuál de estos se parece a tus glúteos hoy?',
      body: 'Mírate de lado y de espaldas en el espejo y elige el más cercano. Vas a descubrir qué necesita tu tipo para levantar en 21 días, sin gimnasio.<br><span class="selo-mini">Exclusivo para mujeres</span>',
      options: [
        { image: 'images/formato-reto.svg', label: 'Plano', sub: 'Casi sin curva de lado, "aplastado"', value: 'reto' },
        { image: 'images/formato-quadrado.svg', label: 'Cuadrado', sub: 'Más ancho arriba, con una quebradura en el costado de la cadera', value: 'quadrado' },
        { image: 'images/formato-caido.svg', label: 'Caído', sub: 'Tiene volumen, pero sin sustentación, con pliegue abajo', value: 'caido' },
      ],
      variableToSave: 'tipo',
    },

    // 2 — INCOMODO
    {
      type: 'question',
      stepName: 'incomodo',
      meterGain: 5,
      title: '¿Qué es lo que más te molesta al mirarte al espejo?',
      options: [
        { emoji: '😩', label: 'Glúteos pequeños o sin volumen', value: 'sem_volume' },
        { emoji: '😢', label: 'Falta de firmeza o definición', value: 'sem_firmeza' },
        { emoji: '😐', label: 'Estoy bien, solo quiero mejorar', value: 'so_melhorar' },
      ],
      variableToSave: 'incomodo',
    },

    // 3 — ROPA
    {
      type: 'question',
      stepName: 'roupas',
      meterGain: 5,
      title: '¿Alguna vez dejaste de usar una prenda por no sentirte segura?',
      body: 'Vestido ajustado, short de mezclilla, bikini.',
      options: [
        { label: 'El short de mezclilla', value: 'short' },
        { label: 'El vestido ajustado', value: 'vestido' },
        { label: 'El bikini', value: 'biquini' },
        { label: 'Ninguna, eso no me molesta', value: 'nenhuma' },
      ],
      variableToSave: 'roupas',
    },

    // 4 — YA PROBASTE
    {
      type: 'question',
      stepName: 'tentou',
      meterGain: 5,
      title: '¿Qué has intentado para cambiar tus glúteos?',
      body: 'Vale cualquier cosa, hasta lo que duró una semana.',
      options: [
        { label: 'Sentadillas y entrenamientos de internet', value: 'internet' },
        { label: 'Gimnasio', value: 'academia' },
        { label: 'Dieta o adelgazar', value: 'dieta' },
        { label: 'Nada todavía, esta es la primera vez', value: 'nada' },
      ],
      variableToSave: 'tentou',
    },

    // 5 — PRUEBA SOCIAL (pares DIA 1 / DIA 21)
    {
      type: 'message',
      stepName: 'prova_social',
      meterGain: 5,
      title: 'Mira el resultado de quienes siguieron estos ejercicios en casa',
      pares: [
        { src: 'images/antes-depois-set-3.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', caption: 'Alumna del reto · en casa', alt: 'Antes y después' },
        { src: 'images/antes-e-depois-presell-2-es.jpeg', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', caption: 'Alumna del reto · en casa', alt: 'Antes y después' },
        { src: 'images/antes-depois-5-web.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', caption: 'Alumna del reto · en casa', alt: 'Antes y después' },
        { src: 'images/prova-9.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', caption: 'Alumna del reto · en casa', alt: 'Antes y después' },
      ],
      cta: '¡Estoy lista!',
    },

    // 6 — MINUTOS
    {
      type: 'question',
      stepName: 'tempo_dia',
      meterGain: 5,
      title: '¿Cuántos minutos por día puedes dedicar al entrenamiento?',
      options: [
        { label: 'Menos de 20 minutos', value: 'menos_20' },
        { label: 'Entre 20 y 30 minutos', value: '20_30' },
        { label: 'Más de 30 minutos', value: 'mais_30' },
      ],
      variableToSave: 'tempo_dia',
    },

    // 7 — FRECUENCIA
    {
      type: 'question',
      stepName: 'frequencia',
      meterGain: 5,
      title: '¿Con qué frecuencia podrías entrenar por semana?',
      options: [
        { label: '3 veces por semana', value: '3x' },
        { label: '4 a 5 veces por semana', value: '4_5x' },
        { label: 'Todos los días', value: 'todos' },
      ],
      variableToSave: 'frequencia',
    },

    // 8 — COMIDAS
    {
      type: 'question',
      stepName: 'refeicoes',
      meterGain: 5,
      title: '¿Cuántas comidas haces normalmente al día?',
      body: 'Esto cambia tu metabolismo. En <b>15 años dando clases</b>, Carolina vio que es aquí donde la mayoría se estanca, y ni lo sospecha.',
      options: [
        { label: '1 a 2 comidas', value: '1_2' },
        { label: '3 comidas al día', value: '3' },
        { label: '4 a 5 comidas', value: '4_5' },
        { label: 'Como varias veces, sin horario fijo', value: 'sem_hora' },
      ],
      variableToSave: 'refeicoes',
    },

    // 9 — EDAD
    {
      type: 'question',
      stepName: 'idade',
      meterGain: 5,
      title: '¿Cuál es tu edad?',
      body: 'El protocolo cambia según el rango de edad: eso es lo que hace que el plan sea tuyo y no un entrenamiento genérico.',
      variableToSave: 'idade',
      options: [
        { label: '18 a 24 años', value: '18 a 24 años' },
        { label: '25 a 34 años', value: '25 a 34 años' },
        { label: '35 a 44 años', value: '35 a 44 años' },
        { label: '45 años o más', value: '45 años o más' },
      ],
    },

    // 10 — CURIOSIDAD SOBRE EL TIPO (todas las edades)
    {
      type: 'question',
      stepName: 'mecanismo',
      meterGain: 5,
      title: 'Curiosidad sobre el {tipo_titulo}',
      body: '<div class="nota-brenda nota-post">' +
        '<div class="nota-post-head"><img src="images/carolina-avatar.webp" alt="Carolina" /><span>Carolina</span></div>' +
        '<p><b>{curios_a}</b></p>' +
        '<p>{curios_b}</p>' +
        '<p><b>Existe un protocolo que obliga al glúteo a volver a su estado de respuesta máxima.</b></p>' +
        '<p>Sin gimnasio. Sin carga pesada.</p>' +
        '<p>Yo lo llamo Truco de las Brasileñas.</p>' +
        '<p class="nota-post-fim">{curios_idade}</p>' +
      '</div>',
      options: [
        { label: 'Ya conocía esta información', value: 'conhecia' },
        { label: 'Es la primera vez que lo escucho', value: 'primeira_vez' },
      ],
      variableToSave: 'mecanismo',
    },

    // 11 — PROCESANDO 1
    {
      type: 'processing',
      stepName: 'processando_1',
      meterGain: 5,
      durationMs: 6000,
      title: 'Procesando tus respuestas...',
      body: 'Estamos armando tu plan personalizado.',
      messages: [
        'Leyendo lo que respondiste...',
        'Cruzando con el historial de <b>más de 17 mil alumnas</b>...',
        'Definiendo los ejercicios de tu punto de partida...',
      ],
      images: [],
    },

    // 12 — ENCONTRÉ EL PATRÓN
    {
      type: 'message',
      stepName: 'padrao',
      meterGain: 5,
      title: 'Encontré el patrón en tus respuestas.',
      body: '<div class="padrao-chips"><span>{tipo_chip}</span><span>{idade}</span><span>{tentou_chip}</span></div>' +
        '<img class="padrao-img" src="{tipo_img}" alt="" />' +
        '<p class="padrao-p">{padrao_a} <b>{padrao_b}</b></p>' +
        '<p class="padrao-p">Eso tiene nombre. Y tiene un protocolo específico. Faltan 3 preguntas para que confirme tu tipo y cierre tu plan.</p>',
      cta: 'CONFIRMAR MI TIPO',
    },

    // 13 — GLUTEOS DE TUS SUEÑOS
    {
      type: 'question',
      stepName: 'bumbum_sonhos',
      meterGain: 5,
      title: '¿Cuáles son los <b class="hl-pink">glúteos de tus sueños?</b>',
      body: 'Elige tu objetivo: es el que define la intensidad de tu plan.',
      options: [
        { label: 'Levantado', sub: 'Para llamar la atención a la distancia', value: 'levantado' },
        { label: 'Esculpido', sub: 'Con curvas marcadas', value: 'esculpido' },
        { label: 'Musculoso', sub: 'Definido y fuerte', value: 'musculoso' },
        { label: 'Redondeado', sub: 'Con volumen y forma', value: 'redondinho' },
      ],
      variableToSave: 'bumbum_sonhos',
    },

    // 14 — OBSTACULO
    {
      type: 'question',
      stepName: 'obstaculo',
      meterGain: 5,
      title: '¿Cuál es tu mayor obstáculo hoy?',
      body: 'Carolina armó una salida específica para cada uno de ellos.',
      options: [
        { label: 'Falta de motivación constante', value: 'motivacao' },
        { label: 'Ansiedad y atracones de comida', value: 'compulsao' },
        { label: 'Rutina apretada, sin tiempo', value: 'tempo' },
        { label: 'No sé por dónde empezar', value: 'comecar' },
        { label: 'La baja autoestima me sabotea', value: 'autoestima' },
      ],
      variableToSave: 'obstaculo',
    },

    // 15 — HORARIO
    {
      type: 'question',
      stepName: 'horario',
      meterGain: 5,
      title: '¿A qué hora va a entrar tu entrenamiento?',
      body: 'Quien define la hora antes de empezar es quien llega al día 21.',
      options: [
        { label: 'Por la mañana, antes que nada', value: 'manha' },
        { label: 'A la hora del almuerzo', value: 'almoco' },
        { label: 'Por la noche, después del día', value: 'noite' },
      ],
      variableToSave: 'horario',
    },

    // 16 — PROCESANDO 2
    {
      type: 'processing',
      stepName: 'processando_2',
      meterGain: 5,
      durationMs: 5000,
      title: 'Analizando tus respuestas...',
      body: 'Falta poco para que tu plan esté listo.',
      messages: [
        'Ajustando el volumen de entrenamiento a tu tiempo...',
        'Encajando {minutos_txt} {horario_proc} en tu rutina...',
        'Armando los ejercicios de tu tipo...',
        'Cerrando tu cronograma de 21 días...',
      ],
      images: ['images/prova-7.webp', 'images/prova-8-es.webp', 'images/antes-depois-3-web.webp', 'images/antes-depois-4-web.webp'],
    },

    // 17 — PAGINA DEL TIPO
    {
      type: 'tipo',
      stepName: 'pagina_tipo',
      meterGain: 5,
      eyebrow: 'Resultado de tu análisis',
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

    // 18 — QUIEN ARMÓ TU PLAN (arma o backredirect)
    {
      type: 'message',
      stepName: 'plano_gerado',
      meterGain: 5,
      armBackredirect: true,
      title: 'Quién armó tu plan',
      body: '<img src="images/carolina-aula-web.jpg" alt="Carolina" style="width:100%;margin:10px 0;border-radius:16px" />' +
        '<b>Carolina, fundadora del Truco de las Brasileñas</b>, educadora física desde hace <b>más de 15 años</b>, <b>más de 50 mil seguidores</b> en redes y ' +
        '<b>más de 17 mil alumnas</b> en Latinoamérica y el mundo.',
      cta: 'VER MI PLAN',
    },

    // 19 — OFERTA (reconstruida dos prints da pagina de vendas)
    {
      type: 'pitch',
      stepName: 'pitch',
      meterGain: 5,
      title: 'Tu plan {nome_prep} está listo. Mira lo que te llevas 👇',
      pitch: {
        subline: 'Tu primer entrenamiento de {minutos_txt} entra mañana, y los siguientes {horario_txt}.',
        reframe: 'El <b>Reto de 21 Días</b> es el mismo protocolo que Carolina aplica con sus alumnas: ' +
          '<b>{minutos_txt}</b>, en la sala de tu casa, sin gimnasio y sin equipo costoso.',

        printsTitle: 'Lo que las alumnas están enviando al grupo 💬',
        prints: [
          { src: 'images/print-grupo-es-1.webp', w: 900, h: 600 },
          { src: 'images/print-grupo-es-2.webp', w: 900, h: 624 },
          { src: 'images/print-grupo-es-3.webp', w: 900, h: 502 },
        ],

        testimonialsTitle: 'Alumnas que hicieron el Truco de las Brasileñas',
        testimonials: [
          { name: 'Ximena', image: 'images/depo-1-es.webp', text: 'Ya había probado el gimnasio y nada cambiaba. Con el Truco de las Brasileñas mis glúteos ganaron volumen y se levantaron de verdad: hoy el short me queda como siempre quise.' },
          { name: 'Isabella', image: 'images/depoimento-2-es.webp', text: 'No tenía nada de glúteos. Hice el Truco de las Brasileñas en casa y gané forma: quedaron redondos, firmes y en su lugar. Fue lo primero que funcionó conmigo.' },
        ],

        benefitsTitle: 'Lo que consigues en el reto',
        benefits: [
          '<b>Volumen y forma</b> — glúteo más grande y más redondo',
          '<b>Firmeza</b> — adiós flacidez y sustentación débil',
          '<b>Menos celulitis</b> — piel más lisa en la zona',
          '<b>Resultado rápido</b> — cambio visible dentro de los 21 días',
          '<b>Entrenamiento práctico</b> — entrenamientos de {minutos_txt}, en casa, con video de cada ejercicio',
          '<b>Autoestima</b> — ponerte lo que quieras sin pensarlo dos veces',
        ],

        // "Como funciona": video da app + passos + primeira semana + cartoes.
        videosTitle: 'Cómo funciona',
        videoApp: { src: 'videos/app-por-dentro-loop.mp4', poster: 'videos/app-por-dentro-loop.jpg', legenda: 'La app por dentro: cada ejercicio con video y las repeticiones del día.' },
        comoFunciona: {
          passos: [
            'Pago aprobado.',
            'Login en el e-mail y en WhatsApp.',
            'Abre la app y confirma tu tipo.',
            'Día 1 mañana mismo, en {minutos_txt}.',
          ],
          semanaTitulo: 'Tu primera semana, {horario_txt}',
          semanaCab: ['DÍA', 'ENTRENAMIENTO', 'DURACIÓN'],
          adaptacao: 'adaptación',
          semanaNota: 'En tu rango de edad, el día 1 es de adaptación, a un ritmo más suave. Empieza cada entrenamiento con un calentamiento ligero.',
          semana: {
            padrao: 'reto',
            porTipo: {
              reto: ['Puente de glúteos', 'Pulsos de puente', 'Patadas de glúteo (derecha e izquierda)', 'Puente marchando', 'Zancada inversa', 'Combinado: puente, patadas y zancada', 'Descanso activo'],
              quadrado: ['Almeja', 'Hidrante en cuatro apoyos', 'Abducción de pie con banda elástica', 'Caminata lateral con banda elástica', 'Elevación pélvica con banda', 'Combinado: almeja, hidrante y caminata', 'Descanso activo'],
              caido: ['Puente de glúteo isométrico', 'Sentadilla sumo con pausa', 'Peso muerto a una pierna con mochila', 'Caminata lateral con banda elástica', 'Puente de glúteo isométrico', 'Combinado: puente, sumo y peso muerto', 'Descanso activo'],
            },
            duracoes: {
              menos_20: [10, 15, 15, 15, 15, 15, 10],
              '20_30': [20, 25, 25, 25, 25, 25, 10],
              mais_30: [25, 30, 30, 30, 30, 30, 10],
            },
          },
          cards: [
            { titulo: 'Acceso', texto: 'Pago único, sin mensualidad. El acceso a la app (Android e iPhone) se libera después del pago, y el login llega por e-mail y WhatsApp.' },
          ],
        },

        bonusesTitle: 'Y además te llevas 4 bonos gratis',
        bonusDestaque: { selo: 'Hecho para tu caso', padrao: 'receitas' },
        bonuses: [
          {
            name: 'Protocolo Cuádriceps Proporcional',
            description: 'Para que el muslo acompañe al glúteo sin robarle el entrenamiento: la secuencia que equilibra cuádriceps y glúteo.',
            price: '',
          },
          {
            name: 'Protocolo de Muslo Anticelulitis',
            description: 'Secuencia específica para la firmeza del muslo y para que la piel se vea más lisa donde más aparece la celulitis.',
            price: '',
          },
          {
            name: 'Dos Entrenamientos Completos de Tren Superior',
            description: 'Brazos, espalda y hombros en dos entrenamientos listos, para que el resultado sea de todo el cuerpo.',
            price: '',
          },
          {
            id: 'receitas',
            name: '51 Recetas Proteicas',
            description: 'Proteína fácil y barata para que el músculo responda al entrenamiento, sin dieta loca y sin pasar hambre.',
            price: '',
            notaDepois: '{refeicoes_nota}',
          },
        ],

        scarcity: 'Cupos con bonos disponibles <b>solo hoy</b>',

        priceLine: 'De <s>US$ 47,00</s> por solo <b>US$ 12,90</b>',
        priceSub: 'Pago único de US$ 12,90 — menos de US$ 1,00 por día de reto',
        priceNote: 'El valor está en dólares (USD). En la siguiente página se ajusta a tu moneda local.',

        timerMinutes: 10,
        timerNote: 'Este valor con los bonos vence cuando se acabe el tiempo',

        seals: [
          { title: 'Pago único', sub: 'Sin mensualidad ninguna' },
          { title: 'Acceso inmediato', sub: 'La app se abre en el momento del pago' },
        ],

        guaranteeLine: '<b>Garantía del Tacto, 30 días:</b> entras, aplicas el protocolo y, si no sientes el glúteo más firme al tacto ya en la primera semana, ' +
          'pides tu dinero de vuelta en cualquier momento dentro de los 30 días. 100%. El riesgo es nuestro. Cómo pedirla: en el bloque Cómo funciona.',

        commentsTitle: 'Lo que comentaron las alumnas',
        comments: [
          { name: 'Camila', avatar: 'images/comentarios%20q1/1.jpg', text: '¿De verdad es rapidito? Quiero descubrir por dónde empezar.', time: '12 min', likes: 8, replies: [{ name: 'Carolina', text: 'Sí, Camila. Toma cerca de 2 minutos y el resultado considera tus respuestas.', time: '9 min' }] },
          { name: 'Valeria', avatar: 'images/comentarios%20q1/2.jpg', text: 'Me gustó porque las preguntas son muy directas', time: '26 min', likes: 11, replies: [] },
          { name: 'Mariana', avatar: 'images/comentarios%20q1/3.jpg', text: '¿Se puede responder aunque entrene en casa?', time: '41 min', likes: 5, replies: [{ name: 'Carolina', text: 'Sí se puede. El cuestionario considera tu rutina y tu punto de partida.', time: '30 min' }] },
          { name: 'Sofía', avatar: 'images/comentarios%20q1/4.jpg', text: 'Empezando ahora', time: '1 h', likes: 3, replies: [] },
          { name: 'Ximena', avatar: 'images/comentarios%20q1/5.jpg', text: '¿El resultado aparece apenas termine?', time: '1 h', likes: 6, replies: [{ name: 'Carolina', text: 'Sí. Al final recibes la recomendación basada en tus respuestas.', time: '52 min' }] },
          { name: 'Lucía', avatar: 'images/comentarios%20q1/6.jpg', text: '¿Hace falta gimnasio o equipos?', time: '2 h', likes: 4, replies: [{ name: 'Carolina', text: 'No. Hay opciones pensadas para quien entrena en casa y con poco tiempo.', time: '1 h' }] },
          { name: 'Paola', avatar: 'images/comentarios%20q1/7.jpg', text: 'Quiero entender cuál es mi punto de partida', time: '2 h', likes: 9, replies: [] },
          { name: 'Andrea', avatar: 'images/comentarios%20q1/8.jpg', text: 'Acabo de terminar, las preguntas son muy fáciles de responder.', time: '3 h', likes: 7, replies: [] },
          { name: 'Gabriela', avatar: 'images/comentarios%20q1/9.jpg', text: '¿Puedo adaptarlo a los horarios que tengo libres?', time: '4 h', likes: 3, replies: [{ name: 'Carolina', text: 'Sí. Tu disponibilidad forma parte del cuestionario.', time: '3 h' }] },
          { name: 'Natalia', avatar: 'images/comentarios%20q1/10.jpg', text: 'Lo guardé para responderlo con calma esta noche.', time: '5 h', likes: 2, replies: [] },
          { name: 'Karla', avatar: 'images/comentarios%20q1/11.jpg', text: 'Ya voy a empezar', time: '6 h', likes: 5, replies: [] },
        ],

        beforeAfterTitle: 'Resultados reales de alumnas',
        beforeAfterSubtitle: 'Todas entrenando en casa, sin gimnasio',
        beforeAfterImages: [
          { src: 'images/antes-depois-2-web.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', alt: 'Antes y después' },
          { src: 'images/antes-depois-4-web.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', alt: 'Antes y después' },
          { src: 'images/prova-6.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', alt: 'Antes y después' },
          { src: 'images/prova-3.webp', rotulos: true, rotuloA: 'DÍA 1', rotuloB: 'DÍA 21', alt: 'Antes y después' },
        ],

        cta: 'QUIERO ASEGURAR MI CUPO',
      },
    },
  ],
};
