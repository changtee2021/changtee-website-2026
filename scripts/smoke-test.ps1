param(
  [string]$BaseUrl = "http://localhost:3000"
)

$paths = @(
  "/",
  "/about",
  "/products",
  "/products/curtain",
  "/products/curtain/s-wave",
  "/products/curtain/pleat",
  "/products/curtain/roman",
  "/products/curtain/eyelet",
  "/products/curtain/waterfall",
  "/products/curtain/tab-top",
  "/products/curtain/louis",
  "/products/curtain/hospital",
  "/products/curtain/print",
  "/products/curtain/motorized",
  "/products/roller-blinds",
  "/products/roller-blinds/standard",
  "/products/roller-blinds/motorized",
  "/products/roller-blinds/zebra",
  "/products/roller-blinds/print",
  "/products/venetian-blinds",
  "/products/venetian-blinds/wood",
  "/products/venetian-blinds/aluminium",
  "/products/venetian-blinds/bamboo",
  "/products/venetian-blinds/roman-shade",
  "/products/vertical-blinds",
  "/products/vertical-blinds/standard",
  "/products/pvc-partition",
  "/products/pvc-partition/solid",
  "/products/pvc-partition/japanese",
  "/products/pvc-partition/euro",
  "/products/pvc-partition/usa",
  "/products/outdoor-factory",
  "/products/outdoor-factory/outdoor-roller",
  "/products/outdoor-factory/zip-blind",
  "/products/outdoor-factory/skylight",
  "/products/outdoor-factory/pvc-strip",
  "/products/motorized",
  "/products/motorized/curtain",
  "/products/motorized/roller",
  "/products/motorized/vertical",
  "/products/motorized/wood",
  "/products/motorized/aluminium",
  "/products/print-fabric",
  "/products/print-fabric/print",
  "/products/print-fabric/noren",
  "/products/print-fabric/print-roller",
  "/products/surface",
  "/products/surface/wallpaper",
  "/products/surface/window-film",
  "/products/service",
  "/products/service/washing",
  "/products/service/repair",
  "/portfolio",
  "/blog",
  "/contact",
  "/quote",
  "/thank-you",
  "/privacy",
  "/terms",
  "/cookies"
)

$results = @()
foreach ($p in $paths) {
  $url = "$BaseUrl$p"
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
    $code = $resp.StatusCode
  } catch {
    $we = $_.Exception
    if ($we.Response) {
      $code = [int]$we.Response.StatusCode
    } else {
      $code = "ERR: $($we.Message)"
    }
  }
  $results += [PSCustomObject]@{ Path = $p; Status = $code }
}

$results | Format-Table -AutoSize
$fail = $results | Where-Object { $_.Status -ne 200 }
if ($fail.Count -gt 0) {
  Write-Output "`n--- FAILURES ---"
  $fail | Format-Table -AutoSize
} else {
  Write-Output "`nAll routes returned 200."
}
