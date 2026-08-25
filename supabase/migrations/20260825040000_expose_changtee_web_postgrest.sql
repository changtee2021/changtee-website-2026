-- PostgREST on this project listed ERP schemas but omitted changtee_web,
-- so /api/admin/leads and other schema-scoped queries returned errors.
-- Keep every schema already exposed; only append changtee_web.

ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, iam, hr, master, wms, procurement, purchasing, sales, crm, production, logistics, field_service, operations, finance, marketplace, analytics, platform, accounting, events, energy, learning, changtee_web';

NOTIFY pgrst, 'reload config';
