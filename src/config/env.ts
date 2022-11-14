import { z } from 'zod';

const Env = z.object({
  MNEMONIC: z.string(),
  HARDHAT_NETWORK: z.string().optional().default('hardhat'),
  ALCHEMY_KEY: z.string(),
  ETHERSCAN_API_KEY: z.string(),
  POLYGONSCAN_API_KEY: z.string(),
  PRIVATE_KEY: z.string().optional(),
});

export const env = Env.parse(process.env);

export type Environment = z.infer<typeof Env>;
