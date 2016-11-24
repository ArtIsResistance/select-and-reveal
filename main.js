const drawingContext = document.getElementById('canvas').getContext('2d')
const fileElem = document.getElementById("file")
const resultElem = document.getElementById("result")
const containerStyle = document.getElementsByName("container")[0]
const lettersStyle = document.getElementsByName("letters")[0]

const fontSize = 12
const spanWidth = () => (fontSize+2)/2
const selection =
    navigator.userAgent.indexOf("Firefox") === -1 ?
    "selection" :
    "-moz-selection"


fileElem.addEventListener("change", draw, false)

let timeout;
window.addEventListener("resize", ()=>{
    clearTimeout(timeout)
    timeout = setTimeout(draw, 250)
})

function draw() {
    let canvas = drawingContext.canvas
    let file = fileElem.files[0]


    if (!file)
        return

    let img = new Image()
    img.src = window.URL.createObjectURL(file)

    img.onload = () => {
        const nonOverflowFactor = 0.98
        let pixelWidth = 2*spanWidth()
        let pixelsPerLine = nonOverflowFactor * resultElem.offsetWidth/pixelWidth
        let scalingFactor = img.width/pixelsPerLine

        canvas.width = img.width/scalingFactor
        canvas.height = img.height/scalingFactor

        drawingContext.drawImage(img, 0, 0, canvas.width, canvas.height)
        let data = drawingContext.getImageData(0, 0, canvas.width, canvas.height).data

        let map = createColorMap(data)

        resultElem.innerHTML = resultHTML(canvas.width, canvas.height)
        containerStyle.innerHTML = resultCSS(fontSize)
        lettersStyle.innerHTML = lettersCSS(data)

        window.URL.revokeObjectURL(img.src) 
    }
}

function createColorMap(pixArray) {
    const map = new Map()
    const length = pixArray.length/4
    let colorIndex = 0
    for (let i=0;i<length;i++) {
        let r = pixArray[i*4]
        let b = pixArray[i*4+1]
        let g = pixArray[i*4+2]
        map.set(rgbToHex(r,g,b), colorIndex++)
    }
    return map
}

function lettersCSS(pixArray) {
    let css = ""
    let length = pixArray.length/4
    for (let i=0; i<length; i++) {
        let slice = pixArray.slice(i*4, i*4+3)
        let color = rgbToHex(slice[0], slice[1], slice[2])
        css += `._${i}{color:#${color}}`
        css += `._${i}::${selection}{background:#${color}}`
    }
    return css 
}

function rgbToHex(r,g,b) {
    let color = (r<<16|g<<8|b).toString(16)
    return ("000000"+color).substring(color.length)
}


function randomString(length) {
    const s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array(length)
        .join().split(',')
        .map(()=>s.charAt(
            Math.floor(Math.random() * s.length)))
        .join('')
}

function resultHTML(w, h) {
    let string = randomString(2*w*h)
    let html = ""
    for (let y=0; y<h; y++){
        for (let x=0; x<w; x++){
            let coord = y*w+x
            let val = string[coord]
            html += `<span class='_${coord}'>${val}</span>`
            val = string[coord+1]
            html += `<span class='_${coord}'>${val}</span>`
        }
        html += "<br/>"
    }
    return html
}

function resultCSS(fontSize, width) {
    return `.result span {
        font-size:${fontSize}px;
        width:${ width || spanWidth() }px;
    }
    .result{line-height: ${fontSize}px;}`
}
