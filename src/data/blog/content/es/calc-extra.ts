import type { BlogPostContent } from '@/types/blog';

const content: Record<string, BlogPostContent> = {
  'how-to-use-base-convert': {
    title: 'Conversor de Bases: Cómo Funcionan los Sistemas Numéricos y Por Qué Todo Programador Necesita Uno',
    metaTitle: 'Conversor de Bases – Convierte Binario, Hex, Octal y Decimal',
    metaDescription:
      'Convierte números entre binario, decimal, hexadecimal, octal y bases personalizadas al instante. Conversor online gratuito. Aprende las matemáticas detrás de la conversión de bases.',
    keywords: [
      'conversor de bases',
      'conversor de sistemas numéricos',
      'binario a decimal',
      'conversor hexadecimal',
      'conversor octal',
      'conversor de base numérica',
      'conversor de raíz',
      'decimal a binario',
      'binario a hexadecimal',
      'conversión de bases',
      'conversor hexadecimal',
      'conversor base 64',
    ],
    intro:
      'Cada número que has escrito está expresado en una base — simplemente estás tan acostumbrado a la base 10 que no lo piensas. Pero las computadoras hablan binario (base 2), los programadores depuran con hexadecimal (base 16) y los permisos de archivos Unix usan octal (base 8). Un conversor de bases une estos mundos, traduciendo un valor de una raíz a otra en milisegundos. Nuestro conversor de bases online gratuito maneja binario, octal, decimal, hexadecimal y bases personalizadas de 2 a 64, así que ya sea que estés decodificando un color hexadecimal como #FF5733, verificando una dirección de memoria como 0x7FFF_FFFF o interpretando bits de permisos Unix como 755, tendrás exactamente la herramienta que necesitas. Toda la conversión se ejecuta localmente en tu navegador — sin envío de datos, sin necesidad de cuenta, y los resultados aparecen en el momento en que escribes.',
    steps: [
      {
        heading: 'Ingresa Tu Número y Selecciona la Base de Origen',
        body: 'Escribe o pega tu número en el campo de entrada, luego selecciona la base en la que se encuentra actualmente. Nuestro conversor admite bases de 2 a 64 — binario (2), octal (8), decimal (10), hexadecimal (16) y más. La entrada se valida contra la base seleccionada: si seleccionas binario, solo puedes escribir 0 y 1; si seleccionas hexadecimal, se aceptan dígitos 0-9 y letras A-F. Para bases superiores a 16, el conversor usa letras mayúsculas A-Z seguidas de minúsculas a-z y símbolos para representar valores de dígitos más allá de 9.',
      },
      {
        heading: 'Elige Una o Más Bases de Destino',
        body: 'Por defecto, el conversor muestra resultados en binario, octal, decimal y hexadecimal simultáneamente — los cuatro sistemas numéricos que necesitas el 95% del tiempo. Puedes agregar bases de destino personalizadas (como base 36 para claves de base de datos o base 64 para codificación de datos) y eliminar las que no necesites. Cada resultado aparece en su propia tarjeta copiable debajo de la entrada, para que puedas tomar el valor hexadecimal para tu CSS y el binario para tu máscara de bits al mismo tiempo.',
      },
      {
        heading: 'Lee el Desglose Matemático',
        body: 'Debajo de los resultados, el conversor muestra la división paso a paso para la conversión decimal — el método de división repetida por la base donde lees los residuos de abajo hacia arriba. Por ejemplo, convertir decimal 202 a binario: 202÷2=101 R0, 101÷2=50 R1, 50÷2=25 R0, 25÷2=12 R1, 12÷2=6 R0, 6÷2=3 R0, 3÷2=1 R1, 1÷2=0 R1 — leyendo los residuos hacia arriba se obtiene 11001010₂. Esto es invaluable para estudiantes que aprenden el concepto y profesionales que verifican resultados.',
      },
    ],
    tips: [
      'El método de división (dividir repetidamente por la base objetivo, recolectar residuos) funciona para cualquier base. Para base 16, los residuos 10-15 se asignan a A-F. Para base 2, los únicos residuos posibles son 0 y 1. Practícalo manualmente con números pequeños — desarrolla la intuición de cómo funciona realmente la notación posicional.',
      'Los códigos de color hexadecimales son simplemente 3 bytes en base 16. #FF5733 significa: rojo = FF (255 decimal), verde = 57 (87 decimal), azul = 33 (51 decimal). Un conversor de bases te permite extraer y manipular estos canales. Oscurece un color reduciendo cada par hexadecimal proporcionalmente.',
      'Los permisos de archivos Unix usan dígitos octales donde cada bit controla lectura (4), escritura (2) y ejecución (1). chmod 755 significa: propietario=4+2+1=7 (rwx), grupo=4+0+1=5 (r-x), otros=4+0+1=5 (r-x). Entender el mapeo binario-a-octal hace que las matemáticas de permisos sean algo natural.',
      'La codificación base 64 (usada en URIs de datos, archivos adjuntos de correo y JWTs) empaqueta 6 bits por carácter — por eso el alfabeto tiene 64 símbolos (A-Z, a-z, 0-9, +, /). Cada 3 bytes de datos binarios se expanden a 4 caracteres base 64. Nuestro conversor maneja bases hasta 64 para que puedas experimentar con este mapeo directamente.',
      'Base 36 (0-9 + A-Z) es la base alfanumérica más grande que no distingue mayúsculas de minúsculas. Se usa en acortadores de URL, IDs de base de datos y toString(36) de JavaScript. Convertir un entero grande a base 36 produce una cadena compacta y segura para URL — 1.000.000.000 se convierte en "gjdgxs" en base 36.',
      'Al convertir entre bases que son potencias de 2 (binario, octal, hexadecimal), puedes saltarte el decimal por completo. Agrupa dígitos binarios: 3 bits por dígito octal, 4 bits por dígito hexadecimal. 1101 0110₂ = D6₁₆ en un solo paso sin convertir nunca a decimal. Así es como los ingenieros experimentados lo hacen mentalmente.',
    ],
    faqs: [
      {
        q: '¿Cómo funciona el método de división para la conversión de bases?',
        a: 'Para convertir un número decimal a base N, divide repetidamente el número por N y recoge los residuos. El primer residuo es el dígito menos significativo (el de la derecha). Lee los residuos del último al primero para obtener el número final. Ejemplo: decimal 29 a base 16 — 29÷16=1 R13 (D), 1÷16=0 R1. Leyendo hacia arriba: 1D₁₆. Esto funciona para cualquier entero positivo y cualquier base de 2 a 64.',
      },
      {
        q: '¿Cuáles son las bases numéricas más comunes usadas en informática?',
        a: 'Binario (base 2): el lenguaje fundamental de toda la electrónica digital. Octal (base 8): permisos de archivos Unix y sistemas heredados. Decimal (base 10): números legibles por humanos. Hexadecimal (base 16): direcciones de memoria, códigos de color, código máquina y protocolos de red. Base 64: codificación de datos binarios como texto. Base 36: identificadores alfanuméricos compactos. Cada una tiene un nicho específico donde su agrupación de dígitos coincide con la estructura de datos subyacente.',
      },
      {
        q: '¿Puedo convertir números de punto flotante entre bases?',
        a: 'La conversión de punto flotante es significativamente más compleja que la conversión de enteros. Una fracción decimal (por ejemplo, 0.1₁₀) a menudo produce una fracción binaria periódica (0.0001100110011...₂), razón por la cual 0.1 + 0.2 ≠ 0.3 en JavaScript. Nuestro conversor de bases maneja enteros; para entender el punto flotante, el conversor explica conceptos de representación IEEE 754 en la sección de desglose detallado.',
      },
      {
        q: '¿Qué es el endianness y afecta a la conversión de bases?',
        a: 'El endianness se refiere al orden de los bytes en memoria: big-endian almacena el byte más significativo primero (como escribimos los números — "123" tiene el dígito más significativo primero), mientras que little-endian almacena el byte menos significativo primero (común en arquitecturas x86 y ARM). El endianness afecta cómo se almacenan los números como bytes, pero la conversión de bases opera sobre el valor matemático, que es independiente del endianness. Cuando conviertes un número entre bases, trabajas con el valor abstracto, no con su representación en memoria.',
      },
      {
        q: '¿Cómo convierto mentalmente binario a hexadecimal y viceversa?',
        a: 'Binario a hexadecimal: divide la cadena binaria en grupos de 4 bits comenzando desde la derecha (rellena con ceros a la izquierda si es necesario), luego reemplaza cada grupo con su dígito hexadecimal. 0000=0, 0001=1, 0010=2, ..., 1001=9, 1010=A, ..., 1111=F. Ejemplo: 10111100 → 1011 1100 → B C → BC₁₆. Hexadecimal a binario: reemplaza cada dígito hexadecimal con su equivalente binario de 4 bits. Este atajo funciona porque 16 = 2⁴, por lo que cada dígito hexadecimal se asigna a exactamente 4 bits.',
      },
      {
        q: '¿Por qué los programadores usan hexadecimal en lugar de decimal?',
        a: 'El hexadecimal refleja directamente el binario en un formato legible por humanos. Un dígito hexadecimal = 4 bits = un nibble. Dos dígitos hexadecimales = 8 bits = un byte (valores 00 a FF / 0 a 255). Esto hace que el hexadecimal sea ideal para ver volcados de memoria, definir colores (RGB cabe cada uno en un byte), depurar paquetes de red y leer código máquina. Una dirección de memoria de 32 bits como 0x7FFF_FFFF es mucho más fácil de interpretar en hexadecimal que como el decimal 2.147.483.647 — la estructura (región 7FFF) salta a la vista inmediatamente.',
      },
      {
        q: '¿Qué bases personalizadas son prácticamente útiles más allá del 16?',
        a: 'Base 36 (dígitos 0-9, A-Z): identificadores compactos, sin distinción de mayúsculas/minúsculas y seguros para URL usados por acortadores de URL, claves de base de datos y toString(36) de JavaScript. Base 58 (la elección de Bitcoin): elimina caracteres confusos (0, O, I, l) para direcciones de criptomonedas legibles por humanos. Base 62: similar a base 58 pero incluye todos los caracteres alfanuméricos, usada por los IDs de video de YouTube. Base 64: el estándar para codificar datos binarios como texto en correo electrónico (MIME), URIs de datos, JSON Web Tokens y archivos de certificados (formato PEM). Cada base personalizada refleja un equilibrio específico entre compacidad, legibilidad y restricciones del conjunto de caracteres.',
      },
    ],
    conclusion:
      'Un conversor de bases es una de esas herramientas que convierte un esfuerzo mental de 30 segundos en un resultado instantáneo y sin errores. Ya seas un programador leyendo volcados hexadecimales, un estudiante aprendiendo notación posicional por primera vez o un administrador de sistemas descifrando permisos octales, nuestro conversor de bases online gratuito maneja bases de 2 a 64 con desgloses paso a paso. Pruébalo ahora y nunca más cuentes en binario con los dedos.',
  },
  'how-to-use-random-number': {
    title: 'Generador de Números Aleatorios: Algoritmos PRNG, Aleatoriedad Verdadera y Cuándo Importa',
    metaTitle: 'Generador de Números Aleatorios – Herramienta RNG Online Gratis',
    metaDescription:
      'Genera números aleatorios en cualquier rango al instante. Aprende la diferencia entre aleatoriedad verdadera y pseudoaleatoria, algoritmos PRNG y cuándo importa cada tipo.',
    keywords: [
      'generador de números aleatorios',
      'generar números aleatorios online',
      'PRNG',
      'generador de números pseudoaleatorios',
      'números aleatorios verdaderos',
      'herramienta RNG',
      'rango de números aleatorios',
      'aleatoriedad criptográfica',
      'Mersenne Twister',
      'valores semilla',
      'distribución estadística',
      'generador de dados aleatorios',
    ],
    intro:
      'Cierra los ojos y nombra un número aleatorio entre 1 y 10. Si dijiste 7, estás en buena compañía — los humanos son terribles para la selección aleatoria, favoreciendo consistentemente los números impares y evitando los extremos. Un generador de números aleatorios (RNG) adecuado elimina este sesgo cognitivo, produciendo números que siguen una distribución matemáticamente uniforme donde cada valor en el rango tiene exactamente la misma probabilidad de ser elegido. Pero no toda la aleatoriedad es igual: la línea entre pseudoaleatorio (algoritmos que simulan aleatoriedad) y verdaderamente aleatorio (fuentes de entropía física como ruido atmosférico o desintegración radiactiva) importa enormemente según tu caso de uso. Para un sorteo de lotería o una clave criptográfica, necesitas aleatoriedad criptográficamente segura; para pruebas A/B sobre qué variante de página de destino mostrar, un generador pseudoaleatorio (PRNG) rápido es más que suficiente. Nuestro RNG online gratuito te permite establecer cualquier rango de enteros, generar valores únicos o múltiples y opcionalmente aplicar una semilla para secuencias reproducibles — todo ejecutándose localmente en tu navegador sin recolección de datos.',
    steps: [
      {
        heading: 'Establece Tu Rango de Números',
        body: 'Define los valores mínimo y máximo para tu rango aleatorio. El generador produce enteros en este rango inclusive en ambos extremos — establece 1 a 6 para un lanzamiento de dado virtual, 1 a 100 para un porcentaje, o cualquier rango personalizado. La herramienta también admite generar múltiples valores a la vez (hasta 100 números por clic) con o sin duplicados permitidos. Para rangos que superan 1.000.000, la interfaz cambia automáticamente a un algoritmo de generación más eficiente para mantener los resultados instantáneos.',
      },
      {
        heading: 'Elige Tu Modo de Aleatoriedad',
        body: 'Selecciona entre tres modos: PRNG Estándar (rápido, reproducible con semilla), API Crypto (usa window.crypto.getRandomValues para aleatoriedad de grado criptográfico), o PRNG con Semilla (ingresa un valor semilla para producir exactamente la misma secuencia cada vez). El modo API Crypto es más lento — típicamente 10-50x más lento que PRNG — pero obtiene entropía directamente del sistema operativo y es adecuado para generación de contraseñas, derivación de claves y aplicaciones sensibles a la seguridad. El modo Estándar usa una variante de Mersenne Twister y es ideal para juegos, muestreo y aleatoriedad cotidiana.',
      },
      {
        heading: 'Genera y Verifica la Distribución',
        body: 'Haz clic en Generar y ve tus números aleatorios al instante. La herramienta incluye una visualización básica de distribución — después de generar muchos números, un gráfico de barras de frecuencia muestra si la distribución es aproximadamente uniforme (como debería ser) o está sesgada. Para el modo con Semilla, copia el valor semilla para reproducir la misma secuencia en cualquier máquina — útil para pruebas deterministas, generación procedural en juegos e investigación reproducible.',
      },
    ],
    tips: [
      'Los generadores de números verdaderamente aleatorios (TRNG) capturan entropía de procesos físicos — ruido atmosférico, ruido térmico en circuitos, temporización de desintegración radiactiva, o incluso el movimiento de lámparas de lava (el famoso LavaRand de Cloudflare). Los generadores pseudoaleatorios, en cambio, son deterministas: dada la misma semilla, producen exactamente la misma secuencia. Para el 99% de las aplicaciones online, los PRNG son perfectamente adecuados.',
      'El Mersenne Twister (MT19937) tiene un período de 2¹⁹⁹³⁷−1 — un número tan grande que si generaras mil millones de números por segundo, necesitarías más de 10⁶⁰⁰⁰ años para ver la secuencia repetirse. Es el PRNG predeterminado en Python, Ruby, R y muchos otros lenguajes. Nuestro modo Estándar usa una variante de este algoritmo.',
      'Para uso criptográfico (contraseñas, tokens, claves), usa siempre Crypto.getRandomValues() o una fuente de entropía a nivel de sistema operativo — nunca Math.random(). El Math.random() estándar de JavaScript en V8 usa xorshift128+, que es rápido pero predecible: investigadores han demostrado ataques prácticos que reconstruyen el estado interno tras observar solo unos pocos miles de resultados.',
      'Distribución uniforme significa que cada valor en el rango tiene la misma probabilidad. Lanzar un dado justo de 6 caras debería dar cada cara ~16.67% de las veces en muchos lanzamientos. La distribución gaussiana (normal) es diferente — los valores se agrupan alrededor de una media y los valores extremos son raros. Nuestra herramienta genera solo distribuciones uniformes; si necesitas gaussiana, puedes aplicar una transformación de Box-Muller a dos números aleatorios uniformes.',
      'Los PRNG con semilla son esenciales para la reproducibilidad. Un juego como Minecraft usa una semilla para generar un mundo entero — ingresa la misma semilla en cualquier máquina y obtienes el mismo terreno. La generación de contenido procedural, simulaciones científicas y frameworks de pruebas A/B aleatorizadas dependen de semillas para volver a ejecutar exactamente el mismo experimento.',
      'Al generar números aleatorios para una lotería o sorteo, registra la marca de tiempo, semilla, algoritmo usado y resultado. Publica toda esta información. Cualquiera puede entonces verificar el resultado volviendo a ejecutar la misma semilla con el mismo algoritmo. Así funcionan los sistemas demostrablemente justos — y elimina cualquier sospecha de manipulación.',
      'La paradoja del cumpleaños se aplica a la generación de números aleatorios: si generas números aleatorios en un rango de tamaño N, solo necesitas aproximadamente √(2N) intentos antes de que una colisión (duplicado) sea más probable que no. En un rango de 1-365, solo 23 personas dan una probabilidad >50% de un cumpleaños compartido. Al realizar sorteos o generar IDs únicos, ten en cuenta esta probabilidad de colisión.',
      'Para pruebas A/B: la asignación aleatoria a la variante A o B debe hacerse del lado del servidor usando un hash de (user_id + experiment_seed), no del lado del cliente con Math.random(). La aleatorización del lado del cliente puede causar variantes parpadeantes dentro de una misma sesión y dificulta la reproducción exacta de la asignación para depuración.',
    ],
    faqs: [
      {
        q: '¿Cuál es la diferencia entre aleatoriedad verdadera y pseudoaleatoria?',
        a: 'Los números verdaderamente aleatorios provienen de fuentes de entropía física (ruido térmico, desintegración radiactiva, temporización de fotones) y son genuinamente impredecibles — incluso con conocimiento completo del estado del universo, el siguiente valor no puede determinarse. Los números pseudoaleatorios provienen de algoritmos matemáticos deterministas; dado el estado interno del algoritmo (la semilla), toda la secuencia es completamente predecible. La aleatoriedad verdadera es lenta, costosa y no reproducible. Los PRNG son rápidos, baratos y reproducibles — y para fines estadísticos, son indistinguibles de la aleatoriedad verdadera siempre que se use un buen algoritmo con un período suficientemente largo.',
      },
      {
        q: '¿Puedo confiar en un generador de números aleatorios online para una lotería?',
        a: 'Para una lotería informal de oficina o un sorteo de clase — sí, nuestro modo API Crypto (que usa la fuente de entropía del sistema operativo) es perfectamente apropiado. Para una lotería legalmente regulada con premios monetarios, se requiere un RNG de hardware dedicado o un servicio de terceros certificado con pistas de auditoría en la mayoría de las jurisdicciones. Para total transparencia, usa el modo con Semilla, publica la semilla antes del sorteo y deja que los participantes verifiquen el resultado.',
      },
      {
        q: '¿Cómo genero un número aleatorio con distribución gaussiana?',
        a: 'Nuestra herramienta genera distribuciones uniformes. Para convertir a gaussiana, usa la transformación de Box-Muller: genera dos números aleatorios uniformes U₁ y U₂ en (0,1], luego calcula Z₁ = √(−2×ln(U₁)) × cos(2π×U₂) y Z₂ = √(−2×ln(U₁)) × sin(2π×U₂). Tanto Z₁ como Z₂ siguen una distribución normal estándar (media=0, desviación=1). Multiplica por tu desviación estándar deseada y suma tu media deseada para desplazar y escalar.',
      },
      {
        q: '¿Por qué Math.random() sigue devolviendo el mismo número?',
        a: 'Si Math.random() parece devolver el mismo número, probablemente se está llamando en un bucle tan rápido que se reinicializa con la misma marca de tiempo, o el código tiene un error donde el valor se calcula una vez y se reutiliza. Math.random() en sí tiene un estado interno de 64 o 128 bits y no producirá el mismo valor dos veces en uso ordinario — la tasa de colisión real es astronómicamente baja.',
      },
      {
        q: '¿Qué valor semilla debo usar cuando necesito resultados reproducibles?',
        a: 'Cualquier cadena o número funciona. Prácticas comunes: usa la fecha actual (20240510) para secuencias diarias reproducibles, un hash del nombre del proyecto para determinismo por proyecto, o una marca de tiempo para ejecuciones "únicas pero registradas". Evita usar el entero 0 o 1 ya que pueden encontrar casos límite en algunas implementaciones de PRNG. Para sistemas en producción, almacena la semilla junto con tus resultados para poder reproducir la secuencia exacta más tarde.',
      },
      {
        q: '¿Cuántos números aleatorios puedo generar antes de que aparezcan patrones?',
        a: 'Esto depende completamente del algoritmo. Mersenne Twister (período 2¹⁹⁹³⁷−1) es seguro para miles de millones de extracciones. Un Generador Lineal Congruencial (LCG) simple como X_{n+1} = (a×X_n + c) mod m con constantes mal elegidas puede mostrar patrones después de solo unos pocos miles de extracciones. Nuestro modo Estándar usa un algoritmo bien probado adecuado para millones de extracciones. Nuestro modo Crypto no tiene ningún patrón detectable a ninguna escala.',
      },
    ],
    conclusion:
      'La aleatoriedad no se trata solo de sacar un número de un sombrero — es una herramienta fundamental en ciencias de la computación, estadística, seguridad y juegos. Ya sea que necesites un lanzamiento rápido de dados, un conjunto de datos de investigación reproducible o un token de fuerza criptográfica, entender qué tipo de aleatoriedad se adapta a tu caso de uso es la mitad de la batalla. Nuestro RNG gratuito te ofrece los tres modos en un solo lugar.',
  },
  'how-to-use-binary-calculator': {
    title: 'Calculadora Binaria: Domina la Aritmética Binaria, Operaciones Bitwise y el Complemento a Dos',
    metaTitle: 'Calculadora Binaria – Sumar, Restar, Multiplicar Números Binarios',
    metaDescription:
      'Realiza sumas, restas, multiplicaciones y divisiones binarias online. Aprende complemento a dos, operaciones bitwise, desbordamiento y reglas de aritmética binaria.',
    keywords: [
      'calculadora binaria',
      'calculadora de aritmética binaria',
      'suma binaria',
      'resta binaria',
      'complemento a dos',
      'multiplicación binaria',
      'operaciones bitwise',
      'calculadora conversora binaria',
      'matemáticas binarias',
      'calculadora de desbordamiento',
      'división binaria',
      'calculadora de ancho de bits',
    ],
    intro:
      'La aritmética binaria parece extraña la primera vez que la ves: 1010 + 0110 = 10000, ninguna columna supera el 1, y la resta se hace sumando la versión negativa de un número. Pero esta es exactamente la aritmética que ocurre miles de millones de veces por segundo dentro de cada núcleo del procesador del dispositivo que estás usando ahora mismo. Una calculadora binaria trae esta capa oculta a la superficie — no solo convirtiendo números a binario, sino realizando sumas, restas, multiplicaciones y divisiones directamente en base 2, con detección de desbordamiento, representación en complemento a dos para números negativos y anchos de bits configurables de 8 a 64 bits. Ya sea que estés depurando una rutina de firmware de bajo nivel, enseñando un curso de arquitectura de computadoras o calculando máscaras de subred para una configuración de red, nuestra calculadora binaria online gratuita maneja la aritmética binaria con la precisión y claridad visual que una calculadora de bolsillo estándar no puede ofrecer.',
    steps: [
      {
        heading: 'Ingresa Tus Operandos en Binario, Decimal o Hexadecimal',
        body: 'Escribe tus números en cualquier representación admitida — binario (1010), decimal (10) o hexadecimal (A). La calculadora muestra los tres formatos simultáneamente para cada operando, para que siempre tengas referencia cruzada. Para números negativos, activa el modo complemento a dos y selecciona tu ancho de bits (8, 16, 32 o 64 bits). En complemento a dos de 8 bits, -5 se representa como 11111011, no solo como "5 con un signo menos". La herramienta calcula automáticamente la codificación correcta en complemento a dos.',
      },
      {
        heading: 'Selecciona Tu Operación y Ancho de Bits',
        body: 'Elige entre suma, resta, multiplicación o división, y establece el ancho de bits para el cálculo. El ancho de bits importa: sumar dos números de 8 bits que producen un resultado de 9 bits provoca desbordamiento, y la calculadora lo resalta en rojo. Para la multiplicación, el ancho de bits del resultado se duplica (dos entradas de 8 bits pueden producir hasta un producto de 16 bits). La calculadora te permite ver los resultados en el ancho natural o en cualquier ancho mayor, lo cual es fundamental para entender cómo las CPUs manejan los bits de acarreo y las banderas de desbordamiento.',
      },
      {
        heading: 'Lee el Desglose Paso a Paso',
        body: 'Debajo de cada resultado, la calculadora muestra la aritmética resuelta columna por columna en binario — como la suma o multiplicación larga en decimal. Para la suma: se anota la suma de cada columna (0+0=0, 0+1=1, 1+0=1, 1+1=10 con acarreo). Para la resta usando complemento a dos: la herramienta muestra cómo se niega el sustraendo (invertir bits, sumar 1) y luego se suma. La división muestra los pasos de división larga directamente en binario. Este nivel de detalle es invaluable para el aprendizaje y la verificación.',
      },
    ],
    tips: [
      'Reglas de suma binaria: 0+0=0, 0+1=1, 1+0=1, 1+1=10 (escribe 0, llevas 1). Es igual que la suma decimal excepto que llevas al 2 en lugar del 10. Practica con dos números de 4 bits hasta que el patrón de acarreo sea automático — luego anchos mayores son el mismo patrón repetido.',
      'El complemento a dos es la forma universal en que las computadoras representan enteros negativos. Para negar un número: invierte todos los bits (complemento a uno), luego suma 1. Ejemplo: 5 en 8 bits es 00000101. Invierte bits: 11111010. Suma 1: 11111011 — eso es -5. La belleza del complemento a dos: la suma y la resta usan exactamente el mismo circuito de hardware, sin caso especial para números negativos.',
      'El desbordamiento ocurre cuando un resultado no cabe en el ancho de bits objetivo. En 8 bits sin signo, 255 + 1 = 0 (se desborda). En 8 bits con signo (-128 a 127), 127 + 1 = -128 (el valor más negativo). Las CPUs activan una bandera de desbordamiento (V) para desbordamiento con signo y una bandera de acarreo (C) para desbordamiento sin signo — diferentes banderas para diferentes interpretaciones de los mismos bits.',
      'Multiplicar por 2ᵏ en binario es simplemente un desplazamiento a la izquierda de k posiciones: 101 (5) << 2 = 10100 (20). Dividir por 2ᵏ es un desplazamiento a la derecha de k posiciones: 10100 (20) >> 2 = 101 (5). Por eso los compiladores de C reemplazan `x * 8` por `x << 3` — los desplazamientos de bits son órdenes de magnitud más rápidos que la multiplicación en hardware.',
      'Bitwise AND puede comprobar si un número es par o impar: número & 1 = 0 significa par, = 1 significa impar. Bitwise OR puede activar bits específicos: activar el bit 3 de un valor significa valor | 0b1000 = valor | 8. Bitwise XOR puede alternar bits: valor ^ (1 << n) invierte el n-ésimo bit. Así es como los controladores de dispositivos, sistemas embebidos y código de alto rendimiento interactúan con los registros de hardware.',
      'En aritmética de 32 bits, el rango sin signo es 0 a 4.294.967.295; con signo (complemento a dos) es -2.147.483.648 a 2.147.483.647. ¿Por qué la asimetría? El cero ocupa uno de los 2³² patrones de bits posibles (000...000) en el lado no negativo, dejando 2.147.483.647 valores positivos y 2.147.483.648 valores negativos.',
      'Las máscaras de subred dependen en gran medida de la aritmética binaria. Una máscara de subred como 255.255.255.0 en binario es 11111111.11111111.11111111.00000000 — exactamente 24 unos seguidos de 8 ceros. El AND lógico entre una dirección IP y su máscara de subred extrae la porción de red. Entender las operaciones bitwise binarias hace que la subnetting IP sea intuitiva en lugar de arcana.',
    ],
    faqs: [
      {
        q: '¿Cómo funciona realmente el complemento a dos?',
        a: 'El complemento a dos codifica números negativos para que la suma funcione de manera idéntica para valores con y sin signo usando el mismo hardware. Para representar -N en k bits: calcula 2ᵏ − N y escribe el resultado en binario. Equivalentemente: escribe N en binario, invierte todos los bits (NOT bitwise / complemento a uno), luego suma 1. Ejemplo: -5 en 8 bits → 2⁸−5 = 256−5 = 251 → 11111011. Cuando sumas 5 (00000101) y -5 (11111011) en 8 bits, obtienes 00000000 con un acarreo fuera del octavo bit — exactamente cero, como se esperaba. Ese acarreo es la bandera de acarreo/desbordamiento, no parte del resultado.',
      },
      {
        q: '¿Cuál es la diferencia entre acarreo y desbordamiento?',
        a: 'Un acarreo (bandera C) indica que una suma sin signo excedió el ancho de bits — por ejemplo, 255 + 1 en 8 bits produce un acarreo porque el resultado sin signo (256) necesita 9 bits. El desbordamiento (bandera V) indica que una suma con signo produjo un resultado con signo incorrecto — por ejemplo, 127 + 1 en 8 bits con signo = -128, lo cual es incorrecto porque el bit de signo cambió inesperadamente. Las dos banderas sirven para propósitos diferentes: acarreo para aritmética sin signo, desbordamiento para aritmética con signo. Nuestra calculadora resalta ambos cuando ocurren.',
      },
      {
        q: '¿Por qué aprender aritmética binaria si las calculadoras lo hacen automáticamente?',
        a: 'La aritmética binaria es esencial para cualquiera que trabaje cerca del hardware: ingenieros de sistemas embebidos configurando registros de microcontroladores, programadores de sistemas leyendo código de kernel, ingenieros de redes calculando máscaras de subred e investigadores de seguridad analizando exploits binarios. Incluso para desarrolladores de alto nivel, entender la aritmética binaria explica por qué existen ciertos errores — como las vulnerabilidades de desbordamiento de enteros (explosión del Ariane 5, Y2K, Gangnam Style rompiendo el contador de vistas de 32 bits de YouTube).',
      },
      {
        q: '¿Cómo se compara la multiplicación binaria con la multiplicación decimal?',
        a: 'La multiplicación binaria es en realidad más simple que la decimal. La tabla de multiplicar tiene exactamente 4 entradas: 0×0=0, 0×1=0, 1×0=0, 1×1=1. Para multiplicar dos números binarios: por cada bit 1 en el multiplicador, escribe el multiplicando desplazado a la izquierda por la posición de ese bit, luego suma todos los productos parciales. Así es precisamente como funciona un multiplicador por desplazamiento y suma en hardware — y el mismo algoritmo implementado en software en los primeros microprocesadores que carecían de multiplicador de hardware.',
      },
      {
        q: '¿Puedo realizar divisiones que produzcan un resultado fraccionario en binario?',
        a: 'Nuestra calculadora realiza división entera (cociente y resto). Para resultados binarios fraccionarios, después de agotar la parte entera, agregas un punto binario y continúas dividiendo: multiplica el resto por 2, la parte entera es el siguiente bit fraccionario, repite. Esto es análogo a la división larga en decimal. Muchas fracciones decimales (como 0.1) producen fracciones binarias periódicas infinitas — esta es la causa raíz de los problemas de precisión en punto flotante.',
      },
      {
        q: '¿Cómo convierto mentalmente números decimales pequeños a binario?',
        a: 'Encuentra la mayor potencia de 2 menor que tu número, réstala, marca un 1 en esa posición de bit, luego repite con el resto. Ejemplo: decimal 42. Potencias: 32, 16, 8, 4, 2, 1. 42-32=10 (marca bit 5). 10-8=2 (marca bit 3). 2-2=0 (marca bit 1). Los bits no marcados son 0. Resultado: 32+8+2 = 101010₂. Con práctica, números menores de 256 se vuelven instantáneos. También útil: memorizar el mapeo de nibble hexadecimal a binario — cada dígito hexadecimal se asigna a exactamente 4 bits.',
      },
    ],
    conclusion:
      'La aritmética binaria no es una habilidad esotérica — es la capa directamente debajo de cada línea de código que escribes. Nuestra calculadora binaria hace visible esa capa con desgloses paso a paso, manejo de complemento a dos y detección de desbordamiento de 8 a 64 bits. Ya sea que estés depurando, enseñando o aprendiendo, ve exactamente lo que el silicio está haciendo.',
  },
  'how-to-use-boolean-calculator': {
    title: 'Calculadora de Álgebra Booleana: Tablas de Verdad, Leyes de De Morgan y Simplificación Lógica',
    metaTitle: 'Calculadora de Álgebra Booleana – Tablas de Verdad y Compuertas Lógicas',
    metaDescription:
      'Simplifica expresiones Boolean, genera tablas de verdad y aplica las leyes de De Morgan online. Calculadora gratuita con AND, OR, NOT, XOR, NAND, NOR, XNOR.',
    keywords: [
      'calculadora booleana',
      'calculadora de álgebra booleana',
      'generador de tablas de verdad',
      'leyes de De Morgan',
      'calculadora de compuertas lógicas',
      'simplificador de expresiones booleanas',
      'AND OR NOT XOR',
      'mapa de Karnaugh',
      'calculadora de lógica proposicional',
      'diseño de lógica digital',
      'simplificación booleana',
      'calculadora de circuitos lógicos',
    ],
    intro:
      'Cada declaración "if" que escribes, cada consulta de base de datos que filtras y cada resultado de motor de búsqueda que ves funciona con lógica Booleana — un sistema matemático donde cada variable es estrictamente verdadera o falsa (1 o 0). George Boole publicó este álgebra en 1854 en "Las Leyes del Pensamiento", y permaneció discretamente en los departamentos de matemáticas durante casi un siglo antes de que Claude Shannon se diera cuenta de que podía describir circuitos de conmutación eléctrica, sentando las bases de cada computadora digital jamás construida. Hoy, el álgebra Booleana sustenta todo, desde las cláusulas WHERE de SQL hasta las consultas de motores de búsqueda y el diseño de microprocesadores con miles de millones de compuertas lógicas. Nuestra calculadora gratuita de álgebra Booleana te permite ingresar cualquier expresión Booleana (hasta 8 variables), ver instantáneamente su tabla de verdad, simplificarla usando reglas algebraicas y las leyes de De Morgan, y ver el diagrama de compuertas lógicas equivalente — todo ejecutándose en tu navegador.',
    steps: [
      {
        heading: 'Ingresa Tu Expresión Booleana',
        body: 'Escribe tu expresión usando notación estándar: & o ∧ para AND, | o ∨ para OR, ! o ¬ para NOT, ^ o ⊕ para XOR. Puedes usar paréntesis para agrupar y nombres de variables como A, B, C, hasta H. Ejemplo: (A & B) | (!A & C) representa "o A y B son ambos verdaderos, o A es falso y C es verdadero." La calculadora valida la sintaxis en tiempo real y te muestra una versión autoformateada de tu expresión con símbolos matemáticos apropiados.',
      },
      {
        heading: 'Visualiza la Tabla de Verdad',
        body: 'La tabla de verdad muestra cada combinación posible de valores de entrada (2ⁿ filas para n variables) y la salida resultante. Cada fila muestra si la expresión se evalúa como verdadera o falsa dada esa entrada específica. Para 3 variables (A, B, C), verás 8 filas; para 4 variables, 16 filas. La tabla de verdad está codificada por colores — verde para salidas verdaderas, gris para falsas — para que puedas identificar patrones al instante. Esta es la forma más rápida de entender lo que realmente significa una expresión Booleana.',
      },
      {
        heading: 'Aplica Simplificación y Ve el Circuito',
        body: 'Haz clic en "Simplificar" y la calculadora aplica identidades de álgebra Booleana para reducir tu expresión a su forma más simple. El panel paso a paso muestra qué regla se aplicó en cada etapa: ley idempotente (A&A=A), ley del complemento (A&!A=0), ley de absorción (A|(A&B)=A), y las leyes de De Morgan. La expresión simplificada se muestra junto a un diagrama de compuertas lógicas usando símbolos estándar ANSI/IEEE — AND (respaldo plano), OR (respaldo curvo), NOT (triángulo con burbuja), XOR (OR con línea extra).',
      },
    ],
    tips: [
      'Las leyes de De Morgan son las dos identidades Booleanas más poderosas: !(A & B) = !A | !B, y !(A | B) = !A & !B. Te permiten convertir ANDs a ORs y viceversa mientras empujas la negación hacia adentro. En términos prácticos: "no (lloviendo Y frío)" equivale a "no lloviendo O no frío." Estas leyes son esenciales para simplificar cláusulas WHERE complejas de SQL y consultas de motores de búsqueda.',
      'El operador XOR (OR exclusivo) devuelve verdadero cuando exactamente una entrada es verdadera — es el operador "uno o el otro, pero no ambos." XOR con una constante 1 es lo mismo que NOT: A ⊕ 1 = !A. XOR también es su propio inverso: (A ⊕ B) ⊕ B = A. Esta propiedad de auto-inversión hace que XOR sea la base de muchos esquemas de cifrado y algoritmos básicos de suma de verificación.',
      'NAND y NOR se llaman "compuertas universales" porque puedes construir AND, OR y NOT usando solo compuertas NAND (o solo compuertas NOR). Cada circuito digital existente puede, en teoría, reducirse a una red de compuertas NAND. De hecho, la memoria flash NAND (usada en SSDs y memorias USB) recibe su nombre de esta misma compuerta.',
      'Al escribir condiciones Booleanas en código, el orden de las condiciones importa para la evaluación por cortocircuito. En `if (chequeoBarato() && chequeoCaro())`, si chequeoBarato() devuelve false, chequeoCaro() nunca se ejecuta. Pon tu condición que falla más rápido primero — es una optimización simple que se acumula en bucles intensivos.',
      'Las tablas de verdad crecen exponencialmente: n variables significan 2ⁿ filas. Con 8 variables, son 256 filas — todavía manejable. Con 32 variables, necesitarías más de 4 mil millones de filas. Por eso la verificación formal de grandes circuitos digitales usa solucionadores SAT y Diagramas de Decisión Binarios en lugar de tablas de verdad por fuerza bruta.',
      'La lógica de tres valores de SQL (TRUE, FALSE, NULL) extiende el álgebra Booleana clásica. En SQL: NULL AND FALSE = FALSE (cortocircuito), pero NULL AND TRUE = NULL (desconocido), y NULL OR TRUE = TRUE (cortocircuito). Al escribir consultas de base de datos con columnas anulables, siempre ten en cuenta la propagación de NULL — es una de las fuentes más comunes de errores sutiles en consultas.',
      'Los mapas de Karnaugh (K-maps) son una alternativa visual a la simplificación algebraica para hasta 4 variables. Organiza la tabla de verdad en una cuadrícula donde celdas adyacentes difieren en exactamente una variable; rodea grupos de 1s en tamaños de 1, 2, 4 u 8; cada grupo corresponde a un término producto simplificado. Nuestra calculadora muestra el K-map para expresiones con 2-4 variables junto con la simplificación algebraica.',
    ],
    faqs: [
      {
        q: '¿Qué son las leyes de De Morgan y cómo las uso?',
        a: 'Las leyes de De Morgan establecen: (1) NOT (A AND B) = (NOT A) OR (NOT B), y (2) NOT (A OR B) = (NOT A) AND (NOT B). Describen cómo se distribuye la negación sobre AND/OR. Aplicaciones prácticas: negar una condición SQL compuesta — `WHERE NOT (status="active" AND age>18)` se convierte en `WHERE status!="active" OR age<=18`; escribir consultas de búsqueda negativas — "perros NOT (poodles OR chihuahuas)" se convierte en "perros NOT poodles AND NOT chihuahuas"; simplificar diseños de circuitos empujando inversores a través de compuertas.',
      },
      {
        q: '¿Cómo se lee e interpreta una tabla de verdad?',
        a: 'Una tabla de verdad enumera cada combinación posible de entradas (cada variable = verdadero o falso) y muestra la salida para cada combinación. Para n variables, hay 2ⁿ filas. Las filas se ordenan típicamente en orden de conteo binario: F,F,F = 0,0,0 → fila 1; F,F,T = 0,0,1 → fila 2; ...; T,T,T = 1,1,1 → fila 8. Una expresión es una tautología si cada fila es verdadera, una contradicción si cada fila es falsa, y satisfacible si al menos una fila es verdadera. Las tablas de verdad verifican exhaustivamente si dos expresiones son lógicamente equivalentes — si sus columnas de salida coinciden fila por fila, las expresiones son equivalentes.',
      },
      {
        q: '¿Cuál es la diferencia entre AND (∧) y NAND?',
        a: 'AND (∧) devuelve verdadero solo cuando ambas entradas son verdaderas: 0∧0=0, 0∧1=0, 1∧0=0, 1∧1=1. NAND (NOT-AND) es simplemente la negación de AND: devuelve falso solo cuando ambas entradas son verdaderas — 0 NAND 0 = 1, 0 NAND 1 = 1, 1 NAND 0 = 1, 1 NAND 1 = 0. NAND es notable por ser funcionalmente completo — cualquier función Booleana puede construirse solo con compuertas NAND. Similarmente, NOR (NOT-OR) devuelve verdadero solo cuando ambas entradas son falsas.',
      },
      {
        q: '¿Puede el álgebra Booleana simplificar las declaraciones if de mi código?',
        a: 'Absolutamente. Muchas cadenas condicionales complejas pueden reducirse usando identidades Booleanas. Un patrón común: `if ((x && y) || (!x && z))` es equivalente a `if (x ? y : z)` — el ternario captura la misma lógica. Otro: `if (!(a && b))` se simplifica a `if (!a || !b)` por De Morgan. Simplificar condiciones reduce la carga cognitiva, mejora la legibilidad y elimina errores sutiles de interacciones no deseadas entre condiciones anidadas.',
      },
      {
        q: '¿Cuántas variables puede manejar la calculadora Booleana?',
        a: 'Nuestra calculadora admite hasta 8 variables, lo que produce una tabla de verdad de 256 filas. Más allá de 8, la tabla de verdad se vuelve difícil de manejar y la simplificación algebraica es el enfoque más práctico. Para expresiones con muchas variables, la calculadora cambia al modo algebraico y usa el teorema del consenso, absorción y reglas de distribución para simplificar sin enumerar cada combinación.',
      },
      {
        q: '¿Qué son los minterms y maxterms en álgebra Booleana?',
        a: 'Un minterm es un término AND donde cada variable aparece exactamente una vez (en forma verdadera o complementada) — corresponde a exactamente una fila de la tabla de verdad donde la salida es 1. Un maxterm es un término OR donde cada variable aparece exactamente una vez — corresponde a exactamente una fila donde la salida es 0. Cualquier función Booleana puede expresarse como una suma de minterms (SOP canónico / Suma de Productos) o un producto de maxterms (POS canónico / Producto de Sumas). Estas formas canónicas son únicas para cada función, lo que significa que dos funciones son equivalentes si y solo si tienen la misma forma canónica.',
      },
    ],
    conclusion:
      'El álgebra Booleana es la gramática oculta de la computación — desde las compuertas lógicas en tu CPU hasta la cláusula WHERE en tu SQL y los operadores de búsqueda en Google. Nuestra calculadora hace visible este álgebra, simplificando expresiones, generando tablas de verdad y dibujando los circuitos que tu lógica describe. Pruébala ahora y ve lo que realmente significan tus condiciones.',
  },
  'how-to-use-bitwise-calculator': {
    title: 'Calculadora Bitwise: AND, OR, XOR, Desplazamiento y Manipulación de Banderas Explicados',
    metaTitle: 'Calculadora Bitwise – AND, OR, XOR y Desplazamiento Online',
    metaDescription:
      'Realiza operaciones bitwise AND, OR, XOR, NOT, desplazamiento a izquierda y derecha online. Aprende máscaras de bits, manipulación de banderas y resultados hexadecimales.',
    keywords: [
      'calculadora bitwise',
      'operaciones bitwise online',
      'bitwise AND',
      'bitwise OR',
      'bitwise XOR',
      'desplazamiento izquierda derecha',
      'máscara de bits',
      'manipulación de banderas',
      'calculadora de manipulación de bits',
      'bitwise hexadecimal',
      'bitwise binario',
      'bitwise NOT',
    ],
    intro:
      'Las operaciones bitwise son el filo de la programación — operan sobre bits individuales dentro de un byte o palabra, dándote control directo sobre la representación binaria cruda de los datos. Mientras la aritmética opera sobre números como valores abstractos, las operaciones bitwise manipulan los 1s y 0s mismos. Así es como se codifican los permisos de archivo en un solo entero en Unix, cómo los programadores gráficos extraen los canales RGB de un valor de píxel, cómo los protocolos de red empaquetan múltiples banderas en un solo byte de cabecera, y cómo se construyen funciones hash rápidas y sumas de verificación. Nuestra calculadora bitwise gratuita toma dos operandos (o uno para NOT y desplazamientos), realiza la operación seleccionada a nivel de bit y muestra el resultado en binario, hexadecimal y decimal simultáneamente — con cada posición de bit etiquetada para que puedas verificar exactamente qué ocurrió y dónde.',
    steps: [
      {
        heading: 'Ingresa Tus Operandos',
        body: 'Escribe dos números en decimal, hexadecimal (prefijo 0x) o binario (prefijo 0b). La calculadora acepta modo de 32 y 64 bits — en modo 32 bits, los operandos se tratan como enteros sin signo de 32 bits (0 a 4.294.967.295). Cada operando se muestra en formato binario con las posiciones de bit numeradas desde 31 (más significativo) hasta 0 (menos significativo), para que puedas visualizar exactamente qué bits están activados antes de aplicar cualquier operación.',
      },
      {
        heading: 'Selecciona la Operación Bitwise',
        body: 'Elige entre siete operaciones: AND (&) activa un bit del resultado a 1 solo si ambos bits correspondientes de los operandos son 1; OR (|) lo activa a 1 si alguno de los bits del operando es 1; XOR (^) lo activa a 1 si exactamente un bit del operando es 1; NOT (~) invierte cada bit de un solo operando; desplazamiento a izquierda (<<) mueve todos los bits a la izquierda N posiciones (rellenando con ceros a la derecha); desplazamiento lógico a derecha (>>>) mueve bits a la derecha con relleno de ceros; desplazamiento aritmético a derecha (>>) mueve bits a la derecha con relleno del bit de signo.',
      },
      {
        heading: 'Lee el Resultado Multi-Formato y el Mapa de Bits',
        body: 'El resultado se muestra en binario (32 bits con espaciado cada 4 bits para legibilidad), hexadecimal (8 dígitos hexadecimales para 32 bits) y decimal. Un mapa de bits visual resalta qué posiciones son 1 en el resultado, y al pasar el cursor sobre cualquier bit se muestra qué bits de entrada lo produjeron. Los botones de copia te permiten tomar el resultado en cualquier formato al instante — binario para documentación, hexadecimal para código, decimal para cálculos.',
      },
    ],
    tips: [
      'La máscara de bits es el patrón bitwise más común: usa AND con una máscara para extraer bits específicos. Para obtener los 8 bits más bajos de un valor de 32 bits: valor & 0xFF (255). Para probar si el bit 3 está activado: (valor & (1 << 3)) !== 0. Para limpiar el bit 5: valor & ~(1 << 5). Para activar el bit 7: valor | (1 << 7). Para alternar el bit 2: valor ^ (1 << 2). Estos cuatro patrones — probar, limpiar, activar, alternar — cubren el 90% de la manipulación de bits en la práctica.',
      'La extracción de canales de color es un caso de uso bitwise clásico. Un píxel RGB empaquetado en un entero de 32 bits (0xRRGGBB) puede desempaquetarse con: rojo = (píxel >> 16) & 0xFF, verde = (píxel >> 8) & 0xFF, azul = píxel & 0xFF. En una línea, has extraído tres canales de color usando desplazamiento a derecha y máscaras AND. ARGB (canal alfa) usa los 8 bits superiores: alfa = (píxel >> 24) & 0xFF.',
      'El desplazamiento a izquierda de 1 posición multiplica por 2; el desplazamiento a derecha de 1 posición divide por 2 (división entera). El desplazamiento a izquierda de N posiciones equivale a multiplicar por 2ᴺ. Las CPUs ejecutan desplazamientos en un solo ciclo de reloj, haciéndolos dramáticamente más rápidos que la multiplicación/división general para potencias de 2.',
      'El intercambio XOR es un truco clásico para intercambiar dos variables sin una variable temporal: a ^= b; b ^= a; a ^= b. Después de esta secuencia, a y b han intercambiado valores. Funciona porque XOR es conmutativo, asociativo, y x ^ x = 0, x ^ 0 = x. En código moderno, esto es principalmente una curiosidad — los compiladores optimizan los intercambios estándar igual de bien — pero es una gran demostración de las propiedades algebraicas de XOR.',
      'Las banderas de permisos empaquetan múltiples configuraciones de activado/desactivado en un solo entero. Los permisos de archivo Unix usan 12 bits: los 9 inferiores son rwx para propietario/grupo/otros (cada uno r=4, w=2, x=1). Los bits superiores codifican setuid (4000), setgid (2000) y sticky (1000). Cada permiso es una sola bandera que puede probarse o modificarse independientemente.',
      'Los cálculos de CRC (Cyclic Redundancy Check) y suma de verificación usan intensivamente XOR y desplazamientos. Una implementación básica de CRC-8 aplica XOR a cada byte de datos en un registro en ejecución, luego desplaza y aplica XOR condicionalmente con un polinomio. Esto produce una "huella digital" de 8 bits que detecta cambios accidentales en los datos.',
      'El operador de desplazamiento a derecha viene en dos variantes: lógico (>>> en JavaScript/Java), que rellena los bits izquierdos desocupados con ceros; y aritmético (>> en la mayoría de los lenguajes), que los rellena con copias del bit de signo (preservando el signo para enteros con signo). Desplazar -8 (11111000 en 8 bits con signo) por 1 con desplazamiento aritmético produce -4 (11111100); con desplazamiento lógico produce 124 (01111100), un valor completamente diferente.',
    ],
    faqs: [
      {
        q: '¿Cuál es la diferencia entre AND bitwise (&) y AND lógico (&&)?',
        a: 'AND bitwise (&) opera sobre bits individuales de dos números: 5 & 3 = 1 porque 101 & 011 = 001. AND lógico (&&) opera sobre valores de verdad Booleanos: 5 && 3 devuelve 3 (valor truthy) en JavaScript, o true en lenguajes estrictamente tipados. AND bitwise produce un número; AND lógico produce un booleano. Confundirlos en una declaración `if` es un error común — `if (x & 1)` prueba si el bit más bajo está activado (verificación de número impar), mientras que `if (x && 1)` verifica si x es truthy (e ignora el 1 completamente debido a la evaluación por cortocircuito).',
      },
      {
        q: '¿Cómo funciona XOR para cifrado simple?',
        a: 'La propiedad clave de XOR: (A ⊕ B) ⊕ B = A. Si tienes texto plano P y una clave K, entonces el texto cifrado C = P ⊕ K, y descifras con P = C ⊕ K — exactamente la misma operación. Esto es un one-time pad cuando K es verdaderamente aleatoria y tan larga como el mensaje. Los cifrados XOR aparecen en todas partes, desde la simple ofuscación de cadenas hasta el paso XOR en el cifrado AES. La debilidad: si reutilizas la misma clave para múltiples mensajes, (C₁ ⊕ C₂) revela (P₁ ⊕ P₂), lo que filtra información sobre ambos textos planos.',
      },
      {
        q: '¿Cuándo debería usar operaciones bitwise en código de alto nivel?',
        a: 'Usa operaciones bitwise cuando necesites empaquetar múltiples banderas booleanas en un formato compacto (columnas de base de datos, parámetros de API, cabeceras de protocolos de red), al realizar cálculos donde el escalado por potencias de 2 ahorra ciclos de CPU (en bucles intensivos y código gráfico), al interactuar con hardware o formatos de archivo binarios que definen estructuras a nivel de bit, y al implementar algoritmos de los dominios de criptografía, compresión o corrección de errores donde la manipulación a nivel de bit es inherente al algoritmo.',
      },
      {
        q: '¿Qué falla con la extensión de signo durante el desplazamiento a derecha?',
        a: 'El desplazamiento aritmético a derecha (>>) replica el bit de signo (el bit más a la izquierda) en las posiciones desocupadas para preservar el signo. Un número negativo de 8 bits como -16 (11110000) desplazado a la derecha por 1 se convierte en 11111000 (-8) — el relleno de 1s preserva el negativo. Pero si esperabas relleno de ceros (desplazamiento lógico), obtienes 01111000 (120), un valor sin signo muy diferente. Los lenguajes manejan esto de manera diferente: Java usa >> para aritmético y >>> para lógico; C lo deja definido por la implementación para tipos con signo; el >> de JavaScript es aritmético en enteros con signo de 32 bits.',
      },
      {
        q: '¿Cómo cuento el número de bits activados (popcount) en un número?',
        a: 'El conteo de población (popcount o peso de Hamming) cuenta el número de bits 1 en una representación binaria. Las CPUs modernas tienen una instrucción POPCNT dedicada (SSE4.2 en x86), pero el enfoque clásico en software es el algoritmo de Brian Kernighan: `while (n) { n &= n - 1; count++; }` — cada iteración limpia el bit activado más bajo. Nuestra calculadora muestra el popcount para cada resultado. Popcount se usa en códigos de corrección de errores, criptografía (distancia de Hamming) e implementaciones de arreglos dispersos.',
      },
      {
        q: '¿Por qué las operaciones bitwise en números de JavaScript a veces dan resultados inesperados?',
        a: 'Los operadores bitwise de JavaScript (excepto >>>) convierten los operandos a enteros con signo de 32 bits, realizan la operación y luego convierten de vuelta a un float de 64 bits. Esto significa que solo los 32 bits inferiores sobreviven. Para números mayores que 2³¹-1 o con partes fraccionarias, la conversión implícita puede causar resultados sorprendentes. Siempre usa Math.floor() para conversión explícita a entero antes de confiar en el comportamiento bitwise, y ten en cuenta que los valores fuera del rango de 32 bits se truncarán módulo 2³².',
      },
    ],
    conclusion:
      'Las operaciones bitwise son las operaciones más pequeñas y rápidas que una computadora puede realizar — literalmente un ciclo de CPU, una capa de compuerta lógica de profundidad. Nuestra calculadora hace estas operaciones visibles, mostrando exactamente qué bits cambian y por qué. Ya sea que estés empaquetando banderas, extrayendo canales de color o depurando una implementación de criptografía, ve tus bits en detalle completo.',
  },
  'how-to-use-ip-calculator': {
    title: 'Calculadora de Subredes IP: Domina la Notación CIDR, Máscaras de Subred y Planificación de Redes',
    metaTitle: 'Calculadora de Subredes IP – CIDR, Máscara de Subred y Rango de Red',
    metaDescription:
      'Calcula subredes IP, rangos CIDR, direcciones de red y conteo de hosts online. Aprende subnetting IPv4, VLSM, rangos IP privados y redes VPC de AWS. Herramienta gratuita.',
    keywords: [
      'calculadora de subredes IP',
      'calculadora de máscara de subred',
      'calculadora CIDR',
      'subnetting IPv4',
      'calculadora de dirección de red',
      'calculadora de rango IP',
      'calculadora VLSM',
      'rangos IP privados',
      'subred VPC AWS',
      'calculadora de dirección broadcast',
      'redes Docker',
      'calculadora de subredes IPv6',
    ],
    intro:
      'El subnetting IP es el arte de dividir un espacio de direcciones de red en segmentos más pequeños y manejables — y sigue siendo uno de los temas más evaluados (y más temidos) en los exámenes de certificación de redes por una buena razón. Cada paquete que atraviesa internet se enruta basándose en cálculos de subred realizados por los routers en tiempo real: ¿pertenece esta IP de destino a mi red local o debo reenviarla hacia arriba? Una calculadora de subredes responde esta pregunta al instante mostrándote la dirección de red, dirección broadcast, rango de hosts utilizables, número total de hosts y máscara wildcard para cualquier combinación de IP y prefijo CIDR. Ya sea que estés configurando un laboratorio doméstico con 192.168.1.0/24, aprovisionando una VPC de AWS con un bloque CIDR 10.0.0.0/16, configurando redes puente de Docker o estudiando para tu CCNA, nuestra calculadora gratuita de subredes IP online maneja subnetting IPv4 con desgloses visuales y admite cálculos de prefijos IPv6.',
    steps: [
      {
        heading: 'Ingresa una Dirección IP y un Prefijo CIDR',
        body: 'Escribe cualquier dirección IPv4 válida (por ejemplo, 192.168.1.100) y una longitud de prefijo CIDR de /0 a /32 (por ejemplo, /24). La notación CIDR combina la dirección de red y el número de bits en la porción de red: /24 significa que los primeros 24 bits son la red, dejando 8 bits para hosts (2⁸−2 = 254 direcciones utilizables). La calculadora también acepta notación de máscara de subred tradicional (255.255.255.0) y la convierte a CIDR automáticamente.',
      },
      {
        heading: 'Revisa el Desglose Completo de la Subred',
        body: 'Las tarjetas de resultado muestran cada propiedad de la subred simultáneamente: Dirección de Red (la base de la subred, por ejemplo, 192.168.1.0), Dirección Broadcast (la dirección de host todo-unos, por ejemplo, 192.168.1.255), Rango de Hosts Utilizables (primera a última IP asignable, por ejemplo, 192.168.1.1 - 192.168.1.254), Total de Hosts (2^(32-prefijo)), Hosts Utilizables (total menos 2 para red y broadcast), Máscara de Subred en decimal punteado y hexadecimal, y Máscara Wildcard (inversa de la máscara de subred, usada en ACLs y OSPF).',
      },
      {
        heading: 'Explora la Visualización y División de Subredes',
        body: 'Una barra visual divide el espacio de direcciones de 32 bits en porciones de red y host en el límite del prefijo seleccionado. La función "Subdividir" muestra cómo un bloque más grande puede dividirse en subredes más pequeñas: un /24 puede convertirse en dos /25s (128 hosts cada una), cuatro /26s (64 hosts cada una) u ocho /27s (32 hosts cada una). Para cada división, la calculadora muestra la dirección de red exacta, el rango y la dirección broadcast — esencial para la planificación VLSM (Variable Length Subnet Masking).',
      },
    ],
    tips: [
      'Memoriza el mapeo CIDR-a-máscara para prefijos comunes: /8 = 255.0.0.0 (clase A, 16.7M hosts), /16 = 255.255.0.0 (clase B, 65.534 hosts), /24 = 255.255.255.0 (clase C, 254 hosts). Entre estos, cada incremento en la longitud del prefijo duplica o divide a la mitad el número de subredes y hosts: /25 tiene 128 direcciones, /26 tiene 64, /27 tiene 32, /28 tiene 16, /29 tiene 8, /30 tiene 4 (exactamente 2 utilizables — para enlaces punto a punto).',
      'Los rangos IP privados (RFC 1918) no son enrutables en internet público. Existen para redes internas: 10.0.0.0/8 (un solo bloque clase A con 16.7 millones de direcciones — ideal para grandes empresas), 172.16.0.0/12 (16 bloques clase B de 172.16.0.0 a 172.31.255.255 — ideal para despliegues medianos) y 192.168.0.0/16 (256 bloques clase C — ideal para redes domésticas y de oficina pequeña).',
      'Redes VPC de AWS: el CIDR de VPC más pequeño es /28 (16 direcciones, AWS reserva 5 por subred, dejando 11 utilizables). El más grande es /16 (65.536 direcciones). Las subredes dentro de una VPC no pueden solaparse. Deja espacio en tu asignación CIDR para futuras subredes — una VPC /24 se llena más rápido de lo que piensas cuando agregas instancias RDS, ENIs de Lambda y nodos de balanceador de carga.',
      'La red puente predeterminada de Docker usa 172.17.0.0/16. Docker Compose crea una nueva red por proyecto en 172.18.0.0/16, 172.19.0.0/16, etc. Si tu VPN corporativa o red de oficina también usa el rango 172.16.0.0/12, tendrás conflictos de enrutamiento. Conoce tus subredes antes de solucionar problemas de conectividad.',
      'VLSM (Variable Length Subnet Masking) te permite dividir una red en subredes de diferentes tamaños en lugar de porciones iguales. Comienza con la subred más grande requerida (por conteo de hosts), asigna el bloque CIDR más pequeño que quepa, luego mueve la dirección de inicio más allá de ese bloque para la siguiente subred más grande. Esto conserva el espacio de direcciones — crítico para IPv4 dada la escasez de direcciones no asignadas.',
      'El prefijo /31 (RFC 3021) es un caso especial para enlaces punto a punto: tiene exactamente 2 direcciones, ambas utilizables (no se necesita dirección de red ni broadcast en un enlace punto a punto). Usar /31 en lugar de /30 duplica la eficiencia de tu direccionamiento de enlaces punto a punto — importante para ISPs con miles de enlaces de clientes.',
      'El subnetting IPv6 es conceptualmente más simple: el tamaño de subred estándar es /64, y casi siempre recibes al menos un /48 de tu ISP (dejando 16 bits para subnetting — eso son 65.536 subredes /64). El espacio de direcciones de 128 bits es tan vasto que el conteo de hosts es irrelevante; enfócate en los límites de subred y la porción de Interface ID (los 64 bits inferiores, a menudo EUI-64 desde la dirección MAC).',
    ],
    faqs: [
      {
        q: '¿Qué significa realmente la notación CIDR /24?',
        a: 'La notación CIDR (Classless Inter-Domain Routing) añade una barra y un número a una dirección IP para indicar cuántos de los 32 bits pertenecen a la porción de red. /24 significa que los primeros 24 bits (3 bytes) son el prefijo de red y los 8 bits restantes (1 byte) son para hosts. En términos de máscara de subred, /24 = 255.255.255.0. El número de hosts utilizables = 2^(32-prefijo) − 2. Para /24: 2⁸−2 = 256−2 = 254. Restas 2 porque la dirección de host todo-ceros es la dirección de red misma, y la dirección de host todo-unos es la dirección broadcast. /23 da 2⁹−2=510 hosts, /25 da 2⁷−2=126.',
      },
      {
        q: '¿Cuál es la diferencia entre una dirección de red y una dirección broadcast?',
        a: 'La dirección de red tiene todos los bits de host en 0 — identifica la subred misma y no puede asignarse a un dispositivo (por ejemplo, 192.168.1.0 para 192.168.1.0/24). La dirección broadcast tiene todos los bits de host en 1 — enviar un paquete a esta dirección lo entrega a cada dispositivo en la subred simultáneamente (por ejemplo, 192.168.1.255). Las solicitudes ARP y los paquetes de descubrimiento DHCP usan broadcast. Solo las direcciones entre estas dos (inclusive) son utilizables para hosts.',
      },
      {
        q: '¿Cómo sé si dos IPs están en la misma subred?',
        a: 'Realiza un AND bitwise entre cada IP y la máscara de subred. Si los resultados son iguales, las IPs están en la misma subred. Ejemplo: 192.168.1.50/24 y 192.168.1.200/24 — ambos AND 255.255.255.0 = 192.168.1.0, por lo que están en la misma subred. 192.168.1.50/24 y 192.168.2.50/24 — la primera hace AND a 192.168.1.0, la segunda a 192.168.2.0 — subredes diferentes, requieren un router para comunicarse. Nuestra calculadora realiza esta comprobación automáticamente entre cualquier par de IP/prefijo.',
      },
      {
        q: '¿Por qué AWS reserva 5 direcciones IP por subred?',
        a: 'En cada subred VPC de AWS, AWS reserva cinco direcciones IP que no puedes usar: la dirección de red (.0), el router VPC (.1), el servidor DNS (.2, en la base +2), una dirección de uso futuro (.3) y la dirección broadcast (.255). Para una subred /24 con 256 direcciones, eso deja 251 utilizables. Para una subred /28 más pequeña (16 direcciones), solo 11 son utilizables — la política de reserva de AWS tiene más impacto en subredes más pequeñas. Siempre ten esto en cuenta al dimensionar subredes de AWS.',
      },
      {
        q: '¿Qué tamaño de subred debo usar para mi red doméstica o de oficina?',
        a: 'Para un hogar típico: 192.168.1.0/24 (254 direcciones utilizables) es más que suficiente para todos los dispositivos, gadgets de hogar inteligente e invitados. Para una oficina pequeña de hasta 200 dispositivos: /24 sigue siendo adecuado. Para 200-500 dispositivos: usa /23 (510 direcciones). Para 500-1000+: /22 (1022 direcciones). Evita hacer subredes más grandes de lo necesario — dominios broadcast más grandes significan más tráfico de sobrecarga broadcast, lo que degrada el rendimiento especialmente en redes Wi-Fi.',
      },
      {
        q: '¿En qué se diferencia el subnetting IPv6 de IPv4?',
        a: 'IPv6 usa direcciones de 128 bits (vs. 32 bits para IPv4). La subred LAN estándar es un /64 — los primeros 64 bits son el prefijo de red, los últimos 64 son el identificador de interfaz. Los ISPs típicamente asignan un /56 o /48 a un sitio de cliente, dándote 8 o 16 bits para subnetting interno (256 o 65.536 subredes). El enorme espacio de direcciones elimina la necesidad de NAT — cada dispositivo puede tener una dirección globalmente única. Las calculadoras de subredes IPv6 se enfocan en límites de prefijo y rangos de ID de subred en lugar de conteos de hosts, ya que incluso un /64 contiene 18.4 trillones de direcciones posibles.',
      },
      {
        q: '¿Qué es una máscara wildcard y cómo se usa?',
        a: 'Una máscara wildcard es el complemento bitwise (NOT) de una máscara de subred. Para /24 (255.255.255.0), la máscara wildcard es 0.0.0.255. Cisco IOS usa máscaras wildcard en listas de control de acceso (ACLs) y declaraciones de red OSPF para definir rangos de direcciones. Mientras una máscara de subred usa 1s para bits de red y 0s para bits de host, una máscara wildcard usa 0s para coincidir y 1s para ignorar. Ejemplo: una regla ACL que coincide con 192.168.1.0 0.0.0.3 coincide con las direcciones 192.168.1.0 a 192.168.1.3 — el wildcard 0.0.0.3 (binario ...00000011) significa "ignora los últimos 2 bits."',
      },
    ],
    conclusion:
      'El subnetting IP deja de ser intimidante en el momento en que visualizas la división de la dirección de 32 bits entre las porciones de red y host. Nuestra calculadora de subredes hace explícita esa división — mostrándote la red, broadcast, rango de hosts y matemáticas CIDR para cualquier combinación de IP/Prefijo. Ya sea que estés aprovisionando infraestructura en la nube o estudiando para una certificación, haz subnetting con confianza.',
  },
  'how-to-use-time-diff': {
    title: 'Calculadora de Diferencia Horaria: Matemáticas de Fechas, Cálculos con Zonas Horarias y Días Hábiles',
    metaTitle: 'Calculadora de Diferencia Horaria – Fecha y Tiempo Transcurrido',
    metaDescription:
      'Calcula la diferencia exacta de tiempo entre dos fechas en días, horas y minutos. Con zona horaria, conteo de días hábiles, duración ISO 8601. Herramienta online gratuita.',
    keywords: [
      'calculadora de diferencia horaria',
      'calculadora de diferencia de fechas',
      'días entre fechas',
      'calculadora de tiempo transcurrido',
      'calculadora de días hábiles',
      'calculadora de zona horaria',
      'duración ISO 8601',
      'diferencia de timestamp Unix',
      'calculadora de edad',
      'calculadora de plazos de proyecto',
      'temporizador de cuenta regresiva',
      'calculadora de SLA',
    ],
    intro:
      'Dos marcas de tiempo. La distancia entre ellas parece simple — solo hay que restar. Pero el mundo real complica esto al instante: las zonas horarias cambian el reloj por horas, el horario de verano añade o quita una hora del día, diferentes meses tienen diferentes duraciones (28, 29, 30 o 31 días), y los años bisiestos insertan un día extra cada cuatro años (excepto los años seculares no divisibles por 400). Una calculadora de diferencia horaria que maneja todos estos casos límite correctamente no es solo una herramienta de resta — es un motor de aritmética de fecha-hora. Ya sea que necesites saber exactamente cuántos días faltan para la fecha límite de tu proyecto, calcular una marca de tiempo de vencimiento de SLA en formato ISO 8601, determinar la edad de alguien con precisión de año bisiesto o contar días hábiles excluyendo fines de semana y festivos, nuestra calculadora gratuita de diferencia horaria produce resultados precisos y legibles al instante.',
    steps: [
      {
        heading: 'Ingresa las Fechas de Inicio y Fin',
        body: 'Establece tu fecha/hora de inicio y fin usando el selector de fecha o escribiendo en cualquier formato común (YYYY-MM-DD, MM/DD/YYYY, DD.MM.YYYY, o con componentes de hora HH:MM:SS). También puedes ingresar timestamps Unix o cadenas ISO 8601. La calculadora autodetecta el formato. Ambas fechas pueden incluir opcionalmente un desplazamiento de zona horaria o nombre de zona horaria IANA (como "America/New_York" o "Europe/Berlin"), que la calculadora usa para normalizar ambos momentos a UTC antes de calcular la diferencia.',
      },
      {
        heading: 'Elige Tu Formato de Salida',
        body: 'Selecciona entre múltiples modos de salida: Total de Días (incluyendo días fraccionarios para componentes de hora), Desglose (X años, Y meses, Z días, H horas, M minutos), Días Hábiles (lunes a viernes excluyendo fines de semana y opcionalmente una lista de fechas festivas) o Duración ISO 8601 (formato P3Y6M15DT4H30M). El modo de Días Hábiles es particularmente útil para gestión de proyectos y cálculos de SLA — una tarea que abarca 14 días naturales puede contener solo 10 días laborables.',
      },
      {
        heading: 'Lee el Desglose Detallado',
        body: 'La tarjeta de resultado muestra la diferencia horaria en cada unidad común simultáneamente: total de años, meses, semanas, días, horas, minutos y segundos. Debajo, una visualización de línea de tiempo coloca el inicio y el fin en una barra horizontal, mostrando la extensión proporcionalmente. La sección "Hitos" muestra puntos intermedios — cuántos días en el punto medio, cada cuarto y los límites notables del calendario (inicio de mes, inicio de año) dentro del intervalo.',
      },
    ],
    tips: [
      'Regla del año bisiesto: un año es bisiesto si es divisible por 4, pero NO si es divisible por 100, A MENOS que también sea divisible por 400. Así que 2000 fue bisiesto (divisible por 400), pero 1900 no lo fue (divisible por 100 pero no por 400), y 2100 no lo será. El año gregoriano promedio es de 365.2425 días — esta pequeña corrección mantiene el calendario alineado con la órbita de la Tierra con un error de solo 1 día cada 3.300 años.',
      'Al calcular la edad con precisión, resta la fecha de nacimiento de la fecha actual, luego verifica si el cumpleaños ya ocurrió este año. Una persona nacida el 29 de febrero en un año bisiesto técnicamente cumple años el 1 de marzo en años no bisiestos en la mayoría de las jurisdicciones legales (Reino Unido, EE. UU., UE). Calcular la edad como suelo((hoy - fechaNacimiento) / 365.2425) da una aproximación cercana pero falla cerca del límite del cumpleaños.',
      'Los cálculos de días hábiles se vuelven complejos rápidamente. La semana laboral estándar de lunes a viernes excluye 104-105 días de fin de semana por año. Agregar festivos comunes (10 festivos federales en EE. UU., 8 festivos bancarios en el Reino Unido, fechas variables como Pascua) elimina otros 7-10 días. Para proyectos internacionales, diferentes países observan diferentes festivos — un equipo EE. UU.-Reino Unido podría perder 15-18 días hábiles por año debido a festivos no solapados.',
      'El formato de duración ISO 8601 (PTnHnMnS) es el estándar internacional para representar intervalos de tiempo. "P1Y2M10DT4H30M" significa 1 año, 2 meses, 10 días, 4 horas, 30 minutos. Este formato se usa en metadatos de video (contentDuration de YouTube), respuestas de API, archivos iCalendar (.ics) y elementos HTML5 <time>. Nuestra calculadora produce tanto la duración ISO 8601 como el desglose más amigable para humanos.',
      'Los timestamps Unix cuentan segundos desde 1970-01-01 00:00:00 UTC (la Época Unix). Restar dos timestamps da la diferencia en segundos — divide por 86.400 para días, 3.600 para horas, 60 para minutos. Pero cuidado: los timestamps Unix ignoran los segundos intercalares (27 añadidos desde 1972), por lo que no son estrictamente un conteo de segundos SI. Para duraciones menores a un día, esta discrepancia es irrelevante; para períodos de varios años, acumula un error de 27 segundos.',
      'Los cálculos de SLA (Service Level Agreement) típicamente usan horas hábiles, no horas naturales. Un "SLA de respuesta de 4 horas" durante el horario laboral (9 AM-6 PM) significa que un ticket a las 5 PM del viernes debe ser atendido antes de las 11 AM del lunes — solo han transcurrido 2 horas hábiles. El modo de horas personalizadas de nuestra calculadora te permite definir la ventana del día laboral y calcular con precisión el vencimiento de SLA a través de fines de semana.',
      'Al planificar un proyecto con diagramas de Gantt, siempre calcula las duraciones en días hábiles, no días naturales. Una "tarea de 10 días" que comienza un jueves y abarca dos fines de semana en realidad toma 14 días naturales. El software de gestión de proyectos maneja esto automáticamente, pero nuestra calculadora te da la misma capacidad para planificación rápida sin necesidad de una suite completa de gestión de proyectos.',
    ],
    faqs: [
      {
        q: '¿Cómo maneja la calculadora las zonas horarias?',
        a: 'Cuando ambas fechas incluyen información de zona horaria (desplazamiento como +02:00 o nombre IANA como "Asia/Tokyo"), la calculadora convierte ambas a UTC antes de calcular la diferencia. Esto asegura que el resultado refleje el tiempo transcurrido real independientemente de la zona horaria. Si no se especifica zona horaria, las fechas se tratan como hora local del navegador. Para cálculos entre zonas horarias, siempre incluye la información de zona horaria — un vuelo de Londres a Nueva York toma aproximadamente 8 horas, pero la diferencia de reloj local es solo 5 horas debido al desplazamiento de zona horaria.',
      },
      {
        q: '¿Cómo se calculan los días hábiles y puedo agregar festivos personalizados?',
        a: 'La calculadora de días hábiles cuenta de lunes a viernes, excluyendo sábado y domingo. Puedes ingresar una lista de fechas festivas personalizadas (formato YYYY-MM-DD separadas por comas), y la calculadora excluirá esos días también. La herramienta también reconoce festivos recurrentes comunes cuando se le da un rango de años. Para festivos de medio día o horas hábiles parciales, usa el modo de horas laborales personalizadas que te permite definir el inicio y fin de cada día laboral.',
      },
      {
        q: '¿Qué sucede con los casos límite de cambio de mes como 31 de enero + 1 mes?',
        a: 'Sumar un mes al 31 de enero produce diferentes resultados según la convención utilizada. El método de "preservación de fin de mes" (usado por nuestra calculadora en modo lógica de negocio) produce 28 de febrero (o 29 en año bisiesto) — el último día del mes objetivo. El método "estricto" recorta al día máximo del mes objetivo. El método "rollover" produce 3 de marzo (28 de febrero + 3 días). Nuestra calculadora usa por defecto la preservación de fin de mes y anota explícitamente cuando ocurre este ajuste.',
      },
      {
        q: '¿Puede la calculadora manejar fechas anteriores a 1970 o posteriores a 2038?',
        a: 'Sí. La calculadora usa manejo de fechas de 64 bits y no está limitada por la época Unix (1970) o el problema del año 2038 (que afecta a los timestamps Unix con signo de 32 bits). Maneja correctamente fechas desde el año 1 hasta el año 9999 usando el calendario gregoriano proléptico (el calendario gregoriano extendido hacia atrás antes de su introducción en 1582). Las fechas anteriores a la reforma gregoriana se muestran con una notación que indica la convención proléptica.',
      },
      {
        q: '¿Cómo calculo la edad exacta de alguien incluyendo años bisiestos?',
        a: 'Calcula la diferencia desde la fecha de nacimiento hasta hoy. Si el mes actual < mes de nacimiento, o el mes actual es igual al mes de nacimiento y el día actual < día de nacimiento, resta 1 de la diferencia de años. Esto maneja correctamente los cumpleaños en año bisiesto: alguien nacido el 29 de febrero de 2000 se consideraría que cumple años el 1 de marzo en años no bisiestos. La calculadora también muestra la edad en meses totales (útil para edad infantil) y semanas totales.',
      },
    ],
    conclusion:
      'Las diferencias horarias esconden complejidad detrás de una aparente simplicidad — años bisiestos, límites de mes, cambios de zona horaria y reglas de días hábiles conspiran contra el enfoque de resta ingenua. Nuestra calculadora maneja cada caso límite, entregando resultados precisos en el formato que necesitas, desde duraciones ISO 8601 hasta conteos de días hábiles. Pruébala ahora y deja de contar en tu calendario.',
  },
  'how-to-use-loan-calculator': {
    title: 'Calculadora de Préstamos: Amortización, TAE vs Tasa de Interés y Cómo los Pagos Extra Ahorran Miles',
    metaTitle: 'Calculadora de Préstamos – Pago Mensual y Plan de Amortización',
    metaDescription:
      'Calcula pagos mensuales de préstamos con la fórmula de amortización. Compara TAE, ve desgloses de capital vs intereses y modela ahorros con pagos extra. Herramienta gratuita.',
    keywords: [
      'calculadora de préstamos',
      'calculadora de pago mensual',
      'calculadora de amortización',
      'calculadora de pago hipotecario',
      'calculadora TAE',
      'amortización de préstamos',
      'calculadora de pagos extra',
      'calculadora de tasa de interés',
      'calculadora de préstamo automotriz',
      'calculadora de préstamo personal',
      'calculadora de préstamo estudiantil',
      'relación deuda-ingreso',
    ],
    intro:
      'Un préstamo es engañosamente simple: pides prestado un monto principal, aceptas devolverlo a lo largo del tiempo y el prestamista cobra intereses por el privilegio. Pero la relación entre el monto del préstamo, la tasa de interés y la duración del plazo produce resultados que desafían la intuición — una hipoteca de $300.000 al 6% a 30 años cuesta $647.515 en total, lo que significa que pagas más en intereses ($347.515) que el valor de la casa misma. Una diferencia de solo un punto porcentual en la tasa de interés cambia el pago mensual en $190 y el costo total en $68.000 en esa misma hipoteca. Nuestra calculadora de préstamos gratuita usa la fórmula de amortización estándar para calcular tu pago mensual exacto, genera un desglose completo de capital vs intereses para cada pago en la vida del préstamo y te permite modelar el efecto de pagos extra — mostrándote exactamente cuántos años y cuántos miles de dólares ahorra un pago extra por año en tu préstamo.',
    steps: [
      {
        heading: 'Ingresa los Detalles de Tu Préstamo',
        body: 'Ingresa el monto del préstamo (principal), la tasa de interés anual (como porcentaje, por ejemplo, 6.5 para 6.5%) y el plazo del préstamo en años. La calculadora admite tanto préstamos amortizados de tasa fija (estándar para hipotecas y préstamos automotrices) como préstamos de interés simple. Para préstamos de tasa ajustable, puedes modelar múltiples períodos de tasa agregando fechas de ajuste de tasa. Todos los campos de moneda aceptan cualquier formato numérico — la calculadora es independiente de la moneda y muestra el separador decimal que prefieras.',
      },
      {
        heading: 'Revisa Tu Pago Mensual y el Plan de Amortización',
        body: 'Tu pago mensual se muestra al instante junto con: total de pagos (mensual × plazo en meses), total de intereses pagados y costo total (principal + intereses). Debajo, el plan de amortización completo muestra cada período de pago — número de pago, saldo inicial, monto del pago, porción de intereses, porción de capital y saldo final. Un gráfico de barras apiladas codificado por colores hace visible la relación interés-vs-capital de un vistazo para cada año del préstamo.',
      },
      {
        heading: 'Modela Escenarios de Pagos Extra',
        body: 'Agrega pagos extra — sumas únicas, extras mensuales recurrentes o pagos adicionales anuales — y la calculadora recalcula el plan de amortización completo. Los resultados muestran: nueva fecha de liquidación (cuántos años antes), total de intereses ahorrados (en moneda y como porcentaje), y una comparación lado a lado del plan original vs el acelerado. Un solo pago extra de $1.000 en una hipoteca de $300K a 30 años puede ahorrar más de $3.500 en intereses — la calculadora te muestra exactamente por qué.',
      },
    ],
    tips: [
      'La fórmula de amortización: M = P × [r(1+r)ⁿ] / [(1+r)ⁿ − 1], donde M = pago mensual, P = principal, r = tasa de interés mensual (tasa anual ÷ 12), n = número total de pagos (años × 12). Para un préstamo de $300K al 6% a 30 años: r = 0.005, n = 360, M = 300.000 × [0.005(1.005)³⁶⁰] / [(1.005)³⁶⁰ − 1] = $1.798.65. Esta fórmula garantiza que el saldo llegue exactamente a $0 después del pago final.',
      'La TAE (Tasa Anual Equivalente) NO es lo mismo que la tasa de interés. La TAE incluye la tasa de interés más las comisiones del prestamista (comisión de apertura, puntos, costos de cierre) expresados como un porcentaje anualizado. Un préstamo anunciado al 6.0% de interés con $5.000 en comisiones en un préstamo de $300K podría tener una TAE del 6.15%. Por ley en EE. UU., los prestamistas deben divulgar ambas — compara TAEs, no tasas de interés, al buscar préstamos.',
      'Los primeros 5 años de una hipoteca a 30 años son casi completamente intereses. En un préstamo de $300K al 6%, tu primer pago se divide en $1.500 de intereses y solo $298.65 de capital. Después de 5 años (60 pagos), has pagado $88.259 en intereses pero has reducido tu saldo solo en $19.726 — todavía debes $280.274. Esta estructura de intereses concentrados al inicio es por qué mudarse o refinanciar en los primeros años elimina gran parte del beneficio financiero de ser propietario.',
      'Una hipoteca a 15 años vs 30 años: en $300K al 6%, el pago a 30 años es $1.799 (intereses totales = $347.515), mientras que el pago a 15 años es $2.531 (intereses totales = $155.582). El préstamo a 15 años cuesta $732 más por mes pero ahorra $191.933 en intereses — y eres dueño de la casa en la mitad del tiempo. Si tu presupuesto permite el pago más alto, los ahorros totales son enormes.',
      'Estrategia de pago extra: hacer un pago mensual extra por año (los pagos quincenales logran el mismo efecto naturalmente) en una hipoteca a 30 años la liquida en aproximadamente 24 años en lugar de 30, ahorrando decenas de miles en intereses. En el préstamo de $300K al 6%, un pago extra de $1.799 anualmente ahorra $64.288 en intereses y reduce 5 años del plazo del préstamo. No hay casi ninguna forma más fácil de ahorrar esta cantidad de dinero.',
      'La relación deuda-ingreso (DTI) = total de pagos mensuales de deuda dividido por el ingreso mensual bruto. La mayoría de los prestamistas hipotecarios limitan el DTI al 43% (el límite de hipoteca calificada), y muchos prefieren 36% o menos. Nuestra calculadora muestra el DTI estimado para tu préstamo basado en el ingreso que ingreses, ayudándote a evaluar la probabilidad de aprobación antes de solicitar formalmente.',
      'Pagos globales (balloon): algunos préstamos comerciales y privados estructuran un pago mensual bajo durante 5-7 años y luego requieren todo el principal restante como un solo pago global. Un préstamo de $100K al 5% amortizado a 30 años pero vencible en 7 años: pago mensual = $537, pero el pago global después de 7 años = $87.843. Si no puedes refinanciar cuando vence el pago global, corres el riesgo de perder el activo. Siempre modela escenarios de pago global antes de firmar.',
    ],
    faqs: [
      {
        q: '¿Cómo se calcula matemáticamente el pago mensual del préstamo?',
        a: 'La fórmula M = P × [r(1+r)ⁿ] / [(1+r)ⁿ − 1] se deriva del valor presente de una anualidad — la suma de todos los pagos futuros descontados debe igualar el principal. Cada pago cubre el interés acumulado desde el último pago (r × saldo restante), y el resto reduce el principal. Debido a que el saldo disminuye con cada pago, la porción de intereses disminuye y la porción de capital aumenta con el tiempo, aunque el pago total permanezca constante. Por eso el plan de amortización no es lineal: los primeros pagos son mayormente intereses, los últimos pagos son mayormente capital.',
      },
      {
        q: '¿Cuál es la diferencia entre la TAE y la tasa de interés?',
        a: 'La tasa de interés es el costo anual de pedir prestado el principal expresado como porcentaje — impulsa la fórmula de amortización pero excluye las comisiones. La TAE (Tasa Anual Equivalente) es una medida más amplia requerida por la Ley de Veracidad en Préstamos que incluye la mayoría de las comisiones del prestamista y las expresa como una tasa anualizada. Por ejemplo, una tasa del 6.0% con \$3.000 en comisiones en un préstamo de \$200K a 30 años resulta aproximadamente en una TAE del 6.12%. Comparar TAEs (no tasas) entre prestamistas te da la comparación de costo real — pero incluso la TAE excluye algunos costos como tasación y título, así que tenlos en cuenta por separado.',
      },
      {
        q: '¿Cómo reducen los pagos extra el interés total que pago?',
        a: 'Los pagos extra reducen el principal directamente, lo que disminuye el saldo sobre el cual se acumulan los intereses futuros. En una hipoteca al 6%, cada $1.000 de pago extra reduce tu principal en $1.000 Y ahorra $60 en intereses solo en el primer año. Ese $60 ahorrado permanece en tu saldo, acelerando la reducción de principal del siguiente período — un efecto compuesto. A lo largo de 25-30 años, un pago extra único de $1.000 en el primer año ahorra aproximadamente $3.500-$5.700 en intereses totales (dependiendo de la tasa), porque evitas pagar intereses sobre ese $1.000 por el resto del préstamo.',
      },
      {
        q: '¿Debería elegir una hipoteca a 15 o 30 años?',
        a: 'La hipoteca a 15 años ofrece una tasa de interés más baja (típicamente 0.5-1% menos que a 30 años) y dramáticamente menos interés total. Sin embargo, el pago mensual más alto reduce tu flexibilidad financiera. Un buen punto medio: toma la de 30 años por el pago mínimo más bajo, pero haz pagos extra como si fuera de 15 años cuando tu presupuesto lo permita. Esto te da la seguridad del pago mínimo más bajo con los ahorros de intereses del plan acelerado — pero asegúrate de que tu préstamo no tenga penalización por prepago.',
      },
      {
        q: '¿Qué es la amortización y en qué se diferencia del interés simple?',
        a: 'La amortización es el proceso de pagar deuda mediante pagos regulares donde cada pago cubre el interés acumulado más una porción del principal, con la porción de capital creciendo con el tiempo. Los préstamos de interés simple cobran interés solo sobre el principal restante cada período (sin capitalización de intereses no pagados). La mayoría de las hipotecas, préstamos automotrices y préstamos estudiantiles son amortizados. Las tarjetas de crédito, en cambio, típicamente capitalizan el interés diariamente sobre el saldo no pagado, haciéndolas mucho más caras para préstamos a largo plazo.',
      },
      {
        q: '¿Cómo afecta mi puntuación de crédito a la tasa de mi préstamo?',
        a: 'Las puntuaciones de crédito son el determinante principal de las tasas de hipotecas y préstamos automotrices. A partir de 2024-2025, la diferencia entre crédito excelente (760+) y regular (620-639) en una hipoteca fija a 30 años puede superar 1.5 puntos porcentuales. En un préstamo de $300K, esta diferencia cuesta aproximadamente $95.000 en intereses adicionales durante 30 años. Antes de solicitar un préstamo, revisa tu informe de crédito, corrige errores, reduce los saldos renovables para bajar tu tasa de utilización y evita abrir nuevo crédito durante 3-6 meses para maximizar tu puntuación.',
      },
    ],
    conclusion:
      'Una calculadora de préstamos es la herramienta financiera más valiosa que puedes usar antes de firmar un acuerdo de préstamo. En 30 segundos, revela el costo real del préstamo — el interés total, la curva de amortización y los ahorros asombrosos incluso de pagos extra modestos. Haz los números antes de comprometerte; tu yo futuro te lo agradecerá.',
  },
  'how-to-use-matrix-calculator': {
    title: 'Calculadora de Matrices: Multiplicación, Inversión, Determinantes y Aplicaciones Reales',
    metaTitle: 'Calculadora de Matrices – Multiplicar, Inversa, Determinante Online',
    metaDescription:
      'Realiza multiplicación, inversión, transposición y cálculo de determinantes de matrices online. Aprende eigenvalues, productos punto y usos reales en gráficos 3D.',
    keywords: [
      'calculadora de matrices',
      'calculadora de multiplicación de matrices',
      'matriz inversa',
      'calculadora de determinantes',
      'matriz transpuesta',
      'calculadora de eigenvalues',
      'calculadora de álgebra lineal',
      'producto punto',
      'matriz de gráficos 3D',
      'matriz de regresión lineal',
      'sistemas de ecuaciones',
      'dimensiones de matriz',
    ],
    intro:
      'Las matrices son el lenguaje de las transformaciones lineales — una forma compacta de representar todo, desde rotar un modelo 3D en un videojuego hasta ajustar una línea de regresión a través de millones de puntos de datos. Cuando ves un personaje moverse en un motor de juegos, una matriz de transformación 4×4 está siendo multiplicada por un vector de coordenadas. Cuando una red neuronal hace una predicción, está realizando cadena tras cadena de multiplicaciones de matrices. Una calculadora de matrices toma estas operaciones abstractas y las hace concretas: defines las matrices, eliges la operación y ves no solo el resultado sino los cálculos intermedios que lo produjeron. Nuestra calculadora de matrices online gratuita maneja suma, resta, multiplicación escalar, multiplicación de matrices, determinante, inversa, transpuesta y eigenvalues para matrices de hasta 10×10 — con cada producto punto y expansión de cofactores desglosados paso a paso para que puedas seguir las matemáticas.',
    steps: [
      {
        heading: 'Define Tus Matrices',
        body: 'Ingresa las dimensiones de tus matrices (hasta 10×10) y llena las celdas de la cuadrícula con números — enteros, decimales o fracciones. La calculadora valida las dimensiones en tiempo real: para la multiplicación A×B, verifica que las columnas de A igualen las filas de B, resaltando la restricción en verde cuando se cumple. También puedes importar matrices desde CSV, pegar desde una hoja de cálculo o usar plantillas predefinidas (matriz identidad, matriz cero, matriz de Hilbert, matriz de rotación para 2D/3D).',
      },
      {
        heading: 'Selecciona una Operación',
        body: 'Elige entre: Suma/Resta (elemento a elemento, requiere dimensiones idénticas), Multiplicación Escalar (cada elemento multiplicado por una constante), Multiplicación de Matrices (productos punto fila por columna), Determinante (solo matrices cuadradas, calculado mediante expansión de Laplace o reducción de filas), Inversa (solo matrices cuadradas, mediante eliminación de Gauss-Jordan o fórmula de adjunta), Transpuesta (intercambia filas y columnas) o Eigenvalues (raíces del polinomio característico, con eigenvectors mostrados para 2×2 y 3×3).',
      },
      {
        heading: 'Estudia la Derivación Paso a Paso',
        body: 'Para la multiplicación: cada celda (i,j) del resultado se muestra como el producto punto de la fila i de la primera matriz y la columna j de la segunda, con los términos individuales listados. Para el determinante: la expansión de Laplace a lo largo de la primera fila se muestra término por término. Para la inversa: los pasos de eliminación de Gauss-Jordan se muestran con la matriz aumentada evolucionando hacia la forma escalonada reducida por filas. Este desglose pedagógico transforma la calculadora de una caja negra a una herramienta de aprendizaje.',
      },
    ],
    tips: [
      'La multiplicación de matrices NO es conmutativa: A×B ≠ B×A en general. El orden importa enormemente. Una traslación seguida de una rotación coloca los objetos en una posición completamente diferente que una rotación seguida de una traslación. En gráficos 3D, el orden de las multiplicaciones de matrices en tu tubería de transformación (escalar → rotar → trasladar) debe ser intencional — intercambiar cualquier par cambia el resultado.',
      'El determinante de una matriz 2×2 [[a,b],[c,d]] es simplemente ad − bc. Para una 3×3: a(ei−fh) − b(di−fg) + c(dh−eg). El determinante te dice si una matriz es invertible (det ≠ 0), representa el factor de escala de la transformación lineal (un determinante de 3 significa que las áreas se triplican) y un determinante negativo indica una reflexión o inversión de orientación.',
      'La inversa de una matriz 2×2 [[a,b],[c,d]] es (1/(ad−bc)) × [[d,−b],[−c,a]], siempre que ad−bc ≠ 0. Si el determinante es exactamente cero, la matriz es singular — no tiene inversa, lo que significa que la transformación colapsa al menos una dimensión (por ejemplo, proyectar 3D sobre un plano 2D). Nuestra calculadora detecta matrices singulares y explica por qué la inversión es imposible.',
      'En gráficos 3D, una matriz de transformación homogénea 4×4 empaqueta rotación, escalado, traslación y proyección de perspectiva en una sola estructura. La submatriz 3×3 superior izquierda maneja rotación y escalado; la columna derecha (elementos [0][3], [1][3], [2][3]) maneja traslación en x, y, z; la fila inferior habilita efectos de perspectiva. Multiplicar una coordenada homogénea 4D [x,y,z,1] por esta matriz produce la posición transformada en una sola operación.',
      'Los eigenvalues (λ) y eigenvectors (v) satisfacen la ecuación Av = λv — multiplicar por la matriz A simplemente escala el eigenvector v por λ sin cambiar su dirección. En análisis de componentes principales (PCA), los eigenvectors de la matriz de covarianza identifican las direcciones de máxima varianza en tus datos. En el algoritmo PageRank original de Google, el eigenvector principal de la matriz de enlaces web determinaba la importancia de las páginas.',
      'La regresión lineal puede expresarse completamente en forma matricial. La ecuación normal β = (XᵀX)⁻¹Xᵀy resuelve para el vector de coeficientes β que minimiza el error cuadrático. Para un conjunto de datos con 100.000 filas y 10 características, X es 100K×10, XᵀX es una matriz compacta de 10×10, y resolver la ecuación normal implica una multiplicación de matrices y una inversión — mucho más eficiente que el descenso de gradiente para conjuntos de características pequeños a medianos.',
      'La transpuesta de un producto: (AB)ᵀ = BᵀAᵀ. El orden de la multiplicación se invierte. Esta identidad es crítica para derivar la retropropagación en redes neuronales — cuando los gradientes fluyen hacia atrás a través de las capas, cada matriz de pesos se transpone y el orden de multiplicación se invierte, siguiendo exactamente este patrón. Entender la transposición de matrices hace que la regla de la cadena del aprendizaje profundo sea intuitiva.',
    ],
    faqs: [
      {
        q: '¿Por qué la multiplicación de matrices requiere dimensiones internas coincidentes?',
        a: 'Para A × B = C, A debe tener dimensiones m×k y B debe tener dimensiones k×n — las dimensiones internas k deben coincidir porque cada celda C[i][j] es el producto punto de la fila i de A (longitud k) y la columna j de B (también longitud k). Si A es 3×4 y B es 4×5, entonces C es 3×5 — estás combinando una fila de 4 elementos con una columna de 4 elementos, produciendo un escalar, para cada una de las 3×5 posiciones de celda. Si las dimensiones internas difieren (por ejemplo, A es 3×4 y B es 5×2), los productos punto no están definidos y la multiplicación es imposible.',
      },
      {
        q: '¿Cómo es útil el determinante en la práctica?',
        a: 'El determinante te dice: (1) si una matriz es invertible — det=0 significa singular, sin inversa; (2) el factor de escala de volumen de la transformación lineal — det=3 significa que un cubo unitario se convierte en un paralelepípedo de volumen 3; (3) orientación — determinante negativo significa que la transformación incluye una reflexión; (4) en ecuaciones diferenciales, el determinante Wronskiano prueba la independencia lineal de soluciones; (5) en cálculo multivariable, el determinante Jacobiano convierte entre sistemas de coordenadas (por ejemplo, dx dy = r dr dθ en coordenadas polares).',
      },
      {
        q: '¿Cuál es la diferencia entre una matriz y un vector?',
        a: 'Un vector es un arreglo unidimensional de números. Una matriz es un arreglo bidimensional. Un vector columna es una matriz n×1; un vector fila es una matriz 1×n. Cuando multiplicas una matriz por un vector, estás aplicando la transformación de la matriz al vector: una matriz 3×3 multiplicada por un vector columna 3×1 produce un nuevo vector columna 3×1. Así es como funciona cada transformación 3D — las coordenadas de los vértices del modelo son vectores; la transformación (rotar, escalar, trasladar) es una matriz.',
      },
      {
        q: '¿Puedo usar la calculadora de matrices para resolver sistemas de ecuaciones lineales?',
        a: 'Sí. Un sistema de ecuaciones como 2x+3y=8, 5x−y=3 puede escribirse como Ax=b donde A = [[2,3],[5,−1]] y b = [[8],[3]]. La solución es x = A⁻¹b (si A es invertible). Nuestra calculadora te permite ingresar A y b por separado, luego calcula A⁻¹b para darte x = [1, 2]. Para sistemas más grandes (hasta 10 ecuaciones), la vista de eliminación gaussiana muestra las operaciones de fila paso a paso que conducen a la solución.',
      },
      {
        q: '¿Qué son los eigenvalues y por qué importan?',
        a: 'Un eigenvalue λ y su eigenvector v satisfacen Av = λv. En términos prácticos, el eigenvector es una dirección que sobrevive a la transformación sin cambios (solo escalada). Los eigenvalues revelan los modos dominantes de un sistema: en ingeniería estructural, los eigenvalues corresponden a frecuencias de vibración natural de un edificio o puente; en mecánica cuántica, representan niveles de energía medibles; en teoría de grafos, los eigenvalues de la matriz de adyacencia caracterizan la conectividad de la red; en PCA, los eigenvalues grandes identifican los componentes principales que capturan la mayor parte de la varianza de un conjunto de datos.',
      },
      {
        q: '¿Cómo multiplico manualmente una matriz 2×2 y una 2×3?',
        a: 'El resultado es 2×3. Celda (1,1) = fila1(A) · col1(B) = a₁₁×b₁₁ + a₁₂×b₂₁. Celda (1,2) = fila1(A) · col2(B) = a₁₁×b₁₂ + a₁₂×b₂₂. Celda (1,3) = fila1(A) · col3(B) = a₁₁×b₁₃ + a₁₂×b₂₃. Celda (2,1) = fila2(A) · col1(B) = a₂₁×b₁₁ + a₂₂×b₂₁. Y así sucesivamente para las 6 celdas. El patrón: para cada celda del resultado, toma la fila correspondiente de A y la columna correspondiente de B, multiplica elemento por elemento y suma. La calculadora muestra esto para cada celda en cada multiplicación.',
      },
    ],
    conclusion:
      'Las matemáticas de matrices impulsan todo, desde los gráficos en tu pantalla hasta los modelos de machine learning que hacen predicciones sobre tu comportamiento. Nuestra calculadora convierte el álgebra lineal abstracta en cálculos visibles paso a paso — ya sea que estés resolviendo ecuaciones, transformando coordenadas o explorando eigenvalues. Pruébala ahora y observa cómo se desarrollan los productos punto.',
  },
  'how-to-use-string-analyzer': {
    title: 'Analizador de Cadenas: Conteo de Caracteres, Tamaño en Bytes UTF-8, Entropía y Diagnóstico de Texto',
    metaTitle: 'Analizador de Cadenas – Contador de Caracteres y Análisis de Texto Online',
    metaDescription:
      'Analiza texto para conteo de caracteres, palabras, tamaño en bytes, entropía, frecuencia de caracteres y más. Tamaños UTF-8, UTF-16, UTF-32. Herramientas SEO y SMS. Gratis.',
    keywords: [
      'analizador de cadenas',
      'analizador de texto online',
      'contador de caracteres',
      'contador de palabras',
      'tamaño en bytes UTF-8',
      'calculadora de entropía de texto',
      'frecuencia de caracteres',
      'contador de caracteres SEO',
      'conteo de caracteres SMS',
      'entropía de contraseñas',
      'conteo de palabras únicas',
      'verificador de palíndromos',
    ],
    intro:
      'El texto parece simple — solo una secuencia de caracteres. Pero pregúntale a una computadora "¿qué tan larga es esta cadena?" y la respuesta depende de lo que entiendas por "longitud." ¿Son 140 caracteres? ¿160 bytes? ¿10 palabras? ¿Y qué hay de las propiedades invisibles — la entropía que mide la aleatoriedad, la distribución de frecuencia de las letras, o el hecho de que la "e" aparece tres veces más que la "k"? Un analizador de cadenas desempaqueta todas estas dimensiones a la vez. Nuestro analizador de texto online gratuito te da todo, desde conteos básicos (caracteres con y sin espacios, palabras, líneas, párrafos) hasta diagnósticos avanzados (tamaño en bytes en UTF-8/UTF-16/UTF-32, entropía de Shannon, distribución de frecuencia de caracteres, proporción de palabras únicas, palabra más larga y detección de palíndromos) — todo calculado al instante en tu navegador sin enviar datos a ningún servidor.',
    steps: [
      {
        heading: 'Pega o Escribe Tu Texto',
        body: 'Ingresa tu texto en el área de entrada — cualquier cosa, desde una sola palabra hasta un documento completo. El analizador se actualiza en tiempo real mientras escribes, mostrando conteos en vivo. Un contador de palabras rastrea los cambios mientras escribes; el contador de caracteres distingue entre caracteres totales y caracteres excluyendo espacios en blanco. El texto permanece completamente en tu navegador — nunca se envían datos por la red, lo que lo hace seguro para contenido sensible, contraseñas bajo análisis o documentos confidenciales.',
      },
      {
        heading: 'Revisa las Métricas Básicas y Avanzadas',
        body: 'El panel de resultados muestra: conteo de caracteres (total y sin espacios), conteo de palabras (usando detección de límites de palabra consciente de Unicode), conteo de líneas, conteo de párrafos, conteo de oraciones, longitud promedio de palabra, palabra más larga, conteo de palabras únicas y proporción (palabras únicas/totales, una medida de diversidad léxica) y tiempo estimado de lectura. Debajo de lo básico, las métricas avanzadas muestran el tamaño en bytes en tres codificaciones (UTF-8, UTF-16, UTF-32), entropía de Shannon y distribución de frecuencia de caracteres.',
      },
      {
        heading: 'Explora Tamaño en Bytes, Entropía y Frecuencia',
        body: 'La sección de codificación muestra cuántos bytes consume tu texto en UTF-8 (1-4 bytes por carácter, los caracteres ASCII usan 1 byte, los caracteres CJK usan 3), UTF-16 (2 o 4 bytes por carácter) y UTF-32 (siempre 4 bytes por carácter). La puntuación de entropía (0-8 bits por carácter) te dice qué tan aleatorio e impredecible es el texto — útil para estimar la fortaleza de contraseñas. La tabla de frecuencia clasifica cada carácter único por conteo de ocurrencias y porcentaje, revelando patrones como el orden de frecuencia clásico ETAOIN SHRDLU del inglés.',
      },
    ],
    tips: [
      'UTF-8 es la codificación dominante en la web (usada por el 98%+ de los sitios web). Es de ancho variable: los caracteres ASCII (letras inglesas, dígitos, puntuación común) ocupan 1 byte; Latín Extendido y Griego/Cirílico ocupan 2 bytes; los caracteres CJK (chino, japonés, coreano) ocupan 3 bytes; los emoji y escrituras raras ocupan 4 bytes. Esto significa que la cadena "Hello" son 5 bytes en UTF-8, mientras que "こんにちは" son 15 bytes — tres veces más grande para el mismo número de caracteres.',
      'UTF-16 se usa internamente en JavaScript, Java y las APIs de Windows. Usa 2 bytes para caracteres en el Plano Multilingüe Básico (BMP, U+0000 a U+FFFF, que cubre la mayoría de los idiomas vivos) y 4 bytes (pares sustitutos) para caracteres más allá — como emoji, escrituras históricas y caracteres CJK raros. La cadena "Hello😀" tiene 5 caracteres pero 10 bytes en UTF-16 (5×2) y 9 bytes en UTF-8 (5+4).',
      'La entropía de Shannon mide el contenido promedio de información por carácter. El texto en inglés típicamente puntúa 3.5-4.5 bits/carácter debido a frecuencias de letras y patrones predecibles. El texto completamente aleatorio (las 26 letras igualmente probables) se acerca a 4.7 bits/carácter. Una contraseña aleatoria que mezcla mayúsculas, minúsculas, dígitos y símbolos puede alcanzar 6.5+ bits/carácter. Mayor entropía = más aleatorio = contraseña más fuerte.',
      'Para metaetiquetas SEO: Google típicamente muestra etiquetas de título de hasta 600 píxeles de ancho (aproximadamente 50-60 caracteres) y meta descripciones de hasta 920 píxeles (aproximadamente 150-160 caracteres). Supera estos límites y tu texto se trunca con puntos suspensivos en los resultados de búsqueda. El "Modo SEO" de nuestro analizador de cadenas agrega contadores calibrados específicamente a estos límites de visualización.',
      'Los mensajes SMS usan un límite de 160 caracteres para la codificación GSM 7-bit estándar (caracteres latinos + símbolos básicos), pero los mensajes que contienen caracteres no GSM (cirílico, CJK, emoji) usan codificación UCS-2, que reduce el límite a 70 caracteres por segmento. Los mensajes más largos que un segmento se concatenan, reduciendo aún más la longitud efectiva. Nuestro analizador indica si tu texto cabe en un segmento SMS y qué codificación se aplica.',
      'El análisis de frecuencia de caracteres revela patrones útiles para criptografía y lingüística. En prosa inglesa, la letra "e" aparece aproximadamente el 12.7% del tiempo, seguida de "t" (9.1%), "a" (8.2%) y "o" (7.5%). Las letras menos comunes (q, z, j, x) aparecen cada una menos del 0.2% del tiempo. Un cifrado de sustitución puede romperse alineando la distribución de frecuencia del texto cifrado con la distribución conocida del idioma del texto plano — el gráfico de frecuencia de nuestro analizador hace esto visual.',
      'La proporción de palabras únicas (palabras únicas ÷ total de palabras) es la Razón Tipo-Token (TTR), una medida de diversidad léxica. Para inglés conversacional, TTR típicamente varía entre 0.45-0.55. Valores más altos (0.6+) indican vocabulario variado; valores más bajos (menos de 0.3) indican repetición. El texto con un TTR por debajo de 0.2 a menudo se lee como robótico o relleno de palabras clave — una bandera roja para la calidad de contenido SEO.',
    ],
    faqs: [
      {
        q: '¿Por qué mi texto tiene diferentes conteos de bytes en UTF-8 vs UTF-16?',
        a: 'UTF-8 usa 1-4 bytes por carácter basado en el punto de código Unicode. Los caracteres en rango ASCII (U+0000-U+007F) usan 1 byte, haciendo UTF-8 muy eficiente para texto en inglés. UTF-16 usa 2 bytes para caracteres BMP (U+0000-U+FFFF) y 4 bytes para caracteres suplementarios mediante pares sustitutos. Para texto mayoritariamente ASCII, UTF-8 tiene aproximadamente la mitad del tamaño de UTF-16. Para texto mayoritariamente CJK, UTF-8 y UTF-16 son comparables (CJK necesita 3 bytes UTF-8 vs 2 bytes UTF-16). UTF-32 siempre usa 4 bytes por carácter, haciéndolo predecible pero ineficiente en espacio — raramente usado para almacenamiento, principalmente para procesamiento interno donde el acceso de ancho fijo importa.',
      },
      {
        q: '¿Cómo se calcula la entropía de Shannon para texto?',
        a: 'La entropía de Shannon H = −Σ(pᵢ × log₂(pᵢ)) para cada carácter único i, donde pᵢ es la probabilidad (frecuencia) de ese carácter en el texto. Por ejemplo, en la cadena "aab", p(a)=2/3, p(b)=1/3, por lo que H = −(2/3×log₂(2/3) + 1/3×log₂(1/3)) ≈ 0.918 bits/carácter. Para seguridad de contraseñas, la estimación de entropía a menudo se reporta como cruda (entropía total) y por carácter.',
      },
      {
        q: '¿Cuál es la diferencia entre conteo de caracteres y conteo de bytes?',
        a: 'El conteo de caracteres es el número de puntos de código Unicode (aproximadamente, el número de símbolos visibles y espacios que ves). El conteo de bytes depende de la codificación. En UTF-8, "a" = 1 byte, "é" = 2 bytes, "字" = 3 bytes, "😀" = 4 bytes. Una cadena de 5 emoji son 5 caracteres pero 20 bytes en UTF-8. Esta distinción importa para el dimensionamiento de columnas de base de datos (VARCHAR(255) puede significar 255 caracteres o 255 bytes dependiendo de la base de datos y la colación), ancho de banda de red y límites de carga útil de API.',
      },
      {
        q: '¿Cómo puedo usar esta herramienta para optimización de metaetiquetas SEO?',
        a: 'Activa el Modo SEO en el analizador. Esto agrega contadores calibrados a los límites de caracteres mostrados por Google: etiqueta de título (50-60 caracteres antes del truncamiento), meta descripción (150-160 caracteres) y slug de URL (idealmente 50-60 caracteres, aunque técnicamente ilimitado). También muestra estimaciones de ancho en píxeles para título y descripción. Ingresa tu texto meta preliminar y la herramienta te avisa cuando excedes el límite.',
      },
      {
        q: '¿Qué me dice el gráfico de frecuencia de caracteres?',
        a: 'El gráfico de frecuencia muestra cada carácter único en tu texto, clasificado por conteo de ocurrencias con porcentaje. Esto tiene varios usos: (1) criptografía — los cifrados de sustitución se rompen comparando la frecuencia del texto cifrado con la frecuencia conocida del idioma; (2) calidad de contenido — el uso excesivo de caracteres o palabras específicas puede indicar relleno de palabras clave; (3) eficiencia de codificación — textos dominados por caracteres ASCII son baratos en UTF-8; (4) identificación de idioma — diferentes idiomas tienen firmas de frecuencia distintas; (5) lingüística forense — análisis de autoría basado en patrones de caracteres habituales.',
      },
      {
        q: '¿Qué es la proporción de palabras únicas y por qué importa para la calidad de escritura?',
        a: 'La proporción de palabras únicas (Razón Tipo-Token, TTR) mide la diversidad de vocabulario. Se calcula como: palabras únicas / total de palabras. Para un artículo de blog de 500 palabras, un TTR de 0.5 significa que se usan 250 formas de palabras distintas — indicativo de escritura variada y natural. Un TTR de 0.2 significa que solo 100 palabras distintas forman todo el texto de 500 palabras — altamente repetitivo, característico de contenido relleno de palabras clave o mal escrito. Sin embargo, el TTR es sensible a la longitud del texto (textos más largos naturalmente tienen TTR más bajo), así que compara TTRs solo para textos de longitud similar.',
      },
    ],
    conclusion:
      'El texto es el tipo de datos más común en la computación, sin embargo, sus propiedades ocultas — tamaño en bytes según la codificación, entropía, patrones de frecuencia, diversidad léxica — son invisibles sin un analizador de cadenas. Nuestra herramienta revela todo sobre tu texto en tiempo real, desde conteos de caracteres para SEO hasta puntuaciones de entropía para fortaleza de contraseñas. Pega tu texto y ve lo que realmente hay allí.',
  },
  'how-to-use-date-calculator': {
    title: 'Calculadora de Fechas: Suma y Resta Días, Maneja Límites de Mes y Planifica con Precisión',
    metaTitle: 'Calculadora de Fechas – Sumar Restar Días, Semanas, Meses y Años',
    metaDescription:
      'Suma o resta días, semanas, meses y años de cualquier fecha online. Maneja años bisiestos, límites de mes y días hábiles. Herramienta gratuita de aritmética de fechas.',
    keywords: [
      'calculadora de fechas',
      'calculadora de sumar restar días',
      'aritmética de fechas',
      'calculadora de días hábiles',
      'calculadora de año bisiesto',
      'sumar meses a una fecha',
      'calculadora de fecha de vencimiento',
      'calculadora de expiración de garantía',
      'fecha de renovación de suscripción',
      'calculadora de cronograma de proyecto',
      'calculadora de fecha de parto',
      'herramienta de matemáticas de fechas',
    ],
    intro:
      'La aritmética de fechas está llena de trampas. Suma un mes al 31 de enero — ¿obtienes 28 de febrero (último día del mes objetivo), 3 de marzo (31 días después) o un error? Resta un año del 29 de febrero de 2024 — ¿llegas al 28 de febrero de 2023 (ya que 2023 no es bisiesto) o al 1 de marzo de 2023? Estos casos límite no son académicos — causan errores reales en sistemas de facturación, gestión de suscripciones, seguimiento de garantías y herramientas de planificación de proyectos. Nuestra calculadora de fechas gratuita maneja todo esto correctamente usando convenciones bien definidas que puedes configurar. Suma y resta días, semanas, meses o años de cualquier fecha; cambia entre días naturales y días hábiles; y ve cada resultado intermedio con anotación clara de cómo se aplicaron los ajustes de límite de mes y el manejo de años bisiestos.',
    steps: [
      {
        heading: 'Establece Tu Fecha de Inicio',
        body: 'Selecciona cualquier fecha usando el selector de calendario o escríbela en formato YYYY-MM-DD, MM/DD/YYYY o DD.MM.YYYY. La calculadora muestra la fecha de inicio en los tres formatos para mayor claridad y muestra el día de la semana. También puedes establecer "hoy" con un clic o elegir entre fechas recientes. Para programaciones recurrentes, un botón rápido de "mismo día del próximo mes" salta al día correspondiente del mes siguiente.',
      },
      {
        heading: 'Suma o Resta Unidades de Tiempo',
        body: 'Usa la interfaz de más/menos para sumar o restar cualquier combinación de días, semanas, meses y años. La calculadora aplica las unidades en un orden sensato (primero años, luego meses, luego semanas, luego días) para evitar casos límite en cascada. Puedes sumar diferentes unidades simultáneamente — por ejemplo, "+ 2 años, - 3 meses, + 15 días" — y el resultado se actualiza en tiempo real. La herramienta también admite resultados negativos, mostrándote la fecha anterior al punto de inicio.',
      },
      {
        heading: 'Revisa el Resultado y el Manejo de Casos Límite',
        body: 'La fecha resultante se muestra prominentemente con el día de la semana y el número total de días de diferencia. Debajo, una sección de "Casos Límite" anota si se aplicó algún ajuste: recorte de límite de mes (por ejemplo, 31 de enero + 1 mes se recortó al 28 de febrero), cruces de año bisiesto y saltos de días hábiles. Una línea de tiempo muestra el camino desde el inicio hasta el resultado, marcando cada límite de mes cruzado y cada día bisiesto encontrado en el camino.',
      },
    ],
    tips: [
      'Casos límite de cambio de mes: nuestra "preservación de fin de mes" predeterminada significa que 31 de enero + 1 mes = 28 de febrero (o 29 en año bisiesto), y 31 de marzo + 1 mes = 30 de abril. Esta convención coincide con cómo funcionan la mayoría de los sistemas de facturación, suscripción y contratos — preserva la propiedad de "último día del mes". La alternativa "rollover estricto" da 28 de febrero + 3 = 3 de marzo, lo cual es menos común pero preferido en algunos cálculos financieros.',
      'Los años bisiestos se manejan automáticamente. Sumar 365 días a una fecha que cruza un 29 de febrero en año bisiesto produce un resultado diferente que sumar 365 días cuando no se cruza ningún día bisiesto. Sumar exactamente 1 año al 29 de febrero de 2024 → 28 de febrero de 2025 (ya que 2025 no es bisiesto). Nuestra calculadora muestra la anotación de año bisiesto siempre que exista un día bisiesto dentro del intervalo.',
      'Días hábiles: solo de lunes a viernes. Sumar 5 días hábiles a un viernes → el viernes siguiente (Lun+Mar+Mié+Jue+Vie = 5 días, pero 7 días naturales). Sumar 1 día hábil al viernes → Lunes. La calculadora maneja esto al instante. Ingresa fechas festivas personalizadas para obtener conteos precisos para tu jurisdicción — una oficina en Dubái (semana laboral domingo-jueves) usa lógica de fin de semana diferente que la calculadora admite mediante ajustes regionales predefinidos.',
      'Para planificación de proyectos: suma días laborables a una fecha de inicio para encontrar una fecha límite. Una tarea de 20 días hábiles que comienza el lunes 5 de mayo de 2026 sin festivos termina el viernes 29 de mayo — pero agrega un solo festivo de lunes (25 de mayo, Día de los Caídos en EE. UU.) y el fin se desplaza al lunes 1 de junio. Estos desplazamientos de un solo día importan cuando los contratos vinculan penalizaciones y bonificaciones a fechas específicas.',
      'La estimación de fecha de parto usa la regla de Naegele: suma 280 días (40 semanas) al primer día del último período menstrual (LPM). La función de suma rápida de nuestra calculadora (fecha LPM + 40 semanas = fecha estimada de parto) calcula esto en un clic. La ventana real de parto es típicamente de 37-42 semanas desde LPM, y solo alrededor del 4% de los nacimientos ocurren en la fecha estimada exacta.',
      'Expiración de garantía: una garantía de 1 año que comienza el 31 de enero de 2025 expira el 31 de enero de 2026 (mismo día, año siguiente). Una garantía de 90 días que comienza el 1 de enero de 2025 expira el 1 de abril de 2025 (no el 31 de marzo — 90 días desde el 1 de enero = 31+28+31 = 90, llegando al 1 de abril). Siempre verifica si tu póliza de garantía cuenta en meses naturales o días exactos — la diferencia de un mes toma a muchos consumidores por sorpresa.',
      'Renovación de suscripciones: las suscripciones mensuales el día 31 de un mes son problemáticas — febrero no tiene día 31. La mayoría de los servicios manejan esto renovando el último día de cualquier mes sin la fecha original (así que una suscripción del 31 de enero se renueva el 28/29 de febrero, luego el 31 de marzo). Nuestra calculadora modela esta convención de "anclaje al último día del mes" específicamente para casos de uso de facturación de suscripciones.',
    ],
    faqs: [
      {
        q: '¿Cómo maneja la calculadora 31 de enero + 1 mes?',
        a: 'Nuestra convención predeterminada ("preservación de fin de mes") devuelve 28 de febrero (o 29 en años bisiestos) — el último día del mes objetivo. La calculadora anota que se aplicó un ajuste de límite. El método alternativo "rollover" devuelve 2 de marzo (28 de febrero + 2 días de desbordamiento) o 3 de marzo (28 de febrero + 3 días, si no es año bisiesto). Puedes cambiar entre convenciones en la configuración. La convención de preservación de fin de mes es usada por la mayoría de los sistemas de facturación, suscripción y contratos; el método rollover se usa a veces en cálculos de acumulación financiera.',
      },
      {
        q: '¿Qué sucede al sumar/restar años a un día bisiesto (29 de febrero)?',
        a: 'Al sumar o restar años enteros a/del 29 de febrero, la calculadora verifica si el año objetivo es bisiesto. Si lo es, el resultado es el 29 de febrero de ese año. Si no, el resultado es el 28 de febrero (preservación de fin de mes). Así que 29 de febrero de 2024 + 1 año = 28 de febrero de 2025; 29 de febrero de 2024 + 4 años = 29 de febrero de 2028. La herramienta siempre anota este ajuste para que sepas que se aplicó.',
      },
      {
        q: '¿Puedo calcular también la diferencia entre dos fechas?',
        a: 'La pestaña "Diferencia" cambia la calculadora para calcular el lapso entre dos fechas. Muestra: total de días, semanas + días, meses + días, años + meses + días y días hábiles (con exclusión de fines de semana/festivos). Esto es útil para determinar exactamente cuántos días faltan para una fecha límite, cuánto tiempo hace que ocurrió un evento o calcular períodos de preaviso legales en derecho laboral (que a menudo especifican números exactos de días hábiles).',
      },
      {
        q: '¿Cómo cuento días hábiles excluyendo tanto fines de semana como festivos?',
        a: 'Ingresa tu lista de festivos personalizada en el campo Festivos (fechas YYYY-MM-DD separadas por comas o un preajuste de país como "US-Federal" o "UK-Bank"). La calculadora luego cuenta los días de lunes a viernes, excluyendo todas las fechas listadas que caen dentro del rango. Para festivos anuales recurrentes (por ejemplo, 1 de enero, 25 de diciembre), ingresa la fecha una vez con la opción "recurrente anualmente" — la calculadora la aplica a cada año abarcado.',
      },
      {
        q: '¿Por qué algunos meses tienen diferente número de días?',
        a: 'El calendario gregoriano asigna 31 días a enero, marzo, mayo, julio, agosto, octubre, diciembre; 30 días a abril, junio, septiembre, noviembre; y 28 o 29 días a febrero (29 en años bisiestos). Esta irregularidad se hereda de las reformas del calendario romano bajo Julio César (45 a. C.) y el Papa Gregorio XIII (1582 d. C.), y es la causa raíz de la mayoría de los casos límite en aritmética de fechas.',
      },
      {
        q: '¿Es adecuada la calculadora de fechas para fechas legales y contractuales?',
        a: 'La calculadora proporciona aritmética de fechas matemáticamente precisa usando convenciones bien definidas, y anota cada ajuste aplicado. Es una herramienta útil de planificación y estimación. Sin embargo, para contratos legalmente vinculantes, siempre consulta el lenguaje específico del acuerdo — el derecho contractual puede definir "un mes desde el 31 de enero" de manera diferente a la convención predeterminada de la calculadora, y los plazos legales pueden tener reglas específicas de jurisdicción sobre cuándo los fines de semana y festivos desplazan los plazos. Usa la calculadora para planificar; verifica con asesoría legal para fechas vinculantes.',
      },
    ],
    conclusion:
      'La aritmética de fechas es una de esas cosas que parecen triviales hasta que encuentras un caso límite de cambio de mes y tu sistema de facturación cobra a los clientes en el día equivocado. Nuestra calculadora maneja cada año bisiesto, cada transición del 31 al 30 y cada salto de día hábil correctamente, con total transparencia sobre los ajustes. Planifica fechas de vencimiento, garantías y suscripciones con confianza.',
  },
};

export default content;
