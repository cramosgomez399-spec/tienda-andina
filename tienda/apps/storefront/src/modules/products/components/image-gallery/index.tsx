"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { getImagesForVariant } from "@lib/util/imagenes-variante"

type ImageGalleryProps = {
  product: HttpTypes.StoreProduct
}

// Las fotos se eligen en el navegador según la variante (?v_id=...), así cambiar de
// color es instantáneo y no hace falta volver a pedir la página al servidor.
// La primera foto ocupa todo el ancho; las demás van de a dos.
const ImageGallery = ({ product }: ImageGalleryProps) => {
  const searchParams = useSearchParams()
  const images = getImagesForVariant(product, searchParams.get("v_id"))

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
