(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var K={ink:'#1f2a44',soft:'rgba(31,42,68,.78)',hair:'rgba(31,42,68,.16)',accent:'#e8457a',lav:'#b9c3e6',mint:'#86cdb8',teal:'#2f7f6c',alert:'#c4566b',amber:'#b07d22',shell:'#1f2a44',paper:'#fbfbfd',vio:'#6f5fb0'};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function fit(cv){var r=cv.getBoundingClientRect(),cw=cv.clientWidth||r.width,z=cv.clientWidth&&r.width?r.width/cv.clientWidth:1,d=(window.devicePixelRatio||1)*(z>.5&&z<4?z:1),h=+(cv.dataset.h||cv.getAttribute('height'));cv.dataset.h=h;
  cv.width=Math.max(1,Math.round(cw*d));cv.height=Math.round(h*d);cv.style.height=h+'px';
  var x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x:x,w:cw,h:h}}
function onView(node,start,stop){if(!('IntersectionObserver'in window)){start();return}
  new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?start():stop()})},{threshold:.05}).observe(node)}
var fmt=function(n){return Math.round(n).toLocaleString('es-MX')};

/* ================= CONTENIDO ================= */
var P=[
{id:'fraude',n:'01',c:K.alert,cs:'rgba(196,86,107,.13)',kick:'Banca digital · 2026',title:'Detección de fraude en transacciones',
 sub:'El proyecto parte de 590,540 transacciones reales en un lakehouse con Spark, Kafka y PostgreSQL.',
 chips:['Datos reales (IEEE-CIS)','Spark + Delta Lake','Kafka','PostgreSQL + data warehouse','Grafos · colas · Bayes'],cover:'f2-anillo',
 tldr:['El fraude es raro: 3.5% de 590,540 transacciones reales de comercio electrónico (Vesta, IEEE-CIS). Un equipo de riesgos no puede revisarlo todo, y el monto por sí solo no distingue el fraude (ROC-AUC 0.50).',
       'Construí un medallón con datos reales de Vesta: bronze → silver → gold en Delta Lake, partición por tiempo, etiquetas que llegan con 30 días de retraso, un solo módulo de variables para batch y streaming, y PostgreSQL para operar y analizar.',
       'Resultado: revisando 3.35% de las transacciones se atrapa 53.6% del fraude (PR-AUC 0.558). Ordenando por pérdida esperada, el mismo equipo recupera 63% del dinero en lugar de 42%.'],
 kpis:[['590,540','transacciones reales, 3.5% fraude'],['0.558','PR-AUC en el último mes de prueba'],['63%','del dinero recuperado revisando 3.35%'],['0','diferencia entre batch y streaming']],
 steps:[
  ['Datos reales','Los datos de Vesta','590,540 transacciones de comercio electrónico (competencia IEEE-CIS) con 434 columnas anonimizadas. Aquí el monto solo no distingue nada: ROC-AUC de 0.50.','Partición por tiempo: entreno días 1–120, validación 121–150, prueba 151–183. Con partición aleatoria el PR-AUC sube a 0.85 porque 84% de los fraudes de prueba vienen de clientes ya vistos defraudando.',null],
  ['Lakehouse','Bronze, silver y gold en Delta Lake','Bronze guarda los CSV tal cual; silver une, limpia y corre pruebas de calidad que quedan registradas en su propia tabla; gold calcula las variables con ventanas de Spark que solo miran el pasado.','Cada fraude se “confirma” 30 días después, como un contracargo real. Verificado: cero etiquetas del mes de prueba visibles al calcular variables.',null],
  ['Matemáticas discretas','Anillos de fraude en un grafo','Grafo bipartito de clientes y huellas de dispositivo. Encontré 219 componentes con dos o más defraudadores, contra 74 esperadas al azar según un modelo nulo.','Solo aparecen con la huella fina (modelo + navegador + resolución + sistema). Dentro de los anillos el fraude es 13% contra 6% de base.','f2-anillo'],
  ['Modelos','Ablación honesta en Spark MLlib','Comparé árboles (GBT) con tres conjuntos de variables y una regresión logística, y elegí por el mes de validación. Ganó la logística: PR-AUC 0.558, ROC-AUC 0.922.','Agregar el historial del cliente empeoró el GBT, y el grafo y Poisson casi no pesan. La versión “estilo Kaggle”, que usa datos del futuro, sacó 0.390: el 0.96 de la competencia no se puede llevar a producción.','f2-modelos'],
  ['Decisión','Bayes, mochila y colas','Regla de Bayes: revisar si probabilidad × monto supera el costo de revisar. Con capacidad fija es un problema de mochila: ordenar por pérdida esperada recupera 63% del dinero contra 42% por probabilidad.','Teoría de colas M/M/c: unas 104 alertas al día piden de 1 a 3 analistas según la hora. Una simulación Monte Carlo confirma la fórmula de Erlang C.','f2-decision'],
  ['Streaming','Kafka, el mismo código y una prueba','Spark Structured Streaming lee el mes de prueba desde Kafka en micro-lotes, calcula las variables con el mismo módulo que el entrenamiento, puntúa y escribe en Delta y en PostgreSQL.','Una prueba automática compara batch contra streaming: diferencia máxima 0 en 94,635 transacciones. Así lo que se evalúa en entrenamiento es lo mismo que corre en producción.',null],
  ['Cómputo cognitivo','Cada alerta llega explicada','En PostgreSQL cada alerta trae una explicación en español (“el cliente ya tuvo fraude confirmado; en ese grupo el fraude es 27 veces más común”), los 7 casos resueltos más parecidos y una acción sugerida por reglas.','De las alertas marcadas “Bloquear”, 86% eran fraude real. Los casos parecidos no mejoran el orden (ROC-AUC 0.877 vs 0.881): ayudan a decidir, no a predecir.',null]],
 gal:[['f2-anillo','Un anillo: 13 clientes con fraude que comparten dispositivos'],['f2-modelos','Ablación de modelos y de dónde aprende el GBT'],['f2-decision','Costo por umbral, mochila con capacidad y analistas por hora']],
 lim:'Solo usé 20 de las 339 columnas V, y el GBT de Spark se detiene temprano (26–79 árboles), por eso perdió contra la logística. El costo de revisión ($3) y los 10 minutos por caso son supuestos. El cliente (UID) es una aproximación porque Vesta no publica un ID. La precisión baja de 46% a ~33% conforme pasan las semanas: el umbral hay que recalibrarlo.',
 repo:['https://github.com/Zidnz/scripts_PP','github.com/Zidnz/scripts_PP'],sim:'fraude',simT:'Simulador: mismo equipo, distinto criterio',simH:'Tienes analistas para revisar solo una parte de las transacciones. Elige cómo ordenar la cola y cuánto puedes revisar. Mira cuántos fraudes atrapas y cuánto dinero salvas.'},

{id:'milpin',n:'02',c:K.teal,cs:'rgba(47,127,108,.13)',kick:'AgTech · 2026',title:'MILPÍN, riego inteligente',
 sub:'Sistema de apoyo a decisiones de riego para el Distrito de Riego 041, Valle del Yaqui, Sonora.',
 chips:['MVP desplegado','FastAPI','PostgreSQL + PostGIS','XGBoost + SHAP','scikit-learn','Leaflet'],cover:'m-app',
 tldr:['Regar de más cuesta agua y energía de bombeo. La meta: bajar de 8,000 a 6,000 m³ por hectárea por ciclo, un ahorro de $3,360 MXN por hectárea.',
       'Programamos el modelo agronómico FAO-56, lo montamos sobre una base geoespacial y una API, y lo rodeamos de modelos que pronostican demanda y detectan riegos anómalos.',
       'Un MVP en producción con mapa de parcelas, recomendación diaria de lámina de riego, asistente de voz y 115 pruebas automáticas.'],
 kpis:[['25%','meta de ahorro de agua por ciclo'],['115','pruebas automáticas (108 backend, 7 ML)'],['5','cultivos: maíz, frijol, algodón, uva y chile'],['800','ciclos agrícolas sintéticos para entrenar']],
 steps:[
  ['Meta','Agua, energía y dinero','En el DR-041 el agua se bombea desde 80 m. Cada metro cúbico cuesta alrededor de $1.68 MXN de energía, así que 2,000 m³ menos por hectárea se notan en el recibo.',null,null],
  ['FAO-56','El motor agronómico','La evapotranspiración de referencia (ETo) se calcula con Penman-Monteith. Si faltan datos de radiación o humedad, el sistema cae a Hargreaves, que solo necesita temperaturas.','Comparamos ambos: coinciden con R² de 0.963 y Hargreaves subestima en verano, con un sesgo medio de −0.53 mm por día.','m-pm'],
  ['Balance','Balance hídrico diario','Cada cultivo tiene su curva Kc por etapa. ETc = Kc × ETo dice cuánta agua pierde el suelo cada día; cuando la humedad cruza el umbral, toca regar hasta capacidad de campo.','La humedad inicial se propaga día a día desde el último riego real, en lugar de suponer un punto medio.','m-balance'],
  ['Datos','Una base que entiende de mapas','PostgreSQL con PostGIS: 7 tablas, 2 vistas de KPI y parcelas guardadas como polígonos con índice espacial. Cuatro migraciones versionadas con Alembic.','Para entrenar se generaron 800 ciclos sintéticos, 160 por cultivo, con el propio motor FAO-56.','m-kc'],
  ['Modelos','Aprendizaje automático alrededor del motor','XGBoost predice consumo de agua y rendimiento, con SHAP para explicar cada predicción. Una regresión Ridge proyecta la ETo a 7 días, un Isolation Forest marca riegos anómalos y K-Means agrupa parcelas en zonas de manejo.',null,'m-shap'],
  ['Auditoría','Cazamos nuestra propia fuga','El primer modelo daba R² de 0.999. Sospechoso. Al quitar las variables derivadas del volumen teórico, el R² cayó a 0.59 y el error subió de 42 a 733 m³ por hectárea.','El modelo estaba copiando la respuesta. Documentar esa caída vale más que presumir el 0.999.','m-leak'],
  ['Producto','De la ecuación a la parcela','API en FastAPI con 6 routers, mapa en Leaflet servido desde PostGIS, lista priorizada de parcelas por urgencia y comandos de voz en español. Desplegado en Netlify, Railway y Supabase.',null,'m-app']],
 gal:[['m-app','Diseño de la app: tablero, mapa, recomendación y configuración'],['m-kc','Curvas Kc por cultivo y etapa'],['m-balance','Balance hídrico de 60 días: humedad, ETc y riegos'],['m-pm','Penman-Monteith contra Hargreaves'],['m-shap','Importancia global y SHAP del modelo de consumo'],['m-leak','Efecto de la fuga de información en las métricas'],['m-dash','Tablero de métricas del modelo v4']],
 lim:'El motor FAO-56 es real; los datos de parcelas, clima e historial son sintéticos. Las métricas de los modelos todavía no dicen nada sobre un productor real. XGBoost está entrenado pero aún no conectado a la API, y el catálogo de cultivos es una decisión académica: en el DR-041 real predominan trigo, cártamo y garbanzo.',
 repo:['https://github.com/Zidnz/Milpin-pp26-v.1-','github.com/Zidnz/Milpin-pp26-v.1-'],sim:'milpin',simT:'Simulador: 60 días en una parcela',simH:'Elige cultivo, etapa y clima. La gráfica muestra cómo baja la humedad del suelo cada día y cuándo toca regar. Es la misma lógica del motor, con la ecuación de Hargreaves.'},

{id:'observatorio',n:'03',c:K.vio,cs:'rgba(111,95,176,.14)',kick:'Política social · 2026, en curso',title:'Observatorio de la Economía del Cuidado',
 sub:'Datos para diseñar un programa de relevo por horas para quienes cuidan en casa, sin pago, a personas con discapacidad o adultas mayores.',
 chips:['Equipo de 3 · líder','ENASIC 2022','Censo 2020','Python + R','SQLite','HTML, CSS y JS'],cover:'o-home',
 tldr:['El programa tendría cupo limitado. Hay que decidir a quién ofrecer primero el relevo y en qué zonas pilotear, y poder defender esa decisión con datos públicos.',
       'Integramos encuestas y censos en un almacén de indicadores, probamos si un modelo ordena mejor que una regla simple, tipificamos el territorio y lo publicamos en un observatorio web.',
       'Ningún modelo superó de forma demostrable a la regla de 40 horas de cuidado a la semana. Nos quedamos con la regla, que cualquiera puede entender.'],
 kpis:[['29','fuentes de datos inventariadas'],['21','indicadores con ficha y precisión'],['2,371','AGEB urbanas tipificadas en 4 grupos'],['≈ 7 pp','diferencia mínima que la muestra permite notar']],
 steps:[
  ['Pregunta','¿A quién primero y dónde?','El programa propuesto da de 3 a 12 horas semanales de relevo a cuidadoras familiares de alta intensidad. Con cupo limitado, el orden importa, y una regla que nadie entiende no se puede defender ante quien queda fuera.',null,'o-home'],
  ['Fuentes','Datos públicos, uno por uno','Microdatos de la ENASIC 2022 para saber quién cuida y qué le cuesta, Censo 2020 por AGEB para el territorio, DENUE para la oferta de servicios, y CONEVAL y CONAPO para pobreza y marginación.','Cada cifra del sitio declara su fuente y qué tan precisa es.','o-terr'],
  ['Almacén','Un almacén de indicadores','SQLite con esquema estrella: 4 tablas de hechos, 10 dimensiones y 3 data marts (necesidad de cuidado, territorio y oferta, asequibilidad). Las reglas de calidad viven en el ETL: si una cifra no cumple, la carga se detiene.',null,'o-dw'],
  ['Diagnóstico','El escalón de las 40 horas','Antes de modelar miramos la forma del problema. Debajo de 40 horas semanales de cuidado, cerca de la mitad declara algún daño; arriba de 40, salta a entre 73% y 82%.','Ese escalón es la razón por la que una regla simple funciona tan bien.','o-horas'],
  ['Modelos','Regla contra modelos, con las reglas fijadas antes','Preregistramos objetivo, cupo y umbrales antes de ver resultados. Luego comparamos regresión logística y una tarjeta de puntos contra la regla de 40 horas, con validación agrupada por unidad de muestreo.','Logística: −0.3 puntos (de −5.1 a +4.4). Tarjeta: −1.4 (de −6.1 a +3.4). Los intervalos cruzan el cero: no hay ganador.','o-v2'],
  ['Territorio','Cuatro tipos de zona','K-means sobre 9 indicadores del Censo agrupa las AGEB urbanas de la CDMX en 4 tipos, desde periferia joven con carencias hasta zonas centrales de alta escolaridad. Sirve para elegir dónde pilotear y a dónde se podrían extrapolar los resultados.',null,'o-mapa'],
  ['Producto','Observatorio y app','Un sitio de 8 pestañas hecho sin framework, con mapas y gráficas en SVG, y un prototipo de la app RedCare (datos simulados) que aplica la priorización como una regla transparente.',null,'o-cola']],
 gal:[['o-home','Portada del Observatorio'],['o-nodos','Evidencia del modelo como mapa de nodos'],['o-terr','Oferta, dependencia y vulnerabilidad por alcaldía'],['o-mapa','Tipología de AGEB urbanas (k = 4)'],['o-horas','Daño declarado por horas de cuidado'],['o-v2','Regla de 40 horas contra modelos, con IC de 90%'],['o-arq','Arquitectura en tres capas'],['o-dw','Almacén: hechos, dimensiones y data marts'],['o-cola','App RedCare: cola de solicitudes'],['o-res','App RedCare: resultado de la entrevista']],
 lim:'Cifras preliminares, pendientes de segunda revisión dentro del equipo. Con 1,043 personas en la muestra solo se notan diferencias de unos 7 puntos, así que el veredicto correcto es «no concluyente», no «el modelo es peor». La ENASIC solo permite concluir a nivel nacional, no por alcaldía, y el daño es declarado, no medido.',
 repo:['https://github.com/Zidnz/pp26-2','github.com/Zidnz/pp26-2'],sim:'obs',simT:'Mapa de nodos: ¿quién encuentra más?',simH:'Todos los métodos eligen a la misma fracción de personas (40.7%). La pregunta es cuántas de las 495 personas con daño a su salud quedan dentro. Toca cada nodo.'},

{id:'qchaucoin',n:'04',c:K.amber,cs:'rgba(176,125,34,.15)',kick:'Fintech · 2025',title:'QchauCoin, una stablecoin simulada',
 sub:'Una moneda estable mexicana de laboratorio: blockchain propia, monedero web y tres análisis cuantitativos de su estabilidad.',
 chips:['Proyecto académico','Node.js + Express','MongoDB','RSA 2048 + JWT','Keras','R'],cover:'q-sim-cover',app:'qchaucoin/',
 tldr:['Una moneda estable solo sirve si es segura y si vuelve a su precio objetivo después de un susto. ¿Cómo se construye eso y de qué depende?',
       'Programamos la cadena de bloques, las firmas y el monedero, y estudiamos la estabilidad con estadística multivariada, una red neuronal y una ecuación diferencial.',
       'Un sistema completo de punta a punta, del registro del usuario al bloque minado, más un modelo que muestra cuánto tarda el precio en recuperarse.'],
 kpis:[['SHA-256','encadena cada bloque con el anterior'],['RSA 2048','firma de cada transacción'],['7→16→8→1','red neuronal que clasifica riesgo'],['180','días de precio simulados']],
 steps:[
  ['Identidad','Registro y llaves','Al registrarse, el usuario recibe un par de llaves RSA de 2048 bits. La privada se entrega una sola vez y no se guarda en el servidor. Contraseñas con bcrypt y sesiones con JWT.',null,'q-sim-llave'],
  ['Firma','Cada pago va firmado','Para enviar monedas, el usuario firma la transacción con su llave privada. El servidor verifica la firma con la llave pública antes de tocar cualquier saldo.',null,'q-sim-firma'],
  ['Bloques','La cadena','Cada bloque guarda su índice, sus transacciones, el hash del bloque anterior y su propio hash SHA-256. Cambiar un bloque viejo rompe todos los que siguen.','Débito, crédito y minado del bloque ocurren en una sola transacción atómica de MongoDB: o pasa todo o no pasa nada.','q-sim-cadena'],
  ['Estadística','¿Qué distingue a una moneda estable?','En R: matriz de correlación, PCA y k-means sobre variables financieras de stablecoins. El respaldo en dinero fiat se asocia con menor volatilidad (−0.91) y la volatilidad con mayor riesgo (0.87).',null,'q-heat'],
  ['Red neuronal','Clasificador de riesgo','Una red densa en Keras con 7 entradas financieras, dos capas ocultas de 16 y 8 neuronas y una salida que estima la probabilidad de riesgo alto.',null,'q-red'],
  ['Dinámica','El precio como ecuación diferencial','dP/dt = α(R − P) + βD(t) − γI(t). El respaldo jala el precio hacia su objetivo R, la demanda lo empuja y la inflación lo erosiona. Resuelta por el método de Euler para 180 días.',null,'q-disp']],
 gal:[['q-sim-wallet','Wallet simulada: saldo, contactos y envío firmado'],['q-sim-firma','Cada pago: firma RSA, verificación y bloque nuevo'],['q-sim-cadena','Cadena alterada: el hash ya no coincide y el enlace se rompe'],['q-sim-llave','La llave privada se muestra una sola vez'],['q-red','Arquitectura de la red neuronal de riesgo'],['q-heat','Correlaciones entre variables financieras'],['q-radar','Perfil de QchauCoin'],['q-disp','Volatilidad contra liquidez por stablecoin']],
 lim:'Es un proyecto académico, no una moneda: no mueve dinero real. La red neuronal se entrenó con variables simuladas y normalizadas, así que su valor está en el flujo de trabajo y no en sus predicciones. La cadena no tiene prueba de trabajo ni red de nodos; es una sola cadena en un servidor.',
 repo:['https://github.com/Zidnz/Moneda-Digital-','github.com/Zidnz/Moneda-Digital-'],sim:'qchau',simT:'Simuladores: rompe la cadena y aguanta el pánico',simH:'Dos experimentos. Arriba, una cadena de bloques en miniatura: envía transacciones y luego altera una vieja. Abajo, el modelo de precio del proyecto con un pánico en el día 60.'}
];

/* ================= LIGHTBOX ================= */
var lb=$('lb');
function zoom(src,cap){$('lb-img').src='assets/img/'+src+'.webp';$('lb-img').alt=cap;$('lb-cap').textContent=cap;if(lb.showModal)lb.showModal();else lb.setAttribute('open','')}
$('lb-x').onclick=function(){lb.close()};
lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});

/* ================= DATOS EXTRA: herramientas, pipelines y modelos de datos ================= */
function ic(n){return '<svg class="ic" aria-hidden="true"><use href="#i-'+n+'"/></svg>'}
var X={
fraude:{card:['Banca digital','Lakehouse + streaming','590,540 transacciones reales'],
 tools:[['py','Python'],['spark','PySpark 4'],['layers','Delta Lake'],['stream','Kafka'],['db','PostgreSQL'],['tree','Spark MLlib'],['net','networkx'],['chart','SciPy (Poisson, Erlang C)']],
 pipe:[['doc','CSV de Vesta','IEEE-CIS, 434 columnas','datos crudos'],['layers','Bronze → Silver','Delta Lake + pruebas de calidad','datos limpios'],['spark','Gold','Ventanas de Spark, solo pasado','105 variables'],['tree','Modelo','Logística en MLlib + Platt','probabilidad calibrada'],['stream','Kafka','Structured Streaming','mismo features.py'],['db','PostgreSQL','operacion.alertas + dw.*','alertas explicadas'],['screen','Analista','Cola por pérdida esperada','qué revisar primero']],
 funnel:{t:'Embudo del mes de prueba (streaming)',d:[['Transacciones del mes',94635],['Alertas del modelo',3426],['Fraudes en las alertas',1156],['Marcadas “Bloquear”',726]],n:'El alto de cada bloque usa escala de raíz cuadrada para que los bloques pequeños sigan siendo visibles.'},
 sn:'Tres capas: tablas Delta para el lakehouse, una tabla operativa en PostgreSQL para el analista y un data warehouse en estrella para el negocio.',
 schema:[['layers','gold.atributos','Delta',[['TransactionID','int','PK'],['uid','string'],['particion','entreno · validación · prueba'],['n_1h, n_24h','int'],['sorpresa_poisson','double'],['grado_dispositivo','int'],['riesgo_tarjeta','double (30 días de retraso)'],['+ 98 variables','']]],
  ['db','operacion.alertas','PostgreSQL',[['alerta_id','bigserial','PK'],['transaction_id','bigint único'],['prob','0 a 1'],['perdida_esperada','numeric'],['estado','pendiente · fraude · descartada'],['explicacion','texto'],['casos_similares','texto'],['accion_sugerida','texto']]],
  ['db','dw.fact_transaccion','estrella',[['id_tiempo','int','FK'],['id_producto','int','FK'],['id_tarjeta','int','FK'],['id_canal','int','FK'],['id_email','int','FK'],['monto','numeric'],['es_fraude','0 / 1'],['prob_modelo','double']]]],
 facts:[['590,540','transacciones reales'],['11','pasos reproducibles'],['94,635','eventos por Kafka'],['3,426','alertas explicadas']]},
milpin:{card:['AgTech','Modelo físico + ML','800 ciclos, 5 cultivos'],
 tools:[['py','Python'],['api','FastAPI'],['db','PostgreSQL'],['map','PostGIS'],['tree','XGBoost + SHAP'],['chart','scikit-learn'],['map','Leaflet'],['cloud','Netlify · Railway · Supabase']],
 pipe:[['cloud','Clima diario','Tabla clima_diario','temperatura y radiación'],['drop','Motor FAO-56','Penman-Monteith o Hargreaves','ETo y ETc'],['db','PostgreSQL + PostGIS','7 tablas y 2 vistas','balance por parcela'],['tree','Modelos','Ridge, Isolation Forest, K-Means','pronóstico y anomalías'],['api','API FastAPI','6 routers','JSON y GeoJSON'],['map','Mapa y voz','Leaflet y Web Speech','recomendación de riego']],
 sn:'Modelo relacional en PostgreSQL. Las parcelas son polígonos con índice espacial; todo cuelga de ellas.',
 schema:[['db','usuarios','tabla',[['id_usuario','uuid','PK'],['nombre_completo','varchar'],['email','varchar único'],['rol','varchar'],['modulo_dr041','varchar']]],
  ['db','cultivos_catalogo','tabla',[['id_cultivo','uuid','PK'],['nombre_comun','varchar'],['kc_inicial · kc_medio · kc_final','numeric'],['ky_total','numeric'],['dias_etapa_*','integer × 4']]],
  ['map','parcelas','tabla',[['id_parcela','uuid','PK'],['id_usuario','uuid','FK'],['id_cultivo_actual','uuid','FK'],['geom','Polygon 4326'],['area_ha','numeric'],['capacidad_campo','numeric'],['punto_marchitez','numeric'],['sistema_riego','varchar']]],
  ['cloud','clima_diario','tabla',[['id_parcela','uuid','PK·FK'],['fecha','date','PK'],['variables de clima','numeric']]],
  ['drop','recomendaciones','tabla',[['id_recomendacion','uuid','PK'],['id_parcela','uuid','FK'],['id_cultivo','uuid','FK'],['lamina_recomendada_mm','numeric'],['eto_referencia','numeric'],['etc_calculada','numeric'],['nivel_urgencia','crítico / moderado / preventivo'],['aceptada','estado']]],
  ['db','historial_riego','tabla',[['id_riego','uuid','PK'],['id_parcela','uuid','FK'],['id_recomendacion','uuid','FK'],['fecha_riego','date'],['volumen_m3_ha','numeric'],['origen_decision','sistema / manual / voz']]],
  ['db','costos_ciclo','tabla',[['id_costo','uuid','PK'],['id_parcela','uuid','FK'],['ciclo_agricola','varchar'],['volumen_agua_total_m3','numeric'],['costo_agua_mxn','numeric']]],
  ['chart','v_agua_disponible · v_kpi_consumo','vistas',[['agua disponible por parcela','vista'],['consumo contra la línea base del DR-041','vista']]]],
 facts:[['7 + 2','tablas y vistas'],['4','migraciones con Alembic'],['GIST','índice espacial en parcelas.geom'],['14+','endpoints CRUD']]},
observatorio:{card:['Política social','Inferencia y focalización','ENASIC 2022 y Censo 2020'],
 tools:[['py','Python'],['r','R'],['survey','ENASIC 2022'],['db','SQLite'],['tree','scikit-learn'],['js','HTML, CSS y JS'],['chart','Power BI']],
 pipe:[['survey','Fuentes públicas','ENASIC, Censo, DENUE, CONEVAL','microdatos y CSV'],['py','Notebooks A a D','Python y R','resultados/*.csv'],['filter','ETL con pruebas','run_etl.py','linaje y rechazos'],['db','Almacén SQLite','Esquema estrella','4 hechos, 10 dimensiones'],['cube','3 data marts','Vistas planas','CSV para Excel y Power BI'],['screen','Observatorio web','HTML, CSS, JS y SVG','21 indicadores con ficha']],
 sn:'Esquema estrella. Elige una tabla de hechos para ver qué dimensiones la describen. Cuatro tablas de control (etl_run, etl_archivo, etl_rechazo, etl_dq) guardan el linaje y el resultado de cada prueba de calidad.',
 star:{dims:['dim_tiempo','dim_fuente','dim_geografia','dim_precision','dim_indicador','dim_segmento','dim_medida','dim_paquete','dim_salario_ref','dim_ingreso_ref'],
  facts:[['fact_estimacion_encuesta','965 filas · una cifra de encuesta con su IC',[0,1,2,3,4,5]],['fact_indicador_territorial','878 filas · una medida por alcaldía o entidad',[0,1,2,3,6]],['fact_asequibilidad','150 filas · quién puede pagar un paquete de relevo',[7,8,9]],['fact_costo_paquete','50 filas · costo del paquete por salario de referencia',[2,7,8,9]]]},
 schema:[],
 facts:[['4','tablas de hechos'],['10','dimensiones'],['3','data marts'],['4','tablas de control del ETL']]},
qchaucoin:{card:['Fintech','Criptografía y simulación','180 días de precio simulado'],
 tools:[['js','Node.js + Express'],['doc','MongoDB'],['key','RSA 2048'],['lock','JWT + bcrypt'],['net','Keras'],['r','R'],['py','Python']],
 pipe:[['key','Registro','bcrypt + par RSA 2048','llave privada, una sola vez'],['lock','Login','JWT de 1 hora','token de sesión'],['sign','Firma','Llave privada del usuario','transacción firmada'],['api','API Express','Verifica la firma','firma válida'],['doc','MongoDB','Transacción atómica','débito y crédito'],['chain','Bloque','Hash SHA-256','cadena actualizada']],
 sn:'Dos colecciones en MongoDB. El saldo vive en el usuario; la historia inmutable vive en los bloques.',
 schema:[['doc','usuarios','colección',[['_id','ObjectId','PK'],['nombre','string'],['email','string'],['password','hash bcrypt'],['publicKey','PEM'],['publicKeyCleaned','string'],['balance','number, inicia en 100'],['transacciones','array']]],
  ['chain','bloques','colección',[['indice','number','PK'],['transacciones','array'],['hashAnterior','SHA-256','FK'],['hashActual','SHA-256']]]],
 facts:[['6','endpoints REST'],['2','colecciones'],['100 QC','saldo inicial por usuario'],['250','épocas de entrenamiento de la red']]}
};
var HOME={id:'inicio',c:K.accent,cs:'rgba(232,69,122,.12)'};

if(window.LANG==='en')I18N.apply(P,X);
/* ================= RENDER POR PESTAÑAS ================= */
var root=$('missions'),tabs=$('tabs'),sims={},views={inicio:$('view-inicio')},tabBtn={};
function mkTab(id,label,c){var b=el('button',null,'<i></i>'+label);b.type='button';b.setAttribute('role','tab');b.style.setProperty('--tc',c);b.onclick=function(){go(id)};tabs.appendChild(b);tabBtn[id]=b}
function theme(p){var s=document.body.style;s.setProperty('--pc',p.c);s.setProperty('--pc-soft',p.cs);s.setProperty('--tint',p.cs.replace(/[\d.]+\)$/,'.34)'))}
function go(id,keep){if(!views[id])id='inicio';
  Object.keys(views).forEach(function(k){views[k].hidden=k!==id;tabBtn[k].setAttribute('aria-selected',k===id)});
  theme(id==='inicio'?HOME:P.filter(function(p){return p.id===id})[0]);
  try{if(location.hash!=='#'+id)history.replaceState(null,'','#'+id)}catch(e){try{location.hash=id}catch(e2){}}
  if(!keep)window.scrollTo(0,0);
  if(tabBtn[id].scrollIntoView)tabBtn[id].scrollIntoView({block:'nearest',inline:'center'});
  setTimeout(function(){window.dispatchEvent(new Event('resize'))},30)}
mkTab('inicio','Inicio',K.accent);
var short={fraude:'Fraude',milpin:'MILPÍN',observatorio:'Observatorio',qchaucoin:'QchauCoin'};

function funnel(f,c){var d=f.d,mx=Math.sqrt(d[0][1]),W=640,bw=118,gap=(W-bw*d.length)/(d.length-1),H=190,cy=96,s='<svg class="fun" viewBox="0 0 '+(W+48)+' '+H+'" style="width:100%;min-width:520px;height:auto;display:block" role="img" aria-label="'+f.t+'">';
  d.forEach(function(it,i){var h=Math.max(30,130*Math.sqrt(it[1])/mx),x=24+i*(bw+gap);
    if(i<d.length-1){var h2=Math.max(30,130*Math.sqrt(d[i+1][1])/mx);s+='<polygon points="'+(x+bw)+','+(cy-h/2)+' '+(x+bw+gap)+','+(cy-h2/2)+' '+(x+bw+gap)+','+(cy+h2/2)+' '+(x+bw)+','+(cy+h/2)+'" fill="'+c+'" opacity=".22"/>'}
    s+='<rect x="'+x+'" y="'+(cy-h/2)+'" width="'+bw+'" height="'+h+'" rx="8" fill="'+c+'" opacity="'+(1-.14*i)+'" stroke="'+K.ink+'" stroke-width="2"/><text class="fv" x="'+(x+bw/2)+'" y="'+(cy+6)+'" text-anchor="middle">'+it[1].toLocaleString('es-MX')+'</text><text class="fl" x="'+(x+bw/2)+'" y="'+(H-6)+'" text-anchor="middle">'+it[0]+'</text>'});
  return s+'</svg>'}
function tblHTML(t){return '<div class="tbl"><h5>'+ic(t[0])+t[1]+'<span>'+t[2]+'</span></h5><ul>'+t[3].map(function(f){return '<li'+(f[1]?'':' class="more"')+'>'+f[0]+(f[2]?'<u>'+f[2]+'</u>':'')+'<span>'+f[1]+'</span></li>'}).join('')+'</ul></div>'}

P.forEach(function(p){var x=X[p.id];
  mkTab(p.id,p.n+' '+short[p.id],p.c);
  var s=el('section','view mission');s.id='view-'+p.id;s.hidden=true;s.style.setProperty('--pc',p.c);s.style.setProperty('--pc-soft',p.cs);views[p.id]=s;
  var w=el('div','wrap'),b=el('div','box');s.appendChild(w);w.appendChild(b);b.appendChild(el('div','win','<span>mision_'+p.n+'_'+p.id+'.exe</span><b><i>–</i><i>□</i><i>×</i></b>'));
  var h=el('div','m-head','<div><div class="m-n"><span>'+p.n+'</span><p class="kick">Misión '+p.n+' de 04 · '+p.kick+'</p></div><h2>'+p.title+'</h2><p class="msub">'+p.sub+'</p><div class="chips"><span class="chip s">'+ic('flag')+p.chips[0]+'</span>'+x.tools.map(function(t){return '<span class="chip">'+ic(t[0])+t[1]+'</span>'}).join('')+'</div></div>');
  var cv=el('button','cover','<img src="assets/img/'+p.cover+'.webp" alt="'+p.title+'">');cv.type='button';cv.onclick=function(){zoom(p.cover,p.title)};h.appendChild(cv);b.appendChild(h);

  /* HUD: subpestañas + progreso */
  var defs=[['res','flag','Resumen'],['rec','path','Recorrido'],['dat','db','Datos y pipeline'],['sim','play','Simulador'],['gal','img','Galería']],panels={},seen={};
  var hud=el('div','hud2'),sub=el('div','sub');sub.setAttribute('role','tablist');hud.appendChild(sub);
  var xp=el('div','xp','<span>Explorado <b class="num">1/5</b></span><div class="bar"><i></i></div>');hud.appendChild(xp);b.appendChild(hud);
  function open(k){seen[k]=1;var n=Object.keys(seen).length;
    defs.forEach(function(d,i){panels[d[0]].hidden=d[0]!==k;sub.children[i].setAttribute('aria-selected',d[0]===k);sub.children[i].classList.toggle('seen',!!seen[d[0]])});
    xp.querySelector('b').textContent=n===5?'misión completa':n+'/5';xp.querySelector('i').style.width=(n*20)+'%';
    setTimeout(function(){window.dispatchEvent(new Event('resize'))},30)}
  defs.forEach(function(d){var t=el('button',null,ic(d[1])+d[2]);t.type='button';t.setAttribute('role','tab');t.onclick=function(){open(d[0])};sub.appendChild(t);
    var pn=el('div','panel');pn.hidden=true;panels[d[0]]=pn;b.appendChild(pn)});

  /* 1 resumen */
  var r=panels.res;
  r.appendChild(el('div','tldr',['Jefe final: el problema','Estrategia: lo que hicimos','Botín: el resultado'].map(function(t,i){return '<div class="tl"><h4>'+t+'</h4><p>'+p.tldr[i]+'</p></div>'}).join('')));
  r.appendChild(el('h3','sec','Logros'));
  r.appendChild(el('div','kpis',p.kpis.map(function(k){return '<div class="kpi"><b class="num">'+k[0]+'</b><small>'+k[1]+'</small></div>'}).join('')));
  r.appendChild(el('div','foot3','<div class="lim"><h4>Puntos débiles, dicho sin rodeos</h4><p>'+p.lim+'</p></div><div class="meta"><h4>Código</h4><p>Todo el código, los notebooks y la documentación están en el repositorio.</p><p style="margin-top:8px"><a href="'+p.repo[0]+'" target="_blank" rel="noopener noreferrer">'+p.repo[1]+'</a></p>'+(p.app?'<p style="margin-top:8px"><a href="'+p.app+'" target="_blank" rel="noopener">'+T('Abrir la wallet simulada ↗')+'</a></p>':'')+'</div>'));
  var nx=el('div','cta');nx.innerHTML='<button class="pill go" type="button">Siguiente: recorrido →</button>';nx.firstChild.onclick=function(){open('rec')};r.appendChild(nx);

  /* 2 recorrido */
  var rc=panels.rec;rc.appendChild(el('h3','sec','Recorrido del proyecto'));rc.appendChild(el('p','sech','Toca cada nodo para ver qué se hizo en esa etapa.'));
  var flow=el('div','flow');flow.setAttribute('role','tablist');rc.appendChild(flow);var step=el('div','step');rc.appendChild(step);var cur=0;
  function show(i){cur=i;var st=p.steps[i];
    [].forEach.call(flow.children,function(n,j){n.setAttribute('aria-selected',j===i);n.classList.toggle('done',j<=i)});
    step.className='step'+(st[4]?'':' solo');
    step.innerHTML='<div><p class="kick">Paso '+(i+1)+' de '+p.steps.length+' · '+st[0]+'</p><h4>'+st[1]+'</h4><p>'+st[2]+'</p>'+(st[3]?'<p>'+st[3]+'</p>':'')+
      '<div class="nav"><button class="pill" type="button" data-d="-1"'+(i?'':' disabled')+'>← Anterior</button><button class="pill go" type="button" data-d="1"'+(i<p.steps.length-1?'':' disabled')+'>Siguiente →</button></div></div>'+
      (st[4]?'<button class="fig" type="button" aria-label="Ampliar figura"><img src="assets/img/'+st[4]+'.webp" alt="'+st[1]+'"></button>':'');
    var f=step.querySelector('.fig');if(f)f.onclick=function(){zoom(st[4],st[1])}}
  step.addEventListener('click',function(e){var t=e.target.closest('[data-d]');if(t&&!t.disabled){show(cur+(+t.dataset.d));var n=flow.children[cur];if(n.scrollIntoView)n.scrollIntoView({block:'nearest',inline:'center'})}});
  p.steps.forEach(function(st,i){var n=el('button','fn','<i>'+(i+1)+'</i><span>'+st[0]+'</span>');n.type='button';n.setAttribute('role','tab');n.onclick=function(){show(i)};flow.appendChild(n)});
  show(0);

  /* 3 datos y pipeline */
  var d=panels.dat;d.appendChild(el('h3','sec','Pipeline de datos'));d.appendChild(el('p','sech','De dónde sale cada dato, por qué herramienta pasa y qué entrega cada etapa.'));
  d.appendChild(el('div','pipe',x.pipe.map(function(s,i){return '<div class="pst" style="--i:'+i+'"><span class="n">ETAPA '+(i+1)+'</span><span class="ib">'+ic(s[0])+'</span><b>'+s[1]+'</b><small>'+s[2]+'</small><em>→ '+s[3]+'</em></div>'}).join('')));
  if(x.funnel){d.appendChild(el('h3','sec',x.funnel.t));d.appendChild(el('p','sech','Cuántos registros quedan en cada etapa, hasta llegar a los que importan.'));
    var fw=el('div','sim');fw.style.overflowX='auto';fw.innerHTML=funnel(x.funnel,p.c)+'<p class="note">'+x.funnel.n+'</p>';d.appendChild(fw)}
  d.appendChild(el('h3','sec','Modelo de datos'));d.appendChild(el('p','sech',x.sn));
  if(x.star){var st=x.star,R=128,cx=260,cy=170,sv='<svg class="star" viewBox="0 0 520 340" style="width:100%;height:auto;display:block">';
    st.dims.forEach(function(dn,i){var a=-Math.PI/2+i*2*Math.PI/10,px=cx+Math.cos(a)*R*1.25,py=cy+Math.sin(a)*R;
      sv+='<g data-d="'+i+'"><line x1="'+cx+'" y1="'+cy+'" x2="'+px+'" y2="'+py+'"/><circle cx="'+px+'" cy="'+py+'" r="9"/><text x="'+(px+(Math.cos(a)>.3?14:Math.cos(a)<-.3?-14:0))+'" y="'+(py+(Math.abs(Math.cos(a))<=.3?(Math.sin(a)<0?-15:24):4))+'" text-anchor="'+(Math.cos(a)>.3?'start':Math.cos(a)<-.3?'end':'middle')+'">'+dn+'</text></g>'});
    sv+='<rect x="'+(cx-58)+'" y="'+(cy-24)+'" width="116" height="48" rx="10" fill="'+p.c+'" stroke="'+K.ink+'" stroke-width="2"/><text id="st-n" x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle" style="fill:#fff;font-weight:700">hecho</text></svg>';
    var sw=el('div','sim');sw.innerHTML='<div class="seg" id="st-seg"></div><div class="sim-grid" style="margin-top:10px"><div>'+sv+'</div><div><div id="st-card" class="tbl"></div><p class="note">Las dimensiones con contorno morado se comparten entre varios hechos, así que una misma alcaldía o un mismo periodo significan lo mismo en todo el almacén.</p></div></div>';d.appendChild(sw);
    var pick=function(i){var f=st.facts[i];[].forEach.call(sw.querySelectorAll('.star g'),function(g){g.setAttribute('class',f[2].indexOf(+g.dataset.d)>=0?'on':'')});
      sw.querySelector('#st-n').textContent=f[0].replace('fact_','').slice(0,16);
      sw.querySelector('#st-card').innerHTML='<h5>'+ic('cube')+f[0]+'<span>hecho</span></h5><ul><li class="more">'+f[1]+'</li>'+f[2].map(function(k){return '<li>'+st.dims[k].replace('dim_','')+'_sk<u>FK</u><span>'+st.dims[k]+'</span></li>'}).join('')+'<li>run_id<u>FK</u><span>etl_run</span></li></ul>';
      [].forEach.call(sw.querySelector('#st-seg').children,function(bn,j){bn.setAttribute('aria-pressed',j===i)})};
    st.facts.forEach(function(f,i){var bn=el('button',null,f[0].replace('fact_',''));bn.type='button';bn.onclick=function(){pick(i)};sw.querySelector('#st-seg').appendChild(bn)});pick(0)}
  if(x.schema.length)d.appendChild(el('div','schema',x.schema.map(tblHTML).join('')));
  d.appendChild(el('h3','sec','En números'));
  d.appendChild(el('div','facts',x.facts.map(function(k){return '<div class="kpi"><b class="num" style="font-size:24px">'+k[0]+'</b><small>'+k[1]+'</small></div>'}).join('')));

  /* 4 simulador */
  var sp=panels.sim;sp.appendChild(el('h3','sec',p.simT));sp.appendChild(el('p','sech',p.simH));var sm=el('div','sim');sm.id='sim-'+p.sim;sp.appendChild(sm);sims[p.sim]=sm;

  /* 5 galería */
  var gp=panels.gal;gp.appendChild(el('h3','sec','Galería'));gp.appendChild(el('p','sech','Figuras y pantallas del repositorio. Toca para ampliar.'));
  var g=el('div','gal');p.gal.forEach(function(it){var t=el('button',null,'<img src="assets/img/'+it[0]+'.webp" alt="" loading="lazy"><span>'+it[1]+'</span>');t.type='button';t.onclick=function(){zoom(it[0],it[1])};g.appendChild(t)});gp.appendChild(g);

  open('res');root.appendChild(s);

  
});

/* inventario */
(function(){var G=[['Lenguajes',[['py','Python',[0,1,2,3]],['db','SQL',[1,2]],['r','R',[2,3]],['js','JavaScript',[1,2,3]]]],
  ['Datos y big data',[['stream','Kafka',[0]],['spark','Spark + Structured Streaming',[0]],['layers','Delta Lake',[0]],['db','PostgreSQL',[0,1]],['map','PostGIS',[1]],['db','SQLite (esquema estrella)',[2]],['doc','MongoDB',[3]]]],
  ['Modelos y estadística',[['tree','Spark MLlib (GBT y logística)',[0]],['tree','XGBoost',[1]],['net','Grafos, colas M/M/c y Bayes',[0]],['chart','scikit-learn',[1,2]],['net','Keras',[3]],['survey','Encuestas con diseño muestral',[2]]]],
  ['Producto',[['api','FastAPI y Express',[1,3]],['map','Leaflet',[1]],['chart','Power BI',[1,2]],['key','RSA, JWT y bcrypt',[3]],['chart','Tableau','veolia'],['cloud','Salesforce CRM','veolia'],['layers','CRM Analytics','veolia'],['screen','Looker Studio','veolia']]]];
  $('inv').innerHTML=G.map(function(g){return '<div><h4>'+g[0]+'</h4><ul>'+g[1].map(function(t){return '<li>'+ic(t[0])+t[1]+'<span>'+(t[2]==='veolia'?'<b class="vb" title="Herramienta de mi experiencia real en Veolia">Veolia</b>':P.map(function(p,i){return '<i style="background:'+(t[2].indexOf(i)>=0?p.c:'transparent')+'" title="'+short[p.id]+'"></i>'}).join(''))+'</span></li>'}).join('')+'</ul></div>'}).join('')})();

document.querySelector('.brand').addEventListener('click',function(e){e.preventDefault();go('inicio')});
window.addEventListener('hashchange',function(){go(location.hash.slice(1),true)});
go((location.hash||'#inicio').slice(1),true);

/* ================= INICIO: portada, secciones y contacto ================= */
var GH='https://github.com/Zidnz',LI='https://www.linkedin.com/in/omar-guti%C3%A9rrez-88507527a/';
var MODE=store('zidnz-mode')==='light'?'light':'dark';
var RES={fraude:'53.6% del fraude revisando 3.35%',milpin:'MVP desplegado, 115 pruebas',observatorio:'La regla simple empató a los modelos',qchaucoin:'Cadena, monedero y modelo de precio'};

/* Ilustraciones vectoriales (SVG propio, sin pixeles) */
function artLaptop(cls){return '<svg class="'+cls+'" viewBox="0 0 300 220" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3b52"/><stop offset="1" stop-color="#1b2635"/></linearGradient>'+
  '<linearGradient id="la" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ee0d6" stop-opacity=".45"/><stop offset="1" stop-color="#5ee0d6" stop-opacity="0"/></linearGradient></defs>'+
  '<ellipse cx="150" cy="208" rx="132" ry="8" fill="rgba(31,43,58,.12)"/>'+
  '<rect x="30" y="8" width="240" height="152" rx="14" fill="#1f2b3a"/><rect x="40" y="18" width="220" height="132" rx="8" fill="url(#lg)"/>'+
  '<rect x="54" y="30" width="46" height="14" rx="7" fill="#2fa7a7"/><rect x="106" y="30" width="46" height="14" rx="7" fill="#ff8fb1"/><rect x="158" y="30" width="46" height="14" rx="7" fill="#ffd36b"/>'+
  '<path d="M54 128L88 106L120 114L152 82L186 92L224 56L246 64V136H54Z" fill="url(#la)"/>'+
  '<polyline points="54,128 88,106 120,114 152,82 186,92 224,56 246,64" fill="none" stroke="#5ee0d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<circle cx="224" cy="56" r="6" fill="#ff8fb1" stroke="#fff" stroke-width="2"/>'+
  '<path d="M10 166H290L278 186Q276 192 268 192H32Q24 192 22 186Z" fill="#cfe6ea"/><rect x="122" y="166" width="56" height="8" rx="4" fill="#a9ccd2"/></svg>'}
function artRadio(){return '<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M10 9L30 1" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><rect x="2" y="9" width="36" height="20" rx="7" fill="#fff"/><circle cx="13" cy="19" r="5.5" fill="#44b8b8"/><rect x="23" y="14" width="11" height="3" rx="1.5" fill="#bfeeee"/><rect x="23" y="21" width="11" height="3" rx="1.5" fill="#bfeeee"/></svg>'}

/* --- Ilustraciones del estilo "Arcade de datos": videojuegos, estadística y matemáticas --- */
function artGamepad(cls){return '<svg class="'+cls+'" viewBox="0 0 170 108" aria-hidden="true"><defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3a63"/><stop offset="1" stop-color="#1a2342"/></linearGradient></defs>'+
  '<ellipse cx="85" cy="102" rx="70" ry="5" fill="rgba(0,0,0,.25)"/>'+
  '<path d="M38 22H132C150 22 162 40 164 66C166 86 158 98 148 98C138 98 134 88 126 80H44C36 88 32 98 22 98C12 98 4 86 6 66C8 40 20 22 38 22Z" fill="url(#gp)" stroke="#22d3ee" stroke-width="2.5"/>'+
  '<rect x="30" y="42" width="30" height="9" rx="3" fill="#0b1020"/><rect x="40.5" y="31.5" width="9" height="30" rx="3" fill="#0b1020"/>'+
  '<circle cx="124" cy="38" r="7" fill="#a3e635"/><circle cx="140" cy="50" r="7" fill="#fb7185"/><circle cx="108" cy="50" r="7" fill="#fbbf24"/><circle cx="124" cy="62" r="7" fill="#22d3ee"/>'+
  '<circle cx="68" cy="64" r="9" fill="#0b1020" stroke="#3b4d80" stroke-width="2"/><circle cx="102" cy="64" r="9" fill="#0b1020" stroke="#3b4d80" stroke-width="2"/>'+
  '<rect x="76" y="40" width="18" height="5" rx="2.5" fill="#3b4d80"/></svg>'}
function artDie(cls){return '<svg class="'+cls+'" viewBox="0 0 100 108" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs>'+
  '<polygon points="50,4 92,28 92,76 50,100 8,76 8,28" fill="url(#dg)" stroke="#a5f3fc" stroke-width="2.5" stroke-linejoin="round"/>'+
  '<g fill="none" stroke="#a5f3fc" stroke-width="1.8" stroke-linejoin="round" opacity=".85"><polygon points="50,24 76,68 24,68"/><path d="M50 4V24M92 28L76 68M8 28L24 68M92 76L76 68M8 76L24 68M50 100V68"/></g>'+
  '<text x="50" y="58" text-anchor="middle" font-family="DM Mono,monospace" font-weight="700" font-size="17" fill="#fff">20</text></svg>'}
function artBell(cls){var p='',a='',i,x,y;for(i=0;i<=60;i++){x=-3+i*.1;y=Math.exp(-x*x/2);var X=(10+(x+3)/6*220).toFixed(1),Y=(96-y*80).toFixed(1);p+=(i?'L':'M')+X+' '+Y;}
  a=p+'L230 96L10 96Z';
  return '<svg class="'+cls+'" viewBox="0 0 240 124" aria-hidden="true"><defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity=".5"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient></defs>'+
  '<path d="'+a+'" fill="url(#bg2)"/><path d="'+p+'" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>'+
  '<line x1="10" y1="96" x2="230" y2="96" style="stroke:var(--faint)" stroke-width="1.5"/><line x1="120" y1="12" x2="120" y2="96" stroke="#a3e635" stroke-width="1.8" stroke-dasharray="4 4"/>'+
  '<line x1="83" y1="52" x2="83" y2="96" stroke="#fbbf24" stroke-width="1.4" stroke-dasharray="3 4"/><line x1="157" y1="52" x2="157" y2="96" stroke="#fbbf24" stroke-width="1.4" stroke-dasharray="3 4"/>'+
  '<g font-family="DM Mono,monospace" font-size="11" style="fill:var(--soft)" text-anchor="middle"><text x="120" y="112" style="fill:var(--hot)">μ</text><text x="83" y="112">−σ</text><text x="157" y="112">+σ</text></g></svg>'}
function artScatter(cls){var s=7,r=function(){s=(s*9301+49297)%233280;return s/233280},d='',i;
  for(i=0;i<30;i++){var x=14+r()*128,y=108-(x-14)*.62-(r()-.5)*34;d+='<circle cx="'+x.toFixed(1)+'" cy="'+Math.max(14,Math.min(112,y)).toFixed(1)+'" r="3.4" fill="'+(i%5===0?'#fbbf24':'#22d3ee')+'"/>'}
  return '<svg class="'+cls+'" viewBox="0 0 156 130" aria-hidden="true"><rect x="1" y="1" width="154" height="128" rx="14" fill="#17213a" stroke="#2a3a66" stroke-width="2"/>'+
  '<path d="M12 118H146M12 118V12" stroke="#5b6b95" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+d+
  '<line x1="14" y1="108" x2="144" y2="26" stroke="#a3e635" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="round"/>'+
  '<text x="22" y="26" font-family="DM Mono,monospace" font-size="11" fill="#a3e635">r = 0.87</text></svg>'}
function artChip(t,cls){return '<div class="chip3 '+cls+'">'+t+'</div>'}

function heroScene(){
 return '<div class="hj-s arc" id="hero-scene"><div class="orb"></div>'+
  '<div class="bell">'+artBell('')+'</div><div class="scat">'+artScatter('')+'</div>'+
  '<div class="pad">'+artGamepad('')+'</div><div class="die">'+artDie('')+'</div><div class="comp">'+artLaptop('')+'</div>'+
  '<div class="bubble">NIVEL 7 · XP<i></i></div>'+
  '<div class="c1">'+artChip('Σ','')+'</div><div class="c2">'+artChip('∫','')+'</div><div class="c3">'+artChip('π','')+'</div><div class="c4">'+artChip('p&lt;.05','')+'</div></div>';}

/* --- Modo claro y oscuro --- */
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function applyLook(){var h=document.documentElement;h.setAttribute('data-mode',MODE);
 var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',MODE==='dark'?'#0b1020':'#f1f6ff')}
function setMode(m){MODE=m==='light'?'light':'dark';store('zidnz-mode',MODE);applyLook();renderHome()}
var ICO_MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></svg>',ICO_SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
function renderOpts(){$('opts').innerHTML='<div class="lang" role="group" aria-label="Idioma"><button type="button" data-set-lang="es" aria-pressed="'+(LANG==='es')+'">ES</button><button type="button" data-set-lang="en" aria-pressed="'+(LANG==='en')+'">EN</button></div><button type="button" class="mode" data-toggle-mode="1" aria-label="'+(MODE==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro')+'" title="'+(MODE==='dark'?'Modo claro':'Modo oscuro')+'">'+(MODE==='dark'?ICO_SUN:ICO_MOON)+'<span>'+(MODE==='dark'?'Claro':'Oscuro')+'</span></button>'}
function infoGrid(){
 var HOW=[['flag','Entender el problema','Antes de tocar datos: qué decisión hay que tomar y quién la toma.'],['db','Limpiar y explorar','Duplicados, etapas, monedas y patrones raros salen a la luz.'],['tree','Modelar y poner a prueba','Evaluar con el futuro, comparar contra una regla simple, desconfiar de lo perfecto.'],['chart','Explicar y decidir','Un tablero o una cola de trabajo que alguien pueda usar mañana.']],
  NUM=[['590,540','transacciones reales analizadas'],['115','pruebas automáticas en un proyecto'],['4','proyectos de punta a punta'],['Desde 2025','Data Analyst Intern en Veolia']],
  RUL=[['Si el resultado es perfecto, sospecha.','Un recall del 100% casi siempre esconde una fuga de información.'],['Evalúa con el futuro, no con el azar.','Partir los datos por tiempo evita resultados demasiado optimistas.'],['Una regla simple también es un modelo.','Si no supera a la regla, el modelo no se ha ganado su lugar.']];
 return '<div class="hpa-grid">'+
 '<div><h3>Cómo trabajo</h3><ol class="how">'+HOW.map(function(h,i){return '<li style="--k:'+i+'"><span class="hi">'+ic(h[0])+'</span><div><b>'+h[1]+'</b><small>'+h[2]+'</small></div></li>'}).join('')+'</ol></div>'+
 '<div><h3>En números</h3><div class="stats">'+NUM.map(function(n){return '<div class="stat"><b>'+n[0]+'</b><small>'+n[1]+'</small></div>'}).join('')+'</div></div>'+
 '<div><h3>Mis reglas</h3><div class="rules">'+RUL.map(function(r,i){return '<div class="rule"><i>'+(i+1)+'</i><div><b>'+r[0]+'</b><small>'+r[1]+'</small></div></div>'}).join('')+'</div></div></div>'}

/* Descarga del CV en español e inglés */
var ICO_DL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>';
function cvRow(){return '<div class="cv"><span>Descargar CV</span><a href="assets/cv/CV_Omar_Gutierrez_Escoto.pdf" download="CV_Omar_Gutierrez_Escoto.pdf" hreflang="es">'+ICO_DL+'Español</a><a href="assets/cv/Resume_Omar_Gutierrez_Escoto.pdf" download="Resume_Omar_Gutierrez_Escoto.pdf" hreflang="en">'+ICO_DL+'English</a></div>'}

var PLAN_URL='https://www.rcastellanos.cdmx.gob.mx/storage/app/media/PlanesEstudio2023/LCDN_MIXTA_RESUMEN%20EJECUTIVO.pdf';
var ICO_GH='<svg class="brand-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
ICO_IN='<svg class="brand-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
ICO_CAP='<svg class="brand-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/></svg>';
function linkBtns(){return '<a class="btn" target="_blank" rel="noopener noreferrer" href="'+LI+'">'+ICO_IN+'LinkedIn</a><a class="btn ghost" target="_blank" rel="noopener noreferrer" href="'+GH+'">'+ICO_GH+'GitHub</a>'}
function heroHTML(){var tk='Ahora corriendo: lakehouse de fraude en Spark ♪ · · · batch = streaming ✓ · · · ETo del día: 7.1 mm · · · regla de 40 h contra modelos: sin ganador claro · · · QchauCoin = 1.00 · · · gracias por visitar ✦ · · · ';
 return '<div class="h-hero"><div class="wrap hj">'+
 '<aside class="rail"><b>UNRC</b><small>7.º SEM</small>'+artDie('')+'<a href="'+PLAN_URL+'" target="_blank" rel="noopener noreferrer" title="Plan de estudios de la UNRC (PDF)" aria-label="Plan de estudios de la UNRC">'+ICO_CAP+'</a><hr><a href="'+GH+'" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">'+ICO_GH+'</a><a href="'+LI+'" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn">'+ICO_IN+'</a></aside>'+
 '<div class="hj-t"><p class="tagp">OMAR GUTIÉRREZ ESCOTO</p><h1>Datos que<br>toman<br>decisiones</h1><p class="lede">Estudiante de Ciencia de Datos para el Negocio en la UNRC y Data Analyst Intern en Veolia. Busco la historia escondida en los datos, la pruebo con rigor y la cuento para que cualquiera la entienda.</p>'+
 '<div class="cta"><button class="btn" type="button" data-scroll="levels-h">Ver misiones ›</button><a class="btn ghost" href="'+GH+'" target="_blank" rel="noopener noreferrer">'+ICO_GH+'GitHub</a></div>'+cvRow()+'</div>'+
 heroScene()+'</div>'+
 '<div class="wrap"><div class="ticker">'+artRadio()+'<div class="tk"><div class="tk-in"><span>'+tk+'</span><span>'+tk+'</span></div></div><span class="eq"><i></i><i></i><i></i><i></i></span></div></div></div>'+
 '<div class="h-info"><div class="wrap">'+infoGrid()+'</div></div>'}

var WORK=[['db','Datos reales','Limpieza de CRM real de varias unidades de negocio en Veolia con Salesforce: duplicados, etapas y monedas.','chart'],
 ['pipe','Pipelines','Kafka, Spark, Delta Lake, PostgreSQL con PostGIS y almacenes en esquema estrella.','layers'],
 ['lupa','Modelos auditados','Spark MLlib, XGBoost y regresión. Y sospechar cuando algo sale demasiado bien.','tree'],
 ['chart','Tableros','Tableau, CRM Analytics y Looker Studio en Veolia, y Power BI y sitios propios en mis proyectos, para que alguien decida con los números.','screen']];

function renderHome(){
 $('hero').innerHTML=heroHTML();renderOpts();
 $('what').innerHTML=WORK.map(function(w){return '<div class="wk"><span class="wi">'+ic(w[3])+'</span><h4>'+w[1]+'</h4><p>'+w[2]+'</p></div>'}).join('');
 $('levels').innerHTML='';
 P.forEach(function(p){var x=X[p.id];
  var lv=el('button','lv','<div class="thumb img"><img src="assets/img/'+p.cover+'.webp" alt=""></div><div class="in"><span class="no">MISIÓN '+p.n+'</span><h3>'+p.title+'</h3><dl><dt>Dominio</dt><dd>'+x.card[0]+'</dd><dt>Técnica</dt><dd>'+x.card[1]+'</dd><dt>Resultado</dt><dd>'+RES[p.id]+'</dd></dl><span class="play">Entrar →</span></div>');
  lv.type='button';lv.style.setProperty('--lc',p.c);lv.onclick=function(){go(p.id)};$('levels').appendChild(lv)});
 $('cta-links').innerHTML=linkBtns();$('cta-cv').innerHTML=cvRow();
 var cd=$('cta-deco');cd.innerHTML='<span class="d1">'+artGamepad('')+'</span><span class="d2">'+artDie('')+'</span><span class="d3">'+artChip('Î£','')+'</span>';
 HOME.c=getComputedStyle(document.documentElement).getPropertyValue('--home').trim()||HOME.c;HOME.cs='color-mix(in srgb,'+HOME.c+' 13%,transparent)';tabBtn.inicio.style.setProperty('--tc',HOME.c);
 var cur=Object.keys(views).filter(function(k){return !views[k].hidden})[0]||'inicio';go(cur,true);
 setTimeout(function(){window.dispatchEvent(new Event('resize'))},60)}

document.addEventListener('click',function(e){var t=e.target.closest('[data-go],[data-scroll],[data-toggle-mode],[data-set-lang]');if(!t)return;
 if(t.dataset.setLang){setLang(t.dataset.setLang);return}
 if(t.dataset.toggleMode){setMode(MODE==='dark'?'light':'dark');return}
 if(t.dataset.go){go(t.dataset.go);return}
 var n=$(t.dataset.scroll);if(n)n.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})});

/* ================= SIM 1: FRAUDE ================= */
(function(){
  var m=sims.fraude;
  m.innerHTML='<div class="sim-grid"><div><canvas id="fs" height="250" aria-label="Flujo animado de transacciones que se separan entre revisión y aprobadas"></canvas>'+
   '<div class="legend"><span><i style="background:'+K.alert+'"></i>Fraude (tamaño = monto)</span><span><i style="background:'+K.mint+'"></i>Operación normal</span><span><i style="background:'+K.lav+'"></i>Aún sin clasificar</span></div>'+
   '<div class="read"><div><b id="fs-tp" class="num">0</b><small>fraudes atrapados</small></div><div><b id="fs-fn" class="num">0</b><small>fraudes que escaparon</small></div><div><b id="fs-fp" class="num">0</b><small>clientes molestados</small></div>'+
   '<div><b id="fs-re" class="num">n/d</b><small>fraudes atrapados (%)</small></div><div><b id="fs-usd" class="num">n/d</b><small>dinero de fraude salvado</small></div><div><b id="fs-n" class="num">0</b><small>transacciones vistas</small></div></div></div>'+
   '<div><div class="seg" id="fs-crit" role="group" aria-label="Cómo ordenar la cola"></div>'+
   '<div class="ctl" style="margin-top:14px"><label for="fs-c">Porcentaje que alcanzas a revisar <output id="fs-co"></output><input id="fs-c" type="range" min="1" max="10" step="0.5" value="3.5"></label></div>'+
   '<p class="note" id="fs-msg"></p>'+
   '<p class="note">Las distribuciones imitan el proyecto real: el monto solo casi no distingue fraude (ROC 0.50) y el modelo sí (0.92). En los datos reales, revisando 3.35%: por probabilidad se salva 42% del dinero; por pérdida esperada, 63%. Aquí 1 de cada 20 puntos es fraude para que se vea; en los datos es 1 de cada 29.</p></div></div>';
  var CR=['Por monto','Por probabilidad','Por pérdida esperada'],crit=2,cap=.035,thr=0;
  var MSG=['Revisar solo lo caro parece sensato, pero en datos reales el fraude no es más caro que lo normal: casi todo se escapa.',
           'El modelo ordena bien quién es fraude, pero trata igual un fraude de $5 que uno de $900.',
           'Probabilidad × monto: atrapas algunos fraudes menos, pero los más caros. Es la solución de la mochila con capacidad fija.'];
  var cv=$('fs'),o,D=[],c,raf=0,fr=0;
  function g(){return(Math.random()+Math.random()+Math.random()+Math.random()+Math.random()+Math.random()-3)/.707}
  function tx(){var f=Math.random()<.05,z=f?-1.3+1.5*g():-4.3+1.5*g();return{f:f,p:1/(1+Math.exp(-z)),a:Math.exp(f?4.4+1.05*g():4.3+g()),x:0,y:.5+(Math.random()-.5)*.5,ty:null,v:.004+Math.random()*.002}}
  function sc(d){return crit===0?d.a:crit===1?d.p:d.p*d.a}
  var REF=[];for(var i=0;i<20000;i++)REF.push(tx());
  function setT(){var v=REF.map(sc).sort(function(x,y){return x-y});thr=v[Math.floor((1-cap)*v.length)];c={tp:0,fn:0,fp:0,n:0,uT:0,uS:0};
    D.forEach(function(d){if(d.x<.42)d.ty=null});$('fs-co').textContent=(cap*100).toFixed(1).replace('.0','')+'%';$('fs-msg').textContent=MSG[crit];rd()}
  function rd(){$('fs-tp').textContent=c.tp;$('fs-fn').textContent=c.fn;$('fs-fp').textContent=c.fp;$('fs-n').textContent=fmt(c.n);
    $('fs-re').textContent=c.tp+c.fn?Math.round(100*c.tp/(c.tp+c.fn))+'%':'n/d';$('fs-usd').textContent=c.uT?Math.round(100*c.uS/c.uT)+'%':'n/d'}
  function count(d){var rev=sc(d)>thr;c.n++;if(d.f){c.uT+=d.a;if(rev){c.tp++;c.uS+=d.a}else c.fn++}else if(rev)c.fp++;return rev}
  function setC(i){crit=i;[].forEach.call($('fs-crit').children,function(bn,j){bn.setAttribute('aria-pressed',j===i)});setT();if(RM)bulk()}
  CR.forEach(function(t,i){var bn=el('button',null,t);bn.type='button';bn.setAttribute('aria-pressed',i===crit);bn.onclick=function(){setC(i)};$('fs-crit').appendChild(bn)});
  function frame(){
    var x=o.x,w=o.w,h=o.h,gx=w*.42;x.clearRect(0,0,w,h);
    x.fillStyle='rgba(192,67,90,.07)';x.fillRect(gx,0,w-gx,h*.42);x.fillStyle='rgba(125,209,193,.12)';x.fillRect(gx,h*.42,w-gx,h*.58);
    x.setLineDash([5,5]);x.strokeStyle=K.accent;x.lineWidth=1.5;x.beginPath();x.moveTo(gx,0);x.lineTo(gx,h);x.stroke();x.setLineDash([]);
    x.font='700 11px "DM Mono",monospace';x.fillStyle=K.accent;x.textAlign='left';x.fillText(T(CR[crit]).toUpperCase(),gx+8,w<460?h-28:h-10);
    x.fillStyle=K.alert;x.textAlign='right';x.fillText(T('COLA DE REVISIÓN'),w-10,18);x.fillStyle=K.teal;x.fillText(T('APROBADAS'),w-10,h-10);
    x.fillStyle=K.soft;x.textAlign='left';x.fillText('KAFKA →',10,18);
    if(++fr%2===0&&D.length<160)D.push(tx());
    for(var i=D.length-1;i>=0;i--){var d=D[i];d.x+=d.v;
      if(d.x>=.42&&d.ty===null){d.ty=count(d)?.1+Math.random()*.24:.52+Math.random()*.4;if(fr%6===0)rd()}
      if(d.ty!==null)d.y+=(d.ty-d.y)*.07;
      if(d.x>1.03){D.splice(i,1);continue}
      var r=2+Math.min(6,Math.max(0,Math.log(d.a)-3)*1.2);
      x.globalAlpha=.9;x.fillStyle=d.ty===null?K.lav:(d.f?K.alert:K.mint);x.beginPath();x.arc(d.x*w,d.y*h,r,0,6.283);x.fill();
      if(d.ty!==null&&d.f){x.strokeStyle=K.alert;x.globalAlpha=.5;x.beginPath();x.arc(d.x*w,d.y*h,r+4,0,6.283);x.stroke()}}
    x.globalAlpha=1;raf=requestAnimationFrame(frame);
  }
  function bulk(){for(var i=0;i<4000;i++)count(tx());rd()}
  function size(){o=fit(cv)}
  $('fs-c').addEventListener('input',function(){cap=+$('fs-c').value/100;setT();if(RM)bulk()});size();setT();window.addEventListener('resize',size);
  if(RM){bulk();var x=o.x;x.font='600 14px "DM Mono",sans-serif';x.fillStyle=K.soft;x.textAlign='center';x.fillText(T('Animación desactivada: se muestran los conteos de 4,000 transacciones.'),o.w/2,o.h/2)}
  else onView(cv,function(){if(!raf)frame()},function(){cancelAnimationFrame(raf);raf=0});
})();

/* ================= SIM 2: MILPÍN ================= */
(function(){
  var m=sims.milpin;
  m.innerHTML='<div class="sim-grid"><div><canvas id="ms" height="260" aria-label="Humedad del suelo durante 60 días con los riegos marcados"></canvas>'+
   '<div class="legend"><span><i style="background:'+K.teal+'"></i>Humedad del suelo (% vol.)</span><span><i style="background:#4a90d9"></i>Riego</span><span>Verde: capacidad de campo (32%) · Ámbar: umbral de riego (23%)</span></div>'+
   '<div class="read"><div><b id="ms-eto" class="num">0</b><small>ETo, mm por día</small></div><div><b id="ms-etc" class="num">0</b><small>ETc del cultivo, mm por día</small></div><div><b id="ms-m3" class="num">0</b><small>m³ por hectárea al día</small></div>'+
   '<div><b id="ms-r" class="num">0</b><small>riegos en 60 días</small></div><div><b id="ms-d" class="num">0</b><small>días entre riegos</small></div><div><b id="ms-v" class="num">0</b><small>m³/ha aplicados en 60 días</small></div></div></div>'+
   '<div><div class="seg" id="ms-crop" role="group" aria-label="Cultivo"></div><div class="seg" id="ms-stage" role="group" aria-label="Etapa" style="margin-top:8px"></div>'+
   '<div class="ctl" style="margin-top:14px"><label for="ms-mes">Mes <output id="ms-mes-o"></output><input id="ms-mes" type="range" min="1" max="12" value="5"></label>'+
   '<label for="ms-tx">Temperatura máxima <output id="ms-tx-o"></output><input id="ms-tx" type="range" min="15" max="46" value="36"></label>'+
   '<label for="ms-tn">Temperatura mínima <output id="ms-tn-o"></output><input id="ms-tn" type="range" min="0" max="30" value="18"></label></div>'+
   '<p class="note">ETo por Hargreaves a 27.37° N. Kc del catálogo del proyecto. Umbrales de humedad de la parcela de ejemplo del repositorio; profundidad de raíz de 80 cm, supuesto de este simulador. 1 mm de lámina = 10 m³ por hectárea.</p></div></div>';
  var crops={'Maíz':[.30,1.20,.60],'Frijol':[.40,1.15,.35],'Algodón':[.35,1.20,.70],'Uva':[.30,.85,.45],'Chile':[.60,1.05,.90]},names=Object.keys(crops),
      st=['Inicial','Media','Final'],meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],crop=0,stage=1,lat=27.37*Math.PI/180,cv=$('ms');
  function seg(box,items,cur,cb){box.innerHTML='';items.forEach(function(t,i){var b=el('button',null,t);b.type='button';b.setAttribute('aria-pressed',i===cur);b.onclick=function(){cb(i)};box.appendChild(b)})}
  function ra(mn){var J=Math.round(30.4*mn-15),dr=1+.033*Math.cos(2*Math.PI*J/365),de=.409*Math.sin(2*Math.PI*J/365-1.39),ws=Math.acos(-Math.tan(lat)*Math.tan(de));
    return .408*(24*60/Math.PI)*.0820*dr*(ws*Math.sin(lat)*Math.sin(de)+Math.cos(lat)*Math.cos(de)*Math.sin(ws))}
  function upd(){
    var mn=+$('ms-mes').value,tx=+$('ms-tx').value,tn=+$('ms-tn').value;if(tn>tx-1){tn=tx-1;$('ms-tn').value=tn}
    var kc=crops[names[crop]][stage],eto=.0023*((tx+tn)/2+17.8)*Math.sqrt(tx-tn)*ra(mn),etc=eto*kc;
    $('ms-mes-o').textContent=meses[mn-1];$('ms-tx-o').textContent=tx+' °C';$('ms-tn-o').textContent=tn+' °C';
    seg($('ms-crop'),names,crop,function(i){crop=i;upd()});
    seg($('ms-stage'),st.map(function(s,i){return s+' · Kc '+crops[names[crop]][i].toFixed(2)}),stage,function(i){stage=i;upd()});
    var CC=32,TH=23,PMP=14,mmPct=8,th=CC,S=[],R=[],vol=0;
    for(var d=0;d<=60;d++){S.push(th);th-=etc/mmPct;if(th<=TH){vol+=(CC-th)*mmPct*10;R.push(d+1);th=CC}}
    $('ms-eto').textContent=eto.toFixed(1);$('ms-etc').textContent=etc.toFixed(1);$('ms-m3').textContent=Math.round(etc*10);
    $('ms-r').textContent=R.length;$('ms-d').textContent=R.length>1?((R[R.length-1]-R[0])/(R.length-1)).toFixed(1):(R.length?R[0]:'> 60');$('ms-v').textContent=fmt(vol);
    var o=fit(cv),x=o.x,w=o.w,h=o.h,pl=34,pr=10,pt=12,pb=24,lo=12,hi=35;
    function X(d){return pl+(w-pl-pr)*d/60}function Y(v){return pt+(h-pt-pb)*(hi-v)/(hi-lo)}
    x.clearRect(0,0,w,h);x.fillStyle='rgba(35,128,111,.08)';x.fillRect(pl,Y(CC),w-pl-pr,Y(TH)-Y(CC));x.fillStyle='rgba(169,113,26,.08)';x.fillRect(pl,Y(TH),w-pl-pr,Y(PMP)-Y(TH));
    x.font='11px "DM Mono",monospace';x.fillStyle=K.soft;x.textAlign='right';
    [14,23,32].forEach(function(v){x.fillText(v+'%',pl-5,Y(v)+4)});x.textAlign='center';[0,15,30,45,60].forEach(function(d){x.fillText(T('día')+' '+d,Math.max(pl+14,Math.min(w-pr-16,X(d))),h-6)});
    x.setLineDash([5,4]);x.lineWidth=1.3;x.strokeStyle=K.teal;x.beginPath();x.moveTo(pl,Y(CC));x.lineTo(w-pr,Y(CC));x.stroke();
    x.strokeStyle=K.amber;x.beginPath();x.moveTo(pl,Y(TH));x.lineTo(w-pr,Y(TH));x.stroke();x.strokeStyle=K.alert;x.beginPath();x.moveTo(pl,Y(PMP));x.lineTo(w-pr,Y(PMP));x.stroke();x.setLineDash([]);
    x.fillStyle='rgba(74,144,217,.55)';R.forEach(function(d){x.fillRect(X(d)-2,Y(CC),4,Y(lo)-Y(CC))});
    x.strokeStyle=K.teal;x.lineWidth=2.2;x.beginPath();S.forEach(function(v,d){if(!d)x.moveTo(X(0),Y(v));else{x.lineTo(X(d),Y(S[d-1]>v?v:S[d-1]));x.lineTo(X(d),Y(v))}});x.stroke();
  }
  ['ms-mes','ms-tx','ms-tn'].forEach(function(i){$(i).addEventListener('input',upd)});upd();window.addEventListener('resize',upd);
})();

/* ================= SIM 3: OBSERVATORIO ================= */
(function(){
  var m=sims.obs;
  var nodes={
   obj:{x:260,y:52,r:26,c:K.teal,l:'Objetivo',v:'495',t:'El objetivo',d:'De 1,043 personas cuidadoras en la muestra, 495 declaran daño a su salud física, cansancio o problemas de sueño. Un buen método de priorización debería encontrar a la mayor parte de ellas con el mismo cupo.'},
   regla:{x:260,y:196,r:30,c:K.shell,l:'Regla ≥ 40 h',v:'50.8%',t:'Regla de 40 horas o más',d:'Ofrecer el relevo primero a quien cuida 40 horas o más a la semana. Encuentra a 50.8% de quienes tienen el daño (rango probable: 45 a 57). Es el comparador: transparente y fácil de explicar a quien solicita el apoyo.'},
   log:{x:86,y:268,r:29,c:K.amber,l:'Regresión logística',v:'50.5%',t:'Regresión logística',d:'Encuentra a 50.5%. La diferencia con la regla es de −0.3 puntos (rango probable: −5.1 a +4.4). Además falla en equidad: deja fuera a más hombres cuidadores. No hay ventaja demostrable.'},
   tar:{x:434,y:268,r:28,c:K.accent,l:'Tarjeta de puntos',v:'49.5%',t:'Tarjeta de puntos',d:'Un puntaje entero, fácil de aplicar en una entrevista. Encuentra a 49.5%: −1.4 puntos contra la regla (rango probable: −6.1 a +3.4). Tampoco la supera.'},
   azar:{x:448,y:92,r:23,c:K.alert,l:'Elegir al azar',v:'40.7%',t:'Elegir al azar',d:'Si se eligiera sin criterio a la misma fracción de personas, se encontraría a 40.7% de quienes tienen el daño. Es el piso: la regla lo supera por unos 10 puntos, una diferencia que sí se nota con esta muestra.'}};
  var edges=[['obj','regla',K.shell],['obj','log',K.amber],['obj','tar',K.accent],['obj','azar',K.alert]];
  var s='<svg class="nm" viewBox="0 0 520 320" style="width:100%;height:auto;display:block" role="group" aria-label="Mapa de nodos: objetivo, regla, dos modelos y azar">';
  edges.forEach(function(e){var a=nodes[e[0]],b=nodes[e[1]];s+='<path class="e" stroke="'+e[2]+'" d="M'+a.x+' '+a.y+' L'+b.x+' '+b.y+'"/>'});
  s+='<path d="M116 262 L230 208" stroke="'+K.hair+'" stroke-width="1.5"/><path d="M406 262 L290 208" stroke="'+K.hair+'" stroke-width="1.5"/>';
  s+='<rect x="146" y="226" width="58" height="20" rx="10" fill="#fff" stroke="'+K.hair+'"/><text class="tag" x="175" y="240" text-anchor="middle" fill="'+K.amber+'">−0.3 pp</text>';
  s+='<rect x="318" y="226" width="58" height="20" rx="10" fill="#fff" stroke="'+K.hair+'"/><text class="tag" x="347" y="240" text-anchor="middle" fill="'+K.accent+'">−1.4 pp</text>';
  Object.keys(nodes).forEach(function(k){var n=nodes[k];
    s+='<g role="button" tabindex="0" data-k="'+k+'" aria-pressed="false" aria-label="'+n.t+'"><circle class="ring" cx="'+n.x+'" cy="'+n.y+'" r="'+(n.r+7)+'" stroke="'+n.c+'"/><circle class="core" cx="'+n.x+'" cy="'+n.y+'" r="'+n.r+'" fill="#fff" stroke="'+n.c+'" stroke-width="2.5"/>'+
       '<text class="v" x="'+n.x+'" y="'+(n.y+5)+'" text-anchor="middle">'+n.v+'</text><text x="'+n.x+'" y="'+(k==='obj'||k==='azar'?n.y-n.r-12:n.y+n.r+20)+'" text-anchor="middle" style="font-weight:700;fill:var(--ink)">'+n.l+'</text></g>'});
  s+='</svg>';
  m.innerHTML='<div class="sim-grid"><div>'+s+'<div class="legend"><span>Línea punteada en movimiento: cada método intenta alcanzar el objetivo</span><span>Círculo punteado: rango probable (IC 90%)</span></div></div>'+
    '<div><div id="os-card" style="background:var(--paper-2);border:1px solid var(--hair);border-radius:14px;padding:16px"></div>'+
    '<div class="read" style="grid-template-columns:1fr 1fr"><div><b>≈ 7.2 pp</b><small>diferencia más pequeña que esta muestra permite notar</small></div><div><b>40.7%</b><small>cupo: fracción de personas que cada método elige</small></div></div>'+
    '<p class="note">Cifras del sitio del Observatorio, pendientes de segunda revisión. Validación agrupada por unidad primaria de muestreo.</p></div></div>';
  function pick(k){var n=nodes[k];$('os-card').innerHTML='<p class="kick" style="color:'+n.c+'">'+n.l+'</p><h4 style="font-size:30px;font-weight:800;margin:6px 0 8px">'+n.v+'</h4><p style="font-size:15px">'+n.d+'</p>';
    [].forEach.call(m.querySelectorAll('g[role=button]'),function(g){g.setAttribute('aria-pressed',g.dataset.k===k)})}
  m.addEventListener('click',function(e){var g=e.target.closest('g[role=button]');if(g)pick(g.dataset.k)});
  m.addEventListener('keydown',function(e){var g=e.target.closest&&e.target.closest('g[role=button]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pick(g.dataset.k)}});
  pick('regla');
})();

/* ================= SIM 4: QCHAUCOIN ================= */
(function(){
  var m=sims.qchau;
  m.innerHTML='<div class="chain" id="qc-chain" aria-live="polite"></div>'+
    '<div class="seg" style="margin:4px 0 4px"><button type="button" id="qc-add" aria-pressed="true">+ Enviar transacción</button><button type="button" id="qc-bad" aria-pressed="false">Alterar el bloque 1</button><button type="button" id="qc-fix" aria-pressed="false">Restaurar</button></div>'+
    '<p class="note" id="qc-msg" style="margin-bottom:18px"></p>'+
    '<div class="sim-grid"><div><canvas id="qs" height="230" aria-label="Precio simulado de QchauCoin durante 180 días"></canvas>'+
    '<div class="legend"><span><i style="background:'+K.amber+'"></i>Precio con pánico</span><span><i style="background:'+K.lav+'"></i>Precio sin pánico</span><span>Línea punteada: precio objetivo R = 1</span></div></div>'+
    '<div><div class="ctl"><label for="qs-a">Fuerza del respaldo (α) <output id="qs-a-o"></output><input id="qs-a" type="range" min="0.02" max="0.5" step="0.01" value="0.18"></label>'+
    '<label for="qs-s">Caída por pánico en el día 60 <output id="qs-s-o"></output><input id="qs-s" type="range" min="0" max="40" step="1" value="20"></label></div>'+
    '<div class="read"><div><b id="qs-min" class="num">0</b><small>precio mínimo</small></div><div><b id="qs-rec" class="num">0</b><small>días para recuperarse</small></div><div><b id="qs-end" class="num">0</b><small>precio al día 180</small></div></div>'+
    '<p class="note">β = 0.55 y γ = 0.75, como en el script del proyecto. Recuperación: días hasta quedar a menos de 0.01 de la trayectoria sin pánico.</p></div></div>';
  /* cadena */
  function hsh(s){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<s.length;i++){var ch=s.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}
    h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
    return((h2>>>0).toString(16)+(h1>>>0).toString(16)).padStart(16,'0').slice(0,10)}
  var ppl=['Ana','Luis','Sofía','Diego','Mara','Iván'],B=[],tam=false;
  function mk(tx){var prev=B.length?B[B.length-1].h:'0';var b={i:B.length,tx:tx,p:prev};b.h=hsh(b.i+tx+prev);B.push(b)}
  function rnd(){var a=ppl[Math.floor(Math.random()*6)],b;do{b=ppl[Math.floor(Math.random()*6)]}while(b===a);return a+' → '+b+': '+(5+Math.floor(Math.random()*95))+' QC'}
  function draw(){var c=$('qc-chain');c.innerHTML='';var broken=false;
    B.forEach(function(b,i){var tx=(tam&&i===1)?b.tx.replace(/\d+ QC/,'9,999 QC'):b.tx,h=hsh(b.i+tx+b.p);if(i>0&&tam&&i>=1&&(i>1||h!==b.h))broken=true;
      var bad=tam&&i>=2,d=el('div','blk'+(bad?' bad':''),'<b>Bloque '+b.i+'</b><div class="tx">'+(i?tx:'Génesis')+'</div><code>anterior: '+b.p+'</code><code>hash: '+(tam&&i===1?h:b.h)+'</code>');
      if(tam&&i===1)d.style.borderColor=K.amber;c.appendChild(d)});
    $('qc-msg').textContent=tam?'Cambiaste el monto del bloque 1, así que su hash cambió. El bloque 2 guarda el hash viejo como «anterior»: ya no coincide y toda la cadena posterior queda inválida. Por eso no se puede reescribir el pasado sin que se note.'
      :'Cada bloque guarda el hash del anterior. Hash abreviado para la demostración; el proyecto usa SHA-256.';
    c.scrollLeft=tam?0:c.scrollWidth}
  $('qc-add').onclick=function(){if(B.length>=9)B.splice(1,B.length-1);tam=false;mk(rnd());draw()};
  $('qc-bad').onclick=function(){if(B.length<3){mk(rnd());mk(rnd())}tam=true;draw()};
  $('qc-fix').onclick=function(){tam=false;draw()};
  mk('');mk('Ana → Luis: 25 QC');mk('Luis → Sofía: 10 QC');mk('Sofía → Diego: 40 QC');draw();
  /* precio */
  var cv=$('qs'),Bt=.55,G=.75,R=1,D=180;
  function sim(a,sh){var p=1,s=[];for(var t=0;t<=D;t++){if(t===60)p*=(1-sh);s.push(p);p+=a*(R-p)+Bt*(.02*Math.sin(t/6)+.01)-G*(.004+.002*Math.sin(t/12))}return s}
  function upd(){var a=+$('qs-a').value,sh=+$('qs-s').value/100,s=sim(a,sh),b=sim(a,0),rec=null;
    $('qs-a-o').textContent=a.toFixed(2);$('qs-s-o').textContent='−'+Math.round(sh*100)+'%';
    for(var t=60;t<=D;t++)if(Math.abs(s[t]-b[t])<.01){rec=t-60;break}
    $('qs-min').textContent=Math.min.apply(null,s).toFixed(2);$('qs-rec').textContent=rec===null?'> 120':rec;$('qs-end').textContent=s[D].toFixed(2);
    var o=fit(cv),x=o.x,w=o.w,h=o.h,pl=34,pr=10,pt=10,pb=24,lo=.55,hi=1.25;
    function X(t){return pl+(w-pl-pr)*t/D}function Y(v){return pt+(h-pt-pb)*(hi-Math.max(lo,Math.min(hi,v)))/(hi-lo)}
    x.clearRect(0,0,w,h);x.font='11px "DM Mono",monospace';x.fillStyle=K.soft;x.lineWidth=1;
    [.6,.8,1,1.2].forEach(function(v){x.strokeStyle=K.hair;x.beginPath();x.moveTo(pl,Y(v));x.lineTo(w-pr,Y(v));x.stroke();x.textAlign='right';x.fillText(v.toFixed(1),pl-5,Y(v)+4)});
    x.textAlign='center';[0,60,120,180].forEach(function(t){x.fillText(T('día')+' '+t,Math.max(pl+14,Math.min(w-pr-18,X(t))),h-6)});
    x.setLineDash([5,4]);x.strokeStyle=K.ink;x.globalAlpha=.5;x.beginPath();x.moveTo(pl,Y(R));x.lineTo(w-pr,Y(R));x.stroke();x.setLineDash([]);x.globalAlpha=1;
    x.strokeStyle=K.lav;x.lineWidth=1.6;x.beginPath();b.forEach(function(v,t){t?x.lineTo(X(t),Y(v)):x.moveTo(X(t),Y(v))});x.stroke();
    x.strokeStyle=K.amber;x.lineWidth=2.4;x.beginPath();s.forEach(function(v,t){t?x.lineTo(X(t),Y(v)):x.moveTo(X(t),Y(v))});x.stroke();
    x.fillStyle=K.alert;x.beginPath();x.arc(X(60),Y(s[60]),5,0,6.283);x.fill();x.fillStyle=K.amber;x.beginPath();x.arc(X(D),Y(s[D]),4,0,6.283);x.fill()}
  $('qs-a').addEventListener('input',upd);$('qs-s').addEventListener('input',upd);upd();window.addEventListener('resize',upd);
})();
applyLook();renderHome();I18N.start();
})();
