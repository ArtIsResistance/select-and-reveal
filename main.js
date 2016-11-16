document.getElementById("uploadimage").addEventListener("change", draw, false)


function draw() {
    let ctx = document.getElementById('canvas').getContext('2d')
    let file = document.getElementById("uploadimage").files[0]

    let img = new Image()
    img.src = window.URL.createObjectURL(file)

    img.onload = () => {
        ctx.drawImage(img,0,0, 600,600)
        window.URL.revokeObjectURL(img.src)
    }
}
