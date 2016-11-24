const canvas = document.getElementById('canvas')
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
    containerStyle.innerHTML = resultCSS(fontSize)

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

        canvas.getContext('2d')
            .drawImage(img, 0, 0, canvas.width, canvas.height)

        const totalPixels = canvas.height*canvas.width
        const colorAt = createColorExtractor(canvas)

        const map = createColorMap(totalPixels, colorAt)

        resultElem.innerHTML = lettersHTML(canvas.width, canvas.height, map, colorAt)
        lettersStyle.innerHTML = lettersCSS(totalPixels, map, colorAt)

        window.URL.revokeObjectURL(img.src) 
    }
}

function createColorMap(length, colorAt) {
    const map = new Map()
    let colorIndex = 0
    for (let i=0;i<length;i++) {
        let color = colorAt(i)
        map.set(color, colorIndex++)
    }
    return map
}

function lettersCSS(length, map, colorAt) {
    let css = ""
    for (let i=0; i<length; i++) {
        let color = colorAt(i)
        let colorIndex = map.get(color)
        css += `._${colorIndex}{color:#${color}}`
        css += `._${colorIndex}::${selection}{background:#${color}}`
    }
    return css 
}

function randomString(length) {
    const s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array(length)
        .join().split(',')
        .map(()=>s.charAt(
            Math.floor(Math.random() * s.length)))
        .join('')
}

function lettersHTML(w, h, map, colorAt) {
    let str = randomString(2*w*h)
    let html = ""
    for (let y=0; y<h; y++){
        for (let x=0; x<w; x++){
            let i = y*w+x
            let colorIndex = map.get(colorAt(i))
            html += `<span class='_${colorIndex}'>${str[i+0]}</span>`
            html += `<span class='_${colorIndex}'>${str[i+1]}</span>`
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

function createColorExtractor(canvas) {
    function rgbToHex(r, g, b) {
        let color = (r<<16|g<<8|b).toString(16)
        return ("000000"+color).substring(color.length)
    }

    let pixArray = canvas.getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height)
        .data

    return function(x,y){
        let n = typeof y === "undefined" ? x : y*canvas.width+x
        let r = pixArray[n*4+0]
        let g = pixArray[n*4+1]
        let b = pixArray[n*4+2]
        return rgbToHex(r, g, b)
    }
}
