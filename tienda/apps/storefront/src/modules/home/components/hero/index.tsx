import { Button, Heading, Text } from "@modules/common/components/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 small:p-32 gap-6">
        <span className="flex flex-col gap-3">
          <Text className="txt-compact-small-plus uppercase tracking-widest text-ui-fg-muted">
            Tienda Andina
          </Text>
          <Heading
            level="h1"
            className="text-3xl small:text-4xl leading-tight text-ui-fg-base font-normal"
          >
            Ropa cómoda para el día a día
          </Heading>
          <Heading
            level="h2"
            className="text-xl small:text-2xl leading-snug text-ui-fg-subtle font-normal"
          >
            Envíos a todo el Perú · Precios con IGV incluido
          </Heading>
        </span>
        <LocalizedClientLink href="/store">
          <Button variant="secondary">Ver la tienda</Button>
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default Hero;
