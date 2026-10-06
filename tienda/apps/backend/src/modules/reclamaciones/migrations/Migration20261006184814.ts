import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261006184814 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "reclamo" ("id" text not null, "correlativo" serial, "tipo" text check ("tipo" in ('reclamo', 'queja')) not null, "nombre" text not null, "documento_tipo" text check ("documento_tipo" in ('DNI', 'CE', 'PASAPORTE', 'RUC')) not null, "documento_numero" text not null, "domicilio" text not null, "telefono" text null, "email" text not null, "es_menor" boolean not null default false, "apoderado" text null, "bien_tipo" text check ("bien_tipo" in ('producto', 'servicio')) not null, "bien_descripcion" text not null, "monto" numeric null, "numero_pedido" text null, "detalle" text not null, "pedido_consumidor" text not null, "estado" text check ("estado" in ('pendiente', 'respondido')) not null default 'pendiente', "respuesta" text null, "respondido_en" timestamptz null, "raw_monto" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reclamo_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reclamo_deleted_at" ON "reclamo" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "reclamo" cascade;`);
  }

}
