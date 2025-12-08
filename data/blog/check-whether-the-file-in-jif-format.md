---
title: Check whether the file is in .jif format.
date: '2024-09-05'
tags: ['IMG', 'WEB', '.jif']
draft: false
---

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <input type="file" name="" id="fileInput" />
  </body>

  <script>
    const fileInput = document.querySelector('input[type="file"]')
    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = function (e) {
        const arr = new Uint8Array(e.target.result)
        // Convert to string, check JFIF signature
        const header = String.fromCharCode.apply(null, arr.subarray(6, 10))
        if (header === 'JFIF') {
          console.log('File is a JFIF format.')
        } else {
          console.log('File does not contain JFIF signature.')
        }
      }
      // Read the first 10 bytes of the file
      reader.readAsArrayBuffer(file.slice(0, 10))
    })
  </script>
</html>
```
