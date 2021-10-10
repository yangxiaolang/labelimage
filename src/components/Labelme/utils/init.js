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
    canvas['background']=function(imageUrl){
        return this.image(imageUrl)
        .attr({ id: "background" })
    }
    canvas['changeMode']=function(mode){
        this.mode = mode
        return this
    }
}