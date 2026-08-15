Add-Type -AssemblyName System.Drawing

function Draw-SqlAcademyIcon([int]$size) {
    $bmp = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Scale factor based on size
    $scale = [double]$size / 256.0
    
    # 1. Outer rounded card background
    $pad = [float](14.0 * $scale)
    $cardSize = [float]($size - (2.0 * $pad))
    $radius = [float](50.0 * $scale)
    
    # Create GraphicsPath for rounded rectangle
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = [float]($radius * 2.0)
    $arc = [System.Drawing.RectangleF]::new($pad, $pad, $diameter, $diameter)
    $path.AddArc($arc, 180.0, 90.0)
    $arc.X = [float]($pad + $cardSize - $diameter)
    $path.AddArc($arc, 270.0, 90.0)
    $arc.Y = [float]($pad + $cardSize - $diameter)
    $path.AddArc($arc, 0.0, 90.0)
    $arc.X = $pad
    $path.AddArc($arc, 90.0, 90.0)
    $path.CloseFigure()

    # Fill background with dark navy/slate
    $bgColor = [System.Drawing.Color]::FromArgb(255, 14, 20, 30)
    $bgBrush = [System.Drawing.SolidBrush]::new($bgColor)
    $g.FillPath($bgBrush, $path)
    $bgBrush.Dispose()

    # Stroke cyan/teal border (width ~ 10px scaled)
    $borderColor = [System.Drawing.Color]::FromArgb(235, 56, 217, 255)
    $borderWidth = [float][Math]::Max(2.0, (10.0 * $scale))
    $borderPen = [System.Drawing.Pen]::new($borderColor, $borderWidth)
    $borderPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPath($borderPen, $path)
    $borderPen.Dispose()
    $path.Dispose()

    # 2. Draw Database Cylinder Drum Icon in Golden Amber
    $amberColor = [System.Drawing.Color]::FromArgb(255, 255, 176, 32)
    $dbWidth = [float][Math]::Max(2.0, (14.0 * $scale))
    $dbPen = [System.Drawing.Pen]::new($amberColor, $dbWidth)
    $dbPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $dbPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $dbPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $cx = [float]($size / 2.0)
    $rx = [float](54.0 * $scale)
    $ry = [float](22.0 * $scale)
    
    # Top ellipse center Y = 92
    $topY = [float](92.0 * $scale)
    $g.DrawEllipse($dbPen, [float]($cx - $rx), [float]($topY - $ry), [float](2.0 * $rx), [float](2.0 * $ry))

    # Middle arc: center Y = 128
    $midY = [float](128.0 * $scale)
    $g.DrawArc($dbPen, [float]($cx - $rx), [float]($midY - $ry), [float](2.0 * $rx), [float](2.0 * $ry), 0.0, 180.0)

    # Bottom arc: center Y = 164
    $botY = [float](164.0 * $scale)
    $g.DrawArc($dbPen, [float]($cx - $rx), [float]($botY - $ry), [float](2.0 * $rx), [float](2.0 * $ry), 0.0, 180.0)

    # Left and right vertical sides
    $g.DrawLine($dbPen, [float]($cx - $rx), $topY, [float]($cx - $rx), $botY)
    $g.DrawLine($dbPen, [float]($cx + $rx), $topY, [float]($cx + $rx), $botY)

    $dbPen.Dispose()
    $g.Dispose()

    return $bmp
}

# Function to save multi-resolution ICO file
function Save-IcoFile([System.Drawing.Bitmap[]]$bitmaps, [string]$outputPath) {
    $ms = [System.IO.MemoryStream]::new()
    $bw = [System.IO.BinaryWriter]::new($ms)

    # ICONDIR header
    $bw.Write([uint16]0) # Reserved
    $bw.Write([uint16]1) # Type 1 = ICO
    $bw.Write([uint16]$bitmaps.Length) # Number of images

    $pngDataList = @()
    foreach ($bmp in $bitmaps) {
        $pms = [System.IO.MemoryStream]::new()
        $bmp.Save($pms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngDataList += ,$pms.ToArray()
        $pms.Dispose()
    }

    $offset = 6 + ($bitmaps.Length * 16)

    for ($i = 0; $i -lt $bitmaps.Length; $i++) {
        $bmp = $bitmaps[$i]
        $pngData = $pngDataList[$i]

        $w = if ($bmp.Width -ge 256) { 0 } else { [byte]$bmp.Width }
        $h = if ($bmp.Height -ge 256) { 0 } else { [byte]$bmp.Height }

        # ICONDIRENTRY
        $bw.Write([byte]$w)
        $bw.Write([byte]$h)
        $bw.Write([byte]0) # Color count
        $bw.Write([byte]0) # Reserved
        $bw.Write([uint16]1) # Color planes
        $bw.Write([uint16]32) # Bit count
        $bw.Write([uint32]$pngData.Length) # Image size in bytes
        $bw.Write([uint32]$offset) # Image offset

        $offset += $pngData.Length
    }

    foreach ($pngData in $pngDataList) {
        $bw.Write($pngData)
    }

    [System.IO.File]::WriteAllBytes($outputPath, $ms.ToArray())
    $bw.Dispose()
    $ms.Dispose()
}

$pubDir = "e:\codex\core\public"
$sizes = @(256, 128, 64, 48, 32, 16)
$bitmaps = @()

foreach ($sz in $sizes) {
    $b = Draw-SqlAcademyIcon $sz
    $bitmaps += $b
    if ($sz -eq 256) {
        $b.Save("$pubDir\app_icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $b.Save("$pubDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
}

Save-IcoFile $bitmaps "$pubDir\app_icon.ico"
Save-IcoFile $bitmaps "$pubDir\favicon.ico"

Write-Host "Icons generated successfully at $pubDir"
