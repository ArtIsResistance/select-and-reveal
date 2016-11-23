const fileElem = document.getElementById("file")
const resultElem = document.getElementById("result")
const ctx = document.getElementById('canvas').getContext('2d')
const fontSize = 8;
fileElem.addEventListener("change", draw, false)
window.addEventListener("resize", draw)

function draw() {
    let canvas = ctx.canvas
    let file = fileElem.files[0]


    if (!file)
        return

    let img = new Image()
    img.src = window.URL.createObjectURL(file)

    img.onload = () => {
        let charsPerLine = resultElem.offsetWidth/fontSize    
        let scalingFactor = 2*img.width/charsPerLine

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
    let pseudoSelector =
        (navigator.userAgent.indexOf("Firefox")===-1) ?
        "selection" :
        "-moz-selection"
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
        css += `._${i}::${pseudoSelector}{background:#${color}}`
    }
    document.head.children["style2"].innerHTML = css 
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

function setSpanWidth(value) {
    document.head.children["style1"].innerHTML = `.result span {
        display:inline-block;
        font-size: ${fontSize}px
        word-break:normal;
        width:${value}px;
    }`
}
