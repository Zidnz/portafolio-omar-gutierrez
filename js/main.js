(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var K={ink:'#1f2a44',soft:'rgba(31,42,68,.78)',hair:'rgba(31,42,68,.16)',accent:'#e8457a',lav:'#b9c3e6',mint:'#86cdb8',teal:'#2f7f6c',alert:'#c4566b',amber:'#b07d22',shell:'#1f2a44',paper:'#fbfbfd',vio:'#6f5fb0'};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function fit(cv){var r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1,h=+(cv.dataset.h||cv.getAttribute('height'));cv.dataset.h=h;
  cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.round(h*d);cv.style.height=h+'px';
  var x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x:x,w:r.width,h:h}}
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
 chips:['Proyecto académico','Node.js + Express','MongoDB','RSA 2048 + JWT','Keras','R'],cover:'q-red',
 tldr:['Una moneda estable solo sirve si es segura y si vuelve a su precio objetivo después de un susto. ¿Cómo se construye eso y de qué depende?',
       'Programamos la cadena de bloques, las firmas y el monedero, y estudiamos la estabilidad con estadística multivariada, una red neuronal y una ecuación diferencial.',
       'Un sistema completo de punta a punta, del registro del usuario al bloque minado, más un modelo que muestra cuánto tarda el precio en recuperarse.'],
 kpis:[['SHA-256','encadena cada bloque con el anterior'],['RSA 2048','firma de cada transacción'],['7→16→8→1','red neuronal que clasifica riesgo'],['180','días de precio simulados']],
 steps:[
  ['Identidad','Registro y llaves','Al registrarse, el usuario recibe un par de llaves RSA de 2048 bits. La privada se entrega una sola vez y no se guarda en el servidor. Contraseñas con bcrypt y sesiones con JWT.',null,'q-main'],
  ['Firma','Cada pago va firmado','Para enviar monedas, el usuario firma la transacción con su llave privada. El servidor verifica la firma con la llave pública antes de tocar cualquier saldo.',null,'q-tx'],
  ['Bloques','La cadena','Cada bloque guarda su índice, sus transacciones, el hash del bloque anterior y su propio hash SHA-256. Cambiar un bloque viejo rompe todos los que siguen.','Débito, crédito y minado del bloque ocurren en una sola transacción atómica de MongoDB: o pasa todo o no pasa nada.',null],
  ['Estadística','¿Qué distingue a una moneda estable?','En R: matriz de correlación, PCA y k-means sobre variables financieras de stablecoins. El respaldo en dinero fiat se asocia con menor volatilidad (−0.91) y la volatilidad con mayor riesgo (0.87).',null,'q-heat'],
  ['Red neuronal','Clasificador de riesgo','Una red densa en Keras con 7 entradas financieras, dos capas ocultas de 16 y 8 neuronas y una salida que estima la probabilidad de riesgo alto.',null,'q-red'],
  ['Dinámica','El precio como ecuación diferencial','dP/dt = α(R − P) + βD(t) − γI(t). El respaldo jala el precio hacia su objetivo R, la demanda lo empuja y la inflación lo erosiona. Resuelta por el método de Euler para 180 días.',null,'q-disp']],
 gal:[['q-main','Imagen del proyecto'],['q-tx','Concepto del monedero: enviar y recibir'],['q-red','Arquitectura de la red neuronal de riesgo'],['q-heat','Correlaciones entre variables financieras'],['q-radar','Perfil de QchauCoin'],['q-disp','Volatilidad contra liquidez por stablecoin']],
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
  r.appendChild(el('div','foot3','<div class="lim"><h4>Puntos débiles, dicho sin rodeos</h4><p>'+p.lim+'</p></div><div class="meta"><h4>Código</h4><p>Todo el código, los notebooks y la documentación están en el repositorio.</p><p style="margin-top:8px"><a href="'+p.repo[0]+'" target="_blank" rel="noopener noreferrer">'+p.repo[1]+'</a></p></div>'));
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
  ['Producto',[['api','FastAPI y Express',[1,3]],['map','Leaflet',[1]],['chart','Power BI',[1,2]],['key','RSA, JWT y bcrypt',[3]]]]];
  $('inv').innerHTML=G.map(function(g){return '<div><h4>'+g[0]+'</h4><ul>'+g[1].map(function(t){return '<li>'+ic(t[0])+t[1]+'<span>'+P.map(function(p,i){return '<i style="background:'+(t[2].indexOf(i)>=0?p.c:'transparent')+'" title="'+short[p.id]+'"></i>'}).join('')+'</span></li>'}).join('')+'</ul></div>'}).join('')})();

document.querySelector('.brand').addEventListener('click',function(e){e.preventDefault();go('inicio')});
window.addEventListener('hashchange',function(){go(location.hash.slice(1),true)});
go((location.hash||'#inicio').slice(1),true);

/* ================= PIXEL ART (motor propio) ================= */
var RAMP={
 blue:{o:'#1f3566',d:'#2b4a8f',m:'#5b7fc7',l:'#b9cdf0',w:'#f4f7fd'},
 rose:{o:'#2b1a24',d:'#a8325f',m:'#e8559a',l:'#f7b6d3',w:'#fff0f6'},
 red:{o:'#1f3566',d:'#9c3a50',m:'#d16a80',l:'#f3c6d0',w:'#fdf2f4'},
 sage:{o:'#1f3566',d:'#256b5a',m:'#4f9e86',l:'#bfe3d6',w:'#effaf6'},
 lav:{o:'#1f3566',d:'#4f4194',m:'#8a79c9',l:'#d9d1f2',w:'#f5f2fc'},
 gold:{o:'#1f3566',d:'#8a5f14',m:'#cf9a35',l:'#f1dba6',w:'#fdf7e8'},
 teal:{o:'#1f2b3a',d:'#1f7f80',m:'#44b8b8',l:'#bfeeee',w:'#f2fbfb'},
 leaf:{o:'#2f2a24',d:'#3f7a34',m:'#6baf5d',l:'#a9d68f',w:'#eaf6df'}};
var ORD='wlmd';
function cov(s,x,y){var dx,dy;switch(s.t){
 case'c':dx=x-s.x;dy=y-s.y;return dx*dx+dy*dy<=s.r*s.r&&(!s.cut||y<=s.cut);
 case'e':var a=s.a||0;dx=x-s.x;dy=y-s.y;var u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a);return u*u/(s.rx*s.rx)+v*v/(s.ry*s.ry)<=1&&(!s.cut||y<=s.cut);
 case'r':return x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h;
 case'p':var p=s.p,inn=false;for(var i=0,j=p.length-1;i<p.length;j=i++){if(((p[i][1]>y)!==(p[j][1]>y))&&(x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0]))inn=!inn}return inn;
 case'l':for(var k=0;k<s.p.length-1;k++){var ax=s.p[k][0],ay=s.p[k][1],vx=s.p[k+1][0]-ax,vy=s.p[k+1][1]-ay,t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy))),qx=ax+vx*t-x,qy=ay+vy*t-y;if(qx*qx+qy*qy<=s.w*s.w/4)return true}return false;
 case'g':var row=s.g[Math.floor(y-s.y)];if(!row)return false;var ch=row[Math.floor(x-s.x)];return !!ch&&ch!=='.'}
 return false}
function pix(def,ramp,cls,attrs){
 var W=def[0],H=def[1],shapes=def[2],R=typeof ramp==='string'?RAMP[ramp]:ramp,N=W*H,id=new Int16Array(N).fill(-1),col=new Array(N),
     bb=shapes.map(function(){return[1e9,1e9,-1e9,-1e9]}),x,y;
 shapes.forEach(function(s,si){for(y=0;y<H;y++)for(x=0;x<W;x++)if(cov(s,x+.5,y+.5)){id[y*W+x]=si;var b=bb[si];if(x<b[0])b[0]=x;if(y<b[1])b[1]=y;if(x>b[2])b[2]=x;if(y>b[3])b[3]=y}});
 for(y=0;y<H;y++)for(x=0;x<W;x++){var i=y*W+x,si=id[i];if(si<0)continue;var s=shapes[si];
  if(s.t==='g'){var ch=s.g[y-s.y][x-s.x],k=(s.m&&s.m[ch])||ch;col[i]=R[k]||k;continue}
  var edge=false;
  if(!s.no)for(var q=0;q<4;q++){var nx=x+[1,-1,0,0][q],ny=y+[0,0,1,-1][q];if(nx<0||ny<0||nx>=W||ny>=H){edge=true;break}var nj=id[ny*W+nx];if(nj<0||(nj<si&&!(s.k&&shapes[nj].k===s.k))){edge=true;break}}
  if(edge){col[i]=R.o;continue}
  var f=s.f||'l',o=ORD.indexOf(f);
  if(s.sh&&o>=0){var b=bb[si],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,v=((x-cx)/Math.max(1,(b[2]-b[0])/2)+(y-cy)/Math.max(1,(b[3]-b[1])/2))/2;
    if(v<-.38)f=ORD[Math.max(0,o-1)];else if(v>.42)f=ORD[Math.min(3,o+1)]}
  col[i]=R[f]||f}
 var out='';for(y=0;y<H;y++){var x0=0;while(x0<W){var c=col[y*W+x0];if(!c){x0++;continue}var x1=x0+1;while(x1<W&&col[y*W+x1]===c)x1++;out+='<rect x="'+x0+'" y="'+y+'" width="'+(x1-x0)+'" height="1" fill="'+c+'"/>';x0=x1}}
 return '<svg class="px '+(cls||'')+'" viewBox="0 0 '+W+' '+H+'" shape-rendering="crispEdges" aria-hidden="true" '+(attrs||'')+'>'+out+'</svg>'}

/* --- sprites originales --- */
function dFlower(sc){sc=sc||1;var S=[],c=function(v){return v*sc};
 S.push({t:'l',p:[[c(36),c(40)],[c(37),c(58)],[c(34),c(76)],[c(35),c(96)]],w:Math.max(1.4,c(3.2)),f:'d'});
 S.push({t:'e',x:c(25),y:c(66),rx:c(13),ry:c(4.6),a:.52,f:'m',sh:1});S.push({t:'e',x:c(48),y:c(58),rx:c(13),ry:c(4.4),a:-.48,f:'m',sh:1});
 if(sc>.6){S.push({t:'l',p:[[c(15),c(60)],[c(34),c(71)]],w:1,f:'d',no:1});S.push({t:'l',p:[[c(38),c(64)],[c(59),c(52)]],w:1,f:'d',no:1})}
 var P=[];for(var k=0;k<6;k++){var a=(-90+k*60+12)*Math.PI/180;P.push(a)}P.sort(function(a,b){return Math.sin(a)-Math.sin(b)});
 P.forEach(function(a){S.push({t:'e',x:c(36)+Math.cos(a)*c(13),y:c(30)+Math.sin(a)*c(11),rx:c(13.5),ry:c(8.5),a:a,f:'l',sh:1})});
 S.push({t:'c',x:c(36),y:c(30),r:c(7.5),f:'d'});S.push({t:'c',x:c(35),y:c(29),r:c(4.2),f:'m',no:1});
 return [Math.ceil(c(72)),Math.ceil(c(96)),S]}
function dTiny(){return[11,16,[{t:'l',p:[[5.5,8],[5.5,16]],w:1.4,f:'d'},{t:'e',x:3,y:12.5,rx:3,ry:1.4,a:.6,f:'m'},{t:'c',x:5.5,y:2.8,r:2.4,f:'l',k:'f'},{t:'c',x:2.8,y:5.2,r:2.4,f:'l',k:'f'},{t:'c',x:8.2,y:5.2,r:2.4,f:'l',k:'f'},{t:'c',x:4,y:8,r:2.2,f:'l',k:'f'},{t:'c',x:7,y:8,r:2.2,f:'l',k:'f'},{t:'c',x:5.5,y:5.5,r:1.6,f:'d'}]]}
var G_SPARK=['...x...','...x...','..xxx..','xxxxxxx','..xxx..','...x...','...x...'];
function dSpark(){return[7,7,[{t:'g',x:0,y:0,g:G_SPARK,m:{x:'m'}}]]}
function dHeart(){return[7,6,[{t:'g',x:0,y:0,g:['.oo.oo.','omlmmmo','ommmmmo','.ommmo.','..omo..','...o...']}]]}
function dComputer(){return[40,40,[{t:'r',x:0,y:32,w:40,h:8,f:'w'},{t:'r',x:5,y:35,w:11,h:1,f:'m',no:1},{t:'r',x:24,y:35,w:11,h:1,f:'m',no:1},
 {t:'r',x:9,y:28,w:20,h:5,f:'l',sh:1},{t:'r',x:20,y:30,w:6,h:1,f:'d',no:1},{t:'r',x:15,y:25,w:8,h:4,f:'l'},
 {t:'r',x:4,y:2,w:30,h:24,f:'w',sh:1},{t:'r',x:8,y:5,w:22,h:16,f:'m'},{t:'r',x:9,y:6,w:20,h:2,f:'l',no:1},
 {t:'g',x:13,y:10,g:['.ww.....ww.','.ww.....ww.','...........','.w.......w.','..wwwwwww..'],m:{w:'w'}},{t:'r',x:27,y:23,w:3,h:1,f:'d',no:1}]]}
function dCat(){return[18,18,[{t:'l',p:[[13,16],[17,12],[16,7]],w:2.2,f:'w'},{t:'e',x:9,y:13,rx:5.6,ry:4.6,f:'w'},
 {t:'c',x:8.5,y:7.5,r:4.7,f:'w',k:'h'},{t:'p',p:[[3.6,6],[4.4,.6],[7.6,3.6]],f:'w',k:'h'},{t:'p',p:[[9.6,3.6],[12.8,.6],[13.4,6]],f:'w',k:'h'},
 {t:'g',x:6,y:7,g:['o...o','..m..'],m:{o:'o',m:'m'}},{t:'g',x:6,y:16,g:['o..o'],m:{o:'o'}}]]}
function dMush(){return[14,14,[{t:'r',x:4.5,y:7,w:5,h:7,f:'w'},{t:'e',x:7,y:7.5,rx:6.8,ry:6,f:'m',sh:1,cut:7.6},{t:'g',x:4,y:3,g:['w....','.....','...w.'],m:{w:'w'}}]]}
function dCrystal(){return[14,18,[{t:'p',p:[[7,.4],[13.4,6],[11,17.6],[3,17.6],[.6,6]],f:'l',sh:1},{t:'l',p:[[7,1.5],[7,16.5]],w:1,f:'m',no:1},{t:'l',p:[[1.5,6.2],[12.5,6.2]],w:1,f:'w',no:1}]]}
function dMailbox(){return[26,34,[{t:'r',x:11,y:18,w:4,h:16,f:'d'},{t:'r',x:2,y:8,w:22,h:12,f:'m',sh:1,k:'mb'},{t:'e',x:13,y:8.5,rx:11,ry:6,f:'m',cut:8.5,k:'mb'},
 {t:'r',x:6,y:2,w:9,h:7,f:'w'},{t:'r',x:22,y:4,w:2,h:9,f:'d'},{t:'r',x:22,y:4,w:4,h:3,f:'d'}]]}
function dRadio(){return[26,16,[{t:'l',p:[[5,3.5],[7,.8],[19,.8],[21,3.5]],w:1.4,f:'d'},{t:'r',x:1,y:3,w:24,h:12,f:'l',sh:1},{t:'c',x:7,y:9.5,r:3.6,f:'m'},{t:'c',x:19,y:9.5,r:3.6,f:'m'},{t:'r',x:11,y:6,w:4,h:2,f:'d',no:1}]]}
function dPot(){return[16,24,[{t:'l',p:[[8,14],[8,6]],w:1.4,f:'d'},{t:'e',x:5,y:10,rx:3,ry:1.4,a:.5,f:'m'},{t:'e',x:11,y:9,rx:3,ry:1.4,a:-.5,f:'m'},
 {t:'c',x:8,y:4,r:3.2,f:'l',sh:1},{t:'c',x:8,y:4,r:1.2,f:'d',no:1},{t:'p',p:[[3,15],[13,15],[12,23.5],[4,23.5]],f:'m',sh:1},{t:'r',x:2,y:13,w:12,h:3,f:'l'}]]}
function dTree(){return[22,26,[{t:'r',x:9.5,y:16,w:3,h:10,f:'d'},{t:'c',x:11,y:10,r:8,f:'m',sh:1,k:'t'},{t:'c',x:6,y:13,r:5,f:'m',sh:1,k:'t'},{t:'c',x:16,y:13,r:5,f:'m',sh:1,k:'t'}]]}
function dCloud(){return[30,12,[{t:'g',x:0,y:0,g:['.........wwwwww...............','.......wwwwwwwwww.............','.....wwwwwwwwwwwwww..wwwww....','..wwwwwwwwwwwwwwwwwwwwwwwwww..','.wwwwwwwwwwwwwwwwwwwwwwwwwwww.','wwwwwwwwwwwwwwwwwwwwwwwwwwwwww','.llllllllllllllllllllllllllll.'],m:{w:'#ffffff',l:'w'}}]]}
function dFlag(){return[16,22,[{t:'r',x:3,y:2,w:1.6,h:20,f:'d'},{t:'p',p:[[4.6,2],[14,5],[4.6,8.6]],f:'m'}]]}
function dDato(){return[30,30,[{t:'r',x:5,y:7,w:20,h:17,f:'l',k:'db'},{t:'e',x:15,y:24,rx:10,ry:4.2,f:'l',k:'db',sh:1},{t:'e',x:15,y:7,rx:10,ry:4.2,f:'w'},
 {t:'l',p:[[5.5,15.5],[24.5,15.5]],w:1,f:'m',no:1},{t:'g',x:10,y:11,g:['oo......oo','ow......ow'],m:{o:'o',w:'w'}},{t:'g',x:8,y:16,g:['mm..o..o..mm','.....oo.....'],m:{m:'m',o:'o'}},
 {t:'g',x:2,y:13,g:['o','.o'],m:{o:'o'}},{t:'g',x:27,y:13,g:['.o','o'],m:{o:'o'}}]]}
var G_AV=['...oooooo...','..ohhhhhho..','.ohhhhhhhho.','.ohssssssho.','.ohsossosho.','.ohssssssho.','..ossoosso..','...oossoo...','.occccccccо.','occccccccccо','occccccccccо','.osccccccso.','..oppppppo..','..oppppppo..','..opo..opo..','..ooo..ooo..'];
function dAvatar(c){return[12,16,[{t:'g',x:0,y:0,g:G_AV.map(function(r){return r.replace(/о/g,'o').padEnd(12,'.').slice(0,12)}),m:{h:'#2b2238',s:'#f2c6a3',c:c||'m',p:'#3c4a73',o:'o'}}]]}
function dBalloon(){return[18,26,[{t:'l',p:[[6,17],[7.5,22]],w:.8,f:'d'},{t:'l',p:[[12,17],[10.5,22]],w:.8,f:'d'},{t:'r',x:6.5,y:21,w:5,h:4,f:'d'},
 {t:'e',x:9,y:9,rx:8,ry:9,f:'l',sh:1,k:'b'},{t:'e',x:9,y:9,rx:3,ry:9,f:'m',no:1}]]}
function dBoat(){return[20,16,[{t:'p',p:[[1,11],[19,11],[16,15],[4,15]],f:'d'},{t:'r',x:9.5,y:1,w:1.2,h:10,f:'d'},{t:'p',p:[[10.7,1.5],[17,10],[10.7,10]],f:'w'},{t:'p',p:[[9.5,3],[9.5,10],[4,10]],f:'l'}]]}
/* misiones */
function dMis(id){
 if(id==='fraude')return[24,24,[{t:'p',p:[[12,1],[22,4],[21,13],[12,23],[3,13],[2,4]],f:'l',sh:1},{t:'p',p:[[12,4],[19,6.2],[18.3,12.5],[12,19.6],[5.7,12.5],[5,6.2]],f:'w',no:1},{t:'g',x:11,y:6,g:['dd','dd','dd','dd','dd','..','dd'],m:{d:'d'}}]];
 if(id==='milpin')return[24,24,[{t:'c',x:12,y:15,r:7.6,f:'l',k:'dr',sh:1},{t:'p',p:[[12,.8],[19,11.5],[5,11.5]],f:'l',k:'dr'},{t:'e',x:13.5,y:16,rx:3.8,ry:1.7,a:-.6,f:'m'},{t:'l',p:[[10,20],[13,16]],w:1.2,f:'d',no:1},{t:'g',x:8,y:9,g:['w.','w.','.w'],m:{w:'w'}}]];
 if(id==='observatorio')return[24,24,[{t:'r',x:4,y:11,w:16,h:12,f:'w'},{t:'p',p:[[.6,12.5],[12,1.5],[23.4,12.5]],f:'m',sh:1},{t:'g',x:9,y:14,g:['.d.d.','ddddd','.ddd.','..d..'],m:{d:'d'}}]];
 return[24,24,[{t:'c',x:12,y:12,r:10.8,f:'l',sh:1},{t:'c',x:12,y:12,r:7.6,f:'m'},{t:'g',x:10,y:8,g:['.www.','w...w','w...w','w...w','w.w.w','w..w.','.ww.w'],m:{w:'w'}}]]}
/* oficio */
function dWork(k){
 if(k==='db')return[24,24,[{t:'r',x:4,y:5,w:16,h:14,f:'l',k:'db'},{t:'e',x:12,y:19,rx:8,ry:3,f:'l',k:'db',sh:1},{t:'e',x:12,y:5,rx:8,ry:3,f:'w'},{t:'l',p:[[4.5,12],[19.5,12]],w:1,f:'m',no:1}]];
 if(k==='pipe')return[24,24,[{t:'l',p:[[5.5,6.5],[12,18],[18.5,6.5]],w:1.8,f:'d'},{t:'r',x:2,y:3,w:7,h:7,f:'l',sh:1},{t:'r',x:15,y:3,w:7,h:7,f:'l',sh:1},{t:'r',x:8.5,y:14.5,w:7,h:7,f:'m',sh:1}]];
 if(k==='lupa')return[24,24,[{t:'l',p:[[15,15],[22,22]],w:3.4,f:'d'},{t:'c',x:10,y:10,r:8,f:'m'},{t:'c',x:10,y:10,r:5.4,f:'w',sh:1}]];
 return[24,24,[{t:'r',x:3,y:12,w:5,h:10,f:'l',sh:1},{t:'r',x:9.5,y:5,w:5,h:17,f:'m',sh:1},{t:'r',x:16,y:9,w:5,h:13,f:'l',sh:1}]]}
var MRAMP={fraude:'red',milpin:'sage',observatorio:'lav',qchaucoin:'gold'};
var PIXR={fusion:MRAMP,jardin:MRAMP,pixo:{fraude:'rose',milpin:'rose',observatorio:'rose',qchaucoin:'rose'},bloques:MRAMP,mundo:MRAMP};

/* ================= VOXELES (isométrico) ================= */
var VX={g:['#8fcf6f','#9b6a43','#7e5434'],d:['#b98256','#9b6a43','#7e5434'],s:['#ccd0d6','#a9adb5','#8f939c'],w:['#9fdcf7','#6cc0ea','#58a9d6'],
 l:['#73bf5c','#5aa548','#4a8c3b'],t:['#a8754a','#8a5d38','#704a2c'],n:['#f6e3b4','#e2c88e','#cdb174'],p:['#f7b8d2','#e993b8','#d47aa1'],
 v:['#c9b8f2','#a690e0','#8a74cc'],o:['#f4cf63','#d9ac3a','#bf9228'],y:['#e9d36a','#c9b24c','#ad973c'],r:['#d8657f','#bb4b66','#9e3c55'],c:['#fffaf0','#e9e1d3','#d6ccbb']};
function iso(blocks,s){s=s||12;var has={},vs=[];blocks.forEach(function(b){has[b[0]+','+b[1]+','+b[2]]=1});
 blocks=blocks.slice().sort(function(a,b){return(a[0]+a[1])-(b[0]+b[1])||a[2]-b[2]||a[0]-b[0]});
 var out='',mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
 function poly(pts,c){pts.forEach(function(p){mnx=Math.min(mnx,p[0]);mny=Math.min(mny,p[1]);mxx=Math.max(mxx,p[0]);mxy=Math.max(mxy,p[1])});
   out+='<polygon points="'+pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ')+'" fill="'+c+'" stroke="'+c+'" stroke-width=".6" stroke-linejoin="round"/>'}
 blocks.forEach(function(b){var x=b[0],y=b[1],z=b[2],C=VX[b[3]]||VX.g,cx=(x-y)*s,cy=(x+y)*s*.5-z*s;
  if(!has[x+','+(y+1)+','+z])poly([[cx-s,cy],[cx,cy+s/2],[cx,cy+s*1.5],[cx-s,cy+s]],C[1]);
  if(!has[(x+1)+','+y+','+z])poly([[cx,cy+s/2],[cx+s,cy],[cx+s,cy+s],[cx,cy+s*1.5]],C[2]);
  if(!has[x+','+y+','+(z+1)]){poly([[cx,cy-s/2],[cx+s,cy],[cx,cy+s/2],[cx-s,cy]],C[0]);
    if(b[3]==='g'){out+='<polygon points="'+[[cx-s,cy],[cx,cy+s/2],[cx,cy+s*.75],[cx-s,cy+s*.25]].map(function(p){return p.join(',')}).join(' ')+'" fill="'+VX.l[1]+'"/><polygon points="'+[[cx,cy+s/2],[cx+s,cy],[cx+s,cy+s*.25],[cx,cy+s*.75]].map(function(p){return p.join(',')}).join(' ')+'" fill="'+VX.l[2]+'"/>'}}});
 var pad=2;return '<svg class="vx" viewBox="'+(mnx-pad)+' '+(mny-pad)+' '+(mxx-mnx+pad*2)+' '+(mxy-mny+pad*2)+'" aria-hidden="true">'+out+'</svg>'}
function island(R,top,extra,seed){var B=[],rnd=mulberry(seed||7);
 for(var x=-R;x<=R;x++)for(var y=-R;y<=R;y++){var d=Math.sqrt(x*x+y*y);if(d>R+.3)continue;var h=Math.max(1,Math.round(3-d*.55+rnd()*.8));
  for(var z=0;z<h;z++)B.push([x,y,z,z===h-1?top:(z<h-2?'s':'d')]);}
 return B.concat(extra||[])}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vTree(x,y,z,lv,h){var B=[];h=h||3;for(var i=0;i<h;i++)B.push([x,y,z+i,'t']);for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++){B.push([x+a,y+b,z+h,lv]);if(!a||!b)B.push([x+a,y+b,z+h+1,lv])}B.push([x,y,z+h+2,lv]);return B}
function topZ(B,x,y){var m=-1;B.forEach(function(b){if(b[0]===x&&b[1]===y&&b[2]>m)m=b[2]});return m+1}
function vScene(id){var B;
 if(id==='hero'){B=island(5,'g',[],11);var t=vTree(-2,-2,topZ(B,-2,-2),'l',3);B=B.concat(t);
   for(var i=0;i<3;i++)B.push([3,-3,topZ(B,3,-3),'s']);B.push([3,-3,topZ(B,3,-3),'o']);
   [[2,3],[3,2],[1,4],[4,1]].forEach(function(p){var z=topZ(B,p[0],p[1])-1;B=B.filter(function(b){return!(b[0]===p[0]&&b[1]===p[1]&&b[2]===z)});B.push([p[0],p[1],z,'w'])});
   B=B.concat(vTree(2,-1,topZ(B,2,-1),'l',2));return iso(B,12)}
 if(id==='fraude'){B=island(3,'g',[],3);B=B.concat(vTree(-1,0,topZ(B,-1,0),'p',2));for(var j=0;j<2;j++)B.push([1,1,topZ(B,1,1),'s']);B.push([1,1,topZ(B,1,1),'r']);return iso(B,12)}
 if(id==='milpin'){B=island(3,'g',[],5);[[-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2]].forEach(function(p){var z=topZ(B,p[0],p[1])-1;B=B.filter(function(b){return!(b[0]===p[0]&&b[1]===p[1]&&b[2]===z)});B.push([p[0],p[1],z,'w'])});
   [[1,-1],[1,0],[1,1],[2,0],[0,-2],[0,2]].forEach(function(p){B.push([p[0],p[1],topZ(B,p[0],p[1]),'y'])});return iso(B,12)}
 if(id==='observatorio'){B=island(3,'g',[],9);var z0=topZ(B,0,0);for(var a=-1;a<=1;a++)for(var b=-1;b<=0;b++){B.push([a,b,z0,'c']);B.push([a,b,z0+1,'c'])}
   for(a=-1;a<=1;a++)for(b=-1;b<=0;b++)B.push([a,b,z0+2,'v']);B.push([0,0,z0+3,'v']);B.push([2,2,topZ(B,2,2),'v']);return iso(B,12)}
 B=island(3,'n',[],13);var zz=topZ(B,0,0);for(var q=-1;q<=1;q++)for(var r=-1;r<=1;r++)B.push([q,r,zz,'o']);B.push([0,0,zz+1,'o']);B.push([0,-1,zz+1,'o']);B.push([-1,0,zz+1,'o']);B.push([0,0,zz+2,'o']);return iso(B,12)}

/* ================= ISLAS (mundo) ================= */
function blob(cx,cy,r,seed,amp){var rnd=mulberry(seed),n=9,pts=[],ph=rnd()*6;for(var i=0;i<n;i++){var a=i/n*Math.PI*2,rr=r*(1+(amp||.16)*Math.sin(a*3+ph)+.08*(rnd()-.5));pts.push([cx+Math.cos(a)*rr*1.18,cy+Math.sin(a)*rr*.78])}
 var d='';for(i=0;i<n;i++){var p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];if(!i)d+='M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1);
  d+='C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1)}
 return d+'Z'}
var ISL=[{id:'fraude',x:128,y:318,r:62,s:3,t:'Detectar lo raro'},{id:'milpin',x:262,y:150,r:66,s:8,t:'Regar mejor'},{id:'observatorio',x:440,y:300,r:68,s:5,t:'Ayudar primero'},{id:'qchaucoin',x:500,y:118,r:54,s:12,t:'Moneda estable'}];
function worldMap(){var W=620,H=440,s='<svg class="wmap" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Mapa del mundo: cuatro islas, una por misión">';
 s+='<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdeefb"/><stop offset="1" stop-color="#9fd8f2"/></linearGradient></defs><rect width="'+W+'" height="'+H+'" rx="22" fill="url(#sea)"/>';
 for(var w=0;w<14;w++){var rx=mulberry(w+40),x=rx()*W,y=rx()*H;s+='<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+'q6 -4 12 0 t12 0" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>'}
 var pts=ISL.map(function(i){return[i.x,i.y-10]}),d='M'+pts[0].join(' ');for(var k=1;k<pts.length;k++){var a=pts[k-1],b=pts[k];d+='Q'+((a[0]+b[0])/2+(k%2?-40:40))+' '+((a[1]+b[1])/2+(k%2?-30:30))+' '+b.join(' ')}
 s+='<path class="route" d="'+d+'"/>';
 ISL.forEach(function(I,i){var p=P[i];
  s+='<g class="isl" data-i="'+i+'" role="button" tabindex="0" aria-label="Isla '+p.n+': '+p.title+'">';
  s+='<path d="'+blob(I.x,I.y,I.r*1.32,I.s)+'" fill="#e6f8fd" opacity=".75"/><path d="'+blob(I.x,I.y,I.r*1.06,I.s)+'" fill="#f4e2b6"/><path d="'+blob(I.x,I.y-4,I.r*.92,I.s+1,.2)+'" fill="#a6d98c"/><path d="'+blob(I.x-8,I.y-10,I.r*.5,I.s+2,.25)+'" fill="#8cc777"/>';
  s+='<g transform="translate('+(I.x-22)+' '+(I.y-52)+')">'+pix(dMis(I.id),MRAMP[I.id],'','width="44" height="44"')+'</g>';
  [[-34,4],[30,-2],[22,16]].forEach(function(o,j){s+='<g transform="translate('+(I.x+o[0]-8)+' '+(I.y+o[1]-14)+')">'+pix(dTree(),j%2?'leaf':MRAMP[I.id]==='red'?'red':'leaf','','width="16" height="19"')+'</g>'});
  var lx=I.x-58,ly=I.y-112;s+='<g class="pin"><rect x="'+lx+'" y="'+ly+'" width="116" height="40" rx="10" fill="#fff" stroke="rgba(42,33,64,.1)"/><circle cx="'+(lx+2)+'" cy="'+(ly+2)+'" r="13" fill="'+p.c+'"/><text x="'+(lx+2)+'" y="'+(ly+6.5)+'" text-anchor="middle" class="pn">'+p.n+'</text><text x="'+(lx+58)+'" y="'+(ly+18)+'" text-anchor="middle" class="pt">'+short[p.id].toUpperCase()+'</text><text x="'+(lx+58)+'" y="'+(ly+32)+'" text-anchor="middle" class="ps">'+I.t+'</text></g></g>'});
 s+='<g class="me" id="wm-me">'+pix(dAvatar('#e8457a'),'blue','','x="-12" y="-34" width="24" height="32"')+'<ellipse cx="0" cy="0" rx="10" ry="3" fill="rgba(0,0,0,.18)"/></g>';
 s+='<g class="drift d1" transform="translate(40 40)">'+pix(dCloud(),'blue','','width="60" height="24"')+'</g><g class="drift d2" transform="translate(330 280)">'+pix(dCloud(),'blue','','width="48" height="19"')+'</g>';
 s+='<g class="bob" transform="translate(560 30)">'+pix(dBalloon(),'red','','width="30" height="43"')+'</g><g class="bob b2" transform="translate(300 392)">'+pix(dBoat(),'blue','','width="30" height="24"')+'</g>';
 return s+'</svg>'}

/* ================= SKINS ================= */
var GH='https://github.com/Zidnz',LI='https://www.linkedin.com/in/omar-guti%C3%A9rrez-88507527a/';
var SKINS=[
 {id:'jardin',name:'Jardín pixel',d:'Crema y azul marino, flores, computadora retro y ventanas',sw:['#f6f2e8','#1f3566','#b9cdf0']},
 {id:'pastel',name:'Tarjetas pastel',d:'Tarjetas redondas turquesa con carrusel de misiones',sw:['#ffffff','#44b8b8','#bfeeee']},
 {id:'fusion',name:'Jardín pastel',d:'La mezcla: el jardín pixel en turquesa con las tarjetas pastel',sw:['#fbfaf6','#2fa7a7','#ffc2d6']}];
var SKIN='jardin';
var KEYW={fraude:['fraud','banc','kafka','spark','transac','delta','alerta','grafo','lakehouse'],milpin:['rieg','agua','milp','fao','cultiv','postgis','xgboost','agro','yaqui'],
 observatorio:['cuid','observ','enasic','censo','encuest','regla','social','relevo'],qchaucoin:['moned','qchau','block','caden','rsa','cripto','stable','fintech']};
function matchMission(q){q=(q||'').toLowerCase();for(var k in KEYW)if(KEYW[k].some(function(w){return q.indexOf(w)>=0}))return k;return null}
var RES={fraude:'53.6% del fraude revisando 3.35%',milpin:'MVP desplegado, 115 pruebas',observatorio:'La regla simple empató a los modelos',qchaucoin:'Cadena, monedero y modelo de precio'};
function lic(n){return ic(n)}
function sp(def,ramp,cls){return pix(def,ramp,cls)}

function pastelGrid(){return '<div class="hpa-grid">'+
 '<div><h3>Proyectos ›</h3><div class="arts">'+P.slice(0,2).map(function(p){return '<button type="button" data-go="'+p.id+'"><img src="assets/img/'+p.cover+'.webp" alt=""><span>'+short[p.id]+'</span></button>'}).join('')+'</div><button class="vm" type="button" data-scroll="levels-h">Ver más</button></div>'+
 '<div><h3>Búsquedas recientes</h3><div class="srch">'+[['detección de fraude con Kafka','fraude'],['riego con FAO-56','milpin'],['esquema estrella ENASIC','observatorio'],['blockchain y RSA','qchaucoin'],['lakehouse con Delta Lake','fraude'],['PostGIS y parcelas','milpin']].map(function(s,i){return '<button type="button" data-go="'+s[1]+'" style="--k:'+i+'">'+ic('filter')+s[0]+'</button>'}).join('')+'</div></div>'+
 '<div class="nums">'+P.map(function(p){return '<button type="button" data-go="'+p.id+'" style="--c:'+p.c+'"><b>'+p.n+'</b><span><strong>'+short[p.id]+'</strong><small>'+RES[p.id]+'</small></span></button>'}).join('')+'</div></div>'}
var HERO={
mundo:function(){var p0=P[0];return '<div class="h-mundo"><div class="wrap hm">'+
 '<div class="hm-l"><p class="hey">HOLA, SOY OMAR ✿</p><h1>Convierto datos en <em>decisiones</em> <span class="scr">que se notan.</span></h1>'+
 '<p class="lede">Estudiante de Ciencia de Datos para el Negocio en la UNRC y ex Junior Data Analyst en Veolia. Cuatro misiones: fraude, agua, cuidados y finanzas.</p>'+
 '<div class="cta"><button class="btn" type="button" data-scroll="levels-h">Explorar mi mundo ✦</button><a class="btn ghost" href="'+GH+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>'+
 '<div class="gcard quest"><h4>MISIÓN ACTUAL</h4><div class="qrow">'+pix(dAvatar('#e8457a'),'blue','av')+'<p>Pasar de analista junior a Data Scientist junior, un proyecto a la vez.</p></div><div class="lvl"><span>Nv. 7 · semestre</span><span class="num">3/4 misiones</span></div><div class="bar"><i style="width:75%"></i></div><small>3 completas · Observatorio en curso</small></div>'+
 '<div class="gcard stk"><h4>INVENTARIO</h4><div class="ticons">'+[['py','Python'],['db','SQL'],['r','R'],['stream','Kafka'],['spark','Spark'],['map','PostGIS'],['tree','XGBoost'],['net','Keras']].map(function(t){return '<span title="'+t[1]+'">'+ic(t[0])+'<small>'+t[1]+'</small></span>'}).join('')+'</div></div></div>'+
 '<div class="hm-map"><div class="mapwrap">'+worldMap()+'</div><div class="keys"><span>Muévete con</span><kbd>←</kbd><kbd>→</kbd><span>o toca una isla · entra con</span><kbd>Enter</kbd></div></div>'+
 '<div class="hm-r"><div class="gcard pl">'+pix(dAvatar('#e8457a'),'blue','av big')+'<div class="who"><b>Omar</b><small>Ciencia de datos · CDMX</small></div>'+
 '<h4>XP DEL DÍA</h4><div class="bar"><i style="width:60%"></i></div><small class="num">4 misiones · 33 figuras · 5 simuladores</small>'+
 '<h4>INSIGNIAS</h4><div class="badges">'+P.map(function(p){return '<button type="button" data-go="'+p.id+'" title="'+p.title+'">'+pix(dMis(p.id),MRAMP[p.id])+'</button>'}).join('')+'</div></div>'+
 '<div class="gcard vibe" id="wm-card"></div>'+
 '<div class="note"><b>NOTA PARA MÍ</b><span class="scr">Progreso, no perfección.</span></div></div></div></div>'},
jardin:function(R){R=R||'blue';return '<div class="h-jardin"><div class="wrap hj">'+
 '<aside class="rail"><b>UNRC</b><small>7.º SEM</small>'+sp(dPot(),R)+'<hr><a href="'+GH+'" target="_blank" rel="noopener noreferrer">GH</a><a href="'+LI+'" target="_blank" rel="noopener noreferrer">IN</a></aside>'+
 '<div class="hj-t"><p class="tagp">OMAR GUTIÉRREZ ESCOTO</p><h1>Datos que<br>toman<br>decisiones</h1><p class="lede">Estudiante de Ciencia de Datos para el Negocio en la UNRC y ex Junior Data Analyst en Veolia. Cultivo modelos, pipelines y tableros que ayudan a decidir.</p>'+
 '<div class="cta"><button class="btn" type="button" data-scroll="levels-h">Ver misiones ›</button><a class="btn ghost" href="'+GH+'" target="_blank" rel="noopener noreferrer">GitHub ✿</a></div></div>'+
 '<div class="hj-s"><div class="sway f1">'+sp(dFlower(1),R)+'</div><div class="sway f2">'+sp(dFlower(.5),R)+'</div><div class="comp">'+sp(dComputer(),R)+'</div>'+
 '<div class="bubble">CARGANDO DATOS…<i></i></div><div class="cat">'+sp(dCat(),R)+'</div><div class="mush">'+sp(dMush(),R)+'</div><div class="hrt">'+sp(dHeart(),R)+'</div>'+
 [1,2,3,4,5].map(function(i){return '<div class="spk s'+i+'">'+sp(dSpark(),R)+'</div>'}).join('')+
 '<div class="row">'+[0,1,2,3,4,5,6].map(function(){return sp(dTiny(),R)}).join('')+'</div></div></div>'+
 '<div class="wrap"><div class="ticker">'+sp(dRadio(),R)+'<div class="tk"><div class="tk-in">'+(function(){var t='Ahora corriendo: lakehouse de fraude en Spark ♪ · · · batch = streaming ✓ · · · ETo del día: 7.1 mm · · · regla de 40 h contra modelos: sin ganador claro · · · QchauCoin = 1.00 · · · gracias por visitar ✦ · · · ';return '<span>'+t+'</span><span>'+t+'</span>'})()+'</div></div><span class="eq"><i></i><i></i><i></i><i></i></span></div></div></div>'},
fusion:function(){return HERO.jardin('teal')+'<div class="h-pastel h-fu"><div class="wrap">'+pastelGrid()+'</div></div>'},
pixo:function(){var R='rose';return '<div class="h-pixo"><div class="wrap hp"><h1>Datos pequeños.<br>Grandes decisiones.</h1>'+
 '<p class="lede">Soy Omar, estudiante de Ciencia de Datos para el Negocio. Dato, mi asistente, te lleva a cualquier misión.</p>'+
 '<div class="hp-scene"><div class="trees l">'+[0,1,2].map(function(){return sp(dTree(),R)}).join('')+'</div><div class="dato">'+sp(dDato(),R)+'<div class="say">'+sp(dHeart(),R)+'</div></div>'+
 '<div class="trees r">'+[0,1].map(function(){return sp(dTree(),R)}).join('')+sp(dFlag(),R)+'</div><div class="cl c1">'+sp(dCloud(),R)+'</div><div class="cl c2">'+sp(dCloud(),R)+'</div>'+
 '<div class="spk s1">'+sp(dSpark(),R)+'</div><div class="spk s2">'+sp(dHeart(),R)+'</div><div class="gnd"></div></div>'+
 '<form class="ask" id="px-ask"><span>✦</span><label for="px-q" class="vh">Pregúntale a Dato</label><input id="px-q" autocomplete="off" placeholder="Pregúntale a Dato: fraude, riego, cuidado, moneda…"><button type="submit" aria-label="Ir">→</button></form><p class="ans" id="px-ans" role="status">Escribe un tema y Dato te lleva a la misión.</p></div><div class="hp-band"></div></div>'},
bloques:function(){return '<div class="h-bloques"><div class="wrap"><div class="hb-card"><div class="hb-top"><div class="hb-t"><p class="lab">Portafolio de ciencia de datos</p><h1>Explorar<br>Modelar<br><em>Decidir</em></h1>'+
 '<p class="lede">Un portafolio construido bloque a bloque: datos reales, modelos que se auditan y decisiones que se pueden explicar.</p><div class="cta"><button class="btn" type="button" data-scroll="levels-h">Ver proyectos →</button><button class="btn ghost" type="button" data-go="fraude">▶ Primera misión</button></div></div>'+
 '<div class="hb-scene">'+vScene('hero')+'<div class="cl c1">'+pix(dCloud(),'blue')+'</div><div class="cl c2">'+pix(dCloud(),'blue')+'</div></div></div>'+
 '<div class="hb-about"><div class="pics"><img src="assets/img/m-app.webp" alt="Pantallas de MILPÍN"><img src="assets/img/o-home.webp" alt="Portada del Observatorio"></div><div><p class="lab">Sobre mí</p><h2>Un constructor de datos</h2><p>Un año como Junior Data Analyst en Veolia limpiando CRM real de varias unidades de negocio, más cuatro proyectos donde modelo, mido y explico. Una tabla a la vez.</p><a class="lnk" href="'+LI+'" target="_blank" rel="noopener noreferrer">Ver LinkedIn →</a></div></div>'+
 '<div class="hb-quote"><p>“Ideas pequeñas,<br>decisiones grandes.”</p><div class="strip">'+['fraude','milpin','observatorio','qchaucoin'].map(vScene).join('')+'</div></div></div></div></div>'},
pastel:function(){return '<div class="h-pastel"><div class="wrap"><div class="hpa-banner" id="pa-b"></div>'+pastelGrid()+'</div></div>'},
poster:function(){return '<div class="h-poster"><div class="wrap hpo"><div class="hpo-t"><p class="lab">Ciencia de datos<br>para el negocio</p><h1>Convierto datos en decisiones<b>.</b></h1>'+
 '<p class="lede">Omar Gutiérrez Escoto. Modelos, pipelines y tableros para fraude, agua, cuidados y finanzas. Ex Junior Data Analyst en Veolia.</p><button class="btn" type="button" data-scroll="levels-h">Ver mi trabajo ↗</button>'+
 '<p class="mini">01 · fraude &nbsp; 02 · riego &nbsp; 03 · cuidado &nbsp; 04 · fintech</p></div><div class="hpo-art">'+posterArt()+'</div></div>'+
 '<div class="hpo-band"><div class="mq"><span>FRAUDE / RIEGO / CUIDADO / FINTECH / PIPELINES / MODELOS / </span><span>FRAUDE / RIEGO / CUIDADO / FINTECH / PIPELINES / MODELOS / </span></div></div></div>'}
};
function posterArt(){var s='<svg viewBox="0 0 520 480" class="pa" aria-hidden="true"><circle cx="270" cy="230" r="200" fill="#f6b48a"/>';
 s+='<g fill="none" stroke="#121418" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">';
 s+='<rect x="150" y="120" width="240" height="160" rx="12" fill="#eef1ec"/><rect x="166" y="136" width="208" height="112" rx="4" fill="#7fd3d3"/>';
 s+='<polyline points="178,224 210,200 236,212 264,170 292,184 322,150 360,162" stroke-width="3"/><circle cx="322" cy="150" r="6" fill="#e5336b"/>';
 s+='<line x1="178" y1="236" x2="362" y2="236"/><path d="M250 280 l-14 40 h68 l-14 -40"/><line x1="214" y1="320" x2="326" y2="320"/>';
 s+='<circle cx="96" cy="300" r="16" fill="#eef1ec"/><circle cx="60" cy="380" r="12" fill="#eef1ec"/><circle cx="140" cy="390" r="12" fill="#eef1ec"/><line x1="86" y1="312" x2="66" y2="368"/><line x1="104" y1="314" x2="134" y2="378"/><line x1="112" y1="300" x2="150" y2="270"/>';
 s+='<path d="M400 330 h80 l-22 28 v34 l-36 18 v-52 z" fill="#eef1ec"/><line x1="392" y1="300" x2="392" y2="330"/>';
 s+='<circle cx="460" cy="90" r="22"/><line x1="430" y1="90" x2="490" y2="90"/><line x1="460" y1="60" x2="460" y2="120"/></g>';
 s+='<g font-family="IBM Plex Mono,monospace" font-size="11" fill="#121418"><text x="404" y="150">STUDIO / DATOS</text><text x="404" y="166">MODELOS</text><text x="404" y="180">PIPELINES</text><text x="404" y="194">TABLEROS</text>';
 s+='<text x="20" y="250" font-size="40" font-family="Anton,sans-serif">01</text><text x="20" y="268">FRAUDE · RIEGO</text><text x="20" y="282">CUIDADO · FINTECH</text></g>';
 for(var i=0;i<22;i++)s+='<rect x="'+(404+i*4)+'" y="206" width="'+(i%3?1.5:3)+'" height="22" fill="#121418"/>';
 s+='<text x="380" y="440" font-family="Caveat,cursive" font-size="24" fill="#121418" transform="rotate(-8 380 440)">mismo dato,</text><text x="388" y="464" font-family="Caveat,cursive" font-size="24" fill="#121418" transform="rotate(-8 388 464)">otra decisión</text>';
 return s+'</svg>'}

/* --- secciones compartidas que cambian con la skin --- */
var WORK=[['db','Datos reales','Limpieza de CRM real de varias unidades de negocio en Veolia: duplicados, etapas y monedas.','chart'],
 ['pipe','Pipelines','Kafka, Spark, Delta Lake, PostgreSQL con PostGIS y almacenes en esquema estrella.','layers'],
 ['lupa','Modelos auditados','Spark MLlib, XGBoost y regresión. Y sospechar cuando algo sale demasiado bien.','tree'],
 ['chart','Tableros','Power BI, Looker Studio y sitios propios para que alguien decida con los números.','screen']];
function renderShared(){var px=(SKIN==='jardin'||SKIN==='pixo'||SKIN==='bloques'||SKIN==='fusion'),R=SKIN==='pixo'?'rose':SKIN==='bloques'?'leaf':SKIN==='fusion'?'teal':'blue';
 $('what').innerHTML=WORK.map(function(w){return '<div class="wk"><span class="wi">'+(px?pix(dWork(w[0]),R):ic(w[3]))+'</span><h4>'+w[1]+'</h4><p>'+w[2]+'</p>'+(px?'<span class="wh">'+pix(dHeart(),R)+'</span>':'')+'</div>'}).join('');
 $('levels').innerHTML='';P.forEach(function(p,i){var x=X[p.id],th;
  if(SKIN==='jardin'||SKIN==='pixo'||SKIN==='fusion')th='<div class="thumb sprite">'+pix(dMis(p.id),PIXR[SKIN][p.id])+'<span class="tg">'+pix(dTiny(),PIXR[SKIN][p.id])+pix(dTiny(),PIXR[SKIN][p.id])+'</span></div>';
  else if(SKIN==='bloques')th='<div class="thumb vox">'+vScene(p.id)+'</div>';
  else if(SKIN==='mundo')th='<div class="thumb isle"><svg viewBox="0 0 200 120"><rect width="200" height="120" fill="#bfe7f7"/><path d="'+blob(100,70,48,ISL[i].s)+'" fill="#f4e2b6"/><path d="'+blob(100,66,42,ISL[i].s+1,.2)+'" fill="#a6d98c"/><g transform="translate(78 22)">'+pix(dMis(p.id),MRAMP[p.id],'','width="44" height="44"')+'</g></svg></div>';
  else th='<div class="thumb img"><img src="assets/img/'+p.cover+'.webp" alt=""></div>';
  var lv=el('button','lv',th+'<div class="in"><span class="no">'+(SKIN==='poster'?p.n:'MISIÓN '+p.n)+'</span><h3>'+p.title+'</h3><dl><dt>Dominio</dt><dd>'+x.card[0]+'</dd><dt>Técnica</dt><dd>'+x.card[1]+'</dd><dt>Resultado</dt><dd>'+RES[p.id]+'</dd></dl><span class="play">Entrar →</span></div>');
  lv.type='button';lv.style.setProperty('--lc',p.c);lv.onclick=function(){go(p.id)};$('levels').appendChild(lv)});
 var cd=$('cta-deco');cd.innerHTML=SKIN==='fusion'?'<span class="d1">'+pix(dMailbox(),'teal')+'</span><span class="d2">'+pix(dCat(),'teal')+'</span><span class="d3">'+pix(dFlower(.4),'teal')+'</span>':SKIN==='jardin'?'<span class="d1">'+pix(dMailbox(),'blue')+'</span><span class="d2">'+pix(dCat(),'blue')+'</span><span class="d3">'+pix(dFlower(.4),'blue')+'</span>':
  SKIN==='pixo'?'<span class="d1">'+pix(dDato(),'rose')+'</span><span class="d3">'+pix(dTree(),'rose')+'</span>':SKIN==='bloques'?'<span class="d1">'+vScene('milpin')+'</span>':SKIN==='mundo'?'<span class="d1">'+pix(dBalloon(),'red')+'</span><span class="d2">'+pix(dAvatar('#e8457a'),'blue')+'</span>':'';
 $('skin-cards').innerHTML=SKINS.map(function(k){return '<button type="button" data-skin="'+k.id+'" aria-pressed="'+(k.id===SKIN)+'"><span class="sw">'+k.sw.map(function(c){return '<i style="background:'+c+'"></i>'}).join('')+'</span><b>'+k.name+'</b><small>'+k.d+'</small></button>'}).join('');
 $('skin-dots').innerHTML=SKINS.map(function(k){return '<button type="button" data-skin="'+k.id+'" aria-pressed="'+(k.id===SKIN)+'" title="Estilo: '+k.name+'" aria-label="Estilo: '+k.name+'" style="--a:'+k.sw[0]+';--b:'+k.sw[1]+'"></button>'}).join('')}

/* --- comportamiento por skin --- */
var heroTimer=0;
function heroWire(){clearInterval(heroTimer);var h=$('hero');
 if(SKIN==='mundo'){var cur=0,me=$('wm-me'),card=$('wm-card'),gs=h.querySelectorAll('.isl');
  var sel=function(i){cur=(i+4)%4;var I=ISL[cur],p=P[cur];me.setAttribute('transform','translate('+I.x+' '+(I.y-8)+')');
   [].forEach.call(gs,function(g,j){g.classList.toggle('on',j===cur)});
   card.style.setProperty('--c',p.c);card.innerHTML='<h4>AHORA EXPLORANDO</h4><div class="vrow">'+pix(dMis(p.id),MRAMP[p.id])+'<div><b>'+p.n+' · '+short[p.id]+'</b><small>'+RES[p.id]+'</small></div></div><div class="ctrl"><button type="button" data-mv="-1" aria-label="Isla anterior">◀</button><button type="button" class="go" data-enter="1">Entrar</button><button type="button" data-mv="1" aria-label="Isla siguiente">▶</button></div>'};
  [].forEach.call(gs,function(g,j){g.addEventListener('click',function(){if(j===cur)go(P[j].id);else sel(j)});g.addEventListener('keydown',function(e){if(e.key==='Enter'){go(P[j].id)}})});
  card.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.mv)sel(cur+(+b.dataset.mv));else go(P[cur].id)});
  h._key=function(e){if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){sel(cur+1);e.preventDefault()}else if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){sel(cur-1);e.preventDefault()}else if(e.key==='Enter'&&!/BUTTON|A|INPUT/.test(document.activeElement.tagName))go(P[cur].id)};
  sel(0)}else h._key=null;
 if(SKIN==='pixo'){var f=$('px-ask'),q=$('px-q'),a=$('px-ans');
  q.addEventListener('input',function(){var m=matchMission(q.value);a.textContent=!q.value?'Escribe un tema y Dato te lleva a la misión.':m?'Encontré: '+P.filter(function(p){return p.id===m})[0].title+'. Presiona Enter.':'Aún no encuentro esa misión. Prueba con fraude, riego, cuidado o moneda.'});
  f.addEventListener('submit',function(e){e.preventDefault();var m=matchMission(q.value);if(m)go(m);else a.textContent='Aún no encuentro esa misión. Prueba con fraude, riego, cuidado o moneda.'})}
 if(SKIN==='pastel'){var S=[{t:'Omar',d:'Estudiante de Ciencia de Datos para el Negocio en la UNRC y ex Junior Data Analyst en Veolia. Cuatro proyectos, cada uno con su pipeline, su modelo y sus límites.',im:['f2-anillo','m-app','o-home'],go:null}].concat(P.map(function(p){return{t:short[p.id],d:p.sub,im:[p.cover].concat(p.gal.slice(1,3).map(function(g){return g[0]})),go:p.id,c:p.c}})),k=0,b=$('pa-b');
  var draw=function(){var s=S[k];b.innerHTML='<div class="t"><h1>'+s.t+'</h1><p>'+s.d+'</p>'+(s.go?'<button class="more" type="button" data-go="'+s.go+'">Entrar a la misión</button>':'<button class="more" type="button" data-scroll="levels-h">Ver proyectos</button>')+
   '<div class="dots">'+S.map(function(_,j){return '<button type="button" aria-label="Diapositiva '+(j+1)+'" class="'+(j===k?'on':'')+'" data-k="'+j+'"></button>'}).join('')+'</div></div><div class="collage">'+s.im.map(function(m,j){return '<img class="c'+j+'" src="assets/img/'+m+'.webp" alt="">'}).join('')+'<svg class="hz" viewBox="0 0 40 36"><path d="M20 34 C-8 14 6 -6 20 8 C34 -6 48 14 20 34Z" fill="#ff8fb1"/></svg></div>'};
  b.addEventListener('click',function(e){var d=e.target.closest('[data-k]');if(d){k=+d.dataset.k;draw()}});draw();if(!RM)heroTimer=setInterval(function(){if(!$('view-inicio').hidden&&!b.matches(':hover')){k=(k+1)%S.length;draw()}},6500)}
}
document.addEventListener('keydown',function(e){var h=$('hero');if(h&&h._key&&!$('view-inicio').hidden&&!(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)))h._key(e)});
document.addEventListener('click',function(e){var t=e.target.closest('[data-go],[data-scroll],[data-skin]');if(!t)return;
 if(t.dataset.skin){setSkin(t.dataset.skin);return}
 if(t.dataset.go){go(t.dataset.go);return}
 var n=$(t.dataset.scroll);if(n)n.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})});
function setSkin(id,init){if(!SKINS.some(function(k){return k.id===id}))id='jardin';SKIN=id;document.documentElement.setAttribute('data-skin',id);
 try{localStorage.setItem('zidnz-skin',id)}catch(e){}
 HOME.c=getComputedStyle(document.documentElement).getPropertyValue('--home').trim()||HOME.c;HOME.cs='color-mix(in srgb,'+HOME.c+' 13%,transparent)';tabBtn.inicio.style.setProperty('--tc',HOME.c);
 $('hero').innerHTML=HERO[id]();renderShared();heroWire();
 if(!init){var cur=Object.keys(views).filter(function(k){return !views[k].hidden})[0]||'inicio';go(cur,true)}
 setTimeout(function(){window.dispatchEvent(new Event('resize'))},60)}

/* ================= MAPA DE NODOS (hero) ================= */
(function(){if(!$('graph'))return;
  var cv=$('graph'),cap=$('g-cap'),W=0,H=0,ctx,N=[],E=[],sel=null,drag=null,moved=false,raf=0,t=0;
  var techs={'Python':[0,1,2,3],'SQL':[0,1,2],'PostgreSQL':[0,1],'Delta Lake':[0],'R':[2,3],'Spark':[0],'Kafka':[0],'MongoDB':[3],'FastAPI':[1],'PostGIS':[1],'XGBoost':[1],'scikit-learn':[1,2],'JavaScript':[1,2,3],'Power BI':[1,2],'Node.js':[3],'Keras':[3],'Muestreo':[2]};
  var names=['Fraude','MILPÍN','Observatorio','QchauCoin'];
  N.push({k:'me',l:'Omar',r:26,c:K.shell});
  P.forEach(function(p,i){N.push({k:'p',i:i,l:names[i],r:21,c:p.c,id:p.id})});
  Object.keys(techs).forEach(function(k){N.push({k:'t',l:k,r:7,c:K.lav,ps:techs[k]})});
  N.forEach(function(n,i){var a=i*2.399;n.x=.5+Math.cos(a)*.3;n.y=.5+Math.sin(a)*.3;n.vx=0;n.vy=0;n.ph=i*1.7});
  for(var i=1;i<=4;i++)E.push([0,i,.33]);
  N.forEach(function(n,j){if(n.k==='t')n.ps.forEach(function(pi){E.push([pi+1,j,.21])})});
  function lit(n){if(!sel)return true;if(n===sel)return true;
    if(sel.k==='t')return n.k==='p'&&sel.ps.indexOf(n.i)>=0;
    if(sel.k==='p')return n.k==='t'&&n.ps.indexOf(sel.i)>=0;return true}
  function tick(){
    var S=Math.min(W*1.05,H*1.35);
    for(var i=0;i<N.length;i++){var a=N[i];
      for(var j=i+1;j<N.length;j++){var b=N[j],dx=(a.x-b.x)*W,dy=(a.y-b.y)*H,d2=dx*dx+dy*dy+60,f=(a.k==='t'&&b.k==='t'?2600:(a.k!=='t'&&b.k!=='t'?16000:6000))/d2,d=Math.sqrt(d2);
        a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f}
      a.vx+=(.5-a.x)*W*.0015;a.vy+=(.5-a.y)*H*.003}
    E.forEach(function(e){var a=N[e[0]],b=N[e[1]],dx=(b.x-a.x)*W,dy=(b.y-a.y)*H,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-e[2]*S)*.012;
      a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f});
    N.forEach(function(n){if(n===drag){n.vx=n.vy=0;return}
      if(!RM){n.vx+=Math.cos(t*.02+n.ph)*.03;n.vy+=Math.sin(t*.017+n.ph)*.03}
      n.vx*=.82;n.vy*=.82;n.x+=n.vx/W;n.y+=n.vy/H;
      n.x=Math.max(.11,Math.min(.89,n.x));n.y=Math.max(.08,Math.min(.9,n.y))});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    E.forEach(function(e,idx){var a=N[e[0]],b=N[e[1]],on=lit(a)&&lit(b)&&(!sel||a===sel||b===sel||e[0]===0);
      ctx.strokeStyle=b.k==='t'?N[e[0]].c:K.shell;ctx.globalAlpha=sel?(on&&e[0]!==0?.8:.08):.3;ctx.lineWidth=b.k==='t'?1.3:2;
      ctx.beginPath();ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);ctx.stroke();
      if(!RM&&(!sel||on)){var u=((t*.006+idx*.37)%1);ctx.globalAlpha=sel?.9:.55;ctx.fillStyle=N[e[0]].c;ctx.beginPath();ctx.arc(a.x*W+(b.x-a.x)*W*u,a.y*H+(b.y-a.y)*H*u,2.2,0,6.283);ctx.fill()}});
    ctx.globalAlpha=1;ctx.textAlign='center';
    N.forEach(function(n){var x=n.x*W,y=n.y*H,on=lit(n)||n.k==='me';ctx.globalAlpha=on?1:.25;
      if(n.k!=='t'){ctx.fillStyle=n.c;ctx.globalAlpha=(on?1:.25)*.16;ctx.beginPath();ctx.arc(x,y,n.r+7+(RM?0:Math.sin(t*.04+n.ph)*2),0,6.283);ctx.fill();ctx.globalAlpha=on?1:.25}
      ctx.fillStyle=n.k==='t'?'#fff':n.c;ctx.strokeStyle=n.k==='t'?K.accent:'#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y,n.r,0,6.283);ctx.fill();ctx.stroke();
      if(n.k==='t'){ctx.fillStyle=K.ink;ctx.font='600 12px "DM Mono",sans-serif';ctx.fillText(n.l,x,y-n.r-6)}
      else if(n.k==='me'){ctx.fillStyle='#fff';ctx.font='800 13px "DM Mono",sans-serif';ctx.fillText(n.l,x,y+4.5)}
      else{ctx.fillStyle='#fff';ctx.font='800 13px "DM Mono",sans-serif';ctx.fillText('0'+(n.i+1),x,y+4.5);ctx.fillStyle=K.ink;ctx.font='800 13px "DM Mono",sans-serif';ctx.fillText(n.l,x,y+n.r+17)}});
    ctx.globalAlpha=1;
  }
  function loop(){t++;tick();draw();raf=requestAnimationFrame(loop)}
  var settled=false;function size(){var o=fit(cv);ctx=o.x;W=o.w;H=o.h;if(!settled||RM){for(var i=0;i<400;i++)tick();settled=true}draw()}
  function at(e){var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,best=null,bd=1e9;
    N.forEach(function(n){var d=Math.hypot(n.x*W-mx,n.y*H-my)-n.r;if(d<bd){bd=d;best=n}});return bd<16?best:null}
  cv.addEventListener('pointerdown',function(e){drag=at(e);moved=false;if(drag){cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'}});
  cv.addEventListener('pointermove',function(e){if(!drag)return;var r=cv.getBoundingClientRect();moved=true;drag.x=(e.clientX-r.left)/W;drag.y=(e.clientY-r.top)/H;if(RM){for(var i=0;i<30;i++)tick();draw()}});
  cv.addEventListener('pointerup',function(e){var n=drag;drag=null;cv.style.cursor='grab';if(moved)return;n=n||at(e);
    if(!n||n.k==='me'){sel=null;cap.innerHTML='<b>Mapa de misiones.</b> Arrastra los nodos. Toca una herramienta para ver dónde se usó, o una misión para ir a ella.'}
    else if(n.k==='t'){sel=n;cap.innerHTML='<b>'+n.l+'</b> aparece en '+n.ps.length+(n.ps.length>1?' misiones: ':' misión: ')+n.ps.map(function(i){return names[i]}).join(', ')+'.'}
    else{if(sel===n){go(n.id)}
      else{sel=n;cap.innerHTML='<b>'+names[n.i]+'.</b> Usa '+N.filter(function(m){return m.k==='t'&&m.ps.indexOf(n.i)>=0}).map(function(m){return m.l}).join(', ')+'. Toca otra vez para ir a la misión.'}}
    if(RM)draw()});
  size();window.addEventListener('resize',size);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(RM)draw()});
  if(!RM)onView(cv,function(){if(!raf)loop()},function(){cancelAnimationFrame(raf);raf=0});
})();

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
    x.font='700 11px "DM Mono",monospace';x.fillStyle=K.accent;x.textAlign='left';x.fillText(CR[crit].toUpperCase(),gx+8,h-10);
    x.fillStyle=K.alert;x.textAlign='right';x.fillText('COLA DE REVISIÓN',w-10,18);x.fillStyle=K.teal;x.fillText('APROBADAS',w-10,h-10);
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
  if(RM){bulk();var x=o.x;x.font='600 14px "DM Mono",sans-serif';x.fillStyle=K.soft;x.textAlign='center';x.fillText('Animación desactivada: se muestran los conteos de 4,000 transacciones.',o.w/2,o.h/2)}
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
    [14,23,32].forEach(function(v){x.fillText(v+'%',pl-5,Y(v)+4)});x.textAlign='center';[0,15,30,45,60].forEach(function(d){x.fillText('día '+d,Math.max(pl+14,Math.min(w-pr-16,X(d))),h-6)});
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
       '<text class="v" x="'+n.x+'" y="'+(n.y+5)+'" text-anchor="middle">'+n.v+'</text><text x="'+n.x+'" y="'+(k==='obj'||k==='azar'?n.y-n.r-12:n.y+n.r+20)+'" text-anchor="middle" style="font-weight:700;fill:'+K.ink+'">'+n.l+'</text></g>'});
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
    x.textAlign='center';[0,60,120,180].forEach(function(t){x.fillText('día '+t,Math.max(pl+14,Math.min(w-pr-18,X(t))),h-6)});
    x.setLineDash([5,4]);x.strokeStyle=K.ink;x.globalAlpha=.5;x.beginPath();x.moveTo(pl,Y(R));x.lineTo(w-pr,Y(R));x.stroke();x.setLineDash([]);x.globalAlpha=1;
    x.strokeStyle=K.lav;x.lineWidth=1.6;x.beginPath();b.forEach(function(v,t){t?x.lineTo(X(t),Y(v)):x.moveTo(X(t),Y(v))});x.stroke();
    x.strokeStyle=K.amber;x.lineWidth=2.4;x.beginPath();s.forEach(function(v,t){t?x.lineTo(X(t),Y(v)):x.moveTo(X(t),Y(v))});x.stroke();
    x.fillStyle=K.alert;x.beginPath();x.arc(X(60),Y(s[60]),5,0,6.283);x.fill();x.fillStyle=K.amber;x.beginPath();x.arc(X(D),Y(s[D]),4,0,6.283);x.fill()}
  $('qs-a').addEventListener('input',upd);$('qs-s').addEventListener('input',upd);upd();window.addEventListener('resize',upd);
})();
setSkin((function(){try{return localStorage.getItem('zidnz-skin')}catch(e){return null}})()||'jardin',true);
})();
