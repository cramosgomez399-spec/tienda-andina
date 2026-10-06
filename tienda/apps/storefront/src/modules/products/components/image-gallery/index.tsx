import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

// La primera foto ocupa todo el ancho; las demás van de a dos para ver más sin bajar tanto.
const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 small:gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          id={image.id}
          className={`relative overflow-hidden rounded-3xl bg-lana ${
            index === 0 ? "col-span-2 aspect-[5/4]" : "aspect-square"
          }`}
        >
          {!!image.url && (
            <Image
              src={image.url}
              priority={index <= 2}
              className="object-cover mix-blend-multiply"
              alt={`Imagen del producto ${index + 1}`}
              fill
              sizes={index === 0 ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 1024px) 50vw, 28vw"}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default ImageGallery
