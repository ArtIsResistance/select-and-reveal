const fileElem = document.getElementById("file")
const resultElem = document.getElementById("result")
const ctx = document.getElementById('canvas').getContext('2d')
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
    let canvas = ctx.canvas
    let file = fileElem.files[0]


    if (!file)
        return

    let img = new Image()
    img.src = window.URL.createObjectURL(file)

    img.onload = () => {
        let charsPerLine = resultElem.offsetWidth/spanWidth()/2 - 2
        let scalingFactor = img.width/charsPerLine

        canvas.width = img.width/scalingFactor
        canvas.height = img.height/scalingFactor

        createText()
        setSpanWidth(fontSize)
        
        canvas.getContext('2d')
            .drawImage(img, 0, 0, canvas.width, canvas.height)

        paintText()
        window.URL.revokeObjectURL(img.src)
    }
}

function paintText() {
    let data = ctx.getImageData(
        0, 0, ctx.canvas.width, ctx.canvas.height
        ).data

    let css = ""
    let length = data.length/4
    for (let i=0; i<length; i++) {
        let slice = data.slice(i*4, i*4+3)
        let color = (slice[0] << 16 | slice[1] << 8 | slice[2])
            .toString(16)
        color = ("000000"+color).substring(color.length)
        css += `._${i}{color:#${color}}`
        css += `._${i}::${selection}{background:#${color}}`
    }
    document.getElementsByName("style2")[0].innerHTML = css 
}

function generateString(length) {
    const s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array(length)
        .join().split(',')
        .map(()=>s.charAt(
            Math.floor(Math.random() * s.length)))
        .join('');
}

function createText() {
    let w = ctx.canvas.width
    let h = ctx.canvas.height
    let string = generateString(2*w*h)
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
    resultElem.innerHTML = html
}

function setSpanWidth(fontSize, width) {
    document.getElementsByName("style1")[0].innerHTML = `.result span {
        font-size:${fontSize}px;
        width:${ width || spanWidth() }px;
    }
    `
}
