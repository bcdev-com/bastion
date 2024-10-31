(Get-Content -Raw ./rawrules.html) -replace 
        ' id="[^"]+"', '' -replace
        ' class="[^"]+"', '' -replace
        ' data-content-chunk=".+?"', '' -replace 
        ' data-content-chunk-id=".+?"', '' -replace 
        ' data-tooltip-href=".+?"', '' -replace
        ' href="(/.*?)"', ' href="https://dndbeyond.com$1"' -replace
        '(?s)<figure>.*?</figure>', '' -replace
        '<a href="#.*?">(.*?)</a>', '$1' -replace
        '<h3>(.*)</h3>', { "<div id=`"room-$($_.Groups[1].Value.ToLower().Replace(' ', '-'))`">`r`n$($_.Value)" } -replace 
        '<hr>', '</div>'
