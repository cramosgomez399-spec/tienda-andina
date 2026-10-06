import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen } from "@medusajs/icons"
import { Badge, Button, Container, Drawer, Heading, Label, Table, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type Reclamo = {
  id: string
  codigo: string
  tipo: "reclamo" | "queja"
  created_at: string
  plazo_respuesta: string
  nombre: string
  documento_tipo: string
  documento_numero: string
  domicilio: string
  telefono: string | null
  email: string
  es_menor: boolean
  apoderado: string | null
  bien_tipo: string
  bien_descripcion: string
  monto: number | null
  numero_pedido: string | null
  detalle: string
  pedido_consumidor: string
  estado: "pendiente" | "respondido"
  respuesta: string | null
  respondido_en: string | null
}

const fecha = (v: string) => new Date(v).toLocaleDateString("es-PE", { dateStyle: "medium" })

async function api<T>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(ruta, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(datos.message ?? `Error ${res.status}`)
  return datos as T
}

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor?: string | number | null }) =>
  valor === null || valor === undefined || valor === "" ? null : (
    <div className="flex flex-col gap-y-1">
      <Text size="small" className="text-ui-fg-subtle">
        {etiqueta}
      </Text>
      <Text size="small" className="whitespace-pre-wrap">
        {valor}
      </Text>
    </div>
  )

const DetalleReclamo = ({ reclamo, onCerrar }: { reclamo: Reclamo; onCerrar: () => void }) => {
  const [respuesta, setRespuesta] = useState("")
  const cliente = useQueryClient()
  const responder = useMutation({
    mutationFn: () =>
      api(`/admin/reclamaciones/${reclamo.id}/responder`, {
        method: "POST",
        body: JSON.stringify({ respuesta }),
      }),
    onSuccess: () => {
      toast.success("Respuesta registrada y enviada al consumidor")
      cliente.invalidateQueries({ queryKey: ["reclamaciones"] })
      onCerrar()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>
          Hoja {reclamo.codigo} · {reclamo.tipo === "queja" ? "Queja" : "Reclamo"}
        </Drawer.Title>
      </Drawer.Header>
      <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
        <Dato etiqueta="Fecha" valor={fecha(reclamo.created_at)} />
        <Dato etiqueta="Consumidor" valor={reclamo.nombre} />
        <Dato etiqueta="Documento" valor={`${reclamo.documento_tipo} ${reclamo.documento_numero}`} />
        <Dato etiqueta="Domicilio" valor={reclamo.domicilio} />
        <Dato etiqueta="Correo" valor={reclamo.email} />
        <Dato etiqueta="Teléfono" valor={reclamo.telefono} />
        <Dato etiqueta="Padre, madre o apoderado" valor={reclamo.es_menor ? reclamo.apoderado : null} />
        <Dato etiqueta="Bien contratado" valor={`${reclamo.bien_tipo}: ${reclamo.bien_descripcion}`} />
        <Dato etiqueta="Monto reclamado" valor={reclamo.monto ? `S/ ${Number(reclamo.monto).toFixed(2)}` : null} />
        <Dato etiqueta="N.º de pedido" valor={reclamo.numero_pedido} />
        <Dato etiqueta="Detalle" valor={reclamo.detalle} />
        <Dato etiqueta="Pedido del consumidor" valor={reclamo.pedido_consumidor} />
        {reclamo.estado === "respondido" ? (
          <Dato etiqueta={`Respuesta (${fecha(reclamo.respondido_en!)})`} valor={reclamo.respuesta} />
        ) : (
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="respuesta">Respuesta al consumidor</Label>
            <Textarea
              id="respuesta"
              rows={6}
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Se enviará al correo del consumidor y quedará registrada en la hoja."
            />
            <Text size="small" className="text-ui-fg-subtle">
              Plazo legal: responder a más tardar el {fecha(reclamo.plazo_respuesta)}.
            </Text>
          </div>
        )}
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cerrar</Button>
        </Drawer.Close>
        {reclamo.estado === "pendiente" && (
          <Button
            onClick={() => responder.mutate()}
            isLoading={responder.isPending}
            disabled={respuesta.trim().length < 10}
          >
            Enviar respuesta
          </Button>
        )}
      </Drawer.Footer>
    </Drawer.Content>
  )
}

const ReclamacionesPage = () => {
  const [abierto, setAbierto] = useState<Reclamo | null>(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ["reclamaciones"],
    queryFn: () => api<{ count: number; reclamaciones: Reclamo[] }>("/admin/reclamaciones"),
  })

  const hoy = Date.now()

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Libro de Reclamaciones</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Plazo legal de respuesta: 15 días hábiles desde el registro.
          </Text>
        </div>
        <Badge>{data?.count ?? 0} hojas</Badge>
      </div>

      {isLoading && <Text className="px-6 py-4">Cargando…</Text>}
      {error && <Text className="px-6 py-4 text-ui-fg-error">{(error as Error).message}</Text>}
      {data && data.count === 0 && <Text className="px-6 py-4 text-ui-fg-subtle">Aún no hay reclamos ni quejas.</Text>}

      {!!data?.count && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Hoja</Table.HeaderCell>
              <Table.HeaderCell>Tipo</Table.HeaderCell>
              <Table.HeaderCell>Consumidor</Table.HeaderCell>
              <Table.HeaderCell>Fecha</Table.HeaderCell>
              <Table.HeaderCell>Responder hasta</Table.HeaderCell>
              <Table.HeaderCell>Estado</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.reclamaciones.map((r) => {
              const vencido = r.estado === "pendiente" && new Date(r.plazo_respuesta).getTime() < hoy
              return (
                <Table.Row key={r.id} className="cursor-pointer" onClick={() => setAbierto(r)}>
                  <Table.Cell>{r.codigo}</Table.Cell>
                  <Table.Cell>{r.tipo === "queja" ? "Queja" : "Reclamo"}</Table.Cell>
                  <Table.Cell>{r.nombre}</Table.Cell>
                  <Table.Cell>{fecha(r.created_at)}</Table.Cell>
                  <Table.Cell>{r.estado === "pendiente" ? fecha(r.plazo_respuesta) : "—"}</Table.Cell>
                  <Table.Cell>
                    <Badge color={r.estado === "respondido" ? "green" : vencido ? "red" : "orange"}>
                      {r.estado === "respondido" ? "Respondido" : vencido ? "Vencido" : "Pendiente"}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}

      <Drawer open={!!abierto} onOpenChange={(v) => !v && setAbierto(null)}>
        {abierto && <DetalleReclamo reclamo={abierto} onCerrar={() => setAbierto(null)} />}
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Libro de Reclamaciones",
  icon: BookOpen,
})

export default ReclamacionesPage
