import { Database } from 'duckdb-async';
import type { AbstractConnection, ConnectionOptions } from '@sequelize/core';
import { AbstractConnectionManager } from '@sequelize/core';
import { logger } from '@sequelize/core/_non-semver-use-at-your-own-risk_/utils/logger.js';
import { DuckDbDialect } from "./dialect";

export interface DuckDbConnectionOptions {
  database: string;
  mode?: "readonly" | "readwrite";
}

export interface DuckDbConnection extends AbstractConnection {
  db: Database;
  closed: boolean;
}

export class DuckDbConnectionManager extends AbstractConnectionManager<DuckDbDialect, DuckDbConnection> {
  async connect(config: ConnectionOptions<DuckDbDialect>): Promise<DuckDbConnection> {
    // TBD if connecting to MotherDuck, use motherduck_attach_mode=single because multiple databases are bad
    const db = await Database.create(
        config.database || ':memory:',
        { 'custom_user_agent': 'sequelize' },
    );

    return { db, closed: false };
  }

  async disconnect(connection: DuckDbConnection) {
    connection.closed = true;

    return connection.db.close();
  }

  validate(connection: DuckDbConnection): boolean {
    return !connection.closed;
  }
}
