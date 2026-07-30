/**
 * Translates all Tool.steps_* keys in zh-cn.json from English to Simplified Chinese.
 * Run: node scripts/translate-zh-cn.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messagesPath = path.resolve(__dirname, "..", "messages", "zh-cn.json");

const data = JSON.parse(fs.readFileSync(messagesPath, "utf8"));

const translations = {
  // ────────────────────────────────────────────────────
  //  Image Conversion Tools
  // ────────────────────────────────────────────────────
  "steps_png-to-jpg_1": "上传您的PNG文件",
  "steps_png-to-jpg_1Desc": "点击上传区域或拖拽PNG图片到页面中。您的文件在整个处理过程中完全保留在您的设备上。",
  "steps_png-to-jpg_2": "调整质量设置",
  "steps_png-to-jpg_2Desc": "设置输出的JPEG质量——数值越高保留的细节越多，但文件体积也越大。默认92%提供了最佳平衡。",
  "steps_png-to-jpg_3": "转换并下载",
  "steps_png-to-jpg_3Desc": "点击"转换"将PNG转换为JPEG。转换后的图片会自动下载——您的原始PNG文件保持不变。",

  "steps_jpg-to-png_1": "上传您的JPG文件",
  "steps_jpg-to-png_1Desc": "选择您的JPEG图片。PNG输出支持透明度和无损压缩，非常适合Logo、截图和含文本的图形。",
  "steps_jpg-to-png_2": "查看转换选项",
  "steps_jpg-to-png_2Desc": "PNG采用无损压缩，因此无需设置质量。您的图片将保留原始JPEG的所有视觉细节，但文件体积会更大。",
  "steps_jpg-to-png_3": "转换并下载",
  "steps_jpg-to-png_3Desc": "点击"转换"将JPG转换为PNG。结果立即下载——您的原始文件不会被修改。",

  "steps_video-to-gif_1": "上传您的视频",
  "steps_video-to-gif_1Desc": "选择要转换的视频文件（MP4、WebM或MOV）。视频在浏览器中加载，以实现逐帧精确的GIF制作。最大文件大小为50MB。",
  "steps_video-to-gif_2": "设置GIF参数",
  "steps_video-to-gif_2Desc": "选择起始时间、时长、帧率和输出尺寸。较低的帧率和较小的尺寸可生成更小的GIF文件。",
  "steps_video-to-gif_3": "转换并下载",
  "steps_video-to-gif_3Desc": "点击"转换"将您的视频片段渲染为动态GIF。生成的GIF已针对社交媒体、即时通讯和论坛分享进行了优化。",

  "steps_mp4-to-gif_1": "上传您的MP4视频",
  "steps_mp4-to-gif_1Desc": "选择要转换为动态GIF的MP4文件。视频保留在您的设备上——所有处理均在浏览器本地完成。",
  "steps_mp4-to-gif_2": "配置GIF设置",
  "steps_mp4-to-gif_2Desc": "设置片段时长、帧率和输出尺寸。较少的每秒帧数和较小的尺寸可显著减小GIF文件体积。",
  "steps_mp4-to-gif_3": "生成并下载GIF",
  "steps_mp4-to-gif_3Desc": "点击"转换"生成动态GIF。非常适合从视频中制作表情包、教程片段或社交媒体内容。",

  "steps_webp-to-jpg_1": "上传您的WebP文件",
  "steps_webp-to-jpg_1Desc": "选择要转换的WebP图片。JPEG输出可确保与旧版软件、社交媒体平台和不支持WebP的设备最大兼容。",
  "steps_webp-to-jpg_2": "设置JPEG质量",
  "steps_webp-to-jpg_2Desc": "调整输出的JPEG质量级别。默认设置在视觉质量和文件大小之间取得平衡。较低的值生成更小的文件。",
  "steps_webp-to-jpg_3": "转换并下载",
  "steps_webp-to-jpg_3Desc": "点击"转换"将WebP转换为JPEG。通用的JPEG格式确保您的图片在任何地方都能打开——原始WebP文件不受影响。",

  "steps_jpg-to-webp_1": "上传您的JPG图片",
  "steps_jpg-to-webp_1Desc": "选择要转换为WebP的JPEG图片。与JPEG相比，WebP通常可减少30%-50%的文件体积，同时保持相似的视觉质量。",
  "steps_jpg-to-webp_2": "设置WebP质量",
  "steps_jpg-to-webp_2Desc": "调整质量滑块——与JPEG相比，WebP在较低质量设置下即可获得出色效果。默认80%通常效果很好。",
  "steps_jpg-to-webp_3": "转换并下载",
  "steps_jpg-to-webp_3Desc": "点击"转换"生成针对网页性能优化的WebP文件。更小的文件体积意味着更快的页面加载速度，同时保持图片质量。",

  "steps_webp-to-png_1": "上传您的WebP文件",
  "steps_webp-to-png_1Desc": "选择WebP图片。转换为PNG可获得无损质量和透明度支持——非常适合图形、Logo和编辑工作流程。",
  "steps_webp-to-png_2": "无损质量",
  "steps_webp-to-png_2Desc": "PNG使用数学上的无损压缩。WebP中的每一个像素都会被精确保留——代价是文件体积比WebP更大。",
  "steps_webp-to-png_3": "转换并下载",
  "steps_webp-to-png_3Desc": "点击"转换"获取无损PNG。非常适合需要最高精度版本进行进一步编辑的场景。",

  "steps_png-to-webp_1": "上传您的PNG文件",
  "steps_png-to-webp_1Desc": "选择PNG图片。转换为WebP可显著减少文件体积——通常比PNG小50%-70%——同时保持出色的视觉质量。",
  "steps_png-to-webp_2": "配置WebP选项",
  "steps_png-to-webp_2Desc": "调整质量设置。WebP会自动保留PNG文件中的透明度，使其成为网页上替代PNG的最佳现代格式。",
  "steps_png-to-webp_3": "转换并下载",
  "steps_png-to-webp_3Desc": "点击"转换"生成紧凑的WebP文件。非常适合加载速度重要且PNG文件太大的网站。",

  "steps_heic-to-jpg_1": "上传您的HEIC照片",
  "steps_heic-to-jpg_1Desc": "从您的iPhone或iPad中选择HEIC图片。HEIC是Apple的默认照片格式——转换为JPEG可确保与所有设备和平台的兼容性。",
  "steps_heic-to-jpg_2": "设置输出质量",
  "steps_heic-to-jpg_2Desc": "调整JPEG质量级别。较高的设置保留更多原始HEIC照片的细节。默认设置适用于大多数照片。",
  "steps_heic-to-jpg_3": "转换并下载",
  "steps_heic-to-jpg_3Desc": "点击"转换"将HEIC转换为通用兼容的JPEG文件。无需Apple设备，即可在任何地方分享、上传或编辑您的照片。",

  "steps_heic-to-png_1": "上传您的HEIC照片",
  "steps_heic-to-png_1Desc": "从Apple设备中选择HEIC图片。PNG转换为编辑、打印或存档目的提供无损质量。",
  "steps_heic-to-png_2": "无损转换",
  "steps_heic-to-png_2Desc": "PNG格式以全分辨率保留每一个细节。文件体积会比HEIC或JPEG更大——这是获得完美质量的代价。",
  "steps_heic-to-png_3": "转换并下载",
  "steps_heic-to-png_3Desc": "点击"转换"获取照片的无损PNG版本。非常适合质量至上的专业编辑工作流程。",

  "steps_avif-to-jpg_1": "上传您的AVIF图片",
  "steps_avif-to-jpg_1Desc": "选择AVIF文件。AVIF是具有出色压缩效果的下一代格式，但JPEG可确保与所有软件和平台的兼容性。",
  "steps_avif-to-jpg_2": "设置转换质量",
  "steps_avif-to-jpg_2Desc": "调整输出的JPEG质量。转换器在生成通用可读的JPEG文件的同时保持色彩准确性。",
  "steps_avif-to-jpg_3": "转换并下载",
  "steps_avif-to-jpg_3Desc": "点击"转换"将AVIF转换为JPEG。您的图片将在任何地方都能打开——从旧版软件到社交媒体平台。",

  "steps_avif-to-png_1": "上传您的AVIF文件",
  "steps_avif-to-png_1Desc": "选择AVIF图片。转换为PNG可为编辑、打印或需要最高保真度的场景提供无损质量。",
  "steps_avif-to-png_2": "无损输出",
  "steps_avif-to-png_2Desc": "PNG保留每一个像素，无压缩伪影。结果是完美质量的图片——文件体积更大，但视觉上完全相同。",
  "steps_avif-to-png_3": "转换并下载",
  "steps_avif-to-png_3Desc": "点击"转换"获取无损PNG版本。最适合平面设计、打印或任何要求像素级完美输出的工作流程。",

  "steps_svg-to-png_1": "上传您的SVG文件",
  "steps_svg-to-png_1Desc": "选择SVG矢量图形。转换为PNG会将矢量路径栅格化为您所选分辨率的像素图像。",
  "steps_svg-to-png_2": "设置输出尺寸",
  "steps_svg-to-png_2Desc": "选择PNG输出的宽度和高度。较大的尺寸提供更多细节但生成更大的文件。宽高比从SVG中保留。",
  "steps_svg-to-png_3": "栅格化并下载",
  "steps_svg-to-png_3Desc": "点击"转换"将SVG渲染为指定尺寸的PNG。非常适合将图标、Logo和插画分享为标准图片文件。",

  "steps_svg-to-jpg_1": "上传您的SVG图形",
  "steps_svg-to-jpg_1Desc": "选择SVG文件。转换为JPEG会将矢量图形栅格化，以便在不接受SVG上传的平台上分享。",
  "steps_svg-to-jpg_2": "设置尺寸和质量",
  "steps_svg-to-jpg_2Desc": "选择输出尺寸和JPEG质量。请注意JPEG不支持透明度——任何透明区域将变为白色。",
  "steps_svg-to-jpg_3": "栅格化并下载",
  "steps_svg-to-jpg_3Desc": "点击"转换"获取矢量图形的JPEG版本。非常适合将插画上传到社交媒体或嵌入文档中。",

  // ────────────────────────────────────────────────────
  //  Image Processing Tools
  // ────────────────────────────────────────────────────
  "steps_compress-image_1": "上传您的图片",
  "steps_compress-image_1Desc": "选择一张或多张图片进行压缩。支持的格式包括JPEG、PNG、WebP、AVIF和HEIC。所有处理均在您的设备上完成。",
  "steps_compress-image_2": "设置压缩级别",
  "steps_compress-image_2Desc": "调整质量百分比——数值越低文件越小，但压缩痕迹越明显。为您的使用场景在文件大小和质量之间找到最佳平衡点。",
  "steps_compress-image_3": "压缩并下载",
  "steps_compress-image_3Desc": "点击"压缩"减小文件体积。处理后对比原始大小和压缩后的大小。可单独下载或批量下载。",

  "steps_remove-bg_1": "上传您的文件",
  "steps_remove-bg_1Desc": "点击上传区域或拖拽文件到页面上传。文件在您的浏览器中本地处理——永远不会离开您的设备。",
  "steps_remove-bg_2": "调整设置",
  "steps_remove-bg_2Desc": "调整质量、尺寸或其他选项以满足您的需求。所有设置在处理过程中即时应用。",
  "steps_remove-bg_3": "下载结果",
  "steps_remove-bg_3Desc": "点击操作按钮处理您的文件。结果将在几秒钟内准备好并自动下载。",

  "steps_resize-image_1": "上传您的图片",
  "steps_resize-image_1Desc": "选择要调整大小的图片。支持的格式包括JPEG、PNG、WebP、AVIF和HEIC。您的原始文件在设备上保持不变。",
  "steps_resize-image_2": "设置目标尺寸",
  "steps_resize-image_2Desc": "输入期望的宽度和高度（像素）。开启宽高比锁定以保持比例，或解锁自定义尺寸。可选用预设尺寸满足常见需求。",
  "steps_resize-image_3": "调整大小并下载",
  "steps_resize-image_3Desc": "点击"调整大小"生成缩小（或放大）后的图片。下载结果——非常适合网页优化、社交媒体或邮件附件。",

  "steps_crop-image_1": "上传您的图片",
  "steps_crop-image_1Desc": "选择要裁剪的图片。完整图片加载到裁剪区域，您可以直观地选择要保留的区域。",
  "steps_crop-image_2": "调整裁剪区域",
  "steps_crop-image_2Desc": "拖动裁剪手柄选择您想要的区域。选择预设宽高比（1:1、4:3、16:9）或自由调整。预览实时更新。",
  "steps_crop-image_3": "应用裁剪并下载",
  "steps_crop-image_3Desc": "点击"裁剪"应用选择区域。裁剪后的图片立即下载——原始文件保持不变以备将来编辑。",

  "steps_rotate-image_1": "上传您的图片",
  "steps_rotate-image_1Desc": "选择要旋转或翻转的图片。预览显示您当前的图片方向。所有变换对原始文件均为非破坏性操作。",
  "steps_rotate-image_2": "选择旋转或翻转",
  "steps_rotate-image_2Desc": "点击旋转90°、180°或270°。使用水平翻转或垂直翻转实现镜像效果。每次点击后预览更新，您可以立即看到结果。",
  "steps_rotate-image_3": "应用并下载",
  "steps_rotate-image_3Desc": "点击旋转按钮完成操作。下载方向正确的图片——告别相册或演示文稿中歪斜的照片。",

  "steps_image-filter_1": "上传您的图片",
  "steps_image-filter_1Desc": "选择要应用滤镜的照片或图片。预览立即加载，您可以在调整各项设置时实时看到变化。",
  "steps_image-filter_2": "调整滤镜设置",
  "steps_image-filter_2Desc": "微调亮度、对比度、饱和度、色相、模糊以及特殊效果（灰度、复古、反相、锐化）。每次调整立即显示在预览中。",
  "steps_image-filter_3": "应用滤镜并下载",
  "steps_image-filter_3Desc": "满意效果了吗？点击"应用"渲染带有所有滤镜的最终图片。下载编辑后的照片——原始文件保持不变。",

  // ────────────────────────────────────────────────────
  //  Image-to-PDF / Document Tools
  // ────────────────────────────────────────────────────
  "steps_image-to-pdf_1": "上传您的图片",
  "steps_image-to-pdf_1Desc": "选择一张或多张图片合并为PDF。支持的格式：JPEG、PNG、WebP。拖拽以按期望出现的顺序排列图片。",
  "steps_image-to-pdf_2": "排列和配置",
  "steps_image-to-pdf_2Desc": "设置页面大小（A4、Letter或自定义）、图片适配模式和边距。预览缩略图布局以确认页面顺序和外观。",
  "steps_image-to-pdf_3": "生成并下载PDF",
  "steps_image-to-pdf_3Desc": "点击"生成"从您的图片创建PDF文档。每张图片成为独立页面。立即下载完成的PDF。",

  // ────────────────────────────────────────────────────
  //  PDF Tools
  // ────────────────────────────────────────────────────
  "steps_merge-pdf_1": "上传您的PDF文件",
  "steps_merge-pdf_1Desc": "选择两个或更多PDF文件进行合并。在文件列表中拖拽重新排序——第一个文件将成为合并文档的第1页。",
  "steps_merge-pdf_2": "排列页面顺序",
  "steps_merge-pdf_2Desc": "拖放文件设置合并顺序。移除不想包含的文件。在合并前预览文件数量和总页数。",
  "steps_merge-pdf_3": "合并并下载",
  "steps_merge-pdf_3Desc": "点击"合并"将所有PDF合并为单个文档。合并后的PDF按您指定的顺序自动下载。",

  "steps_split-pdf_1": "上传您的PDF",
  "steps_split-pdf_1Desc": "选择要拆分的PDF。文件在浏览器中加载并显示总页数。没有任何页面会上传到任何服务器。",
  "steps_split-pdf_2": "选择拆分方式",
  "steps_split-pdf_2Desc": "选择拆分方式——提取特定页面、每隔N页拆分或按页面范围拆分。输入页码或用逗号分隔的页码范围。",
  "steps_split-pdf_3": "拆分并下载",
  "steps_split-pdf_3Desc": "点击"拆分"将PDF分离。每个结果文件单独下载或作为包含所有拆分文档的ZIP包下载。",

  "steps_pdf-compress_1": "上传您的PDF",
  "steps_pdf-compress_1Desc": "选择要压缩的PDF文件。包含嵌入图片的大PDF文件从压缩中获益最多。您的文件永远不会离开您的设备。",
  "steps_pdf-compress_2": "选择压缩级别",
  "steps_pdf-compress_2Desc": "选择压缩强度。较高的压缩生成更小的文件但可能降低图片质量。在确认前预览预估的体积减小量。",
  "steps_pdf-compress_3": "压缩并下载",
  "steps_pdf-compress_3Desc": "点击"压缩"减小PDF文件体积。对比原始大小和压缩后的大小。非常适合通过电子邮件发送超出附件限制的文档。",

  "steps_pdf-encrypt_1": "上传您的PDF",
  "steps_pdf-encrypt_1Desc": "选择要设置密码保护的PDF。您的文档完全保留在设备上——没有任何文件数据通过网络传输。",
  "steps_pdf-encrypt_2": "设置您的密码",
  "steps_pdf-encrypt_2Desc": "输入强密码并确认。选择是否同时限制打印、复制或编辑。使用您能记住的密码——没有找回机制。",
  "steps_pdf-encrypt_3": "加密并下载",
  "steps_pdf-encrypt_3Desc": "点击"加密"应用密码保护。加密后的PDF立即下载。仅通过安全渠道与预期收件人分享密码。",

  "steps_pdf-decrypt_1": "上传您加密的PDF",
  "steps_pdf-decrypt_1Desc": "选择受密码保护的PDF。您必须知道密码才能解锁——没有正确密码无法绕过加密。",
  "steps_pdf-decrypt_2": "输入密码",
  "steps_pdf-decrypt_2Desc": "输入文档的密码。工具使用此密码尝试解密。如果成功，PDF将在浏览器中即时解锁。",
  "steps_pdf-decrypt_3": "下载已解锁的PDF",
  "steps_pdf-decrypt_3Desc": "解密后，下载已解锁的PDF。文件现在可以无需密码自由访问——如果包含敏感信息请妥善保管。",

  "steps_pdf-watermark_1": "上传您的PDF",
  "steps_pdf-watermark_1Desc": "选择要添加水印的PDF。您的文档完全在浏览器中处理——没有任何页面发送到外部服务器。",
  "steps_pdf-watermark_2": "配置水印",
  "steps_pdf-watermark_2Desc": "输入水印文字，选择字体大小、不透明度、旋转角度和页面位置。在应用前预览水印外观。",
  "steps_pdf-watermark_3": "应用并下载",
  "steps_pdf-watermark_3Desc": "点击"应用"将水印印到每一页。下载带水印的PDF——非常适合版权保护、品牌标识或草稿标记。",

  "steps_pdf-to-txt_1": "上传您的PDF",
  "steps_pdf-to-txt_1Desc": "选择要提取文本的PDF。对于基于文本的PDF（而非扫描图片）效果最佳。提取过程完全在浏览器中运行。",
  "steps_pdf-to-txt_2": "提取文本内容",
  "steps_pdf-to-txt_2Desc": "点击"提取"从PDF中提取所有文本内容。提取的文本尽可能保留段落结构。结果显示在文本区域中。",
  "steps_pdf-to-txt_3": "复制或下载文本",
  "steps_pdf-to-txt_3Desc": "检查提取的文本，进行必要的修正，然后复制到剪贴板或下载为.txt文件。非常适合重新利用PDF内容。",

  "steps_pdf-to-csv_1": "上传您的PDF",
  "steps_pdf-to-csv_1Desc": "选择包含表格或结构化数据的PDF。具有清晰格式表格而非自由布局的PDF可获得最佳结果。",
  "steps_pdf-to-csv_2": "提取表格数据",
  "steps_pdf-to-csv_2Desc": "点击"提取"检测并从PDF中提取表格结构。工具尝试从文档布局中识别行和列。",
  "steps_pdf-to-csv_3": "下载为CSV",
  "steps_pdf-to-csv_3Desc": "在预览表格中检查提取的数据，然后下载为CSV文件，可直接用于Excel、Google Sheets或数据库导入。",

  "steps_pdf-to-word_1": "上传您的PDF",
  "steps_pdf-to-word_1Desc": "选择要转换为Word格式的PDF。转换器尽可能忠实地保留文本、格式、图片和布局的原始面貌。",
  "steps_pdf-to-word_2": "转换为DOCX",
  "steps_pdf-to-word_2Desc": "点击"转换"将PDF转换为可编辑的Word文档。转换在本地运行——您的文档内容永远不会离开浏览器。",
  "steps_pdf-to-word_3": "下载Word文档",
  "steps_pdf-to-word_3Desc": "下载.docx文件，在Microsoft Word、Google Docs或LibreOffice中打开。使用转换后的文档自由编辑、排版和协作。",

  "steps_word-to-pdf_1": "上传您的Word文档",
  "steps_word-to-pdf_1Desc": "选择要转换的.docx文件。转换器将您的Word文档渲染为PDF，保留文本、图片和格式。",
  "steps_word-to-pdf_2": "转换为PDF",
  "steps_word-to-pdf_2Desc": "点击"转换"从您的Word文档生成PDF。PDF外观与Word中显示的文档完全一致。处理过程本地且私密。",
  "steps_word-to-pdf_3": "下载PDF",
  "steps_word-to-pdf_3Desc": "下载生成的PDF。非常适合分享定稿文档、提交作业或从Word文档创建用于打印的文件。",

  // ────────────────────────────────────────────────────
  //  Developer Tools
  // ────────────────────────────────────────────────────
  "steps_json-formatter_1": "粘贴您的JSON数据",
  "steps_json-formatter_1Desc": "将压缩或混乱的JSON粘贴到输入区域。格式化工具接受任何有效的JSON——数组、对象、深层嵌套结构。您的数据保留在浏览器中。",
  "steps_json-formatter_2": "格式化或验证",
  "steps_json-formatter_2Desc": "点击"格式化"进行缩进美化，或点击"验证"检查语法错误。错误信息会指出具体行号和字符位置。",
  "steps_json-formatter_3": "复制格式化输出",
  "steps_json-formatter_3Desc": "点击"复制"将格式化后的JSON复制到剪贴板。可直接粘贴到代码编辑器、API客户端或文档中，带有正确的缩进。",

  "steps_base64_1": "输入文本或上传文件",
  "steps_base64_1Desc": "输入或粘贴要编码的文本，或粘贴要解码的Base64字符串。您也可以上传文件对其内容进行编码。所有处理均在本地完成。",
  "steps_base64_2": "编码或解码",
  "steps_base64_2Desc": "点击"编码"将文本/文件转换为Base64，或点击"解码"将Base64还原为原始形式。根据需要切换模式。",
  "steps_base64_3": "复制结果",
  "steps_base64_3Desc": "点击"复制"获取编码/解码后的输出。可用于代码、API请求、数据URI或任何需要Base64编码的场景。",

  "steps_uuid-generator_1": "配置UUID选项",
  "steps_uuid-generator_1Desc": "选择UUID版本（v1基于时间或v4随机）。选择输出格式——单个UUID、多个UUID、大写或带/不带连字符。",
  "steps_uuid-generator_2": "生成UUID",
  "steps_uuid-generator_2Desc": "点击"生成"创建密码学随机的UUID。每个UUID都是全球唯一的——碰撞概率极低。",
  "steps_uuid-generator_3": "复制并使用",
  "steps_uuid-generator_3Desc": "点击"复制"获取生成的UUID。非常适合数据库主键、API请求ID、会话令牌或任何唯一标识符需求。",

  "steps_timestamp-converter_1": "输入时间戳或日期",
  "steps_timestamp-converter_1Desc": "粘贴Unix时间戳（秒或毫秒）或输入可读日期。转换器自动检测输入格式。",
  "steps_timestamp-converter_2": "查看所有格式",
  "steps_timestamp-converter_2Desc": "结果以多种格式显示：Unix秒数、毫秒数、ISO 8601、RFC 2822和本地时间字符串。所有时区转换自动处理。",
  "steps_timestamp-converter_3": "复制任意格式",
  "steps_timestamp-converter_3Desc": "点击任意输出格式将其复制到剪贴板。非常适合调试API时间戳、配置定时任务或在日期表示形式之间转换。",

  "steps_json-validator_1": "粘贴您的JSON",
  "steps_json-validator_1Desc": "粘贴您要验证的JSON。验证器接受任何JSON结构——从简单的键值对到深层嵌套的API响应。",
  "steps_json-validator_2": "验证语法",
  "steps_json-validator_2Desc": "点击"验证"检查您的JSON。错误会被高亮显示，包含确切的行号、列号以及问题描述。修复问题后重新验证。",
  "steps_json-validator_3": "复制有效的JSON",
  "steps_json-validator_3Desc": "验证通过后，复制格式化的JSON或下载。可在您的应用程序中放心使用验证过的数据，确保语法正确。",

  "steps_regex-tester_1": "输入您的正则表达式",
  "steps_regex-tester_1Desc": "输入正则表达式模式，可选择设置标志（g、i、m、s、u）。如果需要正则语法帮助，可使用速查表参考。",
  "steps_regex-tester_2": "针对文本进行测试",
  "steps_regex-tester_2Desc": "粘贴或输入要测试的文本。匹配项在您输入时实时高亮显示。每个匹配的捕获组分别显示。",
  "steps_regex-tester_3": "复制模式或匹配结果",
  "steps_regex-tester_3Desc": "复制您最终确定的正则模式或匹配结果。非常适合在将正则表达式添加到生产代码之前进行调试。",

  "steps_text-case_1": "输入您的文本",
  "steps_text-case_1Desc": "输入或粘贴您要转换的文本。支持任意长度——从单个单词到整篇文档。处理即时且本地。",
  "steps_text-case_2": "选择大小写样式",
  "steps_text-case_2Desc": "可选：全小写、全大写、标题大小写、驼峰命名、帕斯卡命名、蛇形命名、短横线命名或常量大写。结果即时预览。",
  "steps_text-case_3": "复制转换后的文本",
  "steps_text-case_3Desc": "点击"复制"获取转换后的文本。非常适合重命名变量、规范化用户输入或为不同编程规范格式化文本。",

  "steps_lorem-ipsum_1": "设置生成参数",
  "steps_lorem-ipsum_1Desc": "选择段落数、每段句子数，以及是否以经典的"Lorem ipsum dolor sit amet..."开头。",
  "steps_lorem-ipsum_2": "生成占位文本",
  "steps_lorem-ipsum_2Desc": "点击"生成"创建Lorem Ipsum文本。生成器生成可读的伪拉丁文，模拟自然语言的视觉韵律。",
  "steps_lorem-ipsum_3": "复制并粘贴",
  "steps_lorem-ipsum_3Desc": "点击"复制"获取生成的文本。可用作设计稿、模型、线框图或开发预览中的占位内容。",

  "steps_hash-generator_1": "输入您的文本",
  "steps_hash-generator_1Desc": "输入或粘贴要计算哈希的字符串。对于文件校验，请上传文件。所有哈希计算在您的浏览器本地执行。",
  "steps_hash-generator_2": "选择哈希算法",
  "steps_hash-generator_2Desc": "可选：MD5、SHA-1、SHA-256、SHA-384或SHA-512。对于大多数安全敏感应用推荐使用SHA-256。结果即时显示。",
  "steps_hash-generator_3": "复制哈希值",
  "steps_hash-generator_3Desc": "点击"复制"获取生成的哈希。用于文件完整性验证、密码存储（加盐）或数据去重检查。",

  "steps_qr-reader_1": "上传二维码图片",
  "steps_qr-reader_1Desc": "选择包含二维码的图片。支持格式：JPEG、PNG、WebP。您也可以使用摄像头直接在设备上扫描二维码。",
  "steps_qr-reader_2": "扫描二维码",
  "steps_qr-reader_2Desc": "点击"扫描"解码二维码。工具提取嵌入的数据——网址、文本、联系信息、Wi-Fi凭据或任何编码内容。",
  "steps_qr-reader_3": "复制或打开结果",
  "steps_qr-reader_3Desc": "复制解码后的文本，如果是网址可直接点击打开。出于安全考虑，扫描未知二维码前请先验证。",

  "steps_csv-formatter_1": "粘贴您的CSV数据",
  "steps_csv-formatter_1Desc": "粘贴原始CSV文本或上传.csv文件。格式化工具自动检测分隔符（逗号、制表符、分号）并处理带引号的字段。",
  "steps_csv-formatter_2": "格式化并验证",
  "steps_csv-formatter_2Desc": "点击"格式化"对齐列并验证CSV结构。如果行的列数不匹配或引号格式错误，将标记错误行。",
  "steps_csv-formatter_3": "复制或下载",
  "steps_csv-formatter_3Desc": "复制格式化后的CSV或下载为清理过的.csv文件。可直接导入Excel、Google Sheets、数据库或数据分析工具。",

  "steps_xml-formatter_1": "粘贴您的XML",
  "steps_xml-formatter_1Desc": "将压缩或混乱的XML粘贴到输入区域。格式化工具处理嵌套元素、属性、CDATA节和处理指令。",
  "steps_xml-formatter_2": "格式化并验证",
  "steps_xml-formatter_2Desc": "点击"格式化"进行缩进美化。验证会捕获标签不匹配、未闭合元素和结构错误，并提供清晰的消息。",
  "steps_xml-formatter_3": "复制格式化后的XML",
  "steps_xml-formatter_3Desc": "点击"复制"获取清晰、缩进正确的XML。非常适合审查配置文件、SOAP响应或任何基于XML的数据格式。",

  "steps_yaml-formatter_1": "粘贴您的YAML",
  "steps_yaml-formatter_1Desc": "将YAML内容粘贴到输入区域。格式化工具处理嵌套映射、序列、锚点、别名和多行字符串。",
  "steps_yaml-formatter_2": "格式化并验证",
  "steps_yaml-formatter_2Desc": "点击"格式化"规范缩进和间距。验证会捕获语法错误，如错误的缩进、无效字符或重复的键。",
  "steps_yaml-formatter_3": "复制格式化后的YAML",
  "steps_yaml-formatter_3Desc": "点击"复制"获取清理后的YAML输出。非常适合审查Kubernetes清单、CI/CD配置、Docker Compose文件或任何基于YAML的配置。",

  "steps_markdown-formatter_1": "编写或粘贴Markdown",
  "steps_markdown-formatter_1Desc": "在编辑器中输入Markdown或粘贴现有内容。实时预览面板会在您输入时显示格式化输出的效果。",
  "steps_markdown-formatter_2": "预览和格式化",
  "steps_markdown-formatter_2Desc": "在编辑和预览模式之间切换。格式化工具支持标题、粗体、斜体、代码块、表格、链接、图片和任务列表。",
  "steps_markdown-formatter_3": "复制或导出",
  "steps_markdown-formatter_3Desc": "复制渲染后的HTML或原始Markdown。用于README文件、文档、博客文章、论坛内容或任何基于Markdown的写作。",

  // ────────────────────────────────────────────────────
  //  Utility Tools
  // ────────────────────────────────────────────────────
  "steps_word-counter_1": "输入您的文本",
  "steps_word-counter_1Desc": "在输入区域输入或粘贴您的文本。计数器在您输入时实时更新——无需点击按钮。",
  "steps_word-counter_2": "查看详细统计",
  "steps_word-counter_2Desc": "查看字数、字符数（含空格和不含空格）、句子数、段落数和预估阅读时间——全部实时更新。",
  "steps_word-counter_3": "复制或清除",
  "steps_word-counter_3Desc": "复制全部文本或单独统计数据。清除输入区域重新开始。非常适合论文写作、SEO内容规划或翻译工作。",

  "steps_qr-code_1": "输入您的数据",
  "steps_qr-code_1Desc": "输入或粘贴要编码进二维码的网址、文本或数据。二维码可以存储网址、纯文本、联系信息或Wi-Fi凭据。",
  "steps_qr-code_2": "自定义外观",
  "steps_qr-code_2Desc": "调整大小、前景色和背景色以及纠错级别。更高的纠错级别使二维码对损坏或遮挡更具抵抗力。",
  "steps_qr-code_3": "下载二维码",
  "steps_qr-code_3Desc": "点击"下载"将二维码保存为PNG图片。可用于印刷材料、标识牌、名片或数字分享。",

  "steps_password-generator_1": "设置密码要求",
  "steps_password-generator_1Desc": "选择密码长度和字符类型——大写字母、小写字母、数字和符号。包含所有字符类型的长密码提供最高安全性。",
  "steps_password-generator_2": "生成密码",
  "steps_password-generator_2Desc": "点击"生成"使用浏览器的安全随机数生成器创建密码学随机密码。每次生成完全独立。",
  "steps_password-generator_3": "复制并安全存储",
  "steps_password-generator_3Desc": "点击"复制"获取密码。直接粘贴到密码管理器——切勿将密码存储在纯文本文件或通过电子邮件发送给自己。",

  // ────────────────────────────────────────────────────
  //  Time & Network Tools
  // ────────────────────────────────────────────────────
  "steps_timezone-converter_1": "查看并添加城市",
  "steps_timezone-converter_1Desc": "默认城市显示主要时区。搜索并添加任意35+个世界城市到您的视图。每个卡片显示每秒更新的当前本地时间。",
  "steps_timezone-converter_2": "跨时区对比时间",
  "steps_timezone-converter_2Desc": "查看所有已选城市的实时时钟。切换自定义日期/时间来规划会议——设置候选时间并查看每个城市当前是几点。",
  "steps_timezone-converter_3": "查找会议时间窗口",
  "steps_timezone-converter_3Desc": "使用概览视图识别所有参与者在合理工作时间的重叠窗口。移除不需要的城市以获得更清晰的视图。",

  "steps_ip-lookup_1": "输入IP地址",
  "steps_ip-lookup_1Desc": "输入要查询的IP地址，或留空自动检测您自己的IP。页面加载时会自动检测您的IP以立即获取结果。",
  "steps_ip-lookup_2": "查看位置数据",
  "steps_ip-lookup_2Desc": "结果展示国家、城市、ISP、ASN、坐标和时区。所有处理均在浏览器中完成，不存储或追踪任何个人数据。",
  "steps_ip-lookup_3": "在地图上探索",
  "steps_ip-lookup_3Desc": "点击"在Google Maps上查看"以查看IP的大致地理位置。点击任意字段复制，用于日志或文档。",

  // ────────────────────────────────────────────────────
  //  OCR & Data Generation Tools
  // ────────────────────────────────────────────────────
  "steps_ocr-tool_1": "上传含文字的图片",
  "steps_ocr-tool_1Desc": "选择包含文字的图片——截图、扫描文档或标志照片。支持格式：JPEG、PNG、WebP。最大文件大小：50MB。",
  "steps_ocr-tool_2": "选择语言并处理",
  "steps_ocr-tool_2Desc": "选择文本语言（英语、简体中文或繁体中文）。点击"提取文字"。首次运行会下载语言数据（约10-20MB）——后续运行更快。",
  "steps_ocr-tool_3": "复制或下载文字",
  "steps_ocr-tool_3Desc": "检查提取的文字，在编辑器中进行修正，然后复制到剪贴板或下载为.txt文件。文本区域可编辑，方便快速修正。",

  "steps_us-address-generator_1": "选择州或使用随机",
  "steps_us-address-generator_1Desc": "从下拉菜单选择特定美国州份，或保留"随机"以获得地理多样性。免税州（阿拉斯加、特拉华、蒙大拿、新罕布什尔、俄勒冈）标有★。",
  "steps_us-address-generator_2": "生成地址",
  "steps_us-address-generator_2Desc": "点击"生成"创建完整美国地址包——全名、性别、街道地址、城市、州、邮政编码和带有真实区号的州匹配电话号码。",
  "steps_us-address-generator_3": "复制单个字段或全部",
  "steps_us-address-generator_3Desc": "点击任意字段仅复制该值到剪贴板。使用"复制全部"获取完整格式化地址。每次复制有提示通知确认。地图通过OpenStreetMap显示城市位置。",

  // ────────────────────────────────────────────────────
  //  Calculator Tools
  // ────────────────────────────────────────────────────
  "steps_base-convert_1": "输入一个数字",
  "steps_base-convert_1Desc": "输入任意进制的数字（二进制、八进制、十进制或十六进制）。转换器从您的数字格式自动检测输入进制。",
  "steps_base-convert_2": "选择目标进制",
  "steps_base-convert_2Desc": "同时查看所有常用进制的转换结果——二进制（基2）、八进制（基8）、十进制（基10）和十六进制（基16）。",
  "steps_base-convert_3": "复制任意结果",
  "steps_base-convert_3Desc": "点击任意输出将其复制。非常适合编程任务、网络地址、颜色代码转换或计算机科学教育。",

  "steps_random-number_1": "设置范围",
  "steps_random-number_1Desc": "为您的随机数范围输入最小值和最大值。您可以生成JavaScript支持的任何范围内的整数或小数。",
  "steps_random-number_2": "生成数字",
  "steps_random-number_2Desc": "点击"生成"在您指定的范围内生成真正随机的数字。可生成单个值或一次性生成多个数字用于批量使用。",
  "steps_random-number_3": "复制结果",
  "steps_random-number_3Desc": "点击"复制"获取生成的数字。用于骰子投掷、抽奖模拟、随机测试数据、游戏机制或统计抽样。",

  "steps_binary-calculator_1": "输入二进制数字",
  "steps_binary-calculator_1Desc": "在输入字段中输入二进制数字（0和1）或十进制数字。计算器同时显示两种表示形式以便于理解。",
  "steps_binary-calculator_2": "选择运算",
  "steps_binary-calculator_2Desc": "选择运算——加法、减法、乘法或除法。结果同时以二进制和十进制格式显示。",
  "steps_binary-calculator_3": "复制结果",
  "steps_binary-calculator_3Desc": "点击"复制"获取二进制或十进制格式的结果。非常适合计算机体系结构课程、位级调试或学习二进制算术。",

  "steps_boolean-calculator_1": "输入布尔表达式",
  "steps_boolean-calculator_1Desc": "使用AND（∧）、OR（∨）、NOT（¬）、XOR（⊕）和括号分组输入逻辑表达式。使用0/1或true/false作为输入值。",
  "steps_boolean-calculator_2": "计算表达式",
  "steps_boolean-calculator_2Desc": "点击"计算"得出布尔结果。同时生成真值表，展示所有可能的输入组合及其输出。",
  "steps_boolean-calculator_3": "复制结果或真值表",
  "steps_boolean-calculator_3Desc": "复制结果值或完整真值表。对数字逻辑设计、编程条件判断和形式逻辑学习至关重要。",

  "steps_bitwise-calculator_1": "输入您的数字",
  "steps_bitwise-calculator_1Desc": "以十进制、十六进制（0x前缀）或二进制（0b前缀）输入两个数字。两个值同时以三种表示形式显示以便验证。",
  "steps_bitwise-calculator_2": "选择位运算",
  "steps_bitwise-calculator_2Desc": "选择AND（&）、OR（|）、XOR（^）、NOT（~）、左移（<<）或右移（>>）。结果即时以十进制、十六进制和二进制更新。",
  "steps_bitwise-calculator_3": "复制结果",
  "steps_bitwise-calculator_3Desc": "点击任意输出格式复制。对底层编程、嵌入式系统、标志操作和性能优化至关重要。",

  "steps_ip-calculator_1": "输入IP地址和子网",
  "steps_ip-calculator_1Desc": "输入带CIDR表示法的IP地址（例如192.168.1.0/24）或带子网掩码。计算器自动检测输入格式。",
  "steps_ip-calculator_2": "查看子网详情",
  "steps_ip-calculator_2Desc": "查看网络地址、广播地址、可用主机范围、总主机数、子网掩码和通配符掩码——全部即时计算。",
  "steps_ip-calculator_3": "复制任意值",
  "steps_ip-calculator_3Desc": "点击任意字段复制。对网络工程师、系统管理员、DevOps以及任何配置防火墙、路由或VLAN的人员至关重要。",

  "steps_time-diff_1": "输入两个日期或时间",
  "steps_time-diff_1Desc": "使用日期时间选择器输入开始日期/时间和结束日期/时间。支持过去和未来的日期，适用于任何计算方向。",
  "steps_time-diff_2": "计算差值",
  "steps_time-diff_2Desc": "点击"计算"查看两个日期之间的精确时间间隔。结果细分为年、月、天、小时、分钟和秒。",
  "steps_time-diff_3": "复制结果",
  "steps_time-diff_3Desc": "点击"复制"获取时间差。可用于项目规划、年龄计算、倒计时器、SLA追踪和活动日程安排。",

  "steps_bmi-calculator_1": "输入您的身体数据",
  "steps_bmi-calculator_1Desc": "输入您的体重和身高。可在公制（kg/cm）和英制（lbs/ft/in）之间切换。您的数据保持私密——所有计算均在本地完成。",
  "steps_bmi-calculator_2": "查看您的BMI结果",
  "steps_bmi-calculator_2Desc": "您的BMI分数和体重类别（偏瘦、正常、超重或肥胖）即时显示。可视化刻度标尺显示您的结果在区间中的位置。",
  "steps_bmi-calculator_3": "理解您的结果",
  "steps_bmi-calculator_3Desc": "查看BMI类别描述。请注意BMI是一种筛查工具而非诊断手段——请咨询医疗专业人员获取个性化健康建议。",

  "steps_loan-calculator_1": "输入贷款详情",
  "steps_loan-calculator_1Desc": "输入贷款金额、年利率和贷款期限（年或月）。所有计算在您的浏览器本地运行，保护隐私。",
  "steps_loan-calculator_2": "查看还款明细",
  "steps_loan-calculator_2Desc": "查看您的月供、总利息支出、总还款额和完整还款计划表。调整任意输入即时查看更新的结果。",
  "steps_loan-calculator_3": "复制或使用结果",
  "steps_loan-calculator_3Desc": "复制月供金额或完整还款计划。用于按揭规划、车贷对比、个人贷款评估或财务教育。",

  "steps_matrix-calculator_1": "输入矩阵数据",
  "steps_matrix-calculator_1Desc": "通过输入数值或使用网格编辑器输入矩阵。支持从1×1到10×10的尺寸。如果运算涉及两个矩阵，请定义两个矩阵。",
  "steps_matrix-calculator_2": "选择运算",
  "steps_matrix-calculator_2Desc": "选择加法、减法、乘法、转置、行列式或求逆。结果矩阵即时显示所有计算值。",
  "steps_matrix-calculator_3": "复制或使用结果",
  "steps_matrix-calculator_3Desc": "复制单个值或整个结果矩阵。对线性代数课程、3D图形编程和工程计算至关重要。",

  "steps_string-analyzer_1": "输入您的字符串",
  "steps_string-analyzer_1Desc": "将任意文本输入或粘贴到输入区域。分析器即时处理，无需点击按钮——所有数据实时更新。",
  "steps_string-analyzer_2": "查看分析结果",
  "steps_string-analyzer_2Desc": "查看字符数、单词数、字节长度（UTF-8）、行数、熵值、唯一字符数和字符频率分布。",
  "steps_string-analyzer_3": "复制统计数据",
  "steps_string-analyzer_3Desc": "点击任意统计数据复制。对开发者调试编码问题、SEO内容优化、密码熵检查和文本处理非常有用。",

  "steps_date-calculator_1": "选择起始日期",
  "steps_date-calculator_1Desc": "使用日期选择器选择基准日期。可使用今天或任意过去/未来的日期作为计算的起点。",
  "steps_date-calculator_2": "添加或减去时间",
  "steps_date-calculator_2Desc": "输入要添加或减去的天数、周数、月数或年数。从控件中选择操作和时间单位。",
  "steps_date-calculator_3": "查看并复制结果",
  "steps_date-calculator_3Desc": "计算后的日期即时显示。复制结果用于项目截止日期、交付预估、订阅续订或活动规划。",

  // ────────────────────────────────────────────────────
  //  Finance & Unit Conversion Tools
  // ────────────────────────────────────────────────────
  "steps_bank-bin_1": "输入BIN/IIN号码",
  "steps_bank-bin_1Desc": "输入信用卡或借记卡的前6至8位数字（银行识别码）。BIN识别发卡银行、卡品牌和卡类型。",
  "steps_bank-bin_2": "查询发卡行",
  "steps_bank-bin_2Desc": "点击"查询"获取发卡行、品牌（Visa、Mastercard等）、卡类型（信用卡/借记卡/预付卡）和发卡国家。",
  "steps_bank-bin_3": "复制结果",
  "steps_bank-bin_3Desc": "点击任意字段复制。对支付处理验证、欺诈检测和了解银行卡支付基础设施非常有用。",

  "steps_currency-converter_1": "输入金额和币种",
  "steps_currency-converter_1Desc": "输入金额，从170+种世界货币中选择来源和目标币种。汇率实时获取以确保准确转换。",
  "steps_currency-converter_2": "查看转换结果",
  "steps_currency-converter_2Desc": "转换后的金额基于当前汇率即时显示。同时显示使用的汇率和最后更新时间，确保透明度。",
  "steps_currency-converter_3": "复制结果",
  "steps_currency-converter_3Desc": "点击"复制"获取转换后的金额。注意：显示的汇率仅供参考——在进行大额交易前请务必与您的银行确认。",

  "steps_unit-converter_1": "选择单位类别",
  "steps_unit-converter_1Desc": "选择您的计量类型：长度、重量或温度。使用顶部的选项卡按钮切换类别。",
  "steps_unit-converter_2": "输入数值和来源单位",
  "steps_unit-converter_2Desc": "输入您的数值并从下拉菜单选择来源单位。完整的转换表实时更新，同时显示所有单位。",
  "steps_unit-converter_3": "查看或复制任意值",
  "steps_unit-converter_3Desc": "所有单位转换结果同时显示在清晰的表格中。点击任意结果复制。非常适合工程、烹饪、旅行和科学研究。",

  // ────────────────────────────────────────────────────
  //  Text Encoding & Utilities
  // ────────────────────────────────────────────────────
  "steps_text-encoder_1": "输入您的文本",
  "steps_text-encoder_1Desc": "在输入区域输入或粘贴文本。编码器支持多种编码格式，满足不同的使用场景和编程需求。",
  "steps_text-encoder_2": "选择编码类型",
  "steps_text-encoder_2Desc": "选择编码——URL编码/解码、HTML实体、Base64、Unicode转义序列或二进制。并排查看编码和解码结果。",
  "steps_text-encoder_3": "复制编码后的文本",
  "steps_text-encoder_3Desc": "点击"复制"获取编码或解码后的结果。非常适合网页开发、API参数编码和数据转换任务。",

  "steps_online-notepad_1": "开始输入您的笔记",
  "steps_online-notepad_1Desc": "在编辑器中开始书写——内容每500毫秒自动保存到浏览器的localStorage。关闭标签页再回来——您的笔记持续保留。",
  "steps_online-notepad_2": "使用Markdown和预览",
  "steps_online-notepad_2Desc": "使用Markdown语法格式化（标题、粗体、列表、代码）。切换预览模式查看渲染输出。可在深色和浅色编辑器主题间切换。",
  "steps_online-notepad_3": "导出您的作品",
  "steps_online-notepad_3Desc": "将笔记下载为.txt文件或导出为带自动换行的PDF。无需账号——所有内容保留在您的设备上。",

  // ────────────────────────────────────────────────────
  //  Audio Tools
  // ────────────────────────────────────────────────────
  "steps_audio-trim_1": "上传您的音频文件",
  "steps_audio-trim_1Desc": "选择要裁剪的音频文件（MP3、WAV、OGG、AAC、FLAC）。波形图可视化您的音频，您可以精确看到裁剪位置。",
  "steps_audio-trim_2": "设置裁剪点",
  "steps_audio-trim_2Desc": "拖动波形图上的开始和结束手柄选择要保留的部分。在确认前预览裁剪片段，确保听起来正确。",
  "steps_audio-trim_3": "裁剪并下载",
  "steps_audio-trim_3Desc": "点击"裁剪"将音频剪切到选定的范围。下载裁剪后的文件——非常适合铃声、播客片段和移除不需要的部分。",

  "steps_audio-split_1": "上传您的音频文件",
  "steps_audio-split_1Desc": "选择要分割的长音频文件。波形图显示帮助您识别音频内容中的自然断点。",
  "steps_audio-split_2": "选择分割方式",
  "steps_audio-split_2Desc": "按固定时长分割（每N分钟）、按相等片段数量分割，或在波形图上手动放置分割标记。",
  "steps_audio-split_3": "分割并下载",
  "steps_audio-split_3Desc": "点击"分割"划分您的音频。所有片段单独下载或打包为ZIP。非常适合将长录音分解为可管理的片段。",

  "steps_audio-volume_1": "上传您的音频文件",
  "steps_audio-volume_1Desc": "选择要调整的音频文件。支持格式：MP3、WAV、OGG、AAC、FLAC。文件在整个过程中保留在您的设备上。",
  "steps_audio-volume_2": "调整音量级别",
  "steps_audio-volume_2Desc": "拖动音量滑块增强（高于100%）或降低（低于100%）响度。点击"预览"在处理前试听新级别样本。",
  "steps_audio-volume_3": "应用并下载",
  "steps_audio-volume_3Desc": "点击"应用"生成音量调整后的文件。下载结果——非常适合统一各音轨的音量级别或修复录音声音过小的问题。",

  "steps_audio-convert_1": "上传您的音频文件",
  "steps_audio-convert_1Desc": "选择要转换的音频文件。输入格式：MP3、WAV、OGG、AAC、FLAC、M4A。您的文件完全在浏览器中处理。",
  "steps_audio-convert_2": "选择输出格式和质量",
  "steps_audio-convert_2Desc": "选择目标格式（MP3、WAV、OGG、AAC、FLAC）和比特率。MP3 320 kbps提供最佳质量体积比。WAV可获得无损质量。",
  "steps_audio-convert_3": "转换并下载",
  "steps_audio-convert_3Desc": "点击"转换"将音频转码为新格式。下载转换后的文件——适用于任何设备、平台或编辑软件。",

  "steps_audio-merge_1": "上传您的音频文件",
  "steps_audio-merge_1Desc": "选择两个或更多音频文件进行合并。按播放顺序拖拽重新排序。所有文件必须为相同格式。",
  "steps_audio-merge_2": "排列顺序",
  "steps_audio-merge_2Desc": "拖动重新排序文件。预览合并后的总时长。如果需要，在合并前从列表中移除文件。",
  "steps_audio-merge_3": "合并并下载",
  "steps_audio-merge_3Desc": "点击"合并"将所有文件合并为单个音轨。下载合并后的文件——非常适合播客剧集、混音带或音频汇编。",

  "steps_audio-denoise_1": "上传您带噪音的音频",
  "steps_audio-denoise_1Desc": "选择有背景噪音的音频文件——嘶嘶声、嗡嗡声、风扇噪音或静电噪音。文件在浏览器中加载以进行本地噪音特征分析。",
  "steps_audio-denoise_2": "调整降噪强度",
  "steps_audio-denoise_2Desc": "设置降噪强度。从适中级别开始，避免产生伪影。较高级别可去除更多噪音，但可能影响语音清晰度。预览结果。",
  "steps_audio-denoise_3": "处理并下载",
  "steps_audio-denoise_3Desc": "点击"降噪"清洁您的音频。下载处理后的文件——非常适合播客、语音录音、视频配音和会议录音。",

  // ────────────────────────────────────────────────────
  //  Image Editing Tools
  // ────────────────────────────────────────────────────
  "steps_add-watermark_1": "上传您的图片",
  "steps_add-watermark_1Desc": "选择要添加水印的图片，点击上传区域或拖拽到页面上。文件在浏览器中本地处理——永远不会离开您的设备。",
  "steps_add-watermark_2": "配置水印设置",
  "steps_add-watermark_2Desc": "输入水印文字，调整字体大小、不透明度、旋转角度和位置。实时预览水印效果，满意后再应用。",
  "steps_add-watermark_3": "应用并下载",
  "steps_add-watermark_3Desc": "点击"添加水印"将水印应用到您的图片上。下载带水印的图片——非常适合版权保护和品牌宣传。",

  "steps_drawing-canvas_1": "上传图片或新建画布",
  "steps_drawing-canvas_1Desc": "上传现有图片进行标注，或从零开始创建空白画布。支持多种画布尺寸预设，方便不同场景使用。",
  "steps_drawing-canvas_2": "使用绘图工具",
  "steps_drawing-canvas_2Desc": "选择画笔、形状、文字工具或橡皮擦。调整颜色、线条粗细和透明度。支持撤销和重做，自由创作。",
  "steps_drawing-canvas_3": "导出您的作品",
  "steps_drawing-canvas_3Desc": "点击"下载"将绘画保存为PNG或JPG图片。非常适合快速标注、草图绘制或教学图示制作。",

  "steps_image-batch_1": "上传您的图片",
  "steps_image-batch_1Desc": "一次选择多张图片进行批量处理。支持拖拽或点击上传。所有文件在您的设备本地处理——无需上传到服务器。",
  "steps_image-batch_2": "选择批量操作",
  "steps_image-batch_2Desc": "选择批量操作类型——调整大小、转换格式、压缩或添加水印。为每项操作设置统一的参数应用到所有图片。",
  "steps_image-batch_3": "处理并批量下载",
  "steps_image-batch_3Desc": "点击"开始处理"对全部图片应用所选操作。处理完成后可逐个下载或打包为ZIP一次性下载所有结果。",

  // ────────────────────────────────────────────────────
  //  Game & Test Tools
  // ────────────────────────────────────────────────────
  "steps_aim-trainer_1": "配置训练模式",
  "steps_aim-trainer_1Desc": "选择目标大小、出现速度和训练时长。如果您是瞄准训练的新手，建议从较大的目标和较慢的出现速度开始。",
  "steps_aim-trainer_2": "点击目标",
  "steps_aim-trainer_2Desc": "尽可能快地点击出现的每个目标。您的准确率、每秒命中数和总分数实时追踪。",
  "steps_aim-trainer_3": "查看您的表现",
  "steps_aim-trainer_3Desc": "查看您的最终分数、准确率百分比和命中次数。追踪多次训练的提升情况。坚持每天练习可获得最佳效果。",

  "steps_cps-test_1": "准备开始点击",
  "steps_cps-test_1Desc": "将手舒适地放在鼠标上。测试测量您在选定时间窗口内能点击多少次。",
  "steps_cps-test_2": "开始点击",
  "steps_cps-test_2Desc": "在测试区域内以最快速度点击任意位置。计时器倒计时，您的CPS（每秒点击数）实时更新。",
  "steps_cps-test_3": "查看并对比结果",
  "steps_cps-test_3Desc": "显示您的最终CPS分数及表现评级。与全球平均值对比。重复测试以提升——不同的点击技巧会产生不同的结果。",

  "steps_reaction-test_1": "等待信号",
  "steps_reaction-test_1Desc": "观察测试区域。它将在随机时间间隔后从红色变为绿色。不要在变绿之前点击——那将算作抢跑。",
  "steps_reaction-test_2": "变绿时点击",
  "steps_reaction-test_2Desc": "一旦区域变绿，以最快速度点击。您的反应时间以毫秒为单位，从颜色变化到点击进行测量。",
  "steps_reaction-test_3": "查看您的反应时间",
  "steps_reaction-test_3Desc": "您的反应时间以毫秒显示。人类平均视觉反应时间为200-250毫秒。尝试多次——第一次通常较慢。",

  // ────────────────────────────────────────────────────
  //  Sensitivity Converter (General & Per-Game)
  // ────────────────────────────────────────────────────
  "steps_sensitivity-converter_1": "选择您的游戏和设置",
  "steps_sensitivity-converter_1Desc": "选择您的游戏，输入当前灵敏度、鼠标DPI以及任何游戏特定设置，如FOV或瞄准类型（腰射/ADS/瞄准镜）。",
  "steps_sensitivity-converter_2": "输入目标值",
  "steps_sensitivity-converter_2Desc": "选择目标游戏或输入期望的设置。转换器计算等效灵敏度，让您在不同游戏间保持一致的瞄准手感。",
  "steps_sensitivity-converter_3": "复制并应用",
  "steps_sensitivity-converter_3Desc": "复制转换后的灵敏度值并粘贴到您的游戏设置中。在游戏内微调±10%以找到您的个人舒适区间。",

  "steps_valorant-sensitivity-converter_1": "输入您的Valorant灵敏度",
  "steps_valorant-sensitivity-converter_1Desc": "输入您当前的Valorant灵敏度值。此数值位于设置→常规→鼠标→灵敏度：瞄准中。",
  "steps_valorant-sensitivity-converter_2": "选择目标游戏",
  "steps_valorant-sensitivity-converter_2Desc": "选择您要转换到的游戏。计算器使用经过验证的数学公式，在不同游戏间匹配您的360°旋转距离。",
  "steps_valorant-sensitivity-converter_3": "复制并在游戏内应用",
  "steps_valorant-sensitivity-converter_3Desc": "复制转换后的灵敏度并粘贴到目标游戏设置中。更改灵敏度后在死斗模式中热身10-15分钟。",

  "steps_cs2-sensitivity-converter_1": "输入您的CS2灵敏度",
  "steps_cs2-sensitivity-converter_1Desc": "输入您的CS2灵敏度，位于设置→键盘/鼠标→鼠标灵敏度。这是您跨游戏转换的基准值。",
  "steps_cs2-sensitivity-converter_2": "选择目标游戏",
  "steps_cs2-sensitivity-converter_2Desc": "选择目标游戏。转换器将您的CS2 360°旋转距离匹配到目标游戏中的等效设置。",
  "steps_cs2-sensitivity-converter_3": "复制并微调",
  "steps_cs2-sensitivity-converter_3Desc": "复制结果，在游戏内应用，然后根据手感微调±10%。不同游戏引擎和FOV会影响感知灵敏度，即使数学上已匹配。",

  "steps_apex-sensitivity-converter_1": "输入您的Apex Legends灵敏度",
  "steps_apex-sensitivity-converter_1Desc": "输入您的Apex Legends鼠标灵敏度。位于设置→鼠标/键盘→鼠标灵敏度。如相关，请输入您的FOV和ADS倍率。",
  "steps_apex-sensitivity-converter_2": "选择目标游戏",
  "steps_apex-sensitivity-converter_2Desc": "选择要转换到的游戏。Apex较快的移动速度意味着转换后的灵敏度手感可能不同——给自己几场比赛适应。",
  "steps_apex-sensitivity-converter_3": "复制并在游戏内测试",
  "steps_apex-sensitivity-converter_3Desc": "在目标游戏中应用转换后的数值。在训练场或练习模式中测试，然后再进入竞技比赛。",

  "steps_overwatch2-sensitivity-converter_1": "输入您的守望先锋2灵敏度",
  "steps_overwatch2-sensitivity-converter_1Desc": "输入您的OW2灵敏度，位于选项→控制→鼠标→灵敏度。请记下您的FOV设置，因为它会影响转换。",
  "steps_overwatch2-sensitivity-converter_2": "选择目标游戏",
  "steps_overwatch2-sensitivity-converter_2Desc": "选择目标游戏。守望先锋2较快的节奏和垂直瞄准需求意味着转换后的灵敏度可能需要微调。",
  "steps_overwatch2-sensitivity-converter_3": "复制并应用",
  "steps_overwatch2-sensitivity-converter_3Desc": "在目标游戏中应用转换后的灵敏度。花时间在练习靶场适应不同的游戏手感和移动速度。",

  "steps_r6siege-sensitivity-converter_1": "输入您的彩虹六号：围攻灵敏度",
  "steps_r6siege-sensitivity-converter_1Desc": "输入您的R6 Siege灵敏度。位于选项→控制→鼠标灵敏度。包含您的ADS灵敏度设置以获得更准确的转换。",
  "steps_r6siege-sensitivity-converter_2": "选择目标游戏",
  "steps_r6siege-sensitivity-converter_2Desc": "选择要转换到的游戏。R6 Siege较慢、有条不紊的瞄准与快节奏射击游戏不同——给自己时间适应新游戏的节奏。",
  "steps_r6siege-sensitivity-converter_3": "复制并练习",
  "steps_r6siege-sensitivity-converter_3Desc": "应用转换后的数值。在猎杀恐怖份子或训练场中练习，用新的灵敏度设置建立肌肉记忆。",

  "steps_pubg-sensitivity-converter_1": "输入您的PUBG灵敏度",
  "steps_pubg-sensitivity-converter_1Desc": "输入您的PUBG通用灵敏度，如果您使用独立瞄准镜灵敏度也一并输入。PUBG对每个放大倍率都有单独的设置。",
  "steps_pubg-sensitivity-converter_2": "映射到目标游戏",
  "steps_pubg-sensitivity-converter_2Desc": "选择要转换到的游戏。PUBG的多个瞄准镜灵敏度可以单独转换，以匹配目标游戏中的每个放大倍率。",
  "steps_pubg-sensitivity-converter_3": "复制并调整",
  "steps_pubg-sensitivity-converter_3Desc": "应用转换后的灵敏度。PUBG真实的枪械手感意味着与街机射击游戏的感觉不同——先在训练模式中测试。",

  "steps_fortnite-sensitivity-converter_1": "输入您的堡垒之夜灵敏度",
  "steps_fortnite-sensitivity-converter_1Desc": "输入您的堡垒之夜鼠标灵敏度，位于设置→鼠标灵敏度。包含您的瞄准和瞄准镜灵敏度以获得完整转换。",
  "steps_fortnite-sensitivity-converter_2": "选择目标游戏",
  "steps_fortnite-sensitivity-converter_2Desc": "选择要转换到的游戏。堡垒之夜的第三人称视角和建造机制使得瞄准手感与第一人称射击游戏不同。",
  "steps_fortnite-sensitivity-converter_3": "复制并练习",
  "steps_fortnite-sensitivity-converter_3Desc": "应用转换后的灵敏度。建造和编辑灵敏度可能需要单独调整——首先专注于瞄准手感。",

  "steps_cod-sensitivity-converter_1": "输入您的使命召唤灵敏度",
  "steps_cod-sensitivity-converter_1Desc": "输入您的CoD鼠标灵敏度。位于设置→控制器/鼠标→鼠标灵敏度。同时记下您的ADS灵敏度倍率。",
  "steps_cod-sensitivity-converter_2": "选择目标游戏",
  "steps_cod-sensitivity-converter_2Desc": "选择目标游戏。CoD较短的击杀时间意味着精确瞄准的重要性不如战术射击游戏——转换后的灵敏度手感可能略有不同。",
  "steps_cod-sensitivity-converter_3": "复制并调整",
  "steps_cod-sensitivity-converter_3Desc": "应用转换后的数值。先在休闲模式打几局适应，然后再进入排位或竞技模式。",

  "steps_tarkov-sensitivity-converter_1": "输入您的塔科夫灵敏度",
  "steps_tarkov-sensitivity-converter_1Desc": "输入您的逃离塔科夫鼠标灵敏度，位于设置→控制→鼠标灵敏度。包含您的ADS灵敏度以获得准确转换。",
  "steps_tarkov-sensitivity-converter_2": "选择目标游戏",
  "steps_tarkov-sensitivity-converter_2Desc": "选择要转换到的游戏。塔科夫真实的武器操作和独立的腰射/ADS灵敏度使得转换比街机射击游戏更复杂。",
  "steps_tarkov-sensitivity-converter_3": "复制并离线测试",
  "steps_tarkov-sensitivity-converter_3Desc": "应用转换后的灵敏度。在离线模式或Scav跑刀中测试，避免用不熟悉的灵敏度设置冒险携带PMC装备。",

  "steps_bf2042-sensitivity-converter_1": "输入您的战地风云2042灵敏度",
  "steps_bf2042-sensitivity-converter_1Desc": "输入您的BF2042鼠标灵敏度，位于设置→鼠标和键盘→鼠标灵敏度。记下每个放大倍率的士兵变焦灵敏度。",
  "steps_bf2042-sensitivity-converter_2": "选择目标游戏",
  "steps_bf2042-sensitivity-converter_2Desc": "选择目标游戏。BF2042的载具玩法和大尺寸地图意味着步兵和载具战斗对灵敏度需求不同。",
  "steps_bf2042-sensitivity-converter_3": "复制并应用",
  "steps_bf2042-sensitivity-converter_3Desc": "应用转换后的数值。在Portal模式或对抗BOT中测试，找到您的舒适区间后再进行竞技多人游戏。",

  "steps_halo-sensitivity-converter_1": "输入您的光环灵敏度",
  "steps_halo-sensitivity-converter_1Desc": "输入您的光环无限鼠标灵敏度。位于设置→鼠标→鼠标灵敏度。包含瞄准镜武器的缩放级别灵敏度。",
  "steps_halo-sensitivity-converter_2": "选择目标游戏",
  "steps_halo-sensitivity-converter_2Desc": "选择要转换到的游戏。光环较长的击杀时间更看重跟枪瞄准——转换后的灵敏度应优先保证平滑跟枪而非甩枪速度。",
  "steps_halo-sensitivity-converter_3": "复制并测试",
  "steps_halo-sensitivity-converter_3Desc": "应用转换后的灵敏度。在学院或BOT比赛中练习跟枪瞄准，然后再进入排位竞技场。",

  "steps_thefinals-sensitivity-converter_1": "输入您的THE FINALS灵敏度",
  "steps_thefinals-sensitivity-converter_1Desc": "输入您的THE FINALS鼠标灵敏度，位于设置→鼠标→灵敏度。包含ADS灵敏度倍率和FOV设置。",
  "steps_thefinals-sensitivity-converter_2": "选择目标游戏",
  "steps_thefinals-sensitivity-converter_2Desc": "选择要转换到的游戏。THE FINALS快速的移动和破坏机制创造了独特的瞄准手感——转换后的灵敏度可能需要调整。",
  "steps_thefinals-sensitivity-converter_3": "复制并微调",
  "steps_thefinals-sensitivity-converter_3Desc": "应用转换后的数值。在Quick Cash模式中测试，这是低风险环境，适合在锦标赛之前调校灵敏度。",

  "steps_warframe-sensitivity-converter_1": "输入您的星际战甲灵敏度",
  "steps_warframe-sensitivity-converter_1Desc": "输入您的Warframe鼠标灵敏度，位于选项→控制→鼠标灵敏度。Warframe的第三人称快速移动与标准射击游戏不同。",
  "steps_warframe-sensitivity-converter_2": "选择目标游戏",
  "steps_warframe-sensitivity-converter_2Desc": "选择要转换到的游戏。Warframe的跑酷和技能驱动玩法意味着瞄准手感与传统射击游戏的转换效果不同。",
  "steps_warframe-sensitivity-converter_3": "复制并测试",
  "steps_warframe-sensitivity-converter_3Desc": "应用转换后的灵敏度。花时间在低等级任务中适应新游戏的瞄准机制和移动风格。",

  // ────────────────────────────────────────────────────
  //  Cross-Game Sensitivity Converters (Direct Pair)
  // ────────────────────────────────────────────────────
  "steps_cs2-to-valorant-sensitivity_1": "输入您的CS2灵敏度",
  "steps_cs2-to-valorant-sensitivity_1Desc": "输入您的CS2灵敏度值。标准转换公式为：CS2灵敏度 ÷ 3.18 = Valorant灵敏度。",
  "steps_cs2-to-valorant-sensitivity_2": "查看转换后的数值",
  "steps_cs2-to-valorant-sensitivity_2Desc": "您的Valorant等效灵敏度即时显示。同时计算腰射和变焦灵敏度，提供完整转换。",
  "steps_cs2-to-valorant-sensitivity_3": "复制并在Valorant中应用",
  "steps_cs2-to-valorant-sensitivity_3Desc": "复制结果并粘贴到Valorant设置→常规→鼠标→灵敏度：瞄准中。微调±10%以匹配个人手感。",

  "steps_valorant-to-cs2-sensitivity_1": "输入您的Valorant灵敏度",
  "steps_valorant-to-cs2-sensitivity_1Desc": "输入您的Valorant瞄准灵敏度。公式为：Valorant灵敏度 × 3.18 = CS2灵敏度。",
  "steps_valorant-to-cs2-sensitivity_2": "查看CS2等效值",
  "steps_valorant-to-cs2-sensitivity_2Desc": "等效CS2灵敏度即时显示。两者在数学上匹配，产生相同的cm/360°旋转距离。",
  "steps_valorant-to-cs2-sensitivity_3": "复制并在CS2中测试",
  "steps_valorant-to-cs2-sensitivity_3Desc": "在CS2设置→键盘/鼠标→鼠标灵敏度中应用。在死斗模式中调整——尽管灵敏度已匹配，CS2的移动手感与Valorant仍然不同。",

  "steps_apex-to-valorant-sensitivity_1": "输入您的Apex Legends灵敏度",
  "steps_apex-to-valorant-sensitivity_1Desc": "输入您的Apex灵敏度和FOV。Apex默认较高的FOV（110）与Valorant（103）之间的差异会影响感知灵敏度。",
  "steps_apex-to-valorant-sensitivity_2": "查看Valorant等效值",
  "steps_apex-to-valorant-sensitivity_2Desc": "转换后的Valorant灵敏度考虑了两个游戏之间的FOV差异，提供更准确的手感转换。",
  "steps_apex-to-valorant-sensitivity_3": "复制并应用",
  "steps_apex-to-valorant-sensitivity_3Desc": "在Valorant中应用。预计有一段适应期——Apex快速的移动与Valorant的战术卡点玩法形成鲜明对比。",

  "steps_valorant-to-apex-sensitivity_1": "输入您的Valorant灵敏度",
  "steps_valorant-to-apex-sensitivity_1Desc": "输入您的Valorant灵敏度。转换器会根据Apex Legends较高的默认FOV和不同的游戏引擎进行调整。",
  "steps_valorant-to-apex-sensitivity_2": "查看Apex等效值",
  "steps_valorant-to-apex-sensitivity_2Desc": "Apex灵敏度值已针对FOV缩放和引擎差异进行调整。同时计算腰射和ADS灵敏度。",
  "steps_valorant-to-apex-sensitivity_3": "复制并在Apex中测试",
  "steps_valorant-to-apex-sensitivity_3Desc": "在Apex Legends中应用。在训练场用不同武器测试——跟枪瞄准在Apex中比在Valorant中更加重要。",

  "steps_cs2-to-apex-sensitivity_1": "输入您的CS2灵敏度",
  "steps_cs2-to-apex-sensitivity_1Desc": "输入您的CS2鼠标灵敏度。转换器考虑了CS2和Apex Legends之间不同的默认FOV。",
  "steps_cs2-to-apex-sensitivity_2": "查看Apex等效值",
  "steps_cs2-to-apex-sensitivity_2Desc": "计算出您的Apex等效灵敏度。结果已针对Apex更宽的默认FOV和不同的移动速度进行调整。",
  "steps_cs2-to-apex-sensitivity_3": "复制并练习",
  "steps_cs2-to-apex-sensitivity_3Desc": "在Apex Legends中应用。花时间在训练场对移动目标练习跟枪，然后再进入大逃杀模式。",

  "steps_apex-to-cs2-sensitivity_1": "输入您的Apex Legends灵敏度",
  "steps_apex-to-cs2-sensitivity_1Desc": "输入您的Apex灵敏度和当前FOV。这些值用于计算CS2等效灵敏度。",
  "steps_apex-to-cs2-sensitivity_2": "查看CS2等效值",
  "steps_apex-to-cs2-sensitivity_2Desc": "CS2灵敏度即时显示，已考虑FOV缩放差异。CS2较窄的默认FOV会使灵敏度手感不同。",
  "steps_apex-to-cs2-sensitivity_3": "复制并测试",
  "steps_apex-to-cs2-sensitivity_3Desc": "在CS2中应用。至少打15分钟死斗——CS2强调准星预瞄和交叉火力点，与Apex的跟枪重点不同。",

  "steps_overwatch2-to-valorant-sensitivity_1": "输入您的守望先锋2灵敏度",
  "steps_overwatch2-to-valorant-sensitivity_1Desc": "输入您的OW2灵敏度和FOV。OW2更快的移动和多样化的英雄技能创造了与Valorant不同的瞄准环境。",
  "steps_overwatch2-to-valorant-sensitivity_2": "查看Valorant等效值",
  "steps_overwatch2-to-valorant-sensitivity_2Desc": "Valorant灵敏度已通过FOV补偿计算。由于Valorant更偏战术、卡点的玩法，手感会感觉更慢。",
  "steps_overwatch2-to-valorant-sensitivity_3": "复制并调整",
  "steps_overwatch2-to-valorant-sensitivity_3Desc": "在Valorant中应用。适应期可能需要数天——与OW2偏重跟枪的瞄准相比，Valorant更看重精确的准星预瞄。",

  "steps_valorant-to-overwatch2-sensitivity_1": "输入您的Valorant灵敏度",
  "steps_valorant-to-overwatch2-sensitivity_1Desc": "输入您的Valorant瞄准灵敏度。转换器会将其放大以适应OW2节奏更快、技能驱动的游戏环境。",
  "steps_valorant-to-overwatch2-sensitivity_2": "查看守望先锋2等效值",
  "steps_valorant-to-overwatch2-sensitivity_2Desc": "OW2等效值即时显示。灵敏度已针对OW2更宽的FOV和更快的角色移动速度进行调整。",
  "steps_valorant-to-overwatch2-sensitivity_3": "复制并测试",
  "steps_valorant-to-overwatch2-sensitivity_3Desc": "在守望先锋2中应用。在快速游戏中尝试不同英雄——即使灵敏度相同，即时命中英雄和弹道英雄的手感可能不同。",

  "steps_cs2-to-overwatch2-sensitivity_1": "输入您的CS2灵敏度",
  "steps_cs2-to-overwatch2-sensitivity_1Desc": "输入您的CS2鼠标灵敏度。转换器将其转换为适合守望先锋2不同FOV、移动速度和瞄准风格的值。",
  "steps_cs2-to-overwatch2-sensitivity_2": "查看守望先锋2等效值",
  "steps_cs2-to-overwatch2-sensitivity_2Desc": "您的OW2灵敏度即时显示。计算已考虑两个游戏之间的FOV和引擎差异。",
  "steps_cs2-to-overwatch2-sensitivity_3": "复制并在OW2中测试",
  "steps_cs2-to-overwatch2-sensitivity_3Desc": "在守望先锋2中应用。快速游戏是最佳的适应环境——英雄种类和游戏节奏与CS2差别很大。",

  "steps_overwatch2-to-cs2-sensitivity_1": "输入您的守望先锋2灵敏度",
  "steps_overwatch2-to-cs2-sensitivity_1Desc": "输入您的OW2灵敏度和FOV。转换器将其适当缩放以适应CS2更慢、更战术的玩法。",
  "steps_overwatch2-to-cs2-sensitivity_2": "查看CS2等效值",
  "steps_overwatch2-to-cs2-sensitivity_2Desc": "CS2灵敏度即时显示。应用FOV缩放以确保您360°旋转所需的鼠标移动距离保持不变。",
  "steps_overwatch2-to-cs2-sensitivity_3": "复制并练习",
  "steps_overwatch2-to-cs2-sensitivity_3Desc": "在CS2中应用。预期灵敏度手感会更低——CS2强调准星预瞄和卡点而非跟枪。",

  "steps_pubg-to-cs2-sensitivity_1": "输入您的PUBG灵敏度",
  "steps_pubg-to-cs2-sensitivity_1Desc": "输入您的PUBG通用灵敏度。如果您使用不同的瞄准镜灵敏度，请分别转换每个以获得最佳结果。",
  "steps_pubg-to-cs2-sensitivity_2": "查看CS2等效值",
  "steps_pubg-to-cs2-sensitivity_2Desc": "CS2灵敏度即时显示。PUBG真实的武器机制和较慢的节奏意味着瞄准手感与CS2不同。",
  "steps_pubg-to-cs2-sensitivity_3": "复制并完善",
  "steps_pubg-to-cs2-sensitivity_3Desc": "在CS2中应用。在死斗和创意工坊瞄准训练地图中练习，用转换后的灵敏度建立肌肉记忆。",

  "steps_cs2-to-pubg-sensitivity_1": "输入您的CS2灵敏度",
  "steps_cs2-to-pubg-sensitivity_1Desc": "输入您的CS2鼠标灵敏度。PUBG有多个灵敏度设置——此转换仅针对您的基本腰射灵敏度。",
  "steps_cs2-to-pubg-sensitivity_2": "查看PUBG等效值",
  "steps_cs2-to-pubg-sensitivity_2Desc": "显示PUBG通用灵敏度。对于瞄准镜灵敏度，请将结果乘以PUBG每个放大倍率的瞄准镜灵敏度倍率。",
  "steps_cs2-to-pubg-sensitivity_3": "复制并应用",
  "steps_cs2-to-pubg-sensitivity_3Desc": "在PUBG中应用。在训练模式中测试——PUBG真实的后坐力模式和子弹下坠意味着瞄准手感与CS2不同。",

  "steps_fortnite-to-valorant-sensitivity_1": "输入您的堡垒之夜灵敏度",
  "steps_fortnite-to-valorant-sensitivity_1Desc": "输入您的堡垒之夜鼠标灵敏度。包含瞄准和瞄准镜灵敏度以获得最完整的转换。",
  "steps_fortnite-to-valorant-sensitivity_2": "查看Valorant等效值",
  "steps_fortnite-to-valorant-sensitivity_2Desc": "Valorant灵敏度即时显示。堡垒之夜的第三人称视角和建造机制创造了完全不同的瞄准环境。",
  "steps_fortnite-to-valorant-sensitivity_3": "复制并测试",
  "steps_fortnite-to-valorant-sensitivity_3Desc": "在Valorant中应用。预计有显著的适应期——从第三人称建造到第一人称战术射击的转变是巨大的。",

  "steps_valorant-to-fortnite-sensitivity_1": "输入您的Valorant灵敏度",
  "steps_valorant-to-fortnite-sensitivity_1Desc": "输入您的Valorant灵敏度。转换器将其缩放以适应堡垒之夜的第三人称视角和更快的游戏节奏。",
  "steps_valorant-to-fortnite-sensitivity_2": "查看堡垒之夜等效值",
  "steps_valorant-to-fortnite-sensitivity_2Desc": "您的堡垒之夜等效灵敏度显示。这是您的腰射灵敏度——瞄准和瞄准镜灵敏度可能需要单独调校。",
  "steps_valorant-to-fortnite-sensitivity_3": "复制并调整",
  "steps_valorant-to-fortnite-sensitivity_3Desc": "在堡垒之夜中应用。在创造模式中测试——堡垒之夜需要精准射击和快速建造，灵敏度需要在两者之间取得平衡。",

  "steps_cod-to-cs2-sensitivity_1": "输入您的使命召唤灵敏度",
  "steps_cod-to-cs2-sensitivity_1Desc": "输入您的CoD鼠标灵敏度。CoD较短的击杀时间和重生机制与CS2的战术玩法有很大差异。",
  "steps_cod-to-cs2-sensitivity_2": "查看CS2等效值",
  "steps_cod-to-cs2-sensitivity_2Desc": "CS2灵敏度即时显示，已根据CoD和CS2之间不同的默认FOV和游戏引擎特性进行调整。",
  "steps_cod-to-cs2-sensitivity_3": "复制并完善",
  "steps_cod-to-cs2-sensitivity_3Desc": "在CS2中应用。预期灵敏度手感会更慢——与CoD的跑打风格相比，CS2更看重精确度和准星预瞄。",

  "steps_cs2-to-cod-sensitivity_1": "输入您的CS2灵敏度",
  "steps_cs2-to-cod-sensitivity_1Desc": "输入您的CS2鼠标灵敏度。转换器将其放大以适应使命召唤更快的移动和更激进的玩法风格。",
  "steps_cs2-to-cod-sensitivity_2": "查看CoD等效值",
  "steps_cs2-to-cod-sensitivity_2Desc": "您的CoD等效灵敏度显示。计算已考虑两个游戏之间不同的默认FOV和游戏引擎。",
  "steps_cs2-to-cod-sensitivity_3": "复制并测试",
  "steps_cs2-to-cod-sensitivity_3Desc": "在使命召唤中应用。打几局休闲比赛——CoD更快的节奏可能使转换后的灵敏度最初感觉比预期更低。",
};

// Apply translations
for (const [key, value] of Object.entries(translations)) {
  if (data.Tool[key] !== undefined) {
    data.Tool[key] = value;
  } else {
    console.warn(`Key not found in Tool namespace: ${key}`);
  }
}

// Write back
fs.writeFileSync(messagesPath, JSON.stringify(data, null, 2) + "\n", "utf8");

const stepKeys = Object.keys(data.Tool).filter((k) => k.startsWith("steps_"));
const translated = stepKeys.filter((k) => translations[k]);
console.log(`Total step keys in Tool: ${stepKeys.length}`);
console.log(`Keys translated: ${translated.length}`);
console.log(`Keys missing translation: ${stepKeys.length - translated.length}`);
console.log("Done! zh-cn.json updated successfully.");
