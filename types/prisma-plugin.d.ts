declare module "@prisma/nextjs-monorepo-workaround-plugin" {
  import { WebpackPluginInstance } from "webpack";
  export class PrismaPlugin implements WebpackPluginInstance {
    constructor(options?: { prismaPath?: string });
    apply(compiler: any): void;
  }
}
