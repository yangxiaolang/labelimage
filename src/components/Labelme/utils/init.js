export const loadImage = (url)=>{
    return new Promise((res)=>{
        const image = new Image()
        image.onload=()=>{
            res(image)
        }
        image.src=url
    })
}

export const enhanceCanvas =(canvas)=>{
    canvas.loadImage=function(imageUrl){
        return this.image(imageUrl)
        .attr({ id: "background" })
    }
}