import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const prisma = new PrismaClient().$extends(withAccelerate())

export default prisma;
