// ESM script to translate tool step keys in es.json from English to Spanish
// Run with: node scripts/translate-es.mjs
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const esPath = resolve(__dirname, '..', 'messages', 'es.json');
const data = JSON.parse(readFileSync(esPath, 'utf-8'));

// Translation map: key -> Spanish value
const t = {
  // ── png-to-jpg ──
  "steps_png-to-jpg_1": "Sube tu archivo PNG",
  "steps_png-to-jpg_1Desc": "Selecciona tu imagen PNG haciendo clic en el área de carga o arrastrándola a la página. Tu archivo permanece en tu dispositivo durante todo el proceso.",
  "steps_png-to-jpg_2": "Ajusta la calidad",
  "steps_png-to-jpg_2Desc": "Establece la calidad de salida JPEG: los valores más altos conservan más detalle pero aumentan el tamaño del archivo. El valor predeterminado del 92 % ofrece un equilibrio excelente.",
  "steps_png-to-jpg_3": "Convierte y descarga",
  "steps_png-to-jpg_3Desc": "Haz clic en Convertir para transformar tu PNG en un JPEG. La imagen convertida se descarga automáticamente; tu PNG original permanece intacto.",

  // ── jpg-to-png ──
  "steps_jpg-to-png_1": "Sube tu archivo JPG",
  "steps_jpg-to-png_1Desc": "Selecciona tu imagen JPEG. La salida PNG admite transparencia y compresión sin pérdida, ideal para logotipos, capturas de pantalla y gráficos con texto.",
  "steps_jpg-to-png_2": "Revisa las opciones de conversión",
  "steps_jpg-to-png_2Desc": "PNG utiliza compresión sin pérdida, por lo que no es necesario ajustar la calidad. Tu imagen conservará todos los detalles visuales del JPEG original, con un tamaño de archivo mayor.",
  "steps_jpg-to-png_3": "Convierte y descarga",
  "steps_jpg-to-png_3Desc": "Haz clic en Convertir para transformar tu JPG en un PNG. El resultado se descarga de inmediato; tu archivo original nunca se modifica.",

  // ── video-to-gif ──
  "steps_video-to-gif_1": "Sube tu video",
  "steps_video-to-gif_1Desc": "Selecciona un archivo de video (MP4, WebM o MOV) para convertir. El video se carga en tu navegador para crear un GIF con precisión de fotogramas. Tamaño máximo de archivo: 50 MB.",
  "steps_video-to-gif_2": "Configura los parámetros del GIF",
  "steps_video-to-gif_2Desc": "Elige el tiempo de inicio, la duración, la velocidad de fotogramas y las dimensiones de salida. Menos fotogramas por segundo y dimensiones más pequeñas producen archivos GIF más ligeros.",
  "steps_video-to-gif_3": "Convierte y descarga",
  "steps_video-to-gif_3Desc": "Haz clic en Convertir para renderizar tu clip de video como un GIF animado. El GIF resultante está optimizado para compartir en redes sociales, aplicaciones de mensajería y foros.",

  // ── mp4-to-gif ──
  "steps_mp4-to-gif_1": "Sube tu video MP4",
  "steps_mp4-to-gif_1Desc": "Selecciona un archivo MP4 para convertirlo en un GIF animado. El video permanece en tu dispositivo; todo el procesamiento ocurre localmente en tu navegador.",
  "steps_mp4-to-gif_2": "Configura los ajustes del GIF",
  "steps_mp4-to-gif_2Desc": "Define la duración del clip, la velocidad de fotogramas y el tamaño de salida. Menos fotogramas por segundo y dimensiones más pequeñas generan archivos GIF mucho más ligeros.",
  "steps_mp4-to-gif_3": "Crea y descarga el GIF",
  "steps_mp4-to-gif_3Desc": "Haz clic en Convertir para generar tu GIF animado. Perfecto para crear GIFs de reacción, clips tutoriales o contenido para redes sociales a partir de tus videos.",

  // ── webp-to-jpg ──
  "steps_webp-to-jpg_1": "Sube tu archivo WebP",
  "steps_webp-to-jpg_1Desc": "Selecciona una imagen WebP para convertir. La salida JPEG garantiza la máxima compatibilidad con software antiguo, plataformas de redes sociales y dispositivos que no admiten WebP.",
  "steps_webp-to-jpg_2": "Establece la calidad JPEG",
  "steps_webp-to-jpg_2Desc": "Ajusta el nivel de calidad JPEG de salida. La configuración predeterminada optimiza el equilibrio entre calidad visual y tamaño de archivo. Los valores más bajos producen archivos más pequeños.",
  "steps_webp-to-jpg_3": "Convierte y descarga",
  "steps_webp-to-jpg_3Desc": "Haz clic en Convertir para transformar WebP a JPEG. El formato JPEG universal garantiza que tu imagen se abra en todas partes; tu WebP original permanece a salvo.",

  // ── jpg-to-webp ──
  "steps_jpg-to-webp_1": "Sube tu imagen JPG",
  "steps_jpg-to-webp_1Desc": "Selecciona un JPEG para convertir a WebP. WebP suele reducir el tamaño del archivo entre un 30 % y un 50 % en comparación con JPEG, manteniendo una calidad visual similar.",
  "steps_jpg-to-webp_2": "Establece la calidad WebP",
  "steps_jpg-to-webp_2Desc": "Ajusta el control deslizante de calidad: WebP logra excelentes resultados con ajustes de calidad más bajos en comparación con JPEG. El 80 % predeterminado suele verse muy bien.",
  "steps_jpg-to-webp_3": "Convierte y descarga",
  "steps_jpg-to-webp_3Desc": "Haz clic en Convertir para producir un archivo WebP optimizado para el rendimiento web. Los tamaños de archivo más pequeños significan cargas de página más rápidas, conservando la calidad de imagen.",

  // ── webp-to-png ──
  "steps_webp-to-png_1": "Sube tu archivo WebP",
  "steps_webp-to-png_1Desc": "Selecciona una imagen WebP. Convertir a PNG te da calidad sin pérdida y soporte de transparencia, ideal para gráficos, logotipos y flujos de trabajo de edición.",
  "steps_webp-to-png_2": "Sin pérdida de calidad",
  "steps_webp-to-png_2Desc": "PNG utiliza compresión matemáticamente sin pérdida. Cada píxel de tu WebP se conserva exactamente; la contrapartida es un tamaño de archivo mayor que WebP.",
  "steps_webp-to-png_3": "Convierte y descarga",
  "steps_webp-to-png_3Desc": "Haz clic en Convertir para obtener un PNG sin pérdida. Perfecto cuando necesitas la versión de mayor fidelidad de tu imagen para editarla posteriormente.",

  // ── png-to-webp ──
  "steps_png-to-webp_1": "Sube tu archivo PNG",
  "steps_png-to-webp_1Desc": "Selecciona una imagen PNG. Convertir a WebP reduce drásticamente el tamaño del archivo (a menudo entre un 50 % y un 70 % menos que PNG) manteniendo una excelente calidad visual.",
  "steps_png-to-webp_2": "Configura las opciones de WebP",
  "steps_png-to-webp_2Desc": "Ajusta la configuración de calidad. WebP conserva automáticamente la transparencia de los archivos PNG, lo que lo convierte en el mejor reemplazo moderno para PNG en la web.",
  "steps_png-to-webp_3": "Convierte y descarga",
  "steps_png-to-webp_3Desc": "Haz clic en Convertir para producir un archivo WebP compacto. Ideal para sitios web donde la carga rápida es importante y los tamaños de archivo PNG son demasiado grandes.",

  // ── heic-to-jpg ──
  "steps_heic-to-jpg_1": "Sube tu foto HEIC",
  "steps_heic-to-jpg_1Desc": "Selecciona imágenes HEIC de tu iPhone o iPad. HEIC es el formato de foto predeterminado de Apple; convertir a JPEG garantiza la compatibilidad con todos los dispositivos y plataformas.",
  "steps_heic-to-jpg_2": "Establece la calidad de salida",
  "steps_heic-to-jpg_2Desc": "Ajusta el nivel de calidad JPEG. Los ajustes más altos conservan más detalles de la foto HEIC original. La configuración predeterminada funciona bien para la mayoría de las fotos.",
  "steps_heic-to-jpg_3": "Convierte y descarga",
  "steps_heic-to-jpg_3Desc": "Haz clic en Convertir para transformar HEIC en archivos JPEG universalmente compatibles. Comparte, sube o edita tus fotos en cualquier lugar, sin necesidad de un dispositivo Apple.",

  // ── heic-to-png ──
  "steps_heic-to-png_1": "Sube tu foto HEIC",
  "steps_heic-to-png_1Desc": "Selecciona imágenes HEIC de dispositivos Apple. La conversión a PNG te ofrece calidad sin pérdida para edición, impresión o fines de archivo.",
  "steps_heic-to-png_2": "Conversión sin pérdida",
  "steps_heic-to-png_2Desc": "El formato PNG conserva cada detalle a resolución completa. Espera tamaños de archivo mayores que HEIC o JPEG; esta es la contrapartida por una calidad perfecta.",
  "steps_heic-to-png_3": "Convierte y descarga",
  "steps_heic-to-png_3Desc": "Haz clic en Convertir para obtener una versión PNG sin pérdida de tu foto. Ideal para flujos de trabajo de edición profesional donde la calidad es lo más importante.",

  // ── avif-to-jpg ──
  "steps_avif-to-jpg_1": "Sube tu imagen AVIF",
  "steps_avif-to-jpg_1Desc": "Selecciona un archivo AVIF. AVIF es un formato de nueva generación con excelente compresión, pero JPEG garantiza la compatibilidad con todo el software y las plataformas.",
  "steps_avif-to-jpg_2": "Establece la calidad de conversión",
  "steps_avif-to-jpg_2Desc": "Ajusta la calidad JPEG de salida. El conversor conserva la precisión del color mientras produce un archivo JPEG universalmente legible.",
  "steps_avif-to-jpg_3": "Convierte y descarga",
  "steps_avif-to-jpg_3Desc": "Haz clic en Convertir para transformar AVIF en JPEG. Tu imagen se abrirá en cualquier lugar: desde software antiguo hasta plataformas de redes sociales.",

  // ── avif-to-png ──
  "steps_avif-to-png_1": "Sube tu archivo AVIF",
  "steps_avif-to-png_1Desc": "Selecciona una imagen AVIF. Convertir a PNG proporciona calidad sin pérdida para edición, impresión o situaciones donde se requiere la máxima fidelidad.",
  "steps_avif-to-png_2": "Salida sin pérdida",
  "steps_avif-to-png_2Desc": "PNG conserva cada píxel sin artefactos de compresión. El resultado es una imagen de calidad perfecta: mayor en tamaño de archivo pero visualmente idéntica.",
  "steps_avif-to-png_3": "Convierte y descarga",
  "steps_avif-to-png_3Desc": "Haz clic en Convertir para obtener una versión PNG sin pérdida. Ideal para diseño gráfico, impresión o cualquier flujo de trabajo que exija una salida perfecta al píxel.",

  // ── svg-to-png ──
  "steps_svg-to-png_1": "Sube tu archivo SVG",
  "steps_svg-to-png_1Desc": "Selecciona un gráfico vectorial SVG. La conversión a PNG rasteriza los trazados vectoriales en una imagen de píxeles a la resolución que elijas.",
  "steps_svg-to-png_2": "Establece las dimensiones de salida",
  "steps_svg-to-png_2Desc": "Elige el ancho y alto para la salida PNG. Dimensiones más grandes dan más detalle pero producen archivos más grandes. La relación de aspecto se conserva del SVG.",
  "steps_svg-to-png_3": "Rasteriza y descarga",
  "steps_svg-to-png_3Desc": "Haz clic en Convertir para renderizar tu SVG como un PNG al tamaño especificado. Perfecto para compartir iconos, logotipos e ilustraciones como archivos de imagen estándar.",

  // ── svg-to-jpg ──
  "steps_svg-to-jpg_1": "Sube tu gráfico SVG",
  "steps_svg-to-jpg_1Desc": "Selecciona un archivo SVG. La conversión a JPEG rasteriza la ilustración vectorial para compartirla en plataformas que no aceptan cargas SVG.",
  "steps_svg-to-jpg_2": "Establece tamaño y calidad",
  "steps_svg-to-jpg_2Desc": "Elige las dimensiones de salida y la calidad JPEG. Ten en cuenta que JPEG no admite transparencia: las áreas transparentes se vuelven blancas.",
  "steps_svg-to-jpg_3": "Rasteriza y descarga",
  "steps_svg-to-jpg_3Desc": "Haz clic en Convertir para obtener una versión JPEG de tu gráfico vectorial. Ideal para subir ilustraciones a redes sociales o incrustarlas en documentos.",

  // ── compress-image ──
  "steps_compress-image_1": "Sube tu(s) imagen(es)",
  "steps_compress-image_1Desc": "Selecciona una o más imágenes para comprimir. Formatos admitidos: JPEG, PNG, WebP, AVIF y HEIC. Todo el procesamiento permanece en tu dispositivo.",
  "steps_compress-image_2": "Establece el nivel de compresión",
  "steps_compress-image_2Desc": "Ajusta el porcentaje de calidad: números más bajos significan archivos más pequeños pero mayor compresión visible. Encuentra el punto ideal entre tamaño y calidad para tu caso de uso.",
  "steps_compress-image_3": "Comprime y descarga",
  "steps_compress-image_3Desc": "Haz clic en Comprimir para reducir el tamaño de los archivos. Compara los tamaños original y comprimido que se muestran después del procesamiento. Descarga individualmente o en lote.",

  // ── remove-bg ──
  "steps_remove-bg_1": "Sube tu archivo",
  "steps_remove-bg_1Desc": "Selecciona tu archivo haciendo clic en el área de carga o arrastrándolo a la página. Los archivos se procesan localmente en tu navegador; nunca salen de tu dispositivo.",
  "steps_remove-bg_2": "Ajusta la configuración",
  "steps_remove-bg_2Desc": "Ajusta la calidad, dimensiones u otras opciones según tus necesidades. Todos los ajustes se aplican instantáneamente durante el procesamiento.",
  "steps_remove-bg_3": "Descarga el resultado",
  "steps_remove-bg_3Desc": "Haz clic en el botón de acción para procesar tu archivo. Tu resultado estará listo en segundos y se descargará automáticamente.",

  // ── resize-image ──
  "steps_resize-image_1": "Sube tu imagen",
  "steps_resize-image_1Desc": "Selecciona una imagen para redimensionar. Formatos admitidos: JPEG, PNG, WebP, AVIF y HEIC. Tu original permanece intacto en tu dispositivo.",
  "steps_resize-image_2": "Establece las dimensiones objetivo",
  "steps_resize-image_2Desc": "Ingresa el ancho y alto deseados en píxeles. Activa el bloqueo de relación de aspecto para mantener las proporciones o desactívalo para dimensiones personalizadas. Elige un tamaño predefinido para usos comunes.",
  "steps_resize-image_3": "Redimensiona y descarga",
  "steps_resize-image_3Desc": "Haz clic en Redimensionar para generar la imagen reducida (o ampliada). Descarga el resultado, perfecto para optimización web, redes sociales o archivos adjuntos de correo electrónico.",

  // ── crop-image ──
  "steps_crop-image_1": "Sube tu imagen",
  "steps_crop-image_1Desc": "Selecciona una imagen para recortar. La imagen completa se carga en el área de recorte donde puedes seleccionar visualmente la región a conservar.",
  "steps_crop-image_2": "Ajusta la región de recorte",
  "steps_crop-image_2Desc": "Arrastra los controles de recorte para seleccionar el área deseada. Elige una relación de aspecto predefinida (1:1, 4:3, 16:9) o ajústala libremente. La vista previa se actualiza en tiempo real.",
  "steps_crop-image_3": "Aplica el recorte y descarga",
  "steps_crop-image_3Desc": "Haz clic en Recortar para aplicar la selección. La imagen recortada se descarga inmediatamente; tu original permanece intacto para futuras ediciones.",

  // ── rotate-image ──
  "steps_rotate-image_1": "Sube tu imagen",
  "steps_rotate-image_1Desc": "Selecciona una imagen para rotar o voltear. La vista previa muestra la orientación actual de tu imagen. Todas las transformaciones son no destructivas para tu archivo original.",
  "steps_rotate-image_2": "Elige rotación o volteo",
  "steps_rotate-image_2Desc": "Haz clic para rotar 90°, 180° o 270°. Usa volteo horizontal o vertical para efectos espejo. La vista previa se actualiza con cada clic para que veas el resultado de inmediato.",
  "steps_rotate-image_3": "Aplica y descarga",
  "steps_rotate-image_3Desc": "Haz clic en el botón de rotación para finalizar. Descarga la imagen correctamente orientada: no más fotos de lado en tu galería o presentaciones.",

  // ── image-filter ──
  "steps_image-filter_1": "Sube tu imagen",
  "steps_image-filter_1Desc": "Selecciona una foto o imagen para aplicar filtros. La vista previa se carga de inmediato para que veas los cambios en tiempo real mientras ajustas cada configuración.",
  "steps_image-filter_2": "Ajusta los filtros",
  "steps_image-filter_2Desc": "Modifica brillo, contraste, saturación, tono, desenfoque y efectos especiales (escala de grises, sepia, invertir, nitidez). Cada ajuste se muestra instantáneamente en la vista previa.",
  "steps_image-filter_3": "Aplica filtros y descarga",
  "steps_image-filter_3Desc": "¿Estás satisfecho con el resultado? Haz clic en Aplicar para renderizar la imagen final con todos los filtros. Descarga tu foto editada; la original permanece intacta.",

  // ── image-to-pdf ──
  "steps_image-to-pdf_1": "Sube tus imágenes",
  "steps_image-to-pdf_1Desc": "Selecciona una o más imágenes para combinarlas en un PDF. Formatos admitidos: JPEG, PNG, WebP. Arrastra para reordenar las imágenes en la secuencia en que deben aparecer.",
  "steps_image-to-pdf_2": "Organiza y configura",
  "steps_image-to-pdf_2Desc": "Establece el tamaño de página (A4, Carta o personalizado), el modo de ajuste de imagen y los márgenes. Previsualiza las miniaturas para verificar el orden y la apariencia de las páginas.",
  "steps_image-to-pdf_3": "Genera y descarga el PDF",
  "steps_image-to-pdf_3Desc": "Haz clic en Generar para crear un documento PDF a partir de tus imágenes. Cada imagen se convierte en una página separada. Descarga el PDF completo de inmediato.",

  // ── merge-pdf ──
  "steps_merge-pdf_1": "Sube tus archivos PDF",
  "steps_merge-pdf_1Desc": "Selecciona dos o más archivos PDF para combinar. Arrástralos para reordenarlos en la lista: el primer archivo se convierte en la página 1 del documento fusionado.",
  "steps_merge-pdf_2": "Organiza el orden de las páginas",
  "steps_merge-pdf_2Desc": "Arrastra y suelta los archivos para establecer el orden de fusión. Elimina cualquier archivo que no quieras incluir. Revisa el número de archivos y el total de páginas antes de fusionar.",
  "steps_merge-pdf_3": "Fusiona y descarga",
  "steps_merge-pdf_3Desc": "Haz clic en Fusionar para combinar todos los PDF en un solo documento. El PDF fusionado se descarga automáticamente con las páginas en el orden especificado.",

  // ── split-pdf ──
  "steps_split-pdf_1": "Sube tu PDF",
  "steps_split-pdf_1Desc": "Selecciona el PDF que deseas dividir. El archivo se carga en tu navegador y se muestra el número total de páginas. Ninguna página se sube a ningún servidor.",
  "steps_split-pdf_2": "Elige el método de división",
  "steps_split-pdf_2Desc": "Selecciona cómo dividir: extraer páginas específicas, dividir cada N páginas o dividir por rangos de páginas. Ingresa números de página o rangos separados por comas.",
  "steps_split-pdf_3": "Divide y descarga",
  "steps_split-pdf_3Desc": "Haz clic en Dividir para separar tu PDF. Cada archivo resultante se descarga individualmente o como un ZIP que contiene todos los documentos divididos.",

  // ── pdf-compress ──
  "steps_pdf-compress_1": "Sube tu PDF",
  "steps_pdf-compress_1Desc": "Selecciona un archivo PDF para comprimir. Los PDF grandes con imágenes incrustadas se benefician más de la compresión. Tu archivo nunca sale de tu dispositivo.",
  "steps_pdf-compress_2": "Elige el nivel de compresión",
  "steps_pdf-compress_2Desc": "Selecciona la fuerza de compresión. Una compresión más alta crea archivos más pequeños pero puede reducir la calidad de imagen. Previsualiza la reducción de tamaño estimada antes de confirmar.",
  "steps_pdf-compress_3": "Comprime y descarga",
  "steps_pdf-compress_3Desc": "Haz clic en Comprimir para reducir el tamaño de tu archivo PDF. Compara los tamaños original y comprimido. Ideal para enviar documentos por correo electrónico que exceden los límites de archivos adjuntos.",

  // ── pdf-encrypt ──
  "steps_pdf-encrypt_1": "Sube tu PDF",
  "steps_pdf-encrypt_1Desc": "Selecciona el PDF que deseas proteger con contraseña. Tu documento permanece completamente en tu dispositivo; ningún dato del archivo se envía a través de la red.",
  "steps_pdf-encrypt_2": "Establece tu contraseña",
  "steps_pdf-encrypt_2Desc": "Ingresa una contraseña segura y confírmala. Elige si también deseas restringir la impresión, copia o edición. Usa una contraseña que puedas recordar; no hay recuperación.",
  "steps_pdf-encrypt_3": "Cifra y descarga",
  "steps_pdf-encrypt_3Desc": "Haz clic en Cifrar para aplicar la protección con contraseña. El PDF cifrado se descarga inmediatamente. Comparte la contraseña de forma segura solo con los destinatarios previstos.",

  // ── pdf-decrypt ──
  "steps_pdf-decrypt_1": "Sube tu PDF cifrado",
  "steps_pdf-decrypt_1Desc": "Selecciona un PDF protegido con contraseña. Debes conocer la contraseña para desbloquearlo; no hay forma de eludir el cifrado sin la contraseña correcta.",
  "steps_pdf-decrypt_2": "Ingresa la contraseña",
  "steps_pdf-decrypt_2Desc": "Escribe la contraseña del documento. La herramienta intenta descifrar usando esta contraseña. Si es correcta, el PDF se desbloquea instantáneamente en tu navegador.",
  "steps_pdf-decrypt_3": "Descarga el PDF desbloqueado",
  "steps_pdf-decrypt_3Desc": "Una vez descifrado, descarga el PDF desbloqueado. El archivo ahora es libremente accesible sin contraseña; guárdalo de forma segura si contiene información confidencial.",

  // ── pdf-watermark ──
  "steps_pdf-watermark_1": "Sube tu PDF",
  "steps_pdf-watermark_1Desc": "Selecciona el PDF para añadir marca de agua. Tu documento se procesa completamente en tu navegador; ninguna página se envía a ningún servidor externo.",
  "steps_pdf-watermark_2": "Configura la marca de agua",
  "steps_pdf-watermark_2Desc": "Ingresa el texto de la marca de agua, elige tamaño de fuente, opacidad, ángulo de rotación y posición en la página. Previsualiza la apariencia de la marca de agua antes de aplicar.",
  "steps_pdf-watermark_3": "Aplica y descarga",
  "steps_pdf-watermark_3Desc": "Haz clic en Aplicar para estampar la marca de agua en cada página. Descarga el PDF con marca de agua; perfecto para protección de derechos de autor, marca o etiquetado de borradores.",

  // ── pdf-to-txt ──
  "steps_pdf-to-txt_1": "Sube tu PDF",
  "steps_pdf-to-txt_1Desc": "Selecciona un PDF para extraer texto. Funciona mejor con PDF basados en texto (no imágenes escaneadas). La extracción se ejecuta completamente en tu navegador.",
  "steps_pdf-to-txt_2": "Extrae el contenido de texto",
  "steps_pdf-to-txt_2Desc": "Haz clic en Extraer para obtener todo el contenido de texto del PDF. El texto extraído conserva la estructura de párrafos cuando es posible. Los resultados aparecen en el área de texto.",
  "steps_pdf-to-txt_3": "Copia o descarga el texto",
  "steps_pdf-to-txt_3Desc": "Revisa el texto extraído, haz las correcciones necesarias y luego cópialo al portapapeles o descárgalo como archivo .txt. Perfecto para reutilizar contenido de PDF.",

  // ── pdf-to-csv ──
  "steps_pdf-to-csv_1": "Sube tu PDF",
  "steps_pdf-to-csv_1Desc": "Selecciona un PDF que contenga tablas o datos estructurados. Los mejores resultados se obtienen de PDF con tablas claramente formateadas en lugar de diseños libres.",
  "steps_pdf-to-csv_2": "Extrae los datos de la tabla",
  "steps_pdf-to-csv_2Desc": "Haz clic en Extraer para detectar y extraer estructuras de tabla de tu PDF. La herramienta intenta identificar filas y columnas a partir del diseño del documento.",
  "steps_pdf-to-csv_3": "Descarga como CSV",
  "steps_pdf-to-csv_3Desc": "Revisa los datos extraídos en la tabla de vista previa y luego descárgalos como un archivo CSV listo para Excel, Google Sheets o importación en bases de datos.",

  // ── pdf-to-word ──
  "steps_pdf-to-word_1": "Sube tu PDF",
  "steps_pdf-to-word_1Desc": "Selecciona el PDF para convertir a formato Word. El conversor conserva el texto, formato, imágenes y diseño lo más fielmente posible al original.",
  "steps_pdf-to-word_2": "Convierte a DOCX",
  "steps_pdf-to-word_2Desc": "Haz clic en Convertir para transformar tu PDF en un documento Word editable. La conversión se ejecuta localmente; el contenido de tu documento nunca sale de tu navegador.",
  "steps_pdf-to-word_3": "Descarga el documento Word",
  "steps_pdf-to-word_3Desc": "Descarga el archivo .docx y ábrelo en Microsoft Word, Google Docs o LibreOffice. Edita, formatea y colabora libremente con el documento convertido.",

  // ── word-to-pdf ──
  "steps_word-to-pdf_1": "Sube tu documento Word",
  "steps_word-to-pdf_1Desc": "Selecciona un archivo .docx para convertir. El conversor renderiza tu documento Word a PDF conservando texto, imágenes y formato.",
  "steps_word-to-pdf_2": "Convierte a PDF",
  "steps_word-to-pdf_2Desc": "Haz clic en Convertir para generar un PDF a partir de tu documento Word. El PDF se verá idéntico a como aparece el documento en Word. El procesamiento es local y privado.",
  "steps_word-to-pdf_3": "Descarga el PDF",
  "steps_word-to-pdf_3Desc": "Descarga el PDF generado. Perfecto para compartir documentos finalizados, enviar tareas o crear archivos listos para imprimir a partir de tus documentos Word.",

  // ── json-formatter ──
  "steps_json-formatter_1": "Pega tus datos JSON",
  "steps_json-formatter_1Desc": "Pega JSON minimizado o desordenado en el área de entrada. El formateador acepta cualquier JSON válido: arreglos, objetos, estructuras profundamente anidadas. Tus datos permanecen en tu navegador.",
  "steps_json-formatter_2": "Formatea o valida",
  "steps_json-formatter_2Desc": "Haz clic en Formatear para imprimir con sangría, o en Validar para comprobar errores de sintaxis. Los mensajes de error señalan la línea y el carácter exactos de cualquier problema.",
  "steps_json-formatter_3": "Copia la salida formateada",
  "steps_json-formatter_3Desc": "Haz clic en Copiar para llevar el JSON formateado a tu portapapeles. Listo para pegar en tu editor de código, cliente API o documentación con la sangría adecuada.",

  // ── base64 ──
  "steps_base64_1": "Ingresa texto o sube un archivo",
  "steps_base64_1Desc": "Escribe o pega texto para codificar, o pega una cadena Base64 para decodificar. También puedes subir un archivo para codificar su contenido. Todo el procesamiento es local.",
  "steps_base64_2": "Codifica o decodifica",
  "steps_base64_2Desc": "Haz clic en Codificar para convertir texto/archivo a Base64, o en Decodificar para convertir Base64 de vuelta a su forma original. Alterna entre modos según necesites.",
  "steps_base64_3": "Copia el resultado",
  "steps_base64_3Desc": "Haz clic en Copiar para obtener la salida codificada/decodificada. Úsala en tu código, solicitudes API, URIs de datos o donde sea que se requiera codificación Base64.",

  // ── uuid-generator ──
  "steps_uuid-generator_1": "Configura las opciones de UUID",
  "steps_uuid-generator_1Desc": "Selecciona la versión de UUID (v1 basada en tiempo o v4 aleatoria). Elige el formato de salida: UUID único, múltiples UUIDs, mayúsculas o con/sin guiones.",
  "steps_uuid-generator_2": "Genera UUID(s)",
  "steps_uuid-generator_2Desc": "Haz clic en Generar para crear UUIDs criptográficamente aleatorios. Cada UUID es globalmente único; la probabilidad de colisión es astronómicamente baja.",
  "steps_uuid-generator_3": "Copia y usa",
  "steps_uuid-generator_3Desc": "Haz clic en Copiar para obtener los UUID generados. Perfecto para claves primarias de bases de datos, IDs de solicitudes API, tokens de sesión o cualquier necesidad de identificador único.",

  // ── timestamp-converter ──
  "steps_timestamp-converter_1": "Ingresa una marca de tiempo o fecha",
  "steps_timestamp-converter_1Desc": "Pega una marca de tiempo Unix (segundos o milisegundos) o escribe una fecha legible. El conversor detecta automáticamente el formato de entrada.",
  "steps_timestamp-converter_2": "Visualiza todos los formatos",
  "steps_timestamp-converter_2Desc": "Los resultados se muestran en múltiples formatos: segundos Unix, milisegundos, ISO 8601, RFC 2822 y cadenas de hora local. Todas las conversiones de zona horaria se manejan automáticamente.",
  "steps_timestamp-converter_3": "Copia cualquier formato",
  "steps_timestamp-converter_3Desc": "Haz clic en cualquier formato de salida para copiarlo a tu portapapeles. Ideal para depurar marcas de tiempo de API, configurar tareas cron o convertir entre representaciones de fecha.",

  // ── json-validator ──
  "steps_json-validator_1": "Pega tu JSON",
  "steps_json-validator_1Desc": "Pega el JSON que deseas validar. El validador acepta cualquier estructura JSON: desde pares clave-valor simples hasta respuestas de API profundamente anidadas.",
  "steps_json-validator_2": "Valida la sintaxis",
  "steps_json-validator_2Desc": "Haz clic en Validar para comprobar tu JSON. Los errores se resaltan con la línea exacta, columna y una descripción de lo que salió mal. Corrige los problemas y vuelve a validar.",
  "steps_json-validator_3": "Copia el JSON válido",
  "steps_json-validator_3Desc": "Una vez válido, copia el JSON formateado o descárgalo. Usa los datos validados con confianza en tu aplicación sabiendo que tienen la sintaxis correcta.",

  // ── regex-tester ──
  "steps_regex-tester_1": "Ingresa tu patrón de expresión regular",
  "steps_regex-tester_1Desc": "Escribe un patrón de expresión regular y opcionalmente establece banderas (g, i, m, s, u). Usa la referencia rápida si necesitas ayuda con la sintaxis regex.",
  "steps_regex-tester_2": "Pruébalo contra tu texto",
  "steps_regex-tester_2Desc": "Pega o escribe el texto contra el cual probar. Las coincidencias se resaltan en tiempo real mientras escribes. Los grupos de captura se muestran individualmente para cada coincidencia.",
  "steps_regex-tester_3": "Copia el patrón o las coincidencias",
  "steps_regex-tester_3Desc": "Copia tu patrón regex finalizado o los resultados coincidentes. Ideal para depurar regex antes de agregarlo a tu código de producción.",

  // ── text-case ──
  "steps_text-case_1": "Ingresa tu texto",
  "steps_text-case_1Desc": "Escribe o pega el texto que deseas transformar. Se admite cualquier longitud: desde una sola palabra hasta un documento completo. El procesamiento es instantáneo y local.",
  "steps_text-case_2": "Elige el estilo de mayúsculas/minúsculas",
  "steps_text-case_2Desc": "Selecciona entre minúsculas, MAYÚSCULAS, Formato Título, camelCase, PascalCase, snake_case, kebab-case o CONSTANT_CASE. El resultado se previsualiza de inmediato.",
  "steps_text-case_3": "Copia el texto transformado",
  "steps_text-case_3Desc": "Haz clic en Copiar para obtener el texto convertido. Perfecto para renombrar variables, normalizar entrada de usuario o formatear texto para diferentes convenciones de programación.",

  // ── lorem-ipsum ──
  "steps_lorem-ipsum_1": "Establece los parámetros de generación",
  "steps_lorem-ipsum_1Desc": "Elige el número de párrafos, oraciones por párrafo y si comenzar con la clásica apertura \"Lorem ipsum dolor sit amet...\".",
  "steps_lorem-ipsum_2": "Genera texto de relleno",
  "steps_lorem-ipsum_2Desc": "Haz clic en Generar para crear texto Lorem Ipsum. El generador produce pseudolatín legible que imita el ritmo visual del lenguaje natural.",
  "steps_lorem-ipsum_3": "Copia y pega",
  "steps_lorem-ipsum_3Desc": "Haz clic en Copiar para obtener el texto generado. Úsalo como contenido de relleno en tus diseños, maquetas, wireframes o vistas previas de desarrollo.",

  // ── hash-generator ──
  "steps_hash-generator_1": "Ingresa tu texto",
  "steps_hash-generator_1Desc": "Escribe o pega la cadena que deseas hashear. Para sumas de verificación de archivos, sube un archivo en su lugar. Todo el hasheo se realiza localmente en tu navegador.",
  "steps_hash-generator_2": "Selecciona el algoritmo de hash",
  "steps_hash-generator_2Desc": "Elige entre MD5, SHA-1, SHA-256, SHA-384 o SHA-512. Se recomienda SHA-256 para la mayoría de las aplicaciones sensibles a la seguridad. Los resultados aparecen instantáneamente.",
  "steps_hash-generator_3": "Copia el valor hash",
  "steps_hash-generator_3Desc": "Haz clic en Copiar para obtener el hash generado. Úsalo para verificación de integridad de archivos, almacenamiento de contraseñas (con sal) o comprobaciones de deduplicación de datos.",

  // ── qr-reader ──
  "steps_qr-reader_1": "Sube una imagen de código QR",
  "steps_qr-reader_1Desc": "Selecciona una imagen que contenga un código QR. Formatos admitidos: JPEG, PNG, WebP. También puedes usar tu cámara para escanear un código QR directamente con tu dispositivo.",
  "steps_qr-reader_2": "Escanea el código QR",
  "steps_qr-reader_2Desc": "Haz clic en Escanear para decodificar el código QR. La herramienta extrae los datos incrustados: URLs, texto, información de contacto, credenciales Wi-Fi o cualquier contenido codificado.",
  "steps_qr-reader_3": "Copia o abre el resultado",
  "steps_qr-reader_3Desc": "Copia el texto decodificado o, si es una URL, haz clic para abrirla directamente. Verifica los códigos QR antes de escanear los desconocidos por seguridad.",

  // ── csv-formatter ──
  "steps_csv-formatter_1": "Pega tus datos CSV",
  "steps_csv-formatter_1Desc": "Pega texto CSV sin formato o sube un archivo .csv. El formateador detecta automáticamente los delimitadores (coma, tabulación, punto y coma) y maneja campos entre comillas.",
  "steps_csv-formatter_2": "Formatea y valida",
  "steps_csv-formatter_2Desc": "Haz clic en Formatear para alinear columnas y validar la estructura CSV. Las filas con error se marcan si tienen recuentos de columnas no coincidentes o comillas mal formadas.",
  "steps_csv-formatter_3": "Copia o descarga",
  "steps_csv-formatter_3Desc": "Copia el CSV formateado o descárgalo como un archivo .csv limpio. Listo para importar en Excel, Google Sheets, bases de datos o herramientas de análisis de datos.",

  // ── xml-formatter ──
  "steps_xml-formatter_1": "Pega tu XML",
  "steps_xml-formatter_1Desc": "Pega XML minimizado o desordenado en el área de entrada. El formateador maneja elementos anidados, atributos, secciones CDATA e instrucciones de procesamiento.",
  "steps_xml-formatter_2": "Formatea y valida",
  "steps_xml-formatter_2Desc": "Haz clic en Formatear para imprimir con sangría adecuada. La validación detecta etiquetas no coincidentes, elementos no cerrados y errores estructurales con mensajes claros.",
  "steps_xml-formatter_3": "Copia el XML formateado",
  "steps_xml-formatter_3Desc": "Haz clic en Copiar para obtener el XML limpio e indentado. Perfecto para revisar archivos de configuración, respuestas SOAP o cualquier formato de datos basado en XML.",

  // ── yaml-formatter ──
  "steps_yaml-formatter_1": "Pega tu YAML",
  "steps_yaml-formatter_1Desc": "Pega contenido YAML en el área de entrada. El formateador maneja mapeos anidados, secuencias, anclas, alias y cadenas multilínea.",
  "steps_yaml-formatter_2": "Formatea y valida",
  "steps_yaml-formatter_2Desc": "Haz clic en Formatear para normalizar la sangría y el espaciado. La validación detecta errores de sintaxis como sangría incorrecta, caracteres no válidos o claves duplicadas.",
  "steps_yaml-formatter_3": "Copia el YAML formateado",
  "steps_yaml-formatter_3Desc": "Haz clic en Copiar para obtener la salida YAML limpia. Ideal para revisar manifiestos de Kubernetes, configuraciones de CI/CD, archivos Docker Compose o cualquier configuración basada en YAML.",

  // ── markdown-formatter ──
  "steps_markdown-formatter_1": "Escribe o pega Markdown",
  "steps_markdown-formatter_1Desc": "Escribe Markdown en el editor o pega contenido existente. El panel de vista previa en vivo muestra cómo se verá el resultado formateado mientras escribes.",
  "steps_markdown-formatter_2": "Previsualiza y formatea",
  "steps_markdown-formatter_2Desc": "Alterna entre los modos de edición y vista previa. El formateador admite encabezados, negrita, cursiva, bloques de código, tablas, enlaces, imágenes y listas de tareas.",
  "steps_markdown-formatter_3": "Copia o exporta",
  "steps_markdown-formatter_3Desc": "Copia el HTML renderizado o el Markdown sin formato. Úsalo para archivos README, documentación, publicaciones de blog, contenido de foros o cualquier escritura basada en Markdown.",

  // ── word-counter ──
  "steps_word-counter_1": "Ingresa tu texto",
  "steps_word-counter_1Desc": "Escribe o pega tu texto en el área de entrada. El contador se actualiza en tiempo real mientras escribes; no es necesario hacer clic en ningún botón.",
  "steps_word-counter_2": "Consulta las estadísticas detalladas",
  "steps_word-counter_2Desc": "Ve el recuento de palabras, caracteres (con y sin espacios), oraciones, párrafos y tiempo estimado de lectura; todo se actualiza en vivo.",
  "steps_word-counter_3": "Copia o limpia",
  "steps_word-counter_3Desc": "Copia el texto completo o estadísticas individuales. Limpia la entrada para empezar de nuevo. Perfecto para redacción de ensayos, planificación de contenido SEO o trabajos de traducción.",

  // ── qr-code ──
  "steps_qr-code_1": "Ingresa tus datos",
  "steps_qr-code_1Desc": "Escribe o pega la URL, texto o datos que deseas codificar en el código QR. Los códigos QR pueden almacenar URLs, texto plano, información de contacto o credenciales Wi-Fi.",
  "steps_qr-code_2": "Personaliza la apariencia",
  "steps_qr-code_2Desc": "Ajusta el tamaño, los colores de primer plano y fondo, y el nivel de corrección de errores. Una mayor corrección de errores hace que el código sea más resistente a daños u obstrucciones.",
  "steps_qr-code_3": "Descarga el código QR",
  "steps_qr-code_3Desc": "Haz clic en Descargar para guardar el código QR como una imagen PNG. Úsalo en materiales impresos, señalización, tarjetas de presentación o compártelo digitalmente.",

  // ── password-generator ──
  "steps_password-generator_1": "Establece los requisitos de la contraseña",
  "steps_password-generator_1Desc": "Elige la longitud de la contraseña y los tipos de caracteres: mayúsculas, minúsculas, números y símbolos. Las contraseñas más largas con todos los tipos de caracteres proporcionan la máxima seguridad.",
  "steps_password-generator_2": "Genera la contraseña",
  "steps_password-generator_2Desc": "Haz clic en Generar para crear una contraseña criptográficamente aleatoria usando el generador de números aleatorios seguro de tu navegador. Cada generación es completamente independiente.",
  "steps_password-generator_3": "Copia y almacena de forma segura",
  "steps_password-generator_3Desc": "Haz clic en Copiar para obtener la contraseña. Pégala directamente en un gestor de contraseñas; nunca almacenes contraseñas en archivos de texto plano ni te las envíes por correo electrónico.",

  // ── timezone-converter ──
  "steps_timezone-converter_1": "Visualiza y agrega ciudades",
  "steps_timezone-converter_1Desc": "Las ciudades predeterminadas muestran las principales zonas horarias. Busca y agrega cualquiera de más de 35 ciudades del mundo a tu vista. Cada tarjeta muestra la hora local actual actualizada cada segundo.",
  "steps_timezone-converter_2": "Compara horas entre zonas",
  "steps_timezone-converter_2Desc": "Ve relojes en tiempo real para todas las ciudades seleccionadas. Activa la fecha/hora personalizada para planificar reuniones: establece una hora candidata y comprueba qué hora es en cada ciudad.",
  "steps_timezone-converter_3": "Encuentra ventanas de reunión",
  "steps_timezone-converter_3Desc": "Usa la vista general para identificar ventanas de superposición donde todos los participantes tienen horarios laborales razonables. Elimina las ciudades que no necesites para una vista más limpia.",

  // ── ip-lookup ──
  "steps_ip-lookup_1": "Ingresa una dirección IP",
  "steps_ip-lookup_1Desc": "Escribe una dirección IP para consultar o déjala en blanco para detectar tu propia IP automáticamente. Tu IP se detecta al cargar la página para obtener resultados inmediatos.",
  "steps_ip-lookup_2": "Visualiza los datos de ubicación",
  "steps_ip-lookup_2Desc": "Los resultados muestran país, ciudad, ISP, ASN, coordenadas y zona horaria. Todo el procesamiento se realiza en tu navegador; no se almacena ni rastrea ningún dato personal.",
  "steps_ip-lookup_3": "Explora en el mapa",
  "steps_ip-lookup_3Desc": "Haz clic en \"Ver en Google Maps\" para ver la ubicación geográfica aproximada de la IP. Copia cualquier campo haciendo clic en él para usarlo en registros o documentación.",

  // ── ocr-tool ──
  "steps_ocr-tool_1": "Sube una imagen con texto",
  "steps_ocr-tool_1Desc": "Selecciona una imagen que contenga texto: capturas de pantalla, documentos escaneados o fotos de letreros. Formatos admitidos: JPEG, PNG, WebP. Tamaño máximo de archivo: 50 MB.",
  "steps_ocr-tool_2": "Selecciona el idioma y procesa",
  "steps_ocr-tool_2Desc": "Elige el idioma del texto (inglés, chino simplificado o chino tradicional). Haz clic en Extraer texto. La primera ejecución descarga datos de idioma (~10-20 MB); las ejecuciones posteriores son más rápidas.",
  "steps_ocr-tool_3": "Copia o descarga el texto",
  "steps_ocr-tool_3Desc": "Revisa el texto extraído, haz correcciones en el editor y luego cópialo al portapapeles o descárgalo como archivo .txt. El área de texto es editable para facilitar los arreglos.",

  // ── us-address-generator ──
  "steps_us-address-generator_1": "Selecciona un estado o usa aleatorio",
  "steps_us-address-generator_1Desc": "Elige un estado específico de EE. UU. del menú desplegable o déjalo en Aleatorio para variedad geográfica. Los estados sin impuestos (Alaska, Delaware, Montana, New Hampshire, Oregón) están marcados con una ★.",
  "steps_us-address-generator_2": "Genera una dirección",
  "steps_us-address-generator_2Desc": "Haz clic en Generar para crear un paquete completo de dirección de EE. UU.: nombre completo, género, dirección postal, ciudad, estado, código postal y un número de teléfono del estado con un código de área real.",
  "steps_us-address-generator_3": "Copia campos individuales o todo",
  "steps_us-address-generator_3Desc": "Haz clic en cualquier campo para copiar solo ese valor al portapapeles. Usa Copiar todo para la dirección completa formateada. La notificación toast confirma cada copia. El mapa muestra la ubicación de la ciudad a través de OpenStreetMap.",

  // ── base-convert ──
  "steps_base-convert_1": "Ingresa un número",
  "steps_base-convert_1Desc": "Escribe un número en cualquier base (binaria, octal, decimal o hexadecimal). El conversor detecta automáticamente la base de entrada según el formato de tu número.",
  "steps_base-convert_2": "Selecciona la base objetivo",
  "steps_base-convert_2Desc": "Ve las conversiones a todas las bases comunes simultáneamente: binaria (base 2), octal (base 8), decimal (base 10) y hexadecimal (base 16).",
  "steps_base-convert_3": "Copia cualquier resultado",
  "steps_base-convert_3Desc": "Haz clic en cualquier salida para copiarla. Perfecto para tareas de programación, direccionamiento de red, conversión de códigos de color o educación en ciencias de la computación.",

  // ── random-number ──
  "steps_random-number_1": "Establece el rango",
  "steps_random-number_1Desc": "Ingresa los valores mínimo y máximo para tu rango de números aleatorios. Puedes generar enteros o decimales dentro de cualquier rango admitido por JavaScript.",
  "steps_random-number_2": "Genera números",
  "steps_random-number_2Desc": "Haz clic en Generar para producir un número verdaderamente aleatorio dentro de tu rango especificado. Genera valores únicos o múltiples números a la vez para uso en lote.",
  "steps_random-number_3": "Copia resultados",
  "steps_random-number_3Desc": "Haz clic en Copiar para obtener los números generados. Úsalos para tiradas de dados, simulaciones de lotería, datos de prueba aleatorios, mecánicas de juego o muestreo estadístico.",

  // ── binary-calculator ──
  "steps_binary-calculator_1": "Ingresa números binarios",
  "steps_binary-calculator_1Desc": "Escribe números binarios (0s y 1s) o números decimales en los campos de entrada. La calculadora muestra ambas representaciones para mayor claridad.",
  "steps_binary-calculator_2": "Selecciona la operación",
  "steps_binary-calculator_2Desc": "Elige una operación: suma, resta, multiplicación o división. Los resultados se muestran simultáneamente en formato binario y decimal.",
  "steps_binary-calculator_3": "Copia el resultado",
  "steps_binary-calculator_3Desc": "Haz clic en Copiar para obtener el resultado en formato binario o decimal. Ideal para cursos de arquitectura de computadoras, depuración a nivel de bits o aprendizaje de aritmética binaria.",

  // ── boolean-calculator ──
  "steps_boolean-calculator_1": "Ingresa expresiones booleanas",
  "steps_boolean-calculator_1Desc": "Escribe tu expresión lógica usando AND (∧), OR (∨), NOT (¬), XOR (⊕) y paréntesis para agrupar. Usa 0/1 o verdadero/falso como valores de entrada.",
  "steps_boolean-calculator_2": "Evalúa la expresión",
  "steps_boolean-calculator_2Desc": "Haz clic en Evaluar para calcular el resultado booleano. Se genera una tabla de verdad que muestra todas las combinaciones posibles de entrada y sus salidas.",
  "steps_boolean-calculator_3": "Copia el resultado o la tabla",
  "steps_boolean-calculator_3Desc": "Copia el valor del resultado o la tabla de verdad completa. Esencial para diseño de lógica digital, condicionales de programación y estudio de lógica formal.",

  // ── bitwise-calculator ──
  "steps_bitwise-calculator_1": "Ingresa tus números",
  "steps_bitwise-calculator_1Desc": "Escribe dos números en decimal, hexadecimal (prefijo 0x) o binario (prefijo 0b). Ambos valores se muestran en las tres representaciones para verificación.",
  "steps_bitwise-calculator_2": "Elige la operación bit a bit",
  "steps_bitwise-calculator_2Desc": "Selecciona AND (&), OR (|), XOR (^), NOT (~), desplazamiento a la izquierda (<<) o desplazamiento a la derecha (>>). Los resultados se actualizan instantáneamente en decimal, hexadecimal y binario.",
  "steps_bitwise-calculator_3": "Copia los resultados",
  "steps_bitwise-calculator_3Desc": "Haz clic en cualquier formato de salida para copiarlo. Esencial para programación de bajo nivel, sistemas embebidos, manipulación de banderas y optimización de rendimiento.",

  // ── ip-calculator ──
  "steps_ip-calculator_1": "Ingresa la dirección IP y subred",
  "steps_ip-calculator_1Desc": "Escribe una dirección IP con notación CIDR (ej., 192.168.1.0/24) o con una máscara de subred. La calculadora detecta automáticamente el formato de entrada.",
  "steps_ip-calculator_2": "Visualiza los detalles de la subred",
  "steps_ip-calculator_2Desc": "Ve la dirección de red, dirección de difusión, rango de hosts utilizables, total de hosts, máscara de subred y máscara comodín; todo calculado instantáneamente.",
  "steps_ip-calculator_3": "Copia cualquier valor",
  "steps_ip-calculator_3Desc": "Haz clic en cualquier campo para copiarlo. Esencial para ingenieros de redes, administradores de sistemas, DevOps y cualquier persona que configure firewalls, enrutamiento o VLANs.",

  // ── time-diff ──
  "steps_time-diff_1": "Ingresa dos fechas u horas",
  "steps_time-diff_1Desc": "Introduce una fecha/hora de inicio y una fecha/hora de fin usando los selectores de fecha y hora. Se admiten tanto fechas pasadas como futuras para cualquier dirección de cálculo.",
  "steps_time-diff_2": "Calcula la diferencia",
  "steps_time-diff_2Desc": "Haz clic en Calcular para ver el lapso de tiempo exacto entre tus fechas. Los resultados se desglosan en años, meses, días, horas, minutos y segundos.",
  "steps_time-diff_3": "Copia el resultado",
  "steps_time-diff_3Desc": "Haz clic en Copiar para obtener la diferencia de tiempo. Útil para planificación de proyectos, cálculo de edad, temporizadores de cuenta regresiva, seguimiento de SLA y programación de eventos.",

  // ── bmi-calculator ──
  "steps_bmi-calculator_1": "Ingresa tus medidas",
  "steps_bmi-calculator_1Desc": "Introduce tu peso y altura. Alterna entre unidades métricas (kg/cm) e imperiales (lbs/pies/pulgadas). Tus datos permanecen privados; todos los cálculos son locales.",
  "steps_bmi-calculator_2": "Consulta tu resultado de IMC",
  "steps_bmi-calculator_2Desc": "Tu puntuación de IMC y categoría de peso (bajo peso, normal, sobrepeso u obesidad) se muestran instantáneamente. Una escala visual muestra dónde se sitúa tu resultado en el rango.",
  "steps_bmi-calculator_3": "Comprende tu resultado",
  "steps_bmi-calculator_3Desc": "Revisa la descripción de la categoría de IMC. Ten en cuenta que el IMC es una herramienta de detección, no un diagnóstico; consulta a un profesional de la salud para obtener asesoramiento personalizado.",

  // ── loan-calculator ──
  "steps_loan-calculator_1": "Ingresa los detalles del préstamo",
  "steps_loan-calculator_1Desc": "Introduce el monto del préstamo, la tasa de interés anual y el plazo del préstamo en años o meses. Todos los cálculos se ejecutan localmente en tu navegador por privacidad.",
  "steps_loan-calculator_2": "Visualiza el desglose de pagos",
  "steps_loan-calculator_2Desc": "Ve tu pago mensual, el interés total pagado, el monto total reembolsado y el calendario de amortización completo. Ajusta cualquier entrada para ver resultados actualizados al instante.",
  "steps_loan-calculator_3": "Copia o usa los resultados",
  "steps_loan-calculator_3Desc": "Copia el monto del pago mensual o el calendario completo. Úsalo para planificación de hipotecas, comparación de préstamos de auto, evaluación de préstamos personales o educación financiera.",

  // ── matrix-calculator ──
  "steps_matrix-calculator_1": "Ingresa los datos de la matriz",
  "steps_matrix-calculator_1Desc": "Introduce tus matrices escribiendo valores o usando el editor de cuadrícula. Tamaños admitidos de 1x1 a 10x10. Define ambas matrices si la operación usa dos.",
  "steps_matrix-calculator_2": "Selecciona la operación",
  "steps_matrix-calculator_2Desc": "Elige sumar, restar, multiplicar, transponer, determinante o inversa. La matriz resultante se muestra instantáneamente con todos los valores calculados.",
  "steps_matrix-calculator_3": "Copia o usa los resultados",
  "steps_matrix-calculator_3Desc": "Copia valores individuales o toda la matriz de resultados. Esencial para cursos de álgebra lineal, programación de gráficos 3D y cálculos de ingeniería.",

  // ── string-analyzer ──
  "steps_string-analyzer_1": "Ingresa tu cadena de texto",
  "steps_string-analyzer_1Desc": "Escribe o pega cualquier texto en la entrada. El analizador lo procesa instantáneamente sin necesidad de hacer clic en ningún botón; todo se actualiza en tiempo real.",
  "steps_string-analyzer_2": "Visualiza el análisis",
  "steps_string-analyzer_2Desc": "Ve el recuento de caracteres, palabras, longitud en bytes (UTF-8), líneas, entropía, caracteres únicos y distribución de frecuencia de caracteres.",
  "steps_string-analyzer_3": "Copia las estadísticas",
  "steps_string-analyzer_3Desc": "Haz clic en cualquier estadística para copiarla. Útil para desarrolladores que depuran problemas de codificación, optimización de contenido SEO, comprobación de entropía de contraseñas y procesamiento de texto.",

  // ── date-calculator ──
  "steps_date-calculator_1": "Elige una fecha de inicio",
  "steps_date-calculator_1Desc": "Selecciona una fecha base usando el selector de fecha. Usa la fecha de hoy o cualquier fecha pasada/futura como punto de partida para el cálculo.",
  "steps_date-calculator_2": "Suma o resta tiempo",
  "steps_date-calculator_2Desc": "Ingresa el número de días, semanas, meses o años para sumar o restar. Elige la operación y la unidad de tiempo desde los controles.",
  "steps_date-calculator_3": "Visualiza y copia el resultado",
  "steps_date-calculator_3Desc": "La fecha calculada se muestra instantáneamente. Copia el resultado para plazos de proyectos, estimaciones de entrega, renovaciones de suscripciones o planificación de eventos.",

  // ── bank-bin ──
  "steps_bank-bin_1": "Ingresa un número BIN/IIN",
  "steps_bank-bin_1Desc": "Escribe los primeros 6 a 8 dígitos de una tarjeta de crédito o débito (el Número de Identificación Bancaria). Los BIN identifican el banco emisor, la marca de la tarjeta y el tipo de tarjeta.",
  "steps_bank-bin_2": "Consulta el emisor",
  "steps_bank-bin_2Desc": "Haz clic en Consultar para obtener el emisor de la tarjeta, la marca (Visa, Mastercard, etc.), el tipo de tarjeta (crédito/débito/prepago) y el país emisor.",
  "steps_bank-bin_3": "Copia el resultado",
  "steps_bank-bin_3Desc": "Haz clic en cualquier campo para copiarlo. Útil para verificación de procesamiento de pagos, detección de fraude y comprensión de la infraestructura de pagos con tarjeta.",

  // ── currency-converter ──
  "steps_currency-converter_1": "Ingresa el monto y las divisas",
  "steps_currency-converter_1Desc": "Introduce el monto, selecciona las divisas de origen y destino entre más de 170 monedas mundiales. Las tasas de cambio se obtienen en vivo para una conversión precisa.",
  "steps_currency-converter_2": "Visualiza la conversión",
  "steps_currency-converter_2Desc": "El monto convertido se muestra instantáneamente según las tasas de cambio actuales. La tasa utilizada y la hora de la última actualización se muestran para mayor transparencia.",
  "steps_currency-converter_3": "Copia el resultado",
  "steps_currency-converter_3Desc": "Haz clic en Copiar para obtener el monto convertido. Nota: las tasas mostradas son de referencia; verifica siempre con tu banco antes de realizar grandes transacciones.",

  // ── unit-converter ──
  "steps_unit-converter_1": "Selecciona la categoría de unidad",
  "steps_unit-converter_1Desc": "Elige tu tipo de medida: longitud, peso o temperatura. Alterna entre categorías usando los botones de pestaña en la parte superior.",
  "steps_unit-converter_2": "Ingresa el valor y la unidad de origen",
  "steps_unit-converter_2Desc": "Escribe tu número y selecciona la unidad de origen del menú desplegable. La tabla de conversión completa se actualiza en tiempo real mostrando todas las unidades simultáneamente.",
  "steps_unit-converter_3": "Lee o copia cualquier valor",
  "steps_unit-converter_3Desc": "Todas las conversiones de unidades se muestran a la vez en una tabla limpia. Haz clic en cualquier resultado para copiarlo. Perfecto para ingeniería, cocina, viajes y ciencias.",

  // ── text-encoder ──
  "steps_text-encoder_1": "Ingresa tu texto",
  "steps_text-encoder_1Desc": "Escribe o pega texto en el área de entrada. El codificador admite múltiples formatos de codificación para diferentes casos de uso y necesidades de programación.",
  "steps_text-encoder_2": "Elige el tipo de codificación",
  "steps_text-encoder_2Desc": "Selecciona la codificación: codificar/decodificar URL, entidades HTML, Base64, secuencias de escape Unicode o binario. Ve los resultados codificados y decodificados lado a lado.",
  "steps_text-encoder_3": "Copia el texto codificado",
  "steps_text-encoder_3Desc": "Haz clic en Copiar para obtener el resultado codificado o decodificado. Perfecto para desarrollo web, codificación de parámetros de API y tareas de transformación de datos.",

  // ── online-notepad ──
  "steps_online-notepad_1": "Comienza a escribir tus notas",
  "steps_online-notepad_1Desc": "Empieza a escribir en el editor; tu contenido se guarda automáticamente en localStorage del navegador cada 500 ms. Cierra la pestaña y vuelve; tus notas persisten.",
  "steps_online-notepad_2": "Usa Markdown y vista previa",
  "steps_online-notepad_2Desc": "Formatea con sintaxis Markdown (encabezados, negrita, listas, código). Activa el modo Vista previa para ver el resultado renderizado. Alterna entre temas de editor oscuro y claro.",
  "steps_online-notepad_3": "Exporta tu trabajo",
  "steps_online-notepad_3Desc": "Descarga tus notas como archivo .txt o exporta a PDF con ajuste automático de línea. No se necesita cuenta; todo permanece en tu dispositivo.",

  // ── audio-trim ──
  "steps_audio-trim_1": "Sube tu archivo de audio",
  "steps_audio-trim_1Desc": "Selecciona un archivo de audio (MP3, WAV, OGG, AAC, FLAC) para recortar. La forma de onda visualiza tu audio para que puedas ver exactamente dónde cortar.",
  "steps_audio-trim_2": "Establece los puntos de recorte",
  "steps_audio-trim_2Desc": "Arrastra los controles de inicio y fin en la forma de onda para seleccionar la porción a conservar. Previsualiza el segmento recortado antes de confirmar para asegurarte de que suene bien.",
  "steps_audio-trim_3": "Recorta y descarga",
  "steps_audio-trim_3Desc": "Haz clic en Recortar para cortar tu audio al rango seleccionado. Descarga el archivo recortado; perfecto para tonos de llamada, clips de podcast y eliminación de secciones no deseadas.",

  // ── audio-split ──
  "steps_audio-split_1": "Sube tu archivo de audio",
  "steps_audio-split_1Desc": "Selecciona un archivo de audio largo para dividir en segmentos. La visualización de forma de onda te ayuda a identificar puntos de corte naturales en el contenido de audio.",
  "steps_audio-split_2": "Elige el método de división",
  "steps_audio-split_2Desc": "Divide por duración fija (cada N minutos), por número de segmentos iguales o en marcadores de división manuales que coloques en la forma de onda.",
  "steps_audio-split_3": "Divide y descarga",
  "steps_audio-split_3Desc": "Haz clic en Dividir para dividir tu audio. Todos los segmentos se descargan individualmente o como un ZIP. Perfecto para dividir grabaciones largas en episodios manejables.",

  // ── audio-volume ──
  "steps_audio-volume_1": "Sube tu archivo de audio",
  "steps_audio-volume_1Desc": "Selecciona un archivo de audio para ajustar. Formatos admitidos: MP3, WAV, OGG, AAC, FLAC. El archivo permanece en tu dispositivo durante todo el proceso.",
  "steps_audio-volume_2": "Ajusta el nivel de volumen",
  "steps_audio-volume_2Desc": "Arrastra el control deslizante de volumen para aumentar (por encima del 100 %) o reducir (por debajo del 100 %) el volumen. Haz clic en Previsualizar para escuchar una muestra al nuevo nivel antes de procesar.",
  "steps_audio-volume_3": "Aplica y descarga",
  "steps_audio-volume_3Desc": "Haz clic en Aplicar para generar el archivo con volumen ajustado. Descarga el resultado; ideal para normalizar niveles de audio entre pistas o arreglar grabaciones silenciosas.",

  // ── audio-convert ──
  "steps_audio-convert_1": "Sube tu archivo de audio",
  "steps_audio-convert_1Desc": "Selecciona el archivo de audio a convertir. Formatos de entrada: MP3, WAV, OGG, AAC, FLAC, M4A. Tu archivo se procesa completamente en tu navegador.",
  "steps_audio-convert_2": "Elige formato de salida y calidad",
  "steps_audio-convert_2Desc": "Selecciona el formato objetivo (MP3, WAV, OGG, AAC, FLAC) y la tasa de bits. MP3 a 320 kbps ofrece la mejor relación calidad-tamaño. WAV para calidad sin pérdida.",
  "steps_audio-convert_3": "Convierte y descarga",
  "steps_audio-convert_3Desc": "Haz clic en Convertir para transcodificar tu audio al nuevo formato. Descarga el archivo convertido; listo para cualquier dispositivo, plataforma o software de edición.",

  // ── audio-merge ──
  "steps_audio-merge_1": "Sube tus archivos de audio",
  "steps_audio-merge_1Desc": "Selecciona dos o más archivos de audio para combinar. Arrástralos para reordenarlos en la secuencia en que deben reproducirse. Todos los archivos deben ser del mismo formato.",
  "steps_audio-merge_2": "Organiza la secuencia",
  "steps_audio-merge_2Desc": "Reordena los archivos arrastrándolos. Previsualiza la duración total combinada. Elimina cualquier archivo de la lista antes de fusionar si es necesario.",
  "steps_audio-merge_3": "Fusiona y descarga",
  "steps_audio-merge_3Desc": "Haz clic en Fusionar para combinar todos los archivos en una sola pista de audio. Descarga el archivo fusionado; ideal para episodios de podcast, mixtapes o compilaciones de audio.",

  // ── audio-denoise ──
  "steps_audio-denoise_1": "Sube tu audio con ruido",
  "steps_audio-denoise_1Desc": "Selecciona un archivo de audio con ruido de fondo: silbido, zumbido, ruido de ventilador o estática. El archivo se carga en tu navegador para el análisis local del perfil de ruido.",
  "steps_audio-denoise_2": "Ajusta la reducción de ruido",
  "steps_audio-denoise_2Desc": "Establece la intensidad de reducción. Comienza con un nivel moderado para evitar artefactos. Los niveles más altos eliminan más ruido pero pueden afectar la claridad de la voz. Previsualiza el resultado.",
  "steps_audio-denoise_3": "Procesa y descarga",
  "steps_audio-denoise_3Desc": "Haz clic en Reducir ruido para limpiar tu audio. Descarga el archivo procesado; ideal para podcasts, grabaciones de voz, locuciones de video y grabaciones de reuniones.",

  // ── add-watermark ──
  "steps_add-watermark_1": "Sube tu archivo",
  "steps_add-watermark_1Desc": "Selecciona tu archivo haciendo clic en el área de carga o arrastrándolo a la página. Los archivos se procesan localmente en tu navegador; nunca salen de tu dispositivo.",
  "steps_add-watermark_2": "Ajusta la configuración",
  "steps_add-watermark_2Desc": "Ajusta la calidad, dimensiones u otras opciones según tus necesidades. Todos los ajustes se aplican instantáneamente durante el procesamiento.",
  "steps_add-watermark_3": "Descarga el resultado",
  "steps_add-watermark_3Desc": "Haz clic en el botón de acción para procesar tu archivo. Tu resultado estará listo en segundos y se descargará automáticamente.",

  // ── drawing-canvas ──
  "steps_drawing-canvas_1": "Sube tu archivo",
  "steps_drawing-canvas_1Desc": "Selecciona tu archivo haciendo clic en el área de carga o arrastrándolo a la página. Los archivos se procesan localmente en tu navegador; nunca salen de tu dispositivo.",
  "steps_drawing-canvas_2": "Ajusta la configuración",
  "steps_drawing-canvas_2Desc": "Ajusta la calidad, dimensiones u otras opciones según tus necesidades. Todos los ajustes se aplican instantáneamente durante el procesamiento.",
  "steps_drawing-canvas_3": "Descarga el resultado",
  "steps_drawing-canvas_3Desc": "Haz clic en el botón de acción para procesar tu archivo. Tu resultado estará listo en segundos y se descargará automáticamente.",

  // ── image-batch ──
  "steps_image-batch_1": "Sube tu archivo",
  "steps_image-batch_1Desc": "Selecciona tu archivo haciendo clic en el área de carga o arrastrándolo a la página. Los archivos se procesan localmente en tu navegador; nunca salen de tu dispositivo.",
  "steps_image-batch_2": "Ajusta la configuración",
  "steps_image-batch_2Desc": "Ajusta la calidad, dimensiones u otras opciones según tus necesidades. Todos los ajustes se aplican instantáneamente durante el procesamiento.",
  "steps_image-batch_3": "Descarga el resultado",
  "steps_image-batch_3Desc": "Haz clic en el botón de acción para procesar tu archivo. Tu resultado estará listo en segundos y se descargará automáticamente.",

  // ── aim-trainer ──
  "steps_aim-trainer_1": "Configura el modo de entrenamiento",
  "steps_aim-trainer_1Desc": "Elige el tamaño del objetivo, la tasa de aparición y la duración de la sesión. Comienza con objetivos más grandes y apariciones más lentas si eres nuevo en el entrenamiento de puntería.",
  "steps_aim-trainer_2": "Haz clic en los objetivos",
  "steps_aim-trainer_2Desc": "Haz clic en cada objetivo lo más rápido posible a medida que aparecen. Tu precisión, aciertos por segundo y puntuación total se registran en tiempo real.",
  "steps_aim-trainer_3": "Revisa tu rendimiento",
  "steps_aim-trainer_3Desc": "Ve tu puntuación final, porcentaje de precisión y recuento de aciertos. Sigue tu mejora a lo largo de varias sesiones. La práctica diaria constante produce los mejores resultados.",

  // ── cps-test ──
  "steps_cps-test_1": "Prepárate para hacer clic",
  "steps_cps-test_1Desc": "Coloca tu mano cómodamente sobre el ratón. La prueba mide cuántas veces puedes hacer clic en tu ventana de tiempo elegida.",
  "steps_cps-test_2": "Empieza a hacer clic",
  "steps_cps-test_2Desc": "Haz clic en cualquier lugar del área de prueba tan rápido como puedas. El temporizador cuenta regresivamente y tus CPS (clics por segundo) se actualizan en tiempo real.",
  "steps_cps-test_3": "Visualiza y compara los resultados",
  "steps_cps-test_3Desc": "Tu puntuación final de CPS se muestra con una calificación de rendimiento. Compárala con los promedios globales. Repite para mejorar; diferentes técnicas de clic producen diferentes resultados.",

  // ── reaction-test ──
  "steps_reaction-test_1": "Espera la señal",
  "steps_reaction-test_1Desc": "Observa el área de prueba. Cambiará de color rojo a verde en un intervalo aleatorio. No hagas clic antes de que se ponga verde; eso cuenta como salida falsa.",
  "steps_reaction-test_2": "Haz clic cuando esté verde",
  "steps_reaction-test_2Desc": "Haz clic lo más rápido posible una vez que el área se ponga verde. Tu tiempo de reacción se mide en milisegundos desde el cambio de color hasta tu clic.",
  "steps_reaction-test_3": "Visualiza tu tiempo de reacción",
  "steps_reaction-test_3Desc": "Tu tiempo de reacción se muestra en milisegundos. El tiempo de reacción visual humano promedio es de 200-250 ms. Intenta varios intentos; los primeros suelen ser más lentos.",

  // ── sensitivity-converter ──
  "steps_sensitivity-converter_1": "Selecciona tu juego y configuración",
  "steps_sensitivity-converter_1Desc": "Elige tu juego, ingresa tu sensibilidad actual, DPI del ratón y cualquier configuración específica del juego como FOV o tipo de puntería (cadera/ADS/mira).",
  "steps_sensitivity-converter_2": "Ingresa los valores objetivo",
  "steps_sensitivity-converter_2Desc": "Selecciona el juego objetivo o ingresa la configuración deseada. El conversor calcula la sensibilidad equivalente para una sensación de puntería consistente entre juegos.",
  "steps_sensitivity-converter_3": "Copia y aplica",
  "steps_sensitivity-converter_3Desc": "Copia el valor de sensibilidad convertido y pégalo en la configuración de tu juego. Ajusta finamente ±10 % en el juego para encontrar tu zona de confort personal.",

  // ── valorant-sensitivity-converter ──
  "steps_valorant-sensitivity-converter_1": "Ingresa tu sensibilidad de Valorant",
  "steps_valorant-sensitivity-converter_1Desc": "Escribe tu valor de sensibilidad actual de Valorant. Es el número que se encuentra en Ajustes → General → Ratón → Sensibilidad: Apuntado.",
  "steps_valorant-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_valorant-sensitivity-converter_2Desc": "Elige el juego al que deseas convertir. La calculadora usa fórmulas matemáticas probadas para igualar tu distancia de rotación de 360° entre juegos.",
  "steps_valorant-sensitivity-converter_3": "Copia y aplica en el juego",
  "steps_valorant-sensitivity-converter_3Desc": "Copia la sensibilidad convertida y pégala en la configuración del juego objetivo. Calienta en deathmatch durante 10-15 minutos después de cambiar la sensibilidad.",

  // ── cs2-sensitivity-converter ──
  "steps_cs2-sensitivity-converter_1": "Ingresa tu sensibilidad de CS2",
  "steps_cs2-sensitivity-converter_1Desc": "Escribe tu sensibilidad de CS2 de Ajustes → Teclado/Ratón → Sensibilidad del ratón. Este es tu valor base para la conversión entre juegos.",
  "steps_cs2-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_cs2-sensitivity-converter_2Desc": "Elige el juego de destino. El conversor iguala tu distancia de rotación de 360° de CS2 a la configuración equivalente en el juego objetivo.",
  "steps_cs2-sensitivity-converter_3": "Copia y ajusta finamente",
  "steps_cs2-sensitivity-converter_3Desc": "Copia el resultado, aplícalo en el juego y luego ajusta ±10 % según la sensación. Diferentes motores de juego y FOV afectan la sensibilidad percibida incluso cuando coinciden matemáticamente.",

  // ── apex-sensitivity-converter ──
  "steps_apex-sensitivity-converter_1": "Ingresa tu sensibilidad de Apex Legends",
  "steps_apex-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de Apex Legends. Se encuentra en Ajustes → Ratón/Teclado → Sensibilidad del ratón. Ingresa tu FOV y multiplicador de ADS si corresponde.",
  "steps_apex-sensitivity-converter_2": "Elige el juego objetivo",
  "steps_apex-sensitivity-converter_2Desc": "Selecciona el juego al que convertir. El movimiento más rápido de Apex significa que la sensibilidad convertida puede sentirse diferente; date varias partidas para adaptarte.",
  "steps_apex-sensitivity-converter_3": "Copia y prueba en el juego",
  "steps_apex-sensitivity-converter_3Desc": "Aplica el valor convertido en tu juego objetivo. Prueba en el campo de tiro o modo de práctica antes de saltar a partidas competitivas.",

  // ── overwatch2-sensitivity-converter ──
  "steps_overwatch2-sensitivity-converter_1": "Ingresa tu sensibilidad de Overwatch 2",
  "steps_overwatch2-sensitivity-converter_1Desc": "Introduce tu sensibilidad de OW2 desde Opciones → Controles → Ratón → Sensibilidad. Anota tu configuración de FOV ya que afecta la conversión.",
  "steps_overwatch2-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_overwatch2-sensitivity-converter_2Desc": "Elige el juego de destino. El ritmo más rápido de Overwatch 2 y los requisitos de puntería vertical significan que la sensibilidad convertida puede necesitar un ajuste menor.",
  "steps_overwatch2-sensitivity-converter_3": "Copia y aplica",
  "steps_overwatch2-sensitivity-converter_3Desc": "Aplica la sensibilidad convertida en tu juego objetivo. Dedica tiempo en el campo de práctica para adaptarte a la diferente sensación de juego y velocidad de movimiento.",

  // ── r6siege-sensitivity-converter ──
  "steps_r6siege-sensitivity-converter_1": "Ingresa tu sensibilidad de Rainbow Six Siege",
  "steps_r6siege-sensitivity-converter_1Desc": "Introduce tu sensibilidad de R6 Siege. Se encuentra en Opciones → Controles → Sensibilidad del ratón. Incluye tu configuración de sensibilidad ADS para una conversión más precisa.",
  "steps_r6siege-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_r6siege-sensitivity-converter_2Desc": "Elige el juego al que convertir. La puntería más lenta y metódica de R6 Siege difiere de los shooters más rápidos; date tiempo para adaptarte al ritmo del nuevo juego.",
  "steps_r6siege-sensitivity-converter_3": "Copia y practica",
  "steps_r6siege-sensitivity-converter_3Desc": "Aplica el valor convertido. Practica en caza al terrorista o campos de entrenamiento para desarrollar memoria muscular con la nueva configuración de sensibilidad.",

  // ── pubg-sensitivity-converter ──
  "steps_pubg-sensitivity-converter_1": "Ingresa tu sensibilidad de PUBG",
  "steps_pubg-sensitivity-converter_1Desc": "Introduce tu sensibilidad general de PUBG, más las sensibilidades individuales de mira si las usas. PUBG tiene configuraciones separadas para cada nivel de aumento.",
  "steps_pubg-sensitivity-converter_2": "Asigna al juego objetivo",
  "steps_pubg-sensitivity-converter_2Desc": "Selecciona el juego al que convertir. Las múltiples sensibilidades de mira de PUBG se pueden convertir individualmente para igualar cada aumento en el juego objetivo.",
  "steps_pubg-sensitivity-converter_3": "Copia y ajusta",
  "steps_pubg-sensitivity-converter_3Desc": "Aplica la sensibilidad convertida. El manejo realista de armas de PUBG significa que la sensación difiere de los shooters arcade; prueba primero en modo entrenamiento.",

  // ── fortnite-sensitivity-converter ──
  "steps_fortnite-sensitivity-converter_1": "Ingresa tu sensibilidad de Fortnite",
  "steps_fortnite-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de Fortnite desde Ajustes → Sensibilidad del ratón. Incluye tus sensibilidades de apuntado y mira para una conversión completa.",
  "steps_fortnite-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_fortnite-sensitivity-converter_2Desc": "Elige el juego al que convertir. La perspectiva en tercera persona de Fortnite y las mecánicas de construcción hacen que la sensación de puntería sea diferente de los shooters en primera persona.",
  "steps_fortnite-sensitivity-converter_3": "Copia y practica",
  "steps_fortnite-sensitivity-converter_3Desc": "Aplica la sensibilidad convertida. La sensibilidad de construcción y edición puede necesitar ajuste por separado; concéntrate primero en la sensación de puntería.",

  // ── cod-sensitivity-converter ──
  "steps_cod-sensitivity-converter_1": "Ingresa tu sensibilidad de Call of Duty",
  "steps_cod-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de CoD. Se encuentra en Ajustes → Controlador/Ratón → Sensibilidad del ratón. Anota también tu multiplicador de sensibilidad ADS.",
  "steps_cod-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_cod-sensitivity-converter_2Desc": "Elige el juego de destino. El tiempo para matar rápido de CoD significa que la precisión importa menos que en los shooters tácticos; la sensibilidad convertida puede sentirse ligeramente diferente.",
  "steps_cod-sensitivity-converter_3": "Copia y ajusta",
  "steps_cod-sensitivity-converter_3Desc": "Aplica el valor convertido. Juega algunas partidas en modo casual para adaptarte antes de llevarlo a partidas igualadas o competitivas.",

  // ── tarkov-sensitivity-converter ──
  "steps_tarkov-sensitivity-converter_1": "Ingresa tu sensibilidad de Tarkov",
  "steps_tarkov-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de Escape from Tarkov desde Ajustes → Controles → Sensibilidad del ratón. Incluye tu sensibilidad ADS para una conversión precisa.",
  "steps_tarkov-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_tarkov-sensitivity-converter_2Desc": "Elige el juego al que convertir. El manejo realista de armas de Tarkov y las sensibilidades separadas de cadera/ADS hacen que la conversión sea más matizada que en los shooters arcade.",
  "steps_tarkov-sensitivity-converter_3": "Copia y prueba sin conexión",
  "steps_tarkov-sensitivity-converter_3Desc": "Aplica la sensibilidad convertida. Prueba en modo sin conexión o en incursiones de Scav antes de arriesgar el equipo de tu PMC con configuraciones de sensibilidad desconocidas.",

  // ── bf2042-sensitivity-converter ──
  "steps_bf2042-sensitivity-converter_1": "Ingresa tu sensibilidad de Battlefield 2042",
  "steps_bf2042-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de BF2042 desde Ajustes → Ratón y teclado → Sensibilidad del ratón. Anota tu sensibilidad de zoom de soldado para cada aumento.",
  "steps_bf2042-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_bf2042-sensitivity-converter_2Desc": "Elige el juego de destino. La jugabilidad con vehículos de BF2042 y los mapas grandes significan que las necesidades de sensibilidad difieren entre el combate de infantería y vehículos.",
  "steps_bf2042-sensitivity-converter_3": "Copia y aplica",
  "steps_bf2042-sensitivity-converter_3Desc": "Aplica el valor convertido. Prueba en modo Portal o contra bots para encontrar tu zona de confort antes de jugar multijugador competitivo.",

  // ── halo-sensitivity-converter ──
  "steps_halo-sensitivity-converter_1": "Ingresa tu sensibilidad de Halo",
  "steps_halo-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de Halo Infinite. Se encuentra en Ajustes → Ratón → Sensibilidad del ratón. Incluye las sensibilidades de nivel de zoom para armas con mira.",
  "steps_halo-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_halo-sensitivity-converter_2Desc": "Elige el juego al que convertir. El tiempo para matar más largo de Halo recompensa la puntería de seguimiento; la sensibilidad convertida debe priorizar el seguimiento suave sobre la velocidad de flick.",
  "steps_halo-sensitivity-converter_3": "Copia y prueba",
  "steps_halo-sensitivity-converter_3Desc": "Aplica la sensibilidad convertida. Practica la puntería de seguimiento en la Academia o en partidas contra bots antes de saltar a la arena competitiva.",

  // ── thefinals-sensitivity-converter ──
  "steps_thefinals-sensitivity-converter_1": "Ingresa tu sensibilidad de The Finals",
  "steps_thefinals-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de The Finals desde Ajustes → Ratón → Sensibilidad. Incluye el multiplicador de sensibilidad ADS y la configuración de FOV.",
  "steps_thefinals-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_thefinals-sensitivity-converter_2Desc": "Elige el juego al que convertir. El movimiento rápido de The Finals y las mecánicas de destrucción crean una sensación de puntería única; la sensibilidad convertida puede necesitar ajuste.",
  "steps_thefinals-sensitivity-converter_3": "Copia y ajusta finamente",
  "steps_thefinals-sensitivity-converter_3Desc": "Aplica el valor convertido. Prueba en modo Quick Cash para un entorno de bajo riesgo donde ajustar tu sensibilidad antes del juego de torneo.",

  // ── warframe-sensitivity-converter ──
  "steps_warframe-sensitivity-converter_1": "Ingresa tu sensibilidad de Warframe",
  "steps_warframe-sensitivity-converter_1Desc": "Introduce tu sensibilidad de ratón de Warframe desde Opciones → Controles → Sensibilidad del ratón. El movimiento rápido en tercera persona de Warframe difiere de los shooters estándar.",
  "steps_warframe-sensitivity-converter_2": "Selecciona el juego objetivo",
  "steps_warframe-sensitivity-converter_2Desc": "Elige el juego al que convertir. El parkour de Warframe y la jugabilidad basada en habilidades significan que la sensación de puntería se traduce de manera diferente a los shooters tradicionales.",
  "steps_warframe-sensitivity-converter_3": "Copia y prueba",
  "steps_warframe-sensitivity-converter_3Desc": "Aplica la sensibilidad convertida. Dedica tiempo en misiones de bajo nivel para adaptarte a las nuevas mecánicas de puntería y estilo de movimiento del juego.",

  // ── cs2-to-valorant-sensitivity ──
  "steps_cs2-to-valorant-sensitivity_1": "Ingresa tu sensibilidad de CS2",
  "steps_cs2-to-valorant-sensitivity_1Desc": "Introduce tu valor de sensibilidad de CS2. La fórmula de conversión estándar es: sensibilidad de CS2 ÷ 3,18 = sensibilidad de Valorant.",
  "steps_cs2-to-valorant-sensitivity_2": "Visualiza el valor convertido",
  "steps_cs2-to-valorant-sensitivity_2Desc": "Tu sensibilidad equivalente de Valorant se muestra instantáneamente. Se calculan tanto la sensibilidad de cadera como la de zoom para una conversión completa.",
  "steps_cs2-to-valorant-sensitivity_3": "Copia y aplica en Valorant",
  "steps_cs2-to-valorant-sensitivity_3Desc": "Copia el resultado y pégalo en Ajustes de Valorant → General → Ratón → Sensibilidad: Apuntado. Ajusta finamente ±10 % para que coincida con tu sensación personal.",

  // ── valorant-to-cs2-sensitivity ──
  "steps_valorant-to-cs2-sensitivity_1": "Ingresa tu sensibilidad de Valorant",
  "steps_valorant-to-cs2-sensitivity_1Desc": "Introduce tu sensibilidad de apuntado de Valorant. La fórmula es: sensibilidad de Valorant × 3,18 = sensibilidad de CS2.",
  "steps_valorant-to-cs2-sensitivity_2": "Visualiza el equivalente de CS2",
  "steps_valorant-to-cs2-sensitivity_2Desc": "La sensibilidad equivalente de CS2 aparece instantáneamente. Ambas están emparejadas matemáticamente para producir la misma distancia de rotación cm/360°.",
  "steps_valorant-to-cs2-sensitivity_3": "Copia y prueba en CS2",
  "steps_valorant-to-cs2-sensitivity_3Desc": "Aplica en Ajustes de CS2 → Teclado/Ratón → Sensibilidad del ratón. Juega deathmatch para adaptarte; la sensación de movimiento de CS2 difiere de Valorant a pesar de la sensibilidad coincidente.",

  // ── apex-to-valorant-sensitivity ──
  "steps_apex-to-valorant-sensitivity_1": "Ingresa tu sensibilidad de Apex Legends",
  "steps_apex-to-valorant-sensitivity_1Desc": "Introduce tu sensibilidad de Apex y FOV. El FOV predeterminado más alto de Apex (110) frente a Valorant (103) afecta la sensibilidad percibida.",
  "steps_apex-to-valorant-sensitivity_2": "Visualiza el equivalente de Valorant",
  "steps_apex-to-valorant-sensitivity_2Desc": "La sensibilidad convertida de Valorant tiene en cuenta las diferencias de FOV entre los dos juegos para una traducción de sensación más precisa.",
  "steps_apex-to-valorant-sensitivity_3": "Copia y aplica",
  "steps_apex-to-valorant-sensitivity_3Desc": "Aplica en Valorant. Espera un período de adaptación: el movimiento rápido de Apex contrasta con el estilo táctico de mantener ángulos de Valorant.",

  // ── valorant-to-apex-sensitivity ──
  "steps_valorant-to-apex-sensitivity_1": "Ingresa tu sensibilidad de Valorant",
  "steps_valorant-to-apex-sensitivity_1Desc": "Introduce tu sensibilidad de Valorant. El conversor se ajusta al FOV predeterminado más alto de Apex Legends y al diferente motor de juego.",
  "steps_valorant-to-apex-sensitivity_2": "Visualiza el equivalente de Apex",
  "steps_valorant-to-apex-sensitivity_2Desc": "El valor de sensibilidad de Apex se ajusta para la escala de FOV y las diferencias del motor. Se calculan tanto las sensibilidades de cadera como de ADS.",
  "steps_valorant-to-apex-sensitivity_3": "Copia y prueba en Apex",
  "steps_valorant-to-apex-sensitivity_3Desc": "Aplica en Apex Legends. Prueba en el Campo de Tiro con diferentes armas; la puntería de seguimiento es más importante en Apex que en Valorant.",

  // ── cs2-to-apex-sensitivity ──
  "steps_cs2-to-apex-sensitivity_1": "Ingresa tu sensibilidad de CS2",
  "steps_cs2-to-apex-sensitivity_1Desc": "Introduce tu sensibilidad de ratón de CS2. El conversor tiene en cuenta los diferentes FOV predeterminados entre CS2 y Apex Legends.",
  "steps_cs2-to-apex-sensitivity_2": "Visualiza el equivalente de Apex",
  "steps_cs2-to-apex-sensitivity_2Desc": "Se calcula tu sensibilidad equivalente de Apex. El resultado se ajusta para el FOV predeterminado más amplio de Apex y la diferente velocidad de movimiento.",
  "steps_cs2-to-apex-sensitivity_3": "Copia y practica",
  "steps_cs2-to-apex-sensitivity_3Desc": "Aplica en Apex Legends. Dedica tiempo en el Campo de Tiro practicando el seguimiento en objetivos móviles antes de saltar al battle royale.",

  // ── apex-to-cs2-sensitivity ──
  "steps_apex-to-cs2-sensitivity_1": "Ingresa tu sensibilidad de Apex Legends",
  "steps_apex-to-cs2-sensitivity_1Desc": "Introduce tu sensibilidad de Apex y el FOV actual. Estos valores se utilizan para calcular la sensibilidad equivalente de CS2.",
  "steps_apex-to-cs2-sensitivity_2": "Visualiza el equivalente de CS2",
  "steps_apex-to-cs2-sensitivity_2Desc": "La sensibilidad de CS2 se muestra instantáneamente, teniendo en cuenta las diferencias de escala de FOV. El FOV predeterminado más estrecho de CS2 hace que la sensibilidad se sienta diferente.",
  "steps_apex-to-cs2-sensitivity_3": "Copia y prueba",
  "steps_apex-to-cs2-sensitivity_3Desc": "Aplica en CS2. Juega deathmatch durante al menos 15 minutos; el énfasis de CS2 en la colocación de la mira y el pre-apuntado difiere del enfoque de seguimiento de Apex.",

  // ── overwatch2-to-valorant-sensitivity ──
  "steps_overwatch2-to-valorant-sensitivity_1": "Ingresa tu sensibilidad de Overwatch 2",
  "steps_overwatch2-to-valorant-sensitivity_1Desc": "Introduce tu sensibilidad de OW2 y FOV. El movimiento más rápido de OW2 y las diversas habilidades de los héroes crean un contexto de puntería diferente al de Valorant.",
  "steps_overwatch2-to-valorant-sensitivity_2": "Visualiza el equivalente de Valorant",
  "steps_overwatch2-to-valorant-sensitivity_2Desc": "La sensibilidad de Valorant se calcula con compensación de FOV. Espera que se sienta más lenta debido a la jugabilidad más táctica de Valorant basada en mantener ángulos.",
  "steps_overwatch2-to-valorant-sensitivity_3": "Copia y ajusta",
  "steps_overwatch2-to-valorant-sensitivity_3Desc": "Aplica en Valorant. El período de adaptación puede durar varios días; Valorant recompensa la colocación precisa de la mira más que la puntería de seguimiento intensa de OW2.",

  // ── valorant-to-overwatch2-sensitivity ──
  "steps_valorant-to-overwatch2-sensitivity_1": "Ingresa tu sensibilidad de Valorant",
  "steps_valorant-to-overwatch2-sensitivity_1Desc": "Introduce tu sensibilidad de apuntado de Valorant. El conversor la escala para el entorno de juego más rápido y basado en habilidades de OW2.",
  "steps_valorant-to-overwatch2-sensitivity_2": "Visualiza el equivalente de Overwatch 2",
  "steps_valorant-to-overwatch2-sensitivity_2Desc": "El equivalente de OW2 se muestra instantáneamente. La sensibilidad se ajusta para el FOV más amplio de OW2 y las velocidades de movimiento de personajes más rápidas.",
  "steps_valorant-to-overwatch2-sensitivity_3": "Copia y prueba",
  "steps_valorant-to-overwatch2-sensitivity_3Desc": "Aplica en Overwatch 2. Prueba diferentes héroes en Partida Rápida; los héroes de hitscan y proyectil pueden sentirse diferentes incluso con la misma sensibilidad.",

  // ── cs2-to-overwatch2-sensitivity ──
  "steps_cs2-to-overwatch2-sensitivity_1": "Ingresa tu sensibilidad de CS2",
  "steps_cs2-to-overwatch2-sensitivity_1Desc": "Introduce tu sensibilidad de ratón de CS2. El conversor la transforma para el diferente FOV, velocidad de movimiento y estilo de puntería de Overwatch 2.",
  "steps_cs2-to-overwatch2-sensitivity_2": "Visualiza el equivalente de Overwatch 2",
  "steps_cs2-to-overwatch2-sensitivity_2Desc": "Tu sensibilidad de OW2 aparece instantáneamente. El cálculo tiene en cuenta las diferencias de FOV y motor entre los dos juegos.",
  "steps_cs2-to-overwatch2-sensitivity_3": "Copia y prueba en OW2",
  "steps_cs2-to-overwatch2-sensitivity_3Desc": "Aplica en Overwatch 2. Partida Rápida es el mejor entorno para adaptarse; la variedad de héroes y el ritmo de juego difieren significativamente de CS2.",

  // ── overwatch2-to-cs2-sensitivity ──
  "steps_overwatch2-to-cs2-sensitivity_1": "Ingresa tu sensibilidad de Overwatch 2",
  "steps_overwatch2-to-cs2-sensitivity_1Desc": "Introduce tu sensibilidad de OW2 y FOV. El conversor la escala adecuadamente para la jugabilidad más lenta y táctica de CS2.",
  "steps_overwatch2-to-cs2-sensitivity_2": "Visualiza el equivalente de CS2",
  "steps_overwatch2-to-cs2-sensitivity_2Desc": "La sensibilidad de CS2 aparece instantáneamente. Se aplica escala de FOV para que la distancia de movimiento del ratón para un giro de 360° se conserve.",
  "steps_overwatch2-to-cs2-sensitivity_3": "Copia y practica",
  "steps_overwatch2-to-cs2-sensitivity_3Desc": "Aplica en CS2. Espera que la sensibilidad se sienta más baja; CS2 enfatiza la colocación de la mira y el mantenimiento de ángulos en lugar del seguimiento.",

  // ── pubg-to-cs2-sensitivity ──
  "steps_pubg-to-cs2-sensitivity_1": "Ingresa tu sensibilidad de PUBG",
  "steps_pubg-to-cs2-sensitivity_1Desc": "Introduce tu sensibilidad general de PUBG. Si usas diferentes sensibilidades de mira, convierte cada una individualmente para obtener los mejores resultados.",
  "steps_pubg-to-cs2-sensitivity_2": "Visualiza el equivalente de CS2",
  "steps_pubg-to-cs2-sensitivity_2Desc": "La sensibilidad de CS2 aparece instantáneamente. Las mecánicas de armas realistas de PUBG y su ritmo más lento significan que la sensación de puntería difiere de CS2.",
  "steps_pubg-to-cs2-sensitivity_3": "Copia y refina",
  "steps_pubg-to-cs2-sensitivity_3Desc": "Aplica en CS2. Practica en deathmatch y mapas de entrenamiento de puntería del taller para desarrollar memoria muscular con la sensibilidad convertida.",

  // ── cs2-to-pubg-sensitivity ──
  "steps_cs2-to-pubg-sensitivity_1": "Ingresa tu sensibilidad de CS2",
  "steps_cs2-to-pubg-sensitivity_1Desc": "Introduce tu sensibilidad de ratón de CS2. PUBG tiene múltiples configuraciones de sensibilidad; esto convierte tu sensibilidad base de cadera.",
  "steps_cs2-to-pubg-sensitivity_2": "Visualiza el equivalente de PUBG",
  "steps_cs2-to-pubg-sensitivity_2Desc": "Se muestra la sensibilidad general de PUBG. Para las sensibilidades de mira, multiplica por los multiplicadores de sensibilidad de mira de PUBG para cada nivel de aumento.",
  "steps_cs2-to-pubg-sensitivity_3": "Copia y aplica",
  "steps_cs2-to-pubg-sensitivity_3Desc": "Aplica en PUBG. Prueba en Modo Entrenamiento; los patrones de retroceso realistas de PUBG y la caída de bala significan que la sensación de puntería difiere de CS2.",

  // ── fortnite-to-valorant-sensitivity ──
  "steps_fortnite-to-valorant-sensitivity_1": "Ingresa tu sensibilidad de Fortnite",
  "steps_fortnite-to-valorant-sensitivity_1Desc": "Introduce tu sensibilidad de ratón de Fortnite. Incluye las sensibilidades de apuntado y mira para la conversión más completa posible.",
  "steps_fortnite-to-valorant-sensitivity_2": "Visualiza el equivalente de Valorant",
  "steps_fortnite-to-valorant-sensitivity_2Desc": "La sensibilidad de Valorant se muestra instantáneamente. La vista en tercera persona de Fortnite y las mecánicas de construcción crean un contexto de puntería muy diferente.",
  "steps_fortnite-to-valorant-sensitivity_3": "Copia y prueba",
  "steps_fortnite-to-valorant-sensitivity_3Desc": "Aplica en Valorant. Espera un período de adaptación significativo; el cambio de construcción en tercera persona a disparo táctico en primera persona es sustancial.",

  // ── valorant-to-fortnite-sensitivity ──
  "steps_valorant-to-fortnite-sensitivity_1": "Ingresa tu sensibilidad de Valorant",
  "steps_valorant-to-fortnite-sensitivity_1Desc": "Introduce tu sensibilidad de Valorant. El conversor la escala para la perspectiva en tercera persona y la jugabilidad más rápida de Fortnite.",
  "steps_valorant-to-fortnite-sensitivity_2": "Visualiza el equivalente de Fortnite",
  "steps_valorant-to-fortnite-sensitivity_2Desc": "Tu sensibilidad equivalente de Fortnite aparece. Esta es tu sensibilidad de cadera; las sensibilidades de apuntado y mira pueden necesitar ajuste por separado.",
  "steps_valorant-to-fortnite-sensitivity_3": "Copia y ajusta",
  "steps_valorant-to-fortnite-sensitivity_3Desc": "Aplica en Fortnite. Prueba en modo Creativo; Fortnite requiere tanto disparos precisos como construcción rápida, por lo que la sensibilidad es un equilibrio de ambos.",

  // ── cod-to-cs2-sensitivity ──
  "steps_cod-to-cs2-sensitivity_1": "Ingresa tu sensibilidad de Call of Duty",
  "steps_cod-to-cs2-sensitivity_1Desc": "Introduce tu sensibilidad de ratón de CoD. El tiempo para matar más rápido de CoD y las mecánicas de reaparición difieren significativamente de la jugabilidad táctica de CS2.",
  "steps_cod-to-cs2-sensitivity_2": "Visualiza el equivalente de CS2",
  "steps_cod-to-cs2-sensitivity_2Desc": "La sensibilidad de CS2 se muestra instantáneamente, ajustada para los diferentes FOV predeterminados y características del motor de juego entre CoD y CS2.",
  "steps_cod-to-cs2-sensitivity_3": "Copia y refina",
  "steps_cod-to-cs2-sensitivity_3Desc": "Aplica en CS2. Espera que la sensibilidad se sienta más lenta; CS2 recompensa la precisión y la colocación de la mira más que el estilo de correr y disparar de CoD.",

  // ── cs2-to-cod-sensitivity ──
  "steps_cs2-to-cod-sensitivity_1": "Ingresa tu sensibilidad de CS2",
  "steps_cs2-to-cod-sensitivity_1Desc": "Introduce tu sensibilidad de ratón de CS2. El conversor la escala para el movimiento más rápido y el estilo de juego más agresivo de Call of Duty.",
  "steps_cs2-to-cod-sensitivity_2": "Visualiza el equivalente de CoD",
  "steps_cs2-to-cod-sensitivity_2Desc": "Tu sensibilidad equivalente de CoD aparece. El cálculo tiene en cuenta el diferente FOV predeterminado y el motor de juego entre los dos títulos.",
  "steps_cs2-to-cod-sensitivity_3": "Copia y prueba",
  "steps_cs2-to-cod-sensitivity_3Desc": "Aplica en Call of Duty. Juega algunas partidas casuales; el ritmo más rápido de CoD puede hacer que la sensibilidad convertida se sienta más baja de lo esperado inicialmente.",
};

// Apply translations
let applied = 0;
let skipped = 0;

for (const [key, value] of Object.entries(t)) {
  if (data.Tool[key] !== undefined) {
    data.Tool[key] = value;
    applied++;
  } else {
    console.warn(`Warning: key "${key}" not found in Tool namespace`);
    skipped++;
  }
}

// Check for any untranslated steps keys
const allStepKeys = Object.keys(data.Tool).filter(k => k.startsWith("steps_"));
const translated = allStepKeys.filter(k => k in t);
const untranslated = allStepKeys.filter(k => !(k in t));

if (untranslated.length > 0) {
  console.warn(`\nUNTRANSLATED keys (${untranslated.length}):`);
  untranslated.forEach(k => console.warn(`  ${k}`));
} else {
  console.log("All steps keys are translated.");
}

// Write back
writeFileSync(esPath, JSON.stringify(data, null, 2) + "\n");

console.log(`\nDone. ${applied} translations applied, ${skipped} skipped.`);
console.log(`Total steps keys: ${allStepKeys.length}, Translated: ${translated.length}`);
if (untranslated.length === 0) {
  console.log("SUCCESS: 100% coverage.");
}
