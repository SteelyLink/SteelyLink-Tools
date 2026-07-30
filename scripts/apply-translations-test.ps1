# Apply translations to zh-cn.json
$jsonPath = "d:\Coding Programs\artink_tools\artink-tools\messages\zh-cn.json"
Write-Output "Reading JSON..."
$json = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Output "Applying translations..."
# Image Conversion Tools
$json.Tool.'steps_png-to-jpg_1' = "上传您的PNG文件"
$json.Tool.'steps_png-to-jpg_1Desc' = "点击上传区域或拖拽PNG图片到页面中。您的文件在整个处理过程中完全保留在您的设备上。"
$json.Tool.'steps_png-to-jpg_2' = "调整质量设置"
$json.Tool.'steps_png-to-jpg_2Desc' = "设置输出的JPEG质量——数值越高保留的细节越多，但文件体积也越大。默认92%提供了最佳平衡。"
$json.Tool.'steps_png-to-jpg_3' = "转换并下载"
$json.Tool.'steps_png-to-jpg_3Desc' = "点击转换将PNG转换为JPEG。转换后的图片会自动下载——您的原始PNG文件保持不变。"

Write-Output "First 6 done. This test worked."
Write-Output "Writing JSON..."
$json | ConvertTo-Json -Depth 10 | Set-Content $jsonPath -Encoding UTF8
Write-Output "Done!"
