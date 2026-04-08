import { PrismaPg } from "@prisma/adapter-pg";
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

function requireDatabaseUrl(): string {
	const value = process.env.DATABASE_URL?.trim();

	if (!value) {
		throw new Error("Missing required environment variable: DATABASE_URL");
	}

	return value;
}

@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		super({
			adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }),
		});
	}
}